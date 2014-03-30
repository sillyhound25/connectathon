/**
 *The collection for Profile models...
 */

var ProfileCollection = Backbone.Collection.extend({
    model: ProfileModel,
    url : "/api/profile/Orion Health",

    findModelByResourceID : function(resourceID) {
        //return a model with the given resourceID
        //console.log(resourceID);
        var m = _.findWhere(this.models,{'id':resourceID});
        if (m) {return m;}

        //couldn't find a macthing model. Is this a new one?
        console.log(this.toJSON())


        var m1 = _.findWhere(this.models,{'cid':"new"});        //note we're looking for a client ID...
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
        //called when loading up a collection of profiles..
        var that=this;
        var ar = [];
        _.each(response.entry,function(entry){
            //console.log(entry);
            //pull out the versionID if it exists...
            var vid = '';
            _.each(entry.link,function(link){
                if (link.rel === 'self') {
                    vid = link.href;
                }
            })

            ar.push({content:entry.content,id:entry.id,vid:vid});
            //console.log(entry.id);
            //if there are extensions in this profile, then fire an event so they can be parsed out...
            if (entry.content.extensionDefn) {
//console.log(entry.content.name);
                that.trigger("profile:extensiondefs",{ext:entry.content.extensionDefn,profile:entry.content})
            }
        })


        return ar;
    }
});