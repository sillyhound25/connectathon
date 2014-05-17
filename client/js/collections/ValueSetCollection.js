/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 15/03/14
 * Time: 7:51 AM
 * To change this template use File | Settings | File Templates.
 */
/* global Backbone,_,ValueSetModel, */

var ValueSetCollection = Backbone.Collection.extend({
    model: ValueSetModel,
    url : "/api/valueset/orion",
    findModelByResourceID : function(resourceID) {
        //return a model with the given resourceID
        return _.findWhere(this.models,{'id':resourceID});
    },
    toJSON : function(){
        //return an array containing the contents
        var ar = [];
        _.each(this.models,function(model){
            ar.push(model.toJSON());
        });
        return ar;
    },
    parse : function(response,options) {
        //console.log(response);
        var ar = [];
        _.each(response.entry,function(entry){
            //_.each(response.content.response.entry,function(entry){
            //pull out the versionID if it exists...
            var vid = '';
            _.each(entry.link,function(link){
                if (link.rel === 'self') {
                    vid = link.href;
                }
            });

            ar.push({content:entry.content,id:entry.id,vid:vid});
            //ar.push({content:entry.content,id:entry.id,vid:vid});
        });
        //console.log(ar);
        return ar;
    }
});
