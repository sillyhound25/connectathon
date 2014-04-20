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
        //console.log(quest)
        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    update : function() {
        //update this question
        //note that the id is constructed to be unique - {{cid}}qdq_{{name}}{{position}}
        console.log(this.model);
        var quest = this.model;     //the model is the fhir pojo group
        var cid = this.cid;         //the client id for the view...
        quest.text = $('#' + cid + 'qdq_text').val();

        var code = $('#' + cid + 'qdq_code0').val();
        var system = $('#' + cid + 'qdq_system0').val();

        console.log(code,system);

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
        //delete this.model;
        this.model = quest;
        console.log(this.model);

        //update the layout hieracrhy
        //$("ul[data-group='Companies'] li[data-company='Microsoft']")

        //the entry in the Table Of Contents for this entry...

        var tocEntry = $("div[data-id='"+cid+"']");
        var indent = parseInt( tocEntry.attr('data-indent'));
        var txt = "";
        console.log(indent)

        for (var i=0; i <= indent+1; i++){
            txt += "&nbsp;&nbsp;&nbsp;";
        }
        txt += quest.text.trim();
        //console.log(txt)
        tocEntry.html(txt);



        //console.log('|'+tocEntry.text()+'|');

        //console.log(tocEntry.text().split(" ").length + 1) //3


        //tocEntry.text('      al')

        //<div class='qGroup' data-id='"+groupView.cid+

        //Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    render : function() {
        var that = this;
        console.log(this.model);
        this.getTemplate('questionnaireDesignerQuestion',function(){

            //console.log(that)

            //need to use a clone as we're adding illegal properties (cid) to the model so the id's can be unique......
            //note: **must** be a deep clone, or the coding will pick up the cid...
            var clone = {};
            $.extend(true,clone,that.model)

            //must be a name for the template to render the controls...
            if (! clone.name) {
                clone.name = {text:"",coding: [{code:"",system:""}]}
            }
            //add the cid as an attribute
            clone.name.coding[0].cid = that.cid;
            clone.cid = that.cid;

            //console.log(clone,that.cid);

            that.$el.html(that.template(clone));

            _.each(that.arAnswerFormat,function(opt){
                $('#'+that.cid+'qdq_answerType').append("<option value='"+opt+"'>"+opt+"</option>");
            })

            $('.qdq_system').selectize({
                persist: true,
                maxItems: 1,
                create:true,
                options: Backbone.myConstants.arSystem,
                labelField: "label",
                valueField: "value"
            });




            //that.$el.html(that.template({group:that.model,display:FHIRHelper.groupDisplay(that.model)}));
        })
    }
})