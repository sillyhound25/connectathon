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
        console.log(content)
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
    myValidate : function(model,clean,callback) {
        //validate the resource. If clean is true, then remove all the metadata items in the resource...
        var fhirProfile = model.get('content');
        var err = "";
        if (clean) {
            delete fhirProfile.meta;
        }

        _.each(fhirProfile.extensionDefn,function(ext){
            if (ext.meta) {
                if (clean) {
                    delete ext.meta;
                }

                if (! ext.context[0]) {
                    err += 'There is an empty context field in an extension';
                }
            }
        })
        if (! fhirProfile.extensionDefn || fhirProfile.extensionDefn.length < 1 ) {
            err += 'There must be at least one Extension in a profile (at the moment)';
        }


        return {err:err,fhirProfile:fhirProfile};

        //callback(err,fhirProfile);
    },
    validateAndClean : function(model,callback) {
        //validate the profile and remote any meta nodes...
        //todo this could be tidied...
        console.log(model)

        var vo = this.myValidate(model,true);
        callback(vo.err,vo.fhirProfile);

      //  this.myValidate(model,true,function(err,fhirProfile){
          //  callback(err,fhirProfile);
       // })
        //var fhirProfile = model.get('content');

        /*
        var err = "";
        delete fhirProfile.meta;

        _.each(fhirProfile.extensionDefn,function(ext){
            if (ext.meta) {
                delete ext.meta;
                if (! ext.context[0]) {
                    err += 'There is an empty context field in an extension';
                }
            }
        })
        */
        //console.log(fhirProfile);
       // callback(err,fhirProfile);

    },
    sync : function(method,model,options) {
        //todo - apparently thic can be done once for all models - Backbone.sync ...
        var uri = '/api/';
        var rest_method = 'PUT';


        var userEnteredId= this.get('userEnteredId');


        this.validateAndClean(model,function(err,fhirProfile){
            if (err) {
                alert(err);
                options.error(null,null,err);
                return;
            } else {

                //console.log(vs);

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
                    case 'delete' : {
                        rest_method = 'DELETE';
                        var ar = model.get('id').split('/');
                        var id = ar[ar.length-1]
                        //the PUT and POST have the actual resource in the body...
                        uri = uri + 'Profile/'+id;
                        break;
                    }
                }

                //if  the user has entered an id for a new profile, need to be able to execute a PUT
                if (userEnteredId && method === 'create') {
                    rest_method = 'PUT';
                    uri = uri + userEnteredId;
                }


                //need to include the versionid
                var vid = model.get('vid');
                //console.log(rest_method,vid,JSON.stringify(fhirProfile))



                $.ajax (uri,{
                    method : rest_method,
                    data : JSON.stringify(fhirProfile),
                    headers : {
                        'content-type' : 'application/json',
                        'content-location' : vid
                    },
                    success : function(xhr,status){
                        options.success(xhr,status)

                    },
                    error : function(xhr,status,err){
                        //console.log(err);
                       // console.log('error: ' + xhr.responseText)
                        //responseText will ave properties statusCode & body - from the proxy...

                        console.log(xhr.responseText)

                        options.error(xhr,status,err)

                    }
                })

            }


        })




    }
})