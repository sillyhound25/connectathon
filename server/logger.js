/**
 * Created by davidhay on 17/05/14.
 */

/* global exports,require */


var _ = require("underscore");
var ObjectID = require('mongodb').ObjectID;

var mongoDbCon;

exports.addRoutes = function(app){

    //return a single log entry
    app.get('/admin/log/detail/:id', function(req, res) {
        var id = req.params.id;
        var collection = mongoDbCon.collection('RESTLog');
        collection.findOne({_id:ObjectID(id)},function(err,doc){
            res.json(doc);
        });
    });

    //return the log summary
    app.get('/admin/log/summary', function(req, res) {
        var collection = mongoDbCon.collection('RESTLog');

        var ar = [];
        var cursor = collection.find();
        cursor.sort({time:-1}).each(function(err,doc){
            //console.log(err,doc);
            if (doc){
                var item = {time:doc.time,method:doc.method,uri:doc.uri,statusCode:doc.statusCode,id:doc._id};
                if (doc.statusCode >= 300) {
                    //if there was an error, then add additional items...
                    //note that if the body is not valid json, then return it as a string in a json element
                    try {
                        item.body = JSON.parse(doc.body);       //what the server send back
                    } catch (ex) {
                        item.body = {body:doc.body};
                    }

                    item.resource = doc.savedResource;  //what we were trying to save (for a POST/PUT)
                }
                ar.push(item);
            } else {
                //end of the cursor...
                res.json(ar);
            }

        });
    });
};

exports.setDbCon = function(con) {
    mongoDbCon = con;
};