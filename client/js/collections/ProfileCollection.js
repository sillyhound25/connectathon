/**
 *The collection for Profile models...
 */

var ProfileCollection = Backbone.Collection.extend({
    model: ProfileModel,
    url : "/api/profile/orion",

    findModelByResourceID : function(resourceID) {
        //return a model with the given resourceID
        //console.log(resourceID);
        var m = _.findWhere(this.models,{'id':resourceID});
        if (m) {return m;}
        //couldn't find a macthing model. Is this a new one?
        console.log(this.toJSON())


        var m1 = _.findWhere(this.models,{'cid':"new"});
        console.log(m1);
        return m1;
    },
    toJSON : function(){
        //return an array containing the contents
        var ar = [];
        _.each(this.models,function(model){
            ar.push(model.toJSON());
        })


        //sort the list by name
        ar.sort(function(a,b){
            //console.log(a,b)
            //todo - optimize this...
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1
            }  else return 1;
        })
        //console.log(ar)

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