/**
 * Render a list of questionnaires and allow selection
 */



var QuestionnaireListView = BaseView.extend({
    events : {
        "click .viewQ" : "view"

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
            that.$el.html(that.template(that.model));
        })
    }

});