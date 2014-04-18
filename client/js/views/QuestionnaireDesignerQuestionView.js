/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:17 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireDesignerQuestionView = BaseView.extend({
    initialize : function() {
        //don't include string, as that is coded in the template...
        this.arAnswerFormat = ['decimal','integer','boolean','date','dateTime','instant',
            'single-choice','multiple-choice','open-single-choice','open-multiple-choice']



    },

    events : {
        "click #qdqAddSubGroup" : "addGroup",
        "click #qdqUpdateQuestion" : "update"
    },
    addGroup : function() {

        var quest = this.model;     //the model is the fhir pojo group

        quest.group = quest.group || [];
        quest.group.push({text:'new group',header:'new group'});
        console.log(quest)
        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    update : function() {
        //update this question
        var quest = this.model;     //the model is the fhir pojo group

        quest.text = $('#qdq_text').val();

        var code = $('#qdq_code').val();
        var system = $('#qdq_system').val();
        if (quest.name) {
            if (quest.name.coding) {
                quest.name.coding[0].code = code;
                quest.name.coding[0].system = system;
            } else {
                quest.name.coding = [{code:code,system:system}]
            }
        } else {
            quest.name = {coding:[{code:code,system:system}]}
        }

        //<url value="http://hl7.org/fhir/questionnaire-extensions#answerFormat"/>

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

            _.each(that.arAnswerFormat,function(opt){
                $('#qdq_answerType').append("<option value='"+opt+"'>"+opt+"</option>");
            })
            //that.$el.html(that.template({group:that.model,display:FHIRHelper.groupDisplay(that.model)}));
        })
    }
})