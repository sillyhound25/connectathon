/**
 *The collection for Profile models...
 */

var ProfileCollection = Backbone.Collection.extend({
    model: ProfileModel,
    url : "/api/profile/orion",

    findModelByResourceID : function(resourceID) {
        //return a model with the given resourceID
        //console.log(resourceID);
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
        _.each(response.entry,function(entry){
            ar.push({content:entry.content,id:entry.id});
            //console.log(entry.id);
        })
        return ar;
    }
});