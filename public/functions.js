
function localFunctionsSetup(Z) {

    //generate a summary object of the profile suitable for a summary
    //dependency on jquery and async
    //messageElement is the name of the 'waiting' element to hide &
    Z.localFunctions.profileSummary = function(callback) {
        //$('#loading').show();

        if (!Z.currentProfile) {
            callback('There is no Profile being edited');
            return;
        }

        if (! Z.currentProfile.content.extensionDefn) {
            callback('No extensions have been defined yet');
            return;
        }



        //find all the resources that this profile refrences...
        var summary = {resources : {}}
        $.each(Z.currentProfile.content.extensionDefn,function(inx,ext){
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

        //now execute all teh tasks in parallel...
        async.parallel(arTasks,function(){
            //at this point the summary is complete
            console.log('completed')
            console.log(callback)
            if (callback) {
                callback(null,summary);
            }
            //console.log(summary);
        });
        //console.log(arTasks);


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

                        console.log(el);
                    }

                } else {
                    //just add the name...
                    arStructures.push({path : el.path, description: el.definition.short,type:"----------"})
                }

            })


            //now add the extensions that this profile defines for this resource...
            arStructures.push({path : '-------', description: '-------',type:"----------"})
            //console.log(Z.currentProfile);
            $.each(Z.currentProfile.content.extensionDefn,function(inx,ext){
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

    };
}



//generate a summary of a profile suitable for display
function profileSummaryXXXX(Z){

    $('#loading').show();

    //find all the resources that this profile refrences...
    var summary = {resources : {}}

    $.each(Z.currentProfile.content.extensionDefn,function(inx,ext){
        console.log(ext)

        if ( ! summary.resources[ext.context[0]]) {
            summary.resources[ext.context[0]]
        }


        console.log(summary);

    })

    /*
    $.get( "/api/profile/"+resourceName+"/FHIR Project", function( data ) {
        $('#loading').hide();



        var arProperties = [];

        console.log(data);
        if (data.entry.length === 0) {
            alert("Couldn't find the resource: " + resourceName);
            return;
        }


        var resource = data.entry[0].content;
        $.each(resource.structure[0].element, function(inx,el){
            console.log(el);
            if (el.definition.type) {
                //only include elements with a type (ie a datatype). 'header' properties (like medicationAdministration.dosage) aren't neeed (I think)
                var type = el.definition.type[0].code;
                //don't include extensions on the standard profile - they all have them and it's clutter at the moment...
                if (type.toLowerCase() !== 'extension') {
                    arProperties.push({path : el.path, description: el.definition.short,type:type})
                }

            } else {
                //just add the name...
                arProperties.push({path : el.path, description: el.definition.short,type:"----------"})
            }

        })
        console.log(arProperties);

        //now add the extensions that this profile defines for this resource...
        arProperties.push({path : '-------', description: '-------',type:"----------"})
        console.log(Z.currentProfile);
        $.each(Z.currentProfile.content.extensionDefn,function(inx,ext){
            console.log(ext)

            if (ext.context[0] === resourceName) {
                //only the extensions that apply to this profile
                var type = '?????';
                if (ext.definition.type) {
                    type = ext.definition.type[0].code;
                }

                arProperties.push({path : ext.code, description: ext.definition.short,type:type})
            }


        })



        var genDialogFrame = $('#generalModelDlg').html();      //the frams for the modal dialog
        $('#modalDialogDiv').html(genDialogFrame);      //write the frame to the DOM

        var template = Handlebars.compile($('#profiledResourceProperties').html());

        $('#modal-content').html(template({item:arProperties}));

        $("#generalDlg").modal()

*/

    };



//show all the properties of a resource as altered by this profile.
//for the moment, assume that profiles are only adding properties...
function getProfiledResource(Z,resourceName){

    $('#loading').show();
    $.get( "/api/profile/"+resourceName+"/FHIR Project", function( data ) {
        $('#loading').hide();

        var arProperties = [];

        console.log(data);
        if (data.entry.length === 0) {
            alert("Couldn't find the resource: " + resourceName);
            return;
        }
        var resource = data.entry[0].content;
        $.each(resource.structure[0].element, function(inx,el){
            console.log(el);
            if (el.definition.type) {
                //only include elements with a type (ie a datatype). 'header' properties (like medicationAdministration.dosage) aren't neeed (I think)
                var type = el.definition.type[0].code;
                //don't include extensions on the standard profile - they all have them and it's clutter at the moment...
                if (type.toLowerCase() !== 'extension') {
                    arProperties.push({path : el.path, description: el.definition.short,type:type})
                }

            } else {
                //just add the name...
                arProperties.push({path : el.path, description: el.definition.short,type:"----------"})
            }

        })
        console.log(arProperties);

        //now add the extensions that this profile defines for this resource...
        arProperties.push({path : '-------', description: '-------',type:"----------"})
        console.log(Z.currentProfile);
        $.each(Z.currentProfile.content.extensionDefn,function(inx,ext){
            console.log(ext)

            if (ext.context[0] === resourceName) {
                //only the extensions that apply to this profile
                var type = '?????';
                if (ext.definition.type) {
                    type = ext.definition.type[0].code;
                }

                arProperties.push({path : ext.code, description: ext.definition.short,type:type})
            }


        })



        var genDialogFrame = $('#generalModelDlg').html();      //the frams for the modal dialog
        $('#modalDialogDiv').html(genDialogFrame);      //write the frame to the DOM

        var template = Handlebars.compile($('#profiledResourceProperties').html());

        $('#modal-content').html(template({item:arProperties}));

        $("#generalDlg").modal()



    });

}