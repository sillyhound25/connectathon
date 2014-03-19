/**
 * Generate list of profiles
 */

var ProfileListView = Backbone.View.extend({
    events : {
        "click .orionProfileDetail" : "showDetail",
        "click #new_profile" : "newProfile"
    },
    newProfile : function(){
        this.trigger('profileList:new');
    },
    showDetail : function(ev) {
        //alert('dirty VS');
        var id = $(ev.currentTarget).attr('data-id');
        this.trigger('profileList:select',{id:id});


    },
    render : function(){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/orionProfileList.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            })
        } else {
            this.draw();
        }
    },
    draw : function(){
        //actually render out the collection...
        var template = this.template;
        console.log(this.collection)
        this.$el.html(template({entry:this.collection.toJSON()}));
    }

})