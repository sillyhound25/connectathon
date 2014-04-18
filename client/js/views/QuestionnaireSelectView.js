/**
 * Allow the user to select a questionnaire based on a number of criteria...
 */


var QuestionnaireSelectView = BaseView.extend({
    events : {
        "click .qselect" : "select",
        "click #lqNewQ" : "newQ"

    },
    newQ : function() {
        //create a new Questionnaire
        this.trigger("qlv:newQ");
    },
    select : function(ev) {
        //one of the 'type' radios was selected...
        var type = $(ev.currentTarget).val();
        this.trigger('qSelect:select',{type:type});
        //alert(type);
    },
    render : function() {
        var that = this;
        //console.log(this.model);
        this.getTemplate('questionnaireSelect',function(){
            //will setup that.template as a handlebars template
            //model is a fhir bundle...
            //console.log(that.$el)
            that.$el.html(that.template());

        })
    }

});