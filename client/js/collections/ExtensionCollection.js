/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 24/03/14
 * Time: 3:36 PM
 * To change this template use File | Settings | File Templates.
 */

var ExtensionCollection = Backbone.Collection.extend({
    model: ExtensionModel,
    addExtensions : function(ar,profile) {
        //get an array of extension models representing all extensions
        //console.log(ar)
        //add the profile details as a 'meta' property to all models
        _.each(ar,function(item){
            item.meta = {profileName:profile.name}
        })

        this.add(ar);
        //console.log(this.toJSON())
    }
});