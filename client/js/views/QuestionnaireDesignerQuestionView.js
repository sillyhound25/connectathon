/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:17 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireDesignerQuestionView = BaseView.extend({
    events : {
        "click #qdgAddSubGroup" : "addGroup",
        "click #qdqUpdateQuestion" : "update"
    },
    update : function() {
        //update this question
        var quest = this.model;     //the model is the fhir pojo group

        quest.text = $('#qdq_text').val();

        //the name - a cc

        //group.header = $('#qdgHeader').val();

        //var numCols =$("input[name='qdGroupCols']:checked").val();

        //console.log(numCols)

        //this.addExtension("fhir.orionhealth.com/questionnaire#numcol",numCols,"valueInteger");

        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    render : function() {
        var that = this;
        console.log(this.model);
        this.getTemplate('questionnaireDesignerQuestion',function(){

            //console.log(that)

            that.$el.html(that.template(that.model));
            //that.$el.html(that.template({group:that.model,display:FHIRHelper.groupDisplay(that.model)}));
        })
    }
})