/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 15/03/14
 * Time: 7:51 AM
 * To change this template use File | Settings | File Templates.
 */

var ValueSetCollection = Backbone.Collection.extend({
    model: ValueSetModel,
    url : "/api/valueset/orion",
    syncX : function() {
        console.log('sync called');
    },
    findModelByResourceID : function(resourceID) {
        //return a model with the given resourceID
        return _.findWhere(this.models,{'id':resourceID})
    },
    toJSON : function(){
        //return an array containing the contents
        var ar = [];
        _.each(this.models,function(model){
            ar.push(model.toJSON());
        })
        return ar;
    },
    parse : function(response,options) {
        //console.log(response);
        var ar = [];
        _.each(response.content.response.entry,function(entry){
            ar.push({content:entry.content,id:entry.id});
        })
        return ar;
    }
});
