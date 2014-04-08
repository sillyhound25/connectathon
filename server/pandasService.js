/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 8/04/14
 * Time: 11:25 AM
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
var _ = require('underscore');

exports.getPandasSample = function(callback){

    //var data = fs.readFileSync('../sampledata/samplePharmacy.csv', 'ascii');

    //console.log(fs.readFileSync('sampledata/samplePharmacy.csv').toString());


    var arJson = [];

    fs.readFile('/Users/davidha/projects/ipython/meds.csv', {encoding:'utf8'},function (err, data) {
    //fs.readFile('server/common.js', {encoding:'utf8'},function (err, data) {
        if (err) throw err;
        var ar = data.match(/[^\r\n]+/g);

console.log(ar.length)
      //  console.log('x');
      //  console.log(data)

        var arFieldPos = [];    //this links the numerical field index to the field name


        _.each(ar,function(line,inx){
            if (inx===0){
                //the first line is the header...
                var hdr = line.split(',');  //get all the headers
                hdr.forEach(function(name){
                    arFieldPos.push(name);              //this will now have all the field names
                })

//console.log(arFieldPos);

            } else {
                //these are data lines
                var fields = line.split(',');
                var item = {};
                _.each(fields,function(value,inx){
                    var n = arFieldPos[inx];    //field name at this position
                    item[n] = value;

                });

                console.log(inx)

               // var item = {admit:fields[1]}
                arJson.push(item);
            }


            //console.log(item)
        })
        //console.log(arJson)


        fs.writeFile("/Users/davidha/projects/ipython/meds.json", JSON.stringify(arJson), function(err) {
            callback( {});//arJson);
        });




    })


/*
    fs.readFileSync('sampledata/samplePharmacy.csv').toString().split('\r\n').forEach(function (line) {
        console.log(line);
    })
*/





   // var ar = [];
   // ar.push({name:'me',value:2,test:{r:1}})
   // ar.push({name:'me1',value:4,test:{r:1}})
   // ar.push({name:'me2',value:5,test:{r:1}})
   // return ar;
}