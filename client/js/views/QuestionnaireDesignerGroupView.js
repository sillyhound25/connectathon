/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireDesignerGroupView = BaseView.extend({

    events : {
        "click #qdgAddQuestion" : "addQuestion",
        "click #qdgAddSubGroup" : "addGroup",
        "click #qdgUpdateGroup" : "update"
    },
    update : function() {
        var group = this.model;     //the model is the fhir pojo group
        group.text = $('#qdgText').val();
        group.header = $('#qdgHeader').val();

        var numCols =$("input[name='qdGroupCols']:checked").val();

        //console.log(numCols)

        Backbone.FHIRHelper.addExtension(this.model,"fhir.orionhealth.com/questionnaire#numcol",numCols,"valueInteger");

        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    addGroup : function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        var group = this.model;     //the model is the fhir pojo group

        group.group = group.group || [];
        group.group.push({text:'new group',header:'new group'});
        console.log(group)
        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    addQuestion : function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        var group = this.model;     //the model is the fhir pojo group
        group.question = group.question || [];
        group.question.push({text:'new question'});
        console.log(group)
        //console.log('y')
        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    render : function() {
        var that = this;
        //console.log(this.model);
        this.getTemplate('questionnaireDesignerGroup',function(){

            that.$el.html(that.template({group:that.model}));
            //that.$el.html(that.template({group:that.model,display:FHIRHelper.groupDisplay(that.model)}));

            //set the column count



            var numCols = Backbone.FHIRHelper.getExtensionValue(that.model,"fhir.orionhealth.com/questionnaire#numcol","valueInteger");
            //console.log(numCols)
            if (numCols) {
                $('input[name="qdGroupCols"]').val([numCols]);
            }
        })
    }

})