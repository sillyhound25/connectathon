/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireDesignerGroupView = BaseView.extend({

    events : {
        "click #qdgAddQuestion" : "addQuestion"
    },
    addQuestion : function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        var group = this.model;     //the model is the fhir pojo group
        group.question = group.question || [];
        group.question.push({text:'new question'});
        //console.log(group)
        //console.log('y')
        Backbone.trigger('newquestion',{group:group});
    },
    render : function() {
        var that = this;
        //console.log(this.model);
        this.getTemplate('questionnaireDesignerGroup',function(){

            that.$el.html(that.template({group:that.model}));
            //that.$el.html(that.template({group:that.model,display:FHIRHelper.groupDisplay(that.model)}));
        })
    }

})