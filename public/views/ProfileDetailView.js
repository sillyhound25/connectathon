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
        "click #save_profile_changes" : "save"
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

        model.set('content',content);

        model.save({},{
            success : function() {
                //that.model.set({'isDirty':false});
                alert('Profile Updated');
                that.trigger('profile:added',{model:model});
            },
            error : function() {
                alert('sorry, there was an error saving the profile')
            }
        });
    },
    addExtension : function(ev){
        //add a new extension
        var jsonModel = this.model.toJSON();
        this.trigger('profileDetail:addExtension',{id:jsonModel.meta.id});
    },
    removeExtension : function(ev){
        //edit a single extension
        var model = this.model;
        var code = ev.currentTarget.getAttribute('data-code');      //the code of the extension
        console.log(code);
        model.deleteExtension(code);
        this.trigger('profile:updated');
    },
    editExtension : function(ev){
        //edit a single extension
        var jsonModel = this.model.toJSON();
        var code = ev.currentTarget.getAttribute('data-code');      //the code of the extension
        this.trigger('profileDetail:editExtension',{id:jsonModel.meta.id,code:code});
    },
    showDetailXXX : function(ev) {
        //alert('dirty VS');
        var id = $(ev.currentTarget).attr('data-id');
        this.trigger('profileList:select',{id:id});


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
        } else {
            this.$el.html(this.template());
        }


        //this.delegateEvents();
        $('#updatingProfileMsg').hide();
    }
})