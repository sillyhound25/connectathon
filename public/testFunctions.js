/**
 * for functions related to generating test data
 */

function setupTestData(Z) {
    Z.localFunctions.testData = {};       //patent object

    //get resources
    Z.localFunctions.testData.getExtensions = function(callback){
        var vo = {};
        vo.warning = [];      //for issues during parsing - eg missing type
        vo.profile = Z.currentProfile;
        vo.resource = [];  //an array of different resources
        //first, generate a object that has all extensions for all resources in the profile
        console.log(Z.currentProfile);
        $.each(Z.currentProfile.content.extensionDefn,function(inx,ext){
            //console.log(ext);
            var resource = ext.context[0].toLowerCase();      //the resource that this extends
            if (! vo[resource]) {
                vo[resource] = {name:resource,extensions:[],core:[]}
                vo.resource.push(vo[resource]);
            }
            var oneInput = {raw : ext}; //the raw extension
            //for convenience, extract the datatype from the profile...
            console.log(ext);
            if (ext.definition.type) {
                oneInput.dataType =  ext.definition.type[0].code;    //we only look at the first..
                if (! ext.definition.binding) {
                    //this is a binding to a valueset. We assume that we've loaded the valueset already - obviously not scaleable...
                    //but a simple matter to retrieve the the valueset direclty from the server if we need to
                    oneInput.isInput = true;
                } else {
                    //this is a 'simple' input
                    oneInput.isDropdown = true;
                    var vsID = ext.definition.binding.referenceResource.reference;      //the ID of the valueset
                    //now find the valueset
                    //console.log(Z.valueSets);
                    $.each(Z.valueSets,function(inx1,vs) {
                        if (vs.id === vsID) {
                            oneInput.vs = vs;   //again, actually an entry property...
                        }
                    });
                    //oneInput.
                }
                vo[resource].extensions.push(oneInput);
            } else {
                vo.warning.push("Extension code:" + ext.code + " is missing the datatype, and is not displayed")
            }




        })

        //now we want to add the 'standard' properties for each resource. for the moment we'll hard code them,
        //but a better solution is obviously required...

        //the patient...
        //the patient should always be present, so add it if not...
        if (! vo.patient) {
            vo.patient = {name:'patient',extensions:[],core:[]}
            vo.resource.push(vo.patient);
        }

        //a property for the handlebars template...
        if (vo.warning.length > 0) {
            vo.hasWarnings = true;
        }

        //now add the standard elements needed to generate the test data
        //the server has a list of these
        $.get("/api/coreResourceTestParams",function(params){
            console.log(params)
            $.each(vo.resource,function(inx,res){
                var resourceName = res.name;
                if (params[resourceName]) {
                    $.each(params[resourceName],function(inx1,param){
                        vo[resourceName].core.push(param)
                    })
                }
            })
            callback(vo);
        })


        //vo.patient.core.push({code:'fname',display:'First Name'})
        //vo.patient.core.push({code:'lname',display:'Last Name'})
        //vo.patient.core.push({code:'identifier',display:'Identifier'})



        //console.log(vo);




    }
}