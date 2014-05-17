/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 15/03/14
 * Time: 7:45 AM
 * To change this template use File | Settings | File Templates.
 */
/* global console, Backbone, $, */

var ValueSetModel = Backbone.Model.extend({

    initialize: function(){

    },
    toJSON : function() {
        //return the JSON representation of the resource that this model refers to, with the id added as metadata...
        var resource = this.get('content');
        resource.meta = {id :this.get('id')};
        return resource;
    },
    sync : function(method,model,options) {
        //todo - apparently thic can be done once for all modela - Backbone.sync ...
        var uri = '/api/';
        var rest_method = 'PUT';
        var vs = model.get('content');

        console.log(vs);

        delete vs.meta;

        switch (method){
            case 'create' :
                rest_method = 'POST';
                break;

            case 'update' :
                //get the logical id
                var ar = model.get('id').split('/');
                var id = ar[ar.length-1];
                uri = uri +id;
                break;
            case 'delete' :
                rest_method = 'DELETE';
                var ar1 = model.get('id').split('/');
                var id1 = ar1[ar1.length-1];
                //the PUT and POST have the actual resource in the body...
                uri = uri + 'ValueSet/'+id1;
                break;

        }


        var vid = this.get('vid');
        console.log(vid,vs);


        $.ajax (uri,{
            method : rest_method,
            data : JSON.stringify(vs),
            headers : {
                'content-type' : 'application/json',
                'content-location' : vid
            },
            success : function(xhr,status){
                options.success(model);

            },
            error : function(xhr,status,err){
                options.error(model,err);

            }
        });



    }
})