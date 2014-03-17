/**
 * Generate a summary of the profile. This might be better as a collection plus smaller models eventually..
 */

ProfileSummaryModel = Backbone.Model.extend({


    //generate teh summary...
    getSummary : function(profileModel,callback) {
        //set the profile to generate a summary of
        var profile = profileModel.get('content');    //the FHIR profile

        if (! profile.extensionDefn) {
            callback('No extensions have been defined yet');
            return;
        }

        //find all the resources that this profile refrences...
        var summary = {resources : {}}
        $.each(profile.extensionDefn,function(inx,ext){
            //console.log(ext)
            var resource = ext.context[0].toLowerCase();
            if ( ! summary.resources[resource]) {
                summary.resources[resource] = {properties : [],name:resource}
            }
        })
        console.log(summary);



        //create the array of tasks for async...
        var arTasks = [];
        $.each(summary.resources,function(resourceName) {
            arTasks.push(function(cb){
                //console.log('here',resourceName)
                $.get( "/api/profile/"+resourceName+"/FHIR Project", function( data ) {
                    summary.resources[resourceName].raw = data;
                    //console.log('back')
                    //pulls the properties from the resource and from the profile into the summary
                    getStructures(resourceName,data,function(){
                        cb();       //and tell async we're done...
                    })
                });
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
        function getStructures(resourceName,profileBundle,cb){

            var arStructures = summary.resources[resourceName].properties;
            var resource = profileBundle.entry[0].content;
            $.each(resource.structure[0].element, function(inx,el){
                //console.log(el);
                if (el.definition.type) {
                    //only include elements with a type (ie a datatype). 'header' properties (like medicationAdministration.dosage) aren't neeed (I think)
                    var type = el.definition.type[0].code;
                    //don't include extensions on the standard profile - they all have them and it's clutter at the moment...
                    if (type.toLowerCase() !== 'extension') {
                        arStructures.push({path : el.path, description: el.definition.short,type:type,min:el.definition.min,max:el.definition.max})

                        //console.log(el);
                    }

                } else {
                    //just add the name...
                    arStructures.push({path : el.path, description: el.definition.short,type:"----------"})
                }

            })


            //now add the extensions that this profile defines for this resource...
            arStructures.push({path : '-------', description: '-------',type:"----------"})
            //console.log(Z.currentProfile);
            $.each(profile.extensionDefn,function(inx,ext){
                //console.log(ext)

                if (ext.context[0].toLowerCase() === resourceName) {
                    //only the extensions that apply to this profile
                    var type = '?????';
                    if (ext.definition.type) {
                        type = ext.definition.type[0].code;
                    }

                    arStructures.push({path : ext.code, description: ext.definition.short,type:type,min:ext.definition.min,max:ext.definition.max})
                }


            })



            cb();
        }










    }






})
