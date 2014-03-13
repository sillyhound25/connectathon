var _ = require('underscore');
var moment = require('moment');

//resource sample builder functions...
var Common = require('./common.js');
var Patient = require('./patient.js');
var Practitioner = require('./practitioner.js');
var Encounter = require('./encounter.js');
var Condition = require('./condition.js');
var Allergy = require('./allergyIntolerance.js');
var ValueSet = require('./valueset.js');


/* generate a bundle of resouces based on a profile that can be sent as a transaction to a server. The
 * principle is that there are functions (in the modules above) that can generate sample resources with some
  * specific parameters. So we parse the incoming data (as the vo - Value Object) and for each resource use the
  * supplied params to build the sample, and the extentions additionally. Each element code in the data array has a
  * naming convention - <resource>-<param> for a core resource and <resource>-ext-<param> for an extension*/
var generateSampleBundle = function(vo,callback) {
    var profileID = vo.profileID;       //the ID of the profile. We'll add this as a tag to the bundle...

    var objResources = {};   //this will be a object of resources...
    //first, get the list of resources to create.
    _.each(vo.items,function(item){
        var ar = item.code.split('-');
        var resource = ar[0];
        if (! objResources[resource]) {
            objResources[resource] = {params : [], extensions:[],name:resource}
        }
        if (ar[1] === 'ext') {
            //this is an extension
            objResources[resource].extensions.push({name:ar[2],value:item.value,dataType : item.dataType});
        } else {
            //this is a base parameter
            var code = ar[1];
            objResources[resource].params[code]= item.value;//.push({name:ar[1],value:item.value});
        }
    })

    //create the bundle
    var bundle = {resourceType:"Bundle"};
    bundle.title = "Adding resources for medication admin project";
    bundle.updated = moment().format();
    bundle.entry = [];

    //create the patient resource (There must a patient
    var patientOptions = objResources.patient;

    var samPatientEntry = Patient.getSample(patientOptions.params); //pass the params directly into the builder function

    //now add any extensions to patient...
    _.each(patientOptions.extensions,function(ext){
        samPatientEntry.content.extension = samPatientEntry.content.extension || [];
        var url = profileID + "#"+ ext.name;
        //console.log(ext);
        samPatientEntry.content.extension.push(Common.extension(url,ext.dataType,ext.value));
    })
    bundle.entry.push(samPatientEntry);

    _.each(objResources,function(res){
        console.log('resource name ' + res.name);
    })


   // var samEncounterEntry = Encounter.getSample({});



    callback(null,bundle);
}


exports.generateSampleBundle = generateSampleBundle;