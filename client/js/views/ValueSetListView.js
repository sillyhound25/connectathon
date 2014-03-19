/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 15/03/14
 * Time: 8:37 AM
 * To change this template use File | Settings | File Templates.
 */

//display the list of valuesets
var ValueSetListView = Backbone.View.extend({
    events : {
        "click .vsDetail" : "showDetail",
        "click #new_vs" : "newVS"
    },
    newVS : function(){
        this.trigger('vsList:new');
    },
    showDetail : function(ev) {
        //alert('dirty VS');
        var id = $(ev.currentTarget).attr('data-id');
        this.trigger('vsList:select',{id:id});


    },
    render : function(){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/listVS.html',function(html){
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
        //console.log(template({item:this.collection.toJSON()}));
        this.$el.html(template({item:this.collection.toJSON()}));
    }

})