
/* global Backbone, alert */

//the navigation bar for a questionnaire.
var QuestionnaireNavView = Backbone.View.extend({
    initialize : function() {
        //console.log('init');
    },
    events : {
        "click .mynav" : "select"
    },
    select : function() {
        //select a single group
        //todo - need scroll into view + how many questions completed and other stats
        //??? could the link have the number of incomplete questions in the display
        alert('This will do stuff relating to an individual group');
    },
    render : function(){

        //this.html += $('#saveButtonTemplate').html();   //render the save button
        this.$el.html(this.html);
    }
});