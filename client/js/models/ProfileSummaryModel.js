/**
 * Generate a summary of the profile. This might be better as a collection plus smaller models eventually..
 */


//represents a structure.element in the profile...
ProfileSummaryItemModel = Backbone.Model.extend({
    defaults : {
        path : "",
        min : 0,
        max : 1,
        datatype : "",
        description : "",
        type : "",
        resource : "",
        profileid : "",
        content : {}     //the actual JSON represnetation of the profile structure element
    }
})

ProfileSummaryItemCollection = Backbone.Collection.extend({
    model : ProfileSummaryItemModel
});


ProfileSummaryModel = Backbone.Model.extend({
    //generate the summary...
    getSummary : function(profileModel,callback) {
        //set the profile to generate a summary of
        var profile = profileModel.get('content');    //the FHIR profile

        //todo - this check may not be needed as eventually we'll be slicing not just extending...
        if (! profile.extensionDefn) {
            callback('No extensions have been defined yet');
            return;
        }

        //find all the resources that this profile refrences...

        //todo the resoruces collection is the original - will replace with models..
        //find all the resources that are referenced by extensions...


        var summary = {resources : {}};     //<<<<<<<<< this will be the object passed back...
        $.each(profile.extensionDefn,function(inx,ext){
            //console.log(ext)
            var resource = ext.context[0].getResourceNameFromPath();//  ext.context[0].toLowerCase();
            if ( ! summary.resources[resource]) {


   /*

                g = resource.indexOf('.');
                if (g > -1) {
                    resource = resource.substr(0,g);
                }
                console.log(resource);
*/

                //summary.resources[resource] = {properties : [],name:resource}
                summary.resources[resource] = {name:resource}
            }
        })


        //console.log(summary);

        //create the array of tasks for async...
        //each task is to retrieve the base definition for resources in this profile.
        //todo this will require re-factoring as at the moment there must be an extension forst...
        var arTasks = [];
        $.each(summary.resources,function(resourceName) {
            //if there is a '.' then the resource has a path associated with it. We only want the resource name
           /*
            g = resourceName.indexOf('.');
            if (g > -1) {
                resourceName = resourceName.substr(0,g);
            }
console.log(resourceName);

            */
            if (!resourceName) {
                alert('Error: Null resource name');
            }

            //now add the task...
            arTasks.push(function(cb){
                if (Backbone.fhirResourceCache[resourceName]) {
                    console.log('load ' + resourceName + ' from cache')
                    //if this resource has been cached, then don't need to retrieve it...
                    getStructures(resourceName,Backbone.fhirResourceCache[resourceName],function(){
                        cb();       //and tell async we're done...
                    })

                } else {

                    //get the profile. Note that this will be a 'contains' string search, so can return multiple matches...
                    $.get( "/api/profile/"+resourceName+"/FHIR Project", function( data ) {
                        //Backbone.fhirResourceCache
                       // summary.resources[resourceName].raw = data;
//console.log(data)
                        var resourceProfile;       //the entry object holding the profile resource...
                        $.each(data.entry,function(inx,entry){
                            //>>>>>  assume that the name of the profile is the same as the resourceName
                            if (entry.content.name.toLowerCase() === resourceName.toLowerCase()){
                                resourceProfile = entry.content;
                                summary.resources[resourceName].raw = data;
                                //save resource profile in cache...
                                Backbone.fhirResourceCache[resourceName] = resourceProfile;     //the fhir representation of the profile
                            }
                        })


                        if (! resourceProfile) {
                            alert('The profile for the ' + resourceName + ' resource was not found');
                            cb();
                        } else {
                            //console.log('back')
                            //pulls the properties from the resource and from the profile into the summary
                            getStructures(resourceName,resourceProfile,function(){
                                cb();       //and tell async we're done...
                            })
                        }
                    });

                }
            })
        })

        //now execute all the tasks in parallel...
        //this will retrieve the profiles for the resources, and then extract the structures (ie properties)
        //plus, will get the extensions that have been defined in the profile for those resoruces...
        async.parallel(arTasks,function(){
            //at this point the summary is complete
            //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> this is the exit point from the function - it's async remember!!!
            if (callback) {
                callback(null,summary);
            }
        });


        //get all the structures that are defined in this profile, and all extensions for this resorucetype
        function getStructures(resourceName,resource,cb){

            //possible 'structures' is a better name than 'properties'
         //   var arStructures = summary.resources[resourceName].properties;

            //the models holds details about each structure or extension...
            summary.resources[resourceName].models =  new ProfileSummaryItemCollection();

            var models = summary.resources[resourceName].models;        //just a convenience variable...
            //var models = new ProfileSummaryItemCollection();
            //because there may be multiple returns we need to search the bundle...
           // var resource;
            var cnt = 0;        //the count of all properties for this resource in this profile...


            //go through all the structures defined in the core definition for this resource. We are using the path
            //as the discriminator - if a particluar path is defined in the profile then we use that, otherwise we use
            //the one from core. We assume that there cannot be a path in the profile that is not in the core
            //todo is this assumption correct?
            $.each(resource.structure[0].element, function(inx,el){
                //console.log(el);
                if (el.definition.type) {
                    //only include elements with a type (ie a datatype). 'header' properties (like medicationAdministration.dosage) aren't neeed (I think)
                    var type = el.definition.type[0].code;

                    //don't include extensions on the standard profile - they all have them and it's clutter at the moment...
                    if (type.toLowerCase() !== 'extension') {

                        //now see if there is a structure defined in the profile that matches the resource name
                        //and path. If there is, then that is what we'll include in the list of 'properties' (where a
                        //'property' could be core, profiled or an extension). Otherwise we'll use the core

                        var pathName = el.path.toLowerCase();       //the path name from the core...

                        var pathFromProfile = false;               //will be true if we get the definition for this path from the profile

                        //if the profile contains a structure collection, then it has altered one of the core paths...
                        if (profile.structure) {

                            //console.log('profile has structure')

                            //does the profile have any structures? (note visibility due to js closure...)
                            //if so check each strcutire to find one that matches this resource...
                            _.each(profile.structure,function(struc){

                                //console.log(struc)

                                if (struc.name.toLowerCase() === resourceName.toLowerCase()) {
                                    //yep, we've got at least one modification for this resource
                                    if (struc.element) {
                                        _.each(struc.element,function(profileEl){
                                            //if the path's match then we'll add the definition from the profile
                                            //rather than the defintiopn in the core...
                                            if (profileEl.path.toLowerCase() ===  pathName) {
                                                //yes! This path is defined in the profile
                                                pathFromProfile = true;


                                                //create the model - this will be the way forward...
                                                models.push(new ProfileSummaryItemModel({
                                                    content : profileEl,
                                                    profileid : profileModel.get('id'),
                                                    path : pathName,
                                                    description: profileEl.definition.short,
                                                    datatype:type,
                                                    min:profileEl.definition.min,
                                                    max:profileEl.definition.max,
                                                    resource:resourceName,
                                                    type:'prof'     //indicates that this model represents the core definition. It may be overridden by a profile of course...
                                                }));


                                            }
                                        })
                                    }

                                }
                            })

                        }


                        //console.log(pathFromProfile);

                        if (! pathFromProfile) {
                            //if here, then the profile does *not* override the path...
                          ///  arStructures.push({path : el.path, description: el.definition.short,type:type,
                           //     min:el.definition.min,max:el.definition.max,resource:resourceName,type:'core'})

                            //create the model - this will be the way forward...
                            models.push(new ProfileSummaryItemModel({
                                content : el,
                                profileid : profileModel.get('id'),
                                path : el.path,
                                description: el.definition.short,
                                datatype:type,
                                min:el.definition.min,
                                max:el.definition.max,
                                resource:resourceName,
                                type:'core'     //indicates that this model represents the core definition. It may be overridden by a profile of course...
                            }));

                        }

                        cnt++;
                        //console.log(el);
                    }

                } else {
                    //just add the name...

                  //  arStructures.push({path : el.path, description: el.definition.short,type:"----------",resource:resourceName})
                }

            })


            //now add the extensions that this profile defines for this resource...
          //  arStructures.push({path : '-------', description: '-------',type:"----------",resource:resourceName})
            //console.log(Z.currentProfile);
            $.each(profile.extensionDefn,function(inx,ext){
                //console.log(ext)

                if (ext.context[0].toLowerCase() === resourceName) {
                    //only the extensions that apply to this profile
                    cnt++;
                    var type = '?????';
                    if (ext.definition.type) {
                        type = ext.definition.type[0].code;
                    }

                 //   arStructures.push({path : ext.code, description: ext.definition.short,type:type,
                  ///      min:ext.definition.min,max:ext.definition.max,resource:resourceName,type:'ext'})

                    models.push(new ProfileSummaryItemModel({
                        profileid : profileModel.get('id'),
                        path : ext.code,
                        description: ext.definition.short,
                        datatype:type,
                        min:ext.definition.min,
                        max:ext.definition.max,
                        resource:resourceName,
                        type:'ext'      //indicates that this is an extension from the profile
                    }));
                }


            })

            //todo ========= here is where we'll get the structural profile elements...

            summary.resources[resourceName].count = cnt;



            cb();
        }

    },


    //get all the possible paths for a resource. Used to associate an extension with a specific path in a resource
    getPathsForResource : function(resourceName,callback) {
        if (Backbone.fhirResourceCache[resourceName.toLowerCase()]){
            console.log('from cache');
            var ar = processResourceProfile(Backbone.fhirResourceCache[resourceName.toLowerCase()])
            callback (ar);
        } else {
            $.get( "/api/profile/"+resourceName+"/FHIR Project", function( data ) {

                var resourceProfile;
                $.each(data.entry,function(inx,entry){
                    //>>>>>  assume that the name of the profile is the same as the resourceName
                    if (entry.content.name.toLowerCase() === resourceName.toLowerCase()){
                        resourceProfile = entry.content;
                        //save resource profile in cache...
                        Backbone.fhirResourceCache[resourceName.toLowerCase()] = resourceProfile;     //the fhir representation of the profile
                    }
                })




                //console.log(data)
                //Backbone.fhirResourceCache[resourceName.toLowerCase()] = data;
                var ar = [];
                if (resourceProfile) {
                    ar = processResourceProfile(resourceProfile)
                }

                callback (ar);
            })
            //this needs a fhor call...

        }

        //extract all the paths into a string array excluding the Resource name, text and contained elements...
        function processResourceProfile(resource) {
            var ar = [];


            $.each(resource.structure[0].element, function(inx,el){
//console.log(el);
                if (el.definition.type) {
                    //only include elements with a type (ie a datatype). 'header' properties (like medicationAdministration.dosage) aren't neeed (I think)
                    var type = el.definition.type[0].code;
                    //don't include extensions on the standard profile - they all have them and it's clutter at the moment...

                    if (type.toLowerCase() !== 'extension') {//don't want extensions

//console.log(el)

                        var pathName = el.path;//.toLowerCase();
                        //strip off the resource name;
                        //console.log(resource.name);
                        pathName = pathName.replace(resourceName + '.', "");
                        //and there's some elements we don't want either...
                        if (['text', 'contained'].indexOf(pathName.toLowerCase()) === -1) {


                            ar.push(pathName);
                        }


                    }
                }
            });


            return ar;


        }

    }


})
