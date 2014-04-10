/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 8/04/14
 * Time: 11:25 AM
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
var _ = require('underscore');
var moment = require('moment');


var arRiskFlags = [];

arRiskFlags.push({name:"polypharmacy",weight:4});
arRiskFlags.push({name:"frequentflier",weight:5});
arRiskFlags.push({name:"anticoagulant med",weight:3});
arRiskFlags.push({name:"elevatedGlu",weight:6});
arRiskFlags.push({name:"obese",weight:6});
arRiskFlags.push({name:"highRisk ethnicity",weight:6});


//generate the sample data
var arPatient=[];



for (var i= 0; i<100; i++){
    var patient = {};
    patient.name = 'Patient'+i;
    arPatient.push(patient);
}




//return the list of risk actors for a specific patient over time
exports.getPandasPatientRiskFlagsTime = function(time,callback){
    var cntFlags= arRiskFlags.length;
    //make up a random time series of flags...
    var arSample = [];
    var numPats = 10;





    var time = moment().add('d',-1).format('YYYY-MM-DD');

    for (var pat = 0; pat < numPats; pat++) {
        //for (var i=0;i<1;i++){      //just one time, okay?

            var snapShot = {time:time,flags:[]}
            //arSample.push(snapShot);
            var numFlags = Math.random()*cntFlags;
            var avoidDups = Array(cntFlags);     //array to avoid duplications
            for (var j=0 ;j < numFlags; j++) {
                var inx = parseInt( Math.random()*cntFlags);
                if (avoidDups[inx] !=='x') {
                    snapShot.flags.push(arRiskFlags[inx]);
                    avoidDups[inx] ='x'
                    arSample.push({patid:pat,time:time,flag:arRiskFlags[inx].name,risk:arRiskFlags[inx].weight})
                }
            }
       // }
    }


    callback(arSample)

}


//return the list of risk factors for all  patients at a specific time
exports.getPandasPatientRiskFlags = function(time,callback){
    var cntFlags= arRiskFlags.length;
    //make up a random time series of flags...
    var arSample = [];
    var numPats = 1;




    for (var pat = 0; pat < numPats; pat++) {
        for (var i=0;i<20;i++){
            var time = moment().add('d',-1*i).format('YYYY-MM-DD');
            var snapShot = {time:time,flags:[]}
            //arSample.push(snapShot);
            var numFlags = Math.random()*cntFlags;
            var avoidDups = Array(cntFlags);     //array to avoid duplications
            for (var j=0 ;j < numFlags; j++) {
                var inx = parseInt( Math.random()*cntFlags);
                if (avoidDups[inx] !=='x') {
                    snapShot.flags.push(arRiskFlags[inx]);
                    avoidDups[inx] ='x'
                    arSample.push({patid:pat,time:time,flag:arRiskFlags[inx].name,risk:arRiskFlags[inx].weight})
                }
            }
        }
    }


    callback(arSample)

}




exports.makeMemberJson = function(callback){
    var arJson = [];

    fs.readFile('/Users/davidha/projects/AlexUpdate/client/members.csv', {encoding:'utf8'},function (err, data) {
        if (err) throw err;
        var ar = data.match(/[^\r\n]+/g);   //split into lines

        var arFieldPos = [];    //this links the numerical field index to the field name
        _.each(ar,function(line,inx){
            if (inx===0){
                //the first line is the header...
                var hdr = line.split(',');  //get all the headers
                hdr.forEach(function(name){
                    arFieldPos.push(name);              //this will now have all the field names
                })
            } else {
                //these are data lines
                var fields = line.split(',');
                var item = {};
                _.each(fields,function(value,inx){
                    var n = arFieldPos[inx];    //field name at this position
                    item[n] = value;

                });
                arJson.push(item);
            }
        })



        fs.writeFile("/Users/davidha/projects/AlexUpdate/client/members.json", JSON.stringify(arJson), function(err) {
            callback( {});//arJson);
        });




    })
}


exports.getPandasSample = function(callback){
    var arJson = [];

    fs.readFile('/Users/davidha/projects/AlexUpdate/client/meds.csv', {encoding:'utf8'},function (err, data) {
        if (err) throw err;
        var ar = data.match(/[^\r\n]+/g);   //split into lines

        var arFieldPos = [];    //this links the numerical field index to the field name
        _.each(ar,function(line,inx){
            if (inx===0){
                //the first line is the header...
                var hdr = line.split(',');  //get all the headers
                hdr.forEach(function(name){
                    arFieldPos.push(name);              //this will now have all the field names
                })
            } else {
                //these are data lines
                var fields = line.split(',');
                var item = {};
                _.each(fields,function(value,inx){
                    var n = arFieldPos[inx];    //field name at this position
                    item[n] = value;

                });
                arJson.push(item);
            }
        })



        fs.writeFile("/Users/davidha/projects/AlexUpdate/client/meds.json", JSON.stringify(arJson), function(err) {
            callback( {});//arJson);
        });




    })
}