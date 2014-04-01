/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 17/03/14
 * Time: 9:01 AM
 * To change this template use File | Settings | File Templates.
 */


var ProfileDetailView =  Backbone.View.extend({
    events : {
        "click .remove_ext" : "removeExtension",
        "click .profile-extension" : "editExtension",
        "click #add_new_extension": "addExtension",
        "click .vsInExt" : "showValueSet",
        "click #save_profile_changes" : "save",
        "click #checkNewId" : "checkUniqueId",
         "blur .profile_header": function(){
             this.isDirty = true;
             $('#save_profile_changes').show();
         }
    },
    checkUniqueId : function() {
        //check that an ID that has been entered is unique...
        var id = $('#profile_id').val();
        var that = this;
        if (id) {
            var url = '/api/oneresource/Profile/'+id;

            var jqxhr = $.get(url, function() {
                alert( "There is already a Profile with the ID: " );
                $('#profile_id').val("");
            })
            .fail(function() {
                //there is no resource with that ID so it's OK to create a new one...
                $('#profile_id').addClass('alert alert-success');
                that.checkedId = id;
                //that.userEnteredId = id;
            })
        }
    },
    showValueSet : function(ev) {
        //todo thi should be a separate view...
        var vsURI = ev.currentTarget.getAttribute('data-code');
        console.log(vsURI);
        this.trigger('profileDetail:showVS',{uri:vsURI});

    },
    setNewProfile : function() {
        //set by the caller to indicate a new profile...
         this.isNew = true;
    },
    isDirty : function() {
        return this.isDirty;
    },
    save : function() {
        var that=this;
        var model = this.model;
        var content;// = {resourceType :"Profile"};
        if (! model) {
            model = new ProfileModel();
        }
        content = model.get('content');

        //set the value for the profile 'header' contents...
        content.name = $('#profileName').val();
        content.description = $('#profileDescription').val();
        content.requirements = $('#profileRequirements').val();

        if (! content.name || !content.description || !content.requirements) {
            alert('The profile name, description and requirements are all required');
            return;
        }

        if (this.isNew) {
            //if a new profile, then see if the user entered an Id, and also validated that it is new...
            var profileId = $('#profile_id').val();
            if (profileId) {
                if (!this.checkedId) {
                    alert("You entered an Id, so you need to check it doesn't already exist");
                    return;
                } else {
                    model.set('userEnteredId',profileId);
                }
            }
        }

        model.set('content',content);
        $('#save_profile_changes').text('Updating...').attr('disabled',true)
        console.log(model.toJSON())

        //now, lets see it it is valid. I want to do this before saving as I haven't quite got that working yet...


        model.save({},{
            success : function() {
                $('#save_profile_changes').text('Update Profile').attr('disabled',false)
                //that.model.set({'isDirty':false});
                //this.isNew = false;         //need to re-set this after a save - if the view is not re-set...
                alert('Profile Updated');
                that.trigger('profile:added',{model:model});

            },
            error : function(xhr,status,err) {
                console.log(xhr,status,err);
                $('#save_profile_changes').text('Update Profile').attr('disabled',false)
                alert('sorry, there was an error saving the profile ')
            }
        });
    },
    //this is called when a new model is assigned to the view. There's some state info we need to clear...
    setModel : function(model) {
        this.model = model;
        this.isDirty = false;       //not dirty yet
        this.isNew = false;         //and it sure ain't new...
        delete this.checkedId;      //and there can't be a user entered Id
        //console.log(model);


    },
    addExtension : function(ev){
        //add a new extension
      //  if (! this.model) {
          //  this.model = new ProfileModel();
      //  }
        content = this.model.get('content');

        //set the value for the profile 'header' contents...
        content.name = $('#profileName').val();
        content.description = $('#profileDescription').val();
        content.requirements = $('#profileRequirements').val();

        var jsonModel = this.model.toJSON();
        this.isDirty = true;    //will be dirty even if the addition is cancelled...
        this.trigger('profileDetail:addExtension',{id:jsonModel.meta.id});
    },
    removeExtension : function(ev){
        //remove an extension
        this.isDirty = true;
        var model = this.model;
        var code = ev.currentTarget.getAttribute('data-code');      //the code of the extension
        console.log(code);
        model.deleteExtension(code);
        this.trigger('profile:updated');
    },
    editExtension : function(ev){
        //edit a single extension
        this.isDirty = true;
        var jsonModel = this.model.toJSON();
        var code = ev.currentTarget.getAttribute('data-code');      //the code of the extension
        this.trigger('profileDetail:editExtension',{id:jsonModel.meta.id,code:code});
    },
    render : function(){
        //this.undelegateEvents();
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/oneProfile.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            })
        } else {
            this.draw();
        }

    },
    draw : function(){
        //actually render out the valueset...
//console.log(this.template(this.model.toJSON()));

        if (this.model) {
            this.$el.html(this.template(this.model.toJSON()));
//console.log(this.model.toJSON());
            //$('#op_profilename_label').html(this.template(this.model.toJSON().name));



            if (! this.isNew) {
                //if this is a new profile, then allow the ID to be entered
                $('#profile_id').attr('disabled',true)
            } else {
                //this is a new profile. Has the user entered and checked the ID?
                if (this.checkedId) {
                    //if they have, then set the value in the HTML and the background colour...
                    $('#profile_id').val(this.checkedId);
                    $('#profile_id').addClass('alert alert-success');
                }
            }




        } else {
            this.$el.html(this.template());
        }

        if (! this.isDirty) {
            //if tehre are no changes yet, then don't show the save changes button
            $('#save_profile_changes').hide();
        }




        //this.delegateEvents();
        $('#updatingProfileMsg').hide();
    }
})