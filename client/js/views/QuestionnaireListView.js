/**
 * Render a list of questionnaires and allow selection
 */



var QuestionnaireListView = BaseView.extend({
    events : {
        "click .viewQ" : "view",
        "click .viewQSource" : "source",
        "click .designQSource" : "design"


    },

    design : function(ev) {
        var that = this;
        var id = ev.currentTarget.getAttribute('data-id');
        that.trigger("qlv:design",{id:id});
/*
        $.get(id,function(Q){
            console.log(Q)

        }) */
    },
    source : function(ev) {
        var id = ev.currentTarget.getAttribute('data-id');
        $.get(id,function(data){
            console.log(data)
        })
        //window.open(id);
    },
    view : function(ev){
      var id = ev.currentTarget.getAttribute('data-id');
        this.trigger('qlv:view',{id:id});
    },
    render : function() {
        var that = this;
        console.log(this.model);
        this.getTemplate('questionnaireList',function(){
            //will setup that.template as a handlebars template
            //that.template();
            //model is a fhir bundle...
            //get the display title - not all Q;s have a name...
            _.each(that.model.entry,function(ent){
                ent.meta = {};
                if (ent.content.name) {
                    console.log(ent.content.name);
                    ent.meta.name = FHIRHelper.ccDisplay(ent.content.name)
                } else {
                    ent.meta.name = ent.id.getLogicalID();
                }
                console.log(ent)
            })



            that.$el.html(that.template(that.model));
        })
    }

});