/**
 *The collection for Profile models...
 */

    /* global ProfileModel,Backbone*/

var ProfileCollection = Backbone.Collection.extend({
    model: ProfileModel,
    url : "/api/profile/Orion Health",

    findModelByID : function(ID) {
        //return a model with the given  ID.
        var m = _.findWhere(this.models,{'id':ID});
        return m;
    },

    findProfilesUsingValueSet : function(id){
        //locate all the profiles in the collection that have a reference to the indicated valueset.
        //note that there is also a defined query that does something similar - though not for extensions..
        var arProfiles = [];
        id = id.toLowerCase();
        _.each(this.models,function(prof){
            //check the extensions
            var json = prof.toJSON();

            if (json.extensionDefn) {
                _.each(json.extensionDefn,function(ext){
                    //for each extenxionDefn, see if it is bound to a valueset...
                    if (ext.definition && ext.definition.binding) {
                        if (ext.definition.binding.referenceResource) {
                            //this is a reference to a resource - which must be a valueSet...
                            var reference = ext.definition.binding.referenceResource.reference;
                            //todo - this is a frgile comparison and could be made more robust...
                            if (reference.toLowerCase() === id) {
                                arProfiles.push( prof);
                            }
                            console.log(id, reference);
                        }

                    }

                })
            }


        })
        return arProfiles;
    },

    findModelByCID : function(cID) {
        //return a model with the given client ID.
        var m = _.findWhere(this.models,{'cid':cID});
        return m;
    },
    findModelByResourceIDDEP : function(resourceID) {
        //return a model with the given resourceID. If not found, will look for one with a cid: of 'new'
        console.log(resourceID);
        _.each(this.models,function(m){
            console.log(m.cid)
        })

        if (! resourceID) {
            //the id is null, look for a new one...
            var m1 = _.findWhere(this.models,{'cid':"new"});        //note we're looking for a client ID...
            console.log(m1);
            return m1;
        } else {

            var m = _.findWhere(this.models,{'id':resourceID});
            return m;
            //if (m) {return m;}

            //couldn't find a macthing model. Is this a new one?
            console.log(this.toJSON())
        }
    },
    toJSON : function(){
        //return an array containing the contents
        var ar = [];
        //console.log(this.models);
        _.each(this.models,function(model){
            var fModel = model.toJSON()

            if (fModel.resourceType ==='Profile') {
                ar.push(fModel);
            } else {
                console.log('Unexpected resource in profile list: ',model)
            }

        });

        //console.log(ar);


        if (ar.length > 0) {
            //sort the list by name
            ar.sort(function(a,b){
                //console.log(a,b)
                //todo - optimize this...
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                    return -1;
                }  else return 1;
            });
        }



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

                that.trigger("profile:extensiondefs",{ext:entry.content.extensionDefn,profile:entry.content})
            }
        })


        return ar;
    }
});