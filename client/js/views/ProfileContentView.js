/**
 * show the raw content of a Profile
 */
var ProfileContentView =  Backbone.View.extend({
    setModel : function(model) {
        //set the model & render
        this.model = model;
        this.render();
    },
    render : function(){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/profileContent.html',function(html){
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
        if (this.model) {
            var json = JSON.stringify(this.model.toJSON(),undefined,2);
            //console.log(json);
            this.$el.html(template({content:json}));
        }

    }

})
