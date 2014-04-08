/**
 * Generate the test Form data. Ie not a 'real' model - just somewhere to put business logic...
 */


ProfileTestFormModel = Backbone.Model.extend({


    //generate teh summary...
    getExtensions : function(profile,colVS,callback) {

        //var profile = profileModel.content;

        var vo = {};
        vo.warning = [];      //for issues during parsing - eg missing type
        vo.profile = profile;
        vo.resource = [];  //an array of different resources
        //first, generate a object that has all extensions for all resources in the profile
        //console.log(profile);
        $.each(profile.extensionDefn,function(inx,ext){
            //console.log(ext);
            var resource = ext.context[0].toLowerCase();      //the resource that this extends
            if (! vo[resource]) {
                vo[resource] = {name:resource,extensions:[],core:[]}
                vo.resource.push(vo[resource]);
            }
            var oneInput = {raw : ext}; //the raw extension
            //for convenience, extract the datatype from the profile...
            //console.log(ext);
            if (ext.definition.type) {
                oneInput.dataType =  ext.definition.type[0].code;    //we only look at the first..
                if (! ext.definition.binding) {
                    //this is a 'simple' input. Could be a text box or a checkbox
//console.log(oneInput.dataType.toLowerCase());
                    switch ( oneInput.dataType.toLowerCase() ) {
                        case 'boolean' : {
                            oneInput.isBoolean = true;
                            break;
                        }
                        case 'date' : {
                            oneInput.isDate = true;
                            break;
                        }
                        default : {
                            oneInput.isInput = true;
                            break

                        }
                    }
                    /*
                    if (oneInput.dataType.toLowerCase() === 'boolean') {
                        oneInput.isBoolean = true;
                    } else {
                        oneInput.isInput = true;
                    }
                    */

                } else {
                    //this is a binding to a valueset. We assume that we've loaded the valueset already - obviously not scaleable...
                    //but a simple matter to retrieve the the valueset direclty from the server if we need to

                    oneInput.isDropdown = true;
                    var vsID = ext.definition.binding.referenceResource.reference;      //the ID of the valueset
                    //now find the valueset
                    //console.log(Z.valueSets);
                    var ar = colVS.toJSON();

                    $.each(ar,function(inx1,vs) {
                        //console.log(vs);
                        if (vs.meta.id === vsID) {
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


        //the patient should always be present, so add it if not...
        var tip = "Click the 'Find Patient' button to find a patient with this identifier. If there is a single one found, then they will be used " +
            " to store resources against, - otherwise a new patient will be created."
        if (! vo.patient) {
            vo.patient = {name:'patient',extensions:[],core:[],tip : tip}
            vo.resource.push(vo.patient);
        } else {
            if (vo.patient.extensions.length > 0) {
                vo.patient.tip = "If you add an extension to this patient, then a new Patient Resource will be created, which can cause multiple patients with the same identifier";
            } else {
                vo.patient.tip = tip;
            }

        }

        //many of the resources will also need a prcatitioner. We'll make a list for now, but probably better elswhere...
        var needPractitionerList = ['encounter'];
        if (! vo.practitioner) {
            //if there's no practitioner, then need to see if any of the resources being created need one...
            var needPractitioner = false;
            $.each(vo.resource,function(inx,res){
                //console.log(res)
                if (needPractitionerList.indexOf(res.name) >-1) {
                    needPractitioner = true;
                }
            })
            //console.log(needPractitioner)
            if (needPractitioner){
                vo.practitioner = {name:'practitioner',extensions:[],core:[]}
                vo.resource.push(vo.practitioner);
            }
        }



        //a property for the handlebars template...
        if (vo.warning.length > 0) {
            vo.hasWarnings = true;
        }

        //now add the standard elements needed to generate the test data
        //the server has a list of these
        $.get("/api/coreResourceTestParams",function(params){
            //console.log(params)
            //console.log(vo.resource)
            $.each(vo.resource,function(inx,res){
                var resourceName = res.name;
                if (params[resourceName]) {
                    $.each(params[resourceName],function(inx1,param){
                        //vo[resourceName].core.push(param)
                        res.core.push(param)
                    })
                }
            })

            //finally, move the patient to the top of the list...
            var pos = -1;
            $.each(vo.resource,function(inx,res){
                if (res.name === 'patient') {
                    pos = inx;
                }
            })
            if (pos > 0){
                var patientEntry = vo.resource[pos];
                vo.resource.splice(pos,1);
                vo.resource.splice(0,0,patientEntry);
            }


            //and also indicate whether or not there is a test data builder for this resource...
            $.each(vo.resource,function(inx,res){
                console.log(res)
                if (Backbone.fhirTestBuilders.indexOf(res.name.toLowerCase()) > -1) {
                    res.builder=true;
                }
            });



            //console.log(vo);
            callback(vo);
        })





    }


});