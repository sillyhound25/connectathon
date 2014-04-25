/**
 * render a single question
 * User: davidha
 * Date: 26/04/14
 * Time: 6:20 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireQuestionView = BaseView.extend({

    getDisplayClass : function() {
        //the display class when rendering a form
        var quest = this.model;
        var klass = 'noCodeQuestion';
        if (quest.name && quest.name.coding && quest.name.coding.length > 0 && quest.name.coding[0].code) {
            klass = 'codedQuestion';
        }
        return klass;
    }

});