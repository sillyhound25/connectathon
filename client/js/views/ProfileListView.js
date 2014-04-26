/**
 * Generate list of profiles
 */

    /*global Backbone,$,confirm,Handlebars, */
var ProfileListView = Backbone.View.extend({
    events : {
        "click .orionProfileDetail" : "showDetail",
        "click #new_profile" : "newProfile",
        "click .delete-profile" : "deleteProfile"
    },
    deleteProfile : function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var id = $(ev.currentTarget).attr('data-id');
        if (confirm('Please confirm you wish to delete the profile with the ID: ' + id)) {
            this.trigger('profileList:delete',{id:id});
        }
    },
    newProfile : function(){
        $('.orionProfileDetail').removeClass('active');
        this.trigger('profileList:new');
    },
    showDetail : function(ev) {
        //alert('dirty VS');


        $('.orionProfileDetail').removeClass('active');
        var id = $(ev.currentTarget).attr('data-id');
        $(ev.currentTarget).addClass('active');

        this.trigger('profileList:select',{id:id});


    },
    render : function(){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/orionProfileList.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            });
        } else {
            this.draw();
        }
    },
    draw : function(){
        //actually render out the collection...
        var template = this.template;
        //console.log(this.collection.toJSON())
        this.$el.html(template({entry:this.collection.toJSON()}));
    }

});