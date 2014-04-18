/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:17 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireDesignerQuestionView = BaseView.extend({
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