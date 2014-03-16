/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 17/03/14
 * Time: 9:01 AM
 * To change this template use File | Settings | File Templates.
 */


var ProfileDetailView =  Backbone.View.extend({
    events : {
        "click .orionProfileDetailXXX" : "showDetail",
        "click .profile-extension" : "editExtension"
    },
    editExtension : function(ev){
        //edit a single extension
        var model = this.model.toJSON();
        var code = ev.currentTarget.getAttribute('data-code');      //the code of the extension
        this.trigger('profileDetail:editExtension',{id:model.meta.id,code:code});
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
        this.$el.html(this.template(this.model.toJSON()));
        //this.delegateEvents();
        $('#updatingProfileMsg').hide();
    }
})