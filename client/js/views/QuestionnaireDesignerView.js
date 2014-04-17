/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireDesignerView = BaseView.extend({
    events : {
        "click .viewQ" : "view",
        "click .viewQSource" : "source"

    },
    render : function() {
        var that = this;
        console.log(this.model);
        this.getTemplate('questionnaireDesigner',function(){


            that.$el.html(that.template(that.model));
        })
    }


})