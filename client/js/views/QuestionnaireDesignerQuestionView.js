/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:17 AM
 * To change this template use File | Settings | File Templates.
 */

    /* global BaseView,Backbone,console,alert,$,_ */

var QuestionnaireDesignerQuestionView = BaseView.extend({
    initialize : function() {
        //don't include string, as that is coded in the template...
        this.arAnswerFormat = ['decimal','integer','boolean','date','dateTime','instant',
            'single-choice','multiple-choice','open-single-choice','open-multiple-choice'];
    },
    events : {
        "click #qdqAddSubGroup" : "addGroup",
        "click #qdqUpdateQuestion" : "update",
         "click #qdqAddQuestion" : "addQuestion",
         "click .form-control" : "flagDirty",
         "blur .form-control": "flagDirty",
         "click #qdqMoveUp" : "moveUp",
        "click #qdqMoveDown" : "moveDown"
    },
    moveUp : function() {
        //console.log('up')
        var parent = this.parentGroup;      //the group that this question belongs to
        var inx = this.positionInList;      //the index of this question in the list of questions
        if (inx > 0){
           this.swapQuestions(parent.question,inx,inx-1);
            Backbone.trigger('Q:updated');
        } else {
            alert('Already at the top');
        }
    },
    moveDown : function() {
        //console.log('dn')
        var parent = this.parentGroup;      //the group that this question belongs to
        var inx = this.positionInList;      //the index of this question in the list of questions
        if (inx < parent.question.length-1){
            this.swapQuestions(parent.question,inx,inx+1);
            Backbone.trigger('Q:updated');
        }  else {
            alert('Already at the bottom');
        }

    },
    swapQuestions : function(lst, index_a, index_b) {
        var temp = lst[index_a];
        lst[index_a] = lst[index_b];
        lst[index_b] = temp;
    },
    flagDirty : function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        //indicate that this question has been modified
        this._dirty = true;
        $('#qdq_modified').html('Modified');

    },
    addQuestion : function() {
        //add a new question to the group - ie a sibling question
        var parent = this.parentGroup;      //the group that this question belongs to

        //group.question = group.question || [];
        parent.question.push({text:'new question'});
        //console.log(group)

        Backbone.trigger('Q:updated');  //will cause the designer to re-render

    },
    addGroup : function() {
        //add a child group to this question
        var quest = this.model;     //the model is the fhir pojo group

        quest.group = quest.group || [];
        quest.group.push({text:'new group',header:'new group'});
        //console.log(quest)
        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    update : function() {
        //update this question
        //note that the id is constructed to be unique - {{cid}}qdq_{{name}}{{position}}
        //console.log(this.model);
        var quest = this.model;     //the model is the fhir pojo group
        var cid = this.cid;         //the client id for the view...
        quest.text = $('#' + cid + 'qdq_text').val();

        var code = $('#' + cid + 'qdq_code0').val();
        var system = $('#' + cid + 'qdq_system0').val();


        var answerFormat =$("#"+cid+"qdq_answerType").val();
        console.log(answerFormat);


        Backbone.FHIRHelper.addExtension(this.model,Backbone.myConstants.extensionDefn.answerFormat,answerFormat);
        //Backbone.FHIRHelper.addExtension(this.model,"http://hl7.org/fhir/questionnaire-extensions#answerFormat",answerFormat,"valueCode");


        if (quest.name) {
            if (quest.name.coding) {
                quest.name.coding[0].code = code;
                quest.name.coding[0].system = system;
            } else {
                quest.name.coding = [{code:code,system:system}];
            }
        } else {
            quest.name = {coding:[{code:code,system:system}]};
        }
        //delete this.model;
        this.model = quest;
        console.log(this.model);

        //the entry in the Table Of Contents for this entry...

        var tocEntry = $("div[data-id='"+cid+"']");
        var indent = parseInt(tocEntry.attr('data-indent'),10);
        var txt = "";
        console.log(indent);

        for (var i=0; i <= indent+1; i++){
            txt += "&nbsp;&nbsp;&nbsp;";
        }

        txt += quest.text.trim();
        tocEntry.html(txt);

        $('#'+cid+'qdqNotice').show().addClass('alert alert-success').html('Changes saved').fadeOut(2000);

        Backbone.trigger('Q:redrawContent');
        //Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    render : function() {
        var that = this;
        //console.log(this.model);
        this.getTemplate('questionnaireDesignerQuestion',function(){

            //console.log(that)

            //need to use a clone as we're adding illegal properties (cid) to the model so the id's can be unique......
            //note: **must** be a deep clone, or the coding will pick up the cid...
            var clone = {};
            $.extend(true,clone,that.model);

            //must be a name for the template to render the controls...
            if (! clone.name) {
                clone.name = {text:"",coding: [{code:"",system:""}]};
            }
            //add the cid as an attribute
            clone.name.coding[0].cid = that.cid;
            clone.cid = that.cid;

            //console.log(clone,that.cid);

            that.$el.html(that.template(clone));


            var answerFormatElement = that.cid+'qdq_answerType';
            _.each(that.arAnswerFormat,function(opt){
                $('#'+answerFormatElement).append("<option value='"+opt+"'>"+opt+"</option>");
            });

            //var answerFormat = FHIRHelper.getExtensionValue (clone,"http://hl7.org/fhir/questionnaire-extensions#answerFormat","valueCode")
            var answerFormat = Backbone.FHIRHelper.getExtensionValue (clone,
                Backbone.myConstants.extensionDefn.answerFormat);


            //console.log(answerFormat)
            if (answerFormat) {
                $('#'+answerFormatElement).val(answerFormat);
            }

            //check that the system is present in the lust of systems
            _.each(clone.name.coding,function(coding){
                Backbone.FHIRHelper.addToSystem(coding.system);
            });

            $('.qdq_system').selectize({
                persist: true,
                maxItems: 1,
                create:true,
                options: Backbone.myConstants.arSystem,
                labelField: "label",
                valueField: "value"
            });




            //that.$el.html(that.template({group:that.model,display:FHIRHelper.groupDisplay(that.model)}));
        });
    }
});