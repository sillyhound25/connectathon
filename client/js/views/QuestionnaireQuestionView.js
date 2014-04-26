/**
 * render a single question
 * User: davidha
 * Date: 26/04/14
 * Time: 6:20 AM
 * To change this template use File | Settings | File Templates.
 */

/* global BaseView, Backbone, console, Handlebars */


var QuestionnaireQuestionView = BaseView.extend({

    initialize : function() {
        var textHTML = "<input type='text' class='form-control {{displayClass}}' value = '{{value}}' id='{{questID}}'"+
            " placeholder='Enter the {{placeHolder}}'/>";
        this.textTemplate = Handlebars.compile(textHTML);

        var dateHTML = "<input type='date' class='form-control {{displayClass}}' value = '{{value}}' id='{{questID}}'"+
            " placeholder='Enter the {{placeHolder}}'/>";
        this.dateTemplate = Handlebars.compile(dateHTML);

        var datetimeHTML = "<input type='datetime' class='form-control {{displayClass}}' value = '{{value}}' id='{{questID}}'"+
            " placeholder='Enter the {{placeHolder}}'/>";
        this.dateTemplate = Handlebars.compile(datetimeHTML);

    },

    getHTML : function() {
        var quest = this.model;
        var extensions =Backbone.FHIRHelper.getAllExtensions(quest);
        var vo = {'value': quest.answerString,questID:this.questID,placeHolder:quest.text,displayClass:this.getDisplayClass()};
        var html = this.textTemplate(vo);   //default is a string
        console.log(extensions);
        if (extensions.answerFormat) {
            switch (extensions.answerFormat) {
                case 'date' :
                    html = this.dateTemplate(vo);
                    break;
                case 'datetime' :
                    html = this.datetimeTemplate(vo);
                    break;
            }
        }

        return html;
        //return this.dateTemplate(vo);
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