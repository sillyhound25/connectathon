/**
 * Created by davidhay on 17/05/14.
 */

/* global exports,require */

var _ = require("underscore");

var mongoDbCon;

exports.addRoutes = function(app){
    //return the log summary
    app.get('/admin/log/summary', function(req, res) {
        var collection = mongoDbCon.collection('RESTLog');

        var ar = [];
        var cursor = collection.find();
        //cursor.sort(fields).limit(n).skip(m).
        cursor.sort({time:1}).each(function(err,doc){
            //console.log(err,doc);
            if (doc){
                var item = {time:doc.time,method:doc.method,uri:doc.uri,statusCode:doc.statusCode,id:doc._id};
                if (doc.statusCode >= 300) {
                    //if there was an error, then add additional items...
                    item.body = doc.body;       //what the server send back
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