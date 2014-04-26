/**
 * display all extensions
 */

    /*global Backbone,$ ,Handlebars,sorttable */

var ExtensionView = Backbone.View.extend({


    render : function(){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/extension.html',function(html){
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
        var json = this.collection.toJSON();

        json.sort(function(a,b){
            //console.log(a,b)
            //todo - optimize this...
            if (a.code.toLowerCase() < b.code.toLowerCase()) {
                return -1;
            }  else {
                return 1;
            }
        });


        this.$el.html(template({entry:json}));

       var tbl =  document.getElementById('allextensions_tbl');

        sorttable.makeSortable(tbl);

    }

});