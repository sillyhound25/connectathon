/**
 * Generate a summary of the profile. This might be better as a collection plus smaller models eventually..
 */


/*global Backbone, $,alert,console,async,_ */

//represents a structure.element in the profile (which is the same as a path)...
//has the same structure as element in the profile...
var ProfileSummaryItemModel = Backbone.Model.extend({
    defaults : {
        path : "",
        min : 0,
        max : 1,
        datatype : "",
        description : "",
        type : "",
        resource : "",
        profileid : "",
        content : {},     //the actual JSON represnetation of the profile structure element
        extensions : []     //extensions against this path...
    }
});

var ProfileSummaryItemCollection = Backbone.Collection.extend({
    model : ProfileSummaryItemModel
});


var ProfileSummaryModel = Backbone.Model.extend({
    //generate the summary...
    getSummary : function(profileModel,callback) {
        //set the profile to generate a summary of
        var profile = profileModel.get('content');    //the FHIR profile

        //todo - this check may not be needed as eventually we'll be slicing not just extending...
        if (! profile.extensionDefn) {
            callback('No extension definitions have been defined for this profile yet');
            return;
        }

        //find all the resources that this profile references in extensions...

        var summary = {resources : {}};     //<<<<<<<<< this will be the object passed back...
        $.each(profile.extensionDefn,function(inx,ext){
            //console.log(ext)
            var resource = ext.context[0].getResourceNameFromPath();//  ext.context[0].toLowerCase();

            if (!resource) {
                alert("Error: This profile contains an unrecognized resource in a context (" + ext.context[0] + ") and cannot be safely processed");
                return;
            }

            if ( ! summary.resources[resource]) {
                summary.resources[resource] = {name:resource};
                summary.resources[resource].models =  new ProfileSummaryItemCollection();
            }
        });


        //console.log(summary);

        //create the array of tasks for async...
        //each task is to retrieve the base definition for resources in this profile.
        //todo this will require re-factoring as at the moment there must be an extension forst...
        var arTasks = [];
        $.each(summary.resources,function(resourceName) {

            if (!resourceName) {
                alert('Error: Null resource name');
            }

            //now add the task...
            arTasks.push(function(cb){
                if (Backbone.fhirResourceCache[resourceName]) {
                    console.log('load ' + resourceName + ' from cache');
                    //if this resource has been cached, then don't need to retrieve it...
                    getStructures(resourceName,Backbone.fhirResourceCache[resourceName],function(){
                        cb();       //and tell async we're done...
                    });

                } else {

                    //get the profile. Note that this will be a 'contains' string search, so can return multiple matches...
                    $.get( "/api/profile/"+resourceName+"/FHIR Project", function( data ) {
                        //Backbone.fhirResourceCache
                       // summary.resources[resourceName].raw = data;
//console.log(data)
                        if (data.entry && data.entry.length > 0) {  //make sure there's at least 1...
                            var resourceProfile;       //the entry object holding the profile resource...
                            $.each(data.entry,function(inx,entry){
                                //>>>>>  assume that the name of the profile is the same as the resourceName
                                //console.log(entry.content.name , resourceName);
                                //if (entry.content.name === resourceName) {
                                //needs to remain a case insensitive search, as this the name of a profile...
                                    if (entry.content.name.toLowerCase() === resourceName.toLowerCase()){
                                    resourceProfile = entry.content;
                                    summary.resources[resourceName].raw = data;
                                    //save resource profile in cache...
                                     Backbone.fhirResourceCache[resourceName] = resourceProfile;     //the fhir representation of the profile
                                }
                            });


                            if (! resourceProfile) {
                                alert('The profile for the ' + resourceName + ' resource was not found');
                                cb();
                            } else {
                                //console.log('back')
                                //pulls the properties from the resource and from the profile into the summary
                                getStructures(resourceName,resourceProfile,function(){
                                    cb();       //and tell async we're done...
                                });
                            }

                        }



                    });

                }
            });
        });

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
            //summary.resources[resourceName].models =  new ProfileSummaryItemCollection();

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

                        //var pathName = el.path.toLowerCase();       //the path name from the core...
                        var pathName = el.path;       //the path name from the core...

                        var pathFromProfile = false;               //will be true if we get the definition for this path from the profile

                        var itemModel;  //will be the ProfileSummaryItemModel

                        //if the profile contains a structure collection, then it has altered one of the core paths...
                        if (profile.structure) {

                            //console.log('profile has structure')

                            //does the profile have any structures? (note visibility due to js closure...)
                            //if so check each strcutire to find one that matches this resource...
                            _.each(profile.structure,function(struc){

                                //console.log(struc)
                                if (struc.type === resourceName) {      //type has the name of the resource...
                                //if (struc.name === resourceName) {
                                    //if (struc.name.toLowerCase() === resourceName.toLowerCase()) {
                                    //yep, we've got at least one modification for this resource
                                    if (struc.element) {
                                        _.each(struc.element,function(profileEl){
                                            //if the path's match then we'll add the definition from the profile
                                            //rather than the defintiopn in the core...
                                            if (profileEl.path ===  pathName) {
                                                //if (profileEl.path.toLowerCase() ===  pathName) {
                                                //yes! This path is defined in the profile
                                                pathFromProfile = true;


                                                //create the model - this will be the way forward...
                                                itemModel = new ProfileSummaryItemModel({
                                                    content : profileEl,
                                                    profileid : profileModel.get('id'),
                                                    path : pathName,
                                                    description: profileEl.definition.short,
                                                    datatype:type,
                                                    min:profileEl.definition.min,
                                                    max:profileEl.definition.max,
                                                    resource:resourceName,
                                                    extensions:[],
                                                    type:'prof'     //indicates that this model represents the core definition. It may be overridden by a profile of course...
                                                });

                                                models.push(itemModel);
                                            }
                                        });
                                    }

                                }
                            });

                        }


                        //console.log(pathFromProfile);

                        if (! pathFromProfile) {
                            //if here, then the profile does *not* override the path...

                            //create the model - this will be the way forward...
                            itemModel = new ProfileSummaryItemModel({
                                content : el,
                                profileid : profileModel.get('id'),
                                path : el.path,
                                description: el.definition.short,
                                datatype:type,
                                min:el.definition.min,
                                max:el.definition.max,
                                extensions:[],
                                resource:resourceName,
                                //extensions: [{name:'test'}],
                                type:'core'     //indicates that this model represents the core definition. It may be overridden by a profile of course...
                            });

                            models.push(itemModel);
                        }

                        //now we should have a model that represents either an unaltered structure, or one changed by the profile
                        //need to see if there are any extensions that were made against the path...
                        //console.log(itemModel)
                        if (itemModel) {
                            var path = itemModel.get('path');

                            $.each(profile.extensionDefn,function(inx,ext){
                                //ext is a the fhie extensionDefn
                                if (ext.context[0] === path) {
                                    //console.log('froun')
                                    var ar = itemModel.get('extensions') || [];

                                    //console.log(ext.code);

                                    ar.push(new ProfileSummaryItemModel({
                                        content : ext,
                                        profileid : profileModel.get('id'),
                                        path : " -> " + ext.code,
                                        code : ext.code,
                                        description: ext.definition.short,
                                        //datatype:type,
                                        datatype:ext.definition.type[0].code,
                                        min:ext.definition.min,
                                        max:ext.definition.max,
                                        resource:resourceName,
                                        extensions:[],      //this will be where nested etenions go...
                                        type:'ext'      //indicates that this is an extension from the profile
                                    }));
                                    itemModel.set('extensions',ar);
                                }
                            });

                        } else {
                            alert('There was a structure in the profile that could not be mapped for display');
                        }

                        cnt++;
                        //console.log(el);
                    }

                } else {
                    //this is managing the 'header' elements - like careplan.goal.
                    //they can have extensions, so do need to be in the list...
                    console.log(el);

                    //todo - this really needs refactoring - much code duplication...

                     var itemModel1 = new ProfileSummaryItemModel({
                     content : el,
                     profileid : profileModel.get('id'),
                     path : el.path,
                     description: el.definition.short,
                     datatype:type,
                     //min:el.definition.min,
                     //max:el.definition.max,
                     extensions:[],
                     resource:resourceName,
                     //extensions: [{name:'test'}],
                     type:'core'     //indicates that this model represents the core definition. It may be overridden by a profile of course...
                     });




                     models.push(itemModel1);





                    $.each(profile.extensionDefn,function(inx,ext){
                        //ext is a the fhie extensionDefn
                        if (ext.context[0] === el.path) {
                            //console.log('froun')
                            var ar = itemModel1.get('extensions') || [];

                            //console.log(ext.code);

                            ar.push(new ProfileSummaryItemModel({
                                content : ext,
                                profileid : profileModel.get('id'),
                                path : " -> " + ext.code,
                                code : ext.code,
                                description: ext.definition.short,
                                //datatype:type,
                                datatype:ext.definition.type[0].code,
                                min:ext.definition.min,
                                max:ext.definition.max,
                                resource:resourceName,
                                extensions:[],      //this will be where nested etenions go...
                                type:'ext'      //indicates that this is an extension from the profile
                            }));
                            itemModel1.set('extensions',ar);
                        }
                    });





                }

            });



            //todo ========= here is where we'll get the structural profile elements...

            summary.resources[resourceName].count = cnt;



            cb();
        }

    },


    //get all the possible paths for a resource. Used to associate an extension with a specific path in a resource
    getPathsForResource : function(resourceName,callback) {
        //see if it's already in the cache...
        if (Backbone.fhirResourceCache[resourceName.toLowerCase()]){
            console.log('from cache');
            var ar = processResourceProfile(Backbone.fhirResourceCache[resourceName.toLowerCase()]);
            callback (ar);
        } else {
            //if not, then download it and save in the cache...
            $.get( "/api/profile/"+resourceName+"/FHIR Project", function( data ) {

console.log(data);
                var resourceProfile;
                $.each(data.entry,function(inx,entry){
                    //>>>>>  assume that the name property of the profile is the same as the resourceName
                    if (entry.content.name.toLowerCase() === resourceName.toLowerCase()){
                        resourceProfile = entry.content;
                        //save resource profile in cache...
                        Backbone.fhirResourceCache[resourceName.toLowerCase()] = resourceProfile;     //the fhir representation of the profile
                    }
                });

                var ar = [];
                if (resourceProfile) {
                    ar = processResourceProfile(resourceProfile);
                }
                callback (ar);
            });

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
                        var pathName = el.path;//.toLowerCase();
                        //strip off the resource name;
                        //console.log(resource.name);
                        pathName = pathName.replace(resourceName + '.', "");
                        //and there's some elements we don't want either...
                        if (['text', 'contained'].indexOf(pathName.toLowerCase()) === -1) {


                            ar.push(pathName);
                        }


                    }
                } else {
                    //these are the 'container' elements - those that have children like careplan.goal ...
                    console.log(el);
                    var pathName1 = el.path.replace(resourceName + '.', "");
                    ar.push(pathName1);
                }
            });


            return ar;


        }

    }


});
