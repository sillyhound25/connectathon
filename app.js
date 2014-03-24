
/**
 * Module dependencies.
 */

var express = require('express');
var request = require('request');   //https://github.com/mikeal/request
var moment = require('moment');
var async = require('async');
var _ = require('underscore');
var fs = require('fs');

//FHIR sample modules
var Common = require('./server/common.js');
var Patient = require('./server/patient.js');
var Practitioner = require('./server/practitioner.js');
var Encounter = require('./server/encounter.js');
var Condition = require('./server/condition.js');
var Allergy = require('./server/allergyIntolerance.js');
var ValueSet = require('./server/valueset.js');

var mSample = require('./server/serverSample.js');  //used to generate sample messages...

//var app = module.exports = express.createServer();
var app = express.createServer();

var FHIRCoreRegistry = 'http://spark.furore.com/fhir/';

var FHIRServerUrl = 'http://hisappakl/blaze/fhir/';
// var FHIRServerUrl = 'http://spark.furore.com/fhir/';
//var FHIRServerUrl = 'http://fhir.healthintersections.com.au/open/';
// Configuration

app.configure(function(){
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/client'));
});

//perform a query against a fhir server
app.get('/api/generalquery/:query', function(req, res){

    console.log(JSON.parse(req.params.query));
    var query = JSON.parse(req.params.query);
    var url = "";
    _.each(query.params,function(param){
        url += "&" + param.name + '=' + param.value ;
    })


    url = query.resource + '?'+ url.slice(1);
    console.log(url)


    performQueryAgainstFHIRServer(url,null,function(resp){
        res.json(resp);
    })

});



//the parameters for each resource that can be set by a parameter. These are the parameters
//that can be passed to the various builder modules - like patient.js
app.get('/api/coreResourceTestParams', function(req, res){
    var params = {};
    params.patient = [];
    params.patient.push({code:'fname',display:'First Name',default:'John'})
    params.patient.push({code:'lname',display:'Last Name',default:'Cardinal'})
    params.patient.push({code:'identifier',display:'Identifier',default:'ABC1235',lookupPatient:true})
    params.practitioner = [];
    params.practitioner.push({code:'name',display:'Full Name',default:'Marcus Welby'})
    res.json(params);
});


//create a set of samples based op a profile
app.post('/api/createprofilesample', function(req, res){
    //var vsID = req.params.id;
    var sample = req.body;
    console.log('generating test data...');


    mSample.generateSampleBundle(sample,function(err,bundle,messages){
        //now send the bundle to the server for saving...
        if (!err) {
            logBundle(bundle,'testData',function(){


                postBundleToFHIRServer(bundle,function(resp){
                    resp.messages = messages;
                    res.json(resp);
                })

            })
        } else {
            resp.messages = "Error: " + err;
            res.json(resp);
        }




    })

});


//get a specific profile by name and publisher
app.get('/api/profile/:name/:publisher', function(req, res){
    var query = 'Profile?name='+req.params.name + '&publisher=' + req.params.publisher;

    //if the profile that is being requested is one of the core ones, then get is from the
    //core registry server.
    var server = null;
    if (req.params.publisher === 'FHIR Project') {
        server = FHIRCoreRegistry;
    }

    performQueryAgainstFHIRServer(query,server,function(resp){
        res.json(resp);
    })

});

//get a specific profile by name and publisher
app.get('/api/conformance', function(req, res){
    var query = 'metadata';
    performQueryAgainstFHIRServer(query,null,function(resp){
        res.json(resp);
    })
});

//update a resource (the resource type is inside teh resource
app.put('/api/:id', function(req, res){
    var vsID = req.params.id;
    var resource = req.body;

    putToFHIRServer(resource,vsID,function(resp){
        resp.content = resource;
        logResource(resource,function(){
            res.json(resp);
        })

    })

});

//get all profiles published by a specific publisher
app.get('/api/profile/:publisher', function(req, res){
    var query = 'Profile?publisher=' + req.params.publisher;
    performQueryAgainstFHIRServer(query,null,function(resp){
        res.json(resp);
    })
});


//retrieve a specific valueset
app.get('/api/valueset/id/:id', function(req, res){
    var vsID = req.params.id;
    //console.log(vsID);
    //extrct out the logicalID
    //todo - big assumption here - we are assuming that all resources come from the same server

    var ar = vsID.split('/');
    var ID = ar[ar.length-1];
    //console.log(ID)

    var query = 'ValueSet/'+ ID;
    performQueryAgainstFHIRServer(query,null,function(resp){
        res.json(resp);
    })
})
/*
//add a new valueset
app.post('/api/valuesetXXXXX', function(req, res){
    var vsID = req.params.id;
    var resource = req.body;

    //console.log(resource,vsID)


    postToFHIRServer(resource,function(resp){
        resp.content = resource;
        putToFHIRServer(resource,vsID,function(resp){
            resp.content = resource;
            logResource(resource,function(){
                res.json(resp);
            })
        //res.json(resp);
    })
});
    */


//the resource name is in the resource. todo - change
app.post('/api', function(req, res){
    //var vsID = req.params.id;
    var resource = req.body;

    //console.log('saving',resource)


    postToFHIRServer(resource,function(resp){
        resp.content = resource;

        logResource(resource,function(){
            res.json(resp,resp.statusCode);
        })



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
        console.log(response);
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

function logResource(resource,callback){
    var fileName = "./resourceBackup/"+resource.resourceType+ '-' + new Date().getTime() + '.json';
    fs.writeFile(fileName,JSON.stringify(resource), function(err) {
        if(err) {
            throw err;
        } else {
            callback();
        }
    });
}
//log a bundle
function logBundle(bundle,name,callback){
    var fileName = "./bundleBackup/"+name+ '-' + new Date().getTime() + '.json';
    fs.writeFile(fileName,JSON.stringify(bundle), function(err) {
        if(err) {
            throw err;
        } else {
            callback();
        }
    });
}


app.post('/api/createSamples', function(req, res){
    //console.log('/api/createSamples')

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

    //console.log(JSON.stringify(options));

    request(options,function(error,response,body){
        //console.log(response.statusCode);
        //console.log(body)
        var resp = {};
        resp.id = response.headers.location;
        resp.statusCode = response.statusCode;
        resp.body = body;
        resp.headers = response.headers;
        resp.error = error;
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
        resp.error = error;
        callback(resp);
    })
}


function performQueryAgainstFHIRServer(query,server,callback){

    //default the server URL...
    var fhirServer = FHIRServerUrl;
    if (server) {
        fhirServer = server;
    }

    var options = {
        method:'GET',
        headers : {
            "Accept" : 'application/json+fhir'
        },
        uri : fhirServer + query
    }



    console.log(options);
    //console.log(options);

    request(options,function(error,response,body){

        //console.log(error,response.statusCode,body);
        if (error) {
            throw error;
        }

        console.log(body);

        var b = body.substring(1)
        var c = body.substring(0,1);



        console.log('-' + c + '-');
        /*

        var
        var b = body.replace('\r','');
        var c = b.replace('\n','')

        console.log('=========')
        console.log(b);

console.log('---------------')
        console.log(c);

        console.log('xxxxxxxxxxx')
*/



        if (response.statusCode != 200) {
            //console.log(JSON.parse(body));
            console.log(body);
            throw 'error';
        }
        callback(JSON.parse(body));

    })
}

function performQueryAgainstFHIRServerXML(query,callback){
    var options = {
        method:'GET',
        headers : {
            "content-type" : 'application/xml+fhir'
        },
        uri : FHIRServerUrl + query
    }

    //console.log(options);

    request(options,function(error,response,body){

        if (response.statusCode != 200) {
            console.log(body);
            throw 'error';
        }
        callback(body);

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
            "Accept" : 'application/json+fhir'
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
    //console.log(options);
    request(options,function(error,response,body){
        //console.log('bundle post')
        //console.log(JSON.parse(body));
        if (error) {
            console.log(error);
            throw error;
        }
        var resp = {};
        resp.bundle = bundle;
        resp.id = response.headers.location;
        resp.statusCode = response.statusCode;
        resp.response = JSON.parse(body);
        resp.headers = response.headers;
        callback(resp);
    })
}

app.listen(4001);
console.log("Express server listening on port %d in %s mode", 4001, app.settings.env);
