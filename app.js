
/**
 * Module dependencies.
 */

var express = require('express');
var request = require('request');
var moment = require('moment');
var async = require('async');

//FHIR sample modules
var Common = require('./server/common.js');
var Patient = require('./server/patient.js');
var Practitioner = require('./server/practitioner.js');
var Encounter = require('./server/encounter.js');
var Condition = require('./server/condition.js');
var Allergy = require('./server/allergyIntolerance.js');
var ValueSet = require('./server/valueset.js');

//var app = module.exports = express.createServer();
var app = express.createServer();

var FHIRServerUrl = 'http://spark.furore.com/fhir/';
//var FHIRServerUrl = 'http://fhir.healthintersections.com.au/open/';
// Configuration

app.configure(function(){
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});



//get a specific profile by name and publisher
app.get('/api/profile/:name/:publisher', function(req, res){
    var query = 'Profile?name='+req.params.name + '&publisher=' + req.params.publisher;
    performQueryAgainstFHIRServer(query,function(resp){
        res.json(resp);
    })
});


//update a resource (the resource type is inside teh resource
app.put('/api/:id', function(req, res){
    var vsID = req.params.id;
    var resource = req.body;

    //console.log(resource,vsID)


    putToFHIRServer(resource,vsID,function(resp){
        resp.content = resource;
        res.json(resp);
    })

});

//get all profiles published by a specific publisher
app.get('/api/profile/:publisher', function(req, res){
    var query = 'Profile?publisher=' + req.params.publisher;
    performQueryAgainstFHIRServer(query,function(resp){
        res.json(resp);
    })
});


//retrieve a specific valueset
app.get('/api/valueset/id/:id', function(req, res){
    var vsID = req.params.id;
    console.log(vsID);
    //extrct out the logicalID
    //todo - big assumption here - we are assuming that all resources come from the same server

    var ar = vsID.split('/');
    var ID = ar[ar.length-1];
    console.log(ID)

    var query = 'ValueSet/'+ ID;
    performQueryAgainstFHIRServer(query,function(resp){
        res.json(resp);
    })
})

//add a new valueset
app.post('/api/valueset', function(req, res){
    var vsID = req.params.id;
    var resource = req.body;

    //console.log(resource,vsID)


    postToFHIRServer(resource,function(resp){
        resp.content = resource;
        res.json(resp);
    })

});

//update a valueset
app.put('/api/valueset/:id', function(req, res){
    var vsID = req.params.id;
    var resource = req.body;

    //console.log(resource,vsID)


    putToFHIRServer(resource,vsID,function(resp){
        resp.content = resource;
        res.json(resp);
    })

});

//get all the valuestes from a specific published
app.get('/api/valueset/:publisher', function(req, res){
    var publisher = req.params.publisher;


    request(getOptions(FHIRServerUrl+ 'ValueSet?publisher='+publisher),function(error,response,body){
        var resp1={};
        resp1.id = response.headers.location;
        resp1.statusCode = response.statusCode;
        resp1.response = JSON.parse(body);
        resp1.headers = response.headers;
        var resp = {};
        resp.content = resp1;
        res.json(resp);

    });

})

app.get('/api/patient/:patientID', function(req, res){
    var patientID = req.params.patientID;

    getPatientDataFromFHIRServer(patientID,function(bundle){
        var resp = {};
        resp.content = bundle;
        res.json(resp);
    })

})

app.post('/api/createSamples', function(req, res){
    console.log('/api/createSamples')

    var samPatientEntry = Patient.getSample({identifier:"orion1"});
    var samEncounterEntry = Encounter.getSample({});

    var samPractitionerEntry = Practitioner.getSample({});

    samEncounterEntry.content.subject = {reference:samPatientEntry.id};
    var participant = {individual : {reference:samPractitionerEntry.id},
        type: [Common.cc({code:'CON',display:'Consultant',system:'http://hl7.org/fhir/v3/ParticipationType'})]};
    samEncounterEntry.content.participant = [participant];

    var samCondition1Entry = Condition.getSample({});
    samCondition1Entry.content.subject = {reference:samPatientEntry.id};
    var samCondition2Entry = Condition.getSample({code:'73211009',display:'Diabetes',system:'http://snomed.info/sct'});
    samCondition2Entry.content.subject = {reference:samPatientEntry.id};


    var samAllergyEntry = Allergy.getSample({});
    samAllergyEntry.content.subject = {reference:samPatientEntry.id};


    var samVSEntry = ValueSet.getSample({});


    var bundle = {resourceType:"Bundle"};
    bundle.title = "Adding resources for medication admin project";
    bundle.updated = moment().format();
    bundle.entry = [];

    bundle.entry.push(samVSEntry);
  /*
    bundle.entry.push(samPatientEntry);
    bundle.entry.push(samEncounterEntry);
    bundle.entry.push(samPractitionerEntry);
    bundle.entry.push(samCondition1Entry);
    bundle.entry.push(samCondition2Entry);
    bundle.entry.push(samAllergyEntry);
*/

    postBundleToFHIRServer(bundle,function(resp){
        resp.content = bundle;
        res.json(resp);
    })
});

//post a resource to the configured FHIR server. returns the status code,response body and assigned ID
//
function postToFHIRServer(resource,callback) {
    var resourceType = resource.resourceType;
    var options = {
        method:'POST',
        headers : {
            "content-type" : 'application/json+fhir'
        },
        body : JSON.stringify(resource),
        uri : FHIRServerUrl + resourceType
    }

    request(options,function(error,response,body){
        var resp = {};
        resp.id = response.headers.location;
        resp.statusCode = response.statusCode;
        resp.body = body;
        resp.headers = response.headers;
        callback(resp);
    })
}

//put a resource to a FHIR server - ie an update...
function putToFHIRServer(resource,id,callback) {
    var resourceType = resource.resourceType;
    var options = {
        method:'PUT',
        headers : {
            "content-type" : 'application/json+fhir'
        },
        body : JSON.stringify(resource),
        uri : FHIRServerUrl + resourceType + "/" + id
    }

    request(options,function(error,response,body){
        var resp = {};
        resp.id = response.headers.location;
        resp.statusCode = response.statusCode;
        resp.body = body;
        resp.headers = response.headers;
        callback(resp);
    })
}


function performQueryAgainstFHIRServer(query,callback){
    var options = {
        method:'GET',
        headers : {
            "content-type" : 'application/json+fhir'
        },
        uri : FHIRServerUrl + query
    }

    //console.log(options);

    request(options,function(error,response,body){

        if (response.statusCode != 200) {
            console.log(JSON.parse(body));
            throw 'error';
        }
        callback(JSON.parse(body));

    })
}


function getPatientDataFromFHIRServer(patientID,callback){
    var that=this;
    var allResp = [];

    async.parallel([
        function(cb){

            request(getOptions(FHIRServerUrl+ 'Patient/'+patientID),function(error,response,body){


                var resp={};
                resp.id = response.headers.location;
                resp.statusCode = response.statusCode;
                resp.response = JSON.parse(body);
                resp.headers = response.headers;
                allResp.push(resp);
                cb();
            });
        },
        function(cb){

            request(getOptions(FHIRServerUrl+ 'Condition?subject='+patientID),function(error,response,body){

                var resp1={};
                resp1.id = response.headers.location;
                resp1.statusCode = response.statusCode;
                resp1.response = JSON.parse(body);
                resp1.headers = response.headers;
                allResp.push(resp1);
                cb();
            });
        },
        function(cb){

            request(getOptions(FHIRServerUrl+ 'Encounter?subject='+patientID),function(error,response,body){

                var resp={};
                resp.id = response.headers.location;
                resp.statusCode = response.statusCode;
                resp.response = JSON.parse(body);
                resp.headers = response.headers;
                allResp.push(resp);
                cb();
            });
        },
        function(cb){

            request(getOptions(FHIRServerUrl+ 'Allergy?subject='+patientID),function(error,response,body){

                var resp={};
                resp.id = response.headers.location;
                resp.statusCode = response.statusCode;
                resp.response = JSON.parse(body);
                resp.headers = response.headers;
                allResp.push(resp);
                cb();
            });
        }
    ],
    function(){
        callback(allResp);
    })

    function getOptionsXXX(uri)  {
        var options = {
            method:'GET',
            headers : {
                "content-type" : 'application/json+fhir'
            },
            uri : uri
        }
        return options;
    }

};


function getOptions(uri)  {
    var options = {
        method:'GET',
        headers : {
            "content-type" : 'application/json+fhir'
        },
        uri : uri
    }
    return options;
}

function postBundleToFHIRServer(bundle,callback) {
    var options = {
        method:'POST',
        headers : {
            "content-type" : 'application/json+fhir'
        },
        body : JSON.stringify(bundle),
        uri : FHIRServerUrl
    }

    request(options,function(error,response,body){

        //console.log(JSON.parse(body));

        var resp = {};
        resp.id = response.headers.location;
        resp.statusCode = response.statusCode;
        resp.response = JSON.parse(body);
        resp.headers = response.headers;
        callback(resp);
    })
}

app.listen(4000);
console.log("Express server listening on port %d in %s mode", 4000, app.settings.env);
