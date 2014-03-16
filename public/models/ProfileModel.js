/**
 * Represents a Profile
 */

ProfileModel = Backbone.Model.extend({

    initialize: function(){

    },
    toJSON : function() {
        //return the JSON representation of the resource that this model refers to, with the id added as metadata...
        var resource = this.get('content')
        resource.meta = {id :this.get('id')};
        return resource;
    }

})