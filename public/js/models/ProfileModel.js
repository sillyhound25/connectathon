/**
 * Represents a Profile
 */

ProfileModel = Backbone.Model.extend({

    initialize: function(d){
        //if the model is created without any attributes (as when creating a new profile), then create default content
        if (!d) {
            var content = {};
            content.resourceType = "Profile";
            content.identifier = content.identifier || 'oh'+new Date().getTime();
            content.status = "draft";
            content.experimental = true;
            content.date = moment().format();
            content.publisher='Orion Health'
            this.set('content',content)
        }




    },
    addExtension : function(extensionDefn) {
        var content = this.get('content');
        content.extensionDefn = content.extensionDefn || [];
        content.extensionDefn.push(extensionDefn);
    },
    updateExtension : function(extensionDefn) {
        //update the given extension in the content of the model
        var content = this.get('content');
        var pos = -1;
        $.each(content.extensionDefn,function(inx,ext){
            if (ext.code === extensionDefn.code) {
                pos = inx;
            }
        })
        if (pos > -1) {
            content.extensionDefn[pos] = extensionDefn;
        }
    },
    deleteExtension : function(code) {
        var content = this.get('content');
        var pos = -1;
        $.each(content.extensionDefn,function(inx,ext){
            if (ext.code === code) {
                pos = inx;
            }
        })
        if (pos > -1) {
            content.extensionDefn.splice(pos,1);
        }

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
        delete vs.meta;

        switch (method){
            case 'create' : {
                rest_method = 'POST';
                break;
            }
            case 'update' : {
                //get the logical id
                var ar = model.get('id').split('/');
                var id = ar[ar.length-1]
                uri = uri +id;
                break;
            }
        }




        $.ajax (uri,{
            method : rest_method,
            data : JSON.stringify(vs),
            headers : {
                'content-type' : 'application/json'
            },
            success : function(xhr,status){
                options.success(model)

            },
            error : function(xhr,status,err){
                options.error(model,err)

            }
        })



    }
})