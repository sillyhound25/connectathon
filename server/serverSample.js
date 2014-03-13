var _ = require('underscore');
var moment = require('moment');

//resource sample builder functions...
var builder = {};
builder.common = require('./common.js');
builder.patient = require('./patient.js');
builder.practitioner = require('./practitioner.js');
builder.encounter = require('./encounter.js');
builder.condition = require('./condition.js');
builder.allergy = require('./allergyIntolerance.js');
builder.valueSet = require('./valueset.js');


/* generate a bundle of resouces based on a profile that can be sent as a transaction to a server. The
 * principle is that there are functions (in the modules above) that can generate sample resources with some
  * specific parameters. So we parse the incoming data (as the vo - Value Object) and for each resource use the
  * supplied params to build the sample, and the extentions additionally. Each element code in the data array has a
  * naming convention - <resource>-<param> for a core resource and <resource>-ext-<param> for an extension*/
var generateSampleBundle = function(vo,callback) {
    var profileID = vo.profileID;       //the ID of the profile. We'll add this as a tag to the bundle...

    //these are ID's to resources that other resources might refer to - like Patient & practitioner...
    var patientID;
    var practitionerID;

    console.log(JSON.stringify(vo));

    var objResources = {};   //this will be a object of resources...
    //first, get the list of resources to create.
    _.each(vo.items,function(item){
        var ar = item.code.split('-');
        var resource = ar[0];
        if (! objResources[resource]) {
            objResources[resource] = {params : {}, extensions:[],name:resource}
        }
        if (ar[1] === 'ext') {
            //this is an extension
            objResources[resource].extensions.push({name:ar[2],value:item.value,dataType : item.dataType});
        } else {
            //this is a base parameter
            var code = ar[1];
            console.log('43',resource,code,item.value)
            var r = objResources[resource];
            r.params[code]= item.value;//.push({name:ar[1],value:item.value});
        }
    })


    console.log(JSON.stringify(objResources));

    //create the bundle
    var bundle = {resourceType:"Bundle"};
    bundle.title = "Adding resources for medication admin project";
    bundle.updated = moment().format();
    bundle.entry = [];

    //create the patient resource (There must a patient - this is added by the test UI)
    var patientOptions = objResources.patient;
    var samPatientEntry = builder.patient.getSample(patientOptions.params); //pass the params directly into the builder function
    patientID = samPatientEntry.id;
    addExtensions(samPatientEntry, patientOptions.extensions);
    bundle.entry.push(samPatientEntry);

    //next to add is the practitioner. It is assumed that if any of the other resources in the profile have
    //a reference to practitioner, then the UI will ensure that Practitioner is added to the collection...
    if (objResources.practitioner) {
        var optionsPrac = objResources.practitioner;
        var practitionerEntry = builder.practitioner.getSample(optionsPrac.params); //pass the params directly into the builder function
        practitionerID = practitionerEntry.id;
        addExtensions(practitionerEntry, optionsPrac.extensions);
        bundle.entry.push(practitionerEntry);
    }

    //finally, we can add the other resources
    _.each(objResources,function(res){
        console.log('resource name ' + res.name);
        if (['patient','practitioner'].indexOf(res.name) === -1) {
            var options = res;
            options.params.patientID = patientID;
            options.params.practitionerID = practitionerID;
            var entry = builder[res.name].getSample(options.params); //pass the params directly into the builder function
            addExtensions(entry, options.extensions);
            bundle.entry.push(entry);
        }
    })


   // var samEncounterEntry = Encounter.getSample({});

    callback(null,bundle);

    function addExtensions(entryResource,extensions){
        _.each(extensions,function(ext){
            entryResource.content.extension = entryResource.content.extension || [];
            var url = profileID + "#"+ ext.name;
            entryResource.content.extension.push(builder.common.extension(url,ext.dataType,ext.value));
        })

    }
}


exports.generateSampleBundle = generateSampleBundle;