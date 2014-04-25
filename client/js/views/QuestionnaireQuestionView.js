/**
 * render a single question
 * User: davidha
 * Date: 26/04/14
 * Time: 6:20 AM
 * To change this template use File | Settings | File Templates.
 */

/* global BaseView */
/* global Handlebars */

var QuestionnaireQuestionView = BaseView.extend({

    initialize : function() {
        var textHTML = "<input type='text' class='form-control {{displayClass}}' value = '{{value}}' id='{{questID}}'"+
            " placeholder='Enter the {{placeHolder}}'/>";
        this.textTemplate = Handlebars.compile(textHTML);
    },

    getHTML : function() {
        var quest = this.model;
        var vo = {'value': quest.answerString,questID:this.questID,placeHolder:quest.text,displayClass:this.getDisplayClass()};
        return this.textTemplate(vo);

    },

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