/**
 * render a single question
 * User: davidha
 * Date: 26/04/14
 * Time: 6:20 AM
 * To change this template use File | Settings | File Templates.
 */

/* global $,BaseView, Backbone, console, Handlebars */


var QuestionnaireQuestionView = BaseView.extend({

    initialize : function() {
        var textHTML = "<input type='text' class='form-control {{displayClass}}' value = '{{value}}' id='{{questID}}'"+
            " placeholder='Enter the {{placeHolder}}'/>";
        this.textTemplate = Handlebars.compile(textHTML);

        var dateHTML = "<input type='date' class='form-control {{displayClass}}' value = '{{value}}' id='{{questID}}'"+
            " placeholder='Enter the {{placeHolder}}'/>";
        this.dateTemplate = Handlebars.compile(dateHTML);

        var booleanHTML = "<input type='checkbox' class='form-control {{displayClass}}' value = '{{value}}' id='{{questID}}'"+
            " />";
        this.booleanTemplate = Handlebars.compile(booleanHTML);

        var datetimeHTML = "<input type='datetime' class='form-control {{displayClass}}' value = '{{value}}' id='{{questID}}'"+
            " placeholder='Enter the {{placeHolder}}'/>";
        this.dateTimeTemplate = Handlebars.compile(datetimeHTML);

    },

    getHTML : function(callback) {
        var that = this;
        var quest = this.model;

        if (quest.options){
            //todo - at the moment the assumption is that the reference is to a valueset on the same server...
            //todo - note that at this point, we assume the valueset is cached... - see the mediator for details...
            var valueSetID = quest.options.reference.getLogicalID();

            //todo - need to check for relative and contained valuesets
            //need to get the valueset form whereever it is stored...
            var url = '/api/oneresourceabsolute/'+ btoa(quest.options.reference);

           // $.get(uri,function(data){

             //   console.log(data);

           // });

            //var url = '/api/oneresource/ValueSet/'+valueSetID;

            that.generateControl(callback,Backbone.myCache[url]);
            /*
            //console.log(url);
            //if the reference exists in the cache, then we can use it - otherwise we need to retrieve it...
            if (! Backbone.myCache[url]) {
                //todo handle error
                $.get(url,function(data) {
                    Backbone.myCache[url] = data;
                    console.log(data);
                    that.generateControl(callback,data);
                });
            } else {
                that.generateControl(callback,Backbone.myCache[url]);
            }
            */

        } else {
            that.generateControl(callback);
        }

    },

    generateControl : function(callback,data) {
        var quest = this.model;
        var extensions =Backbone.FHIRHelper.getAllExtensions(quest);
        var vo = {'value': quest.answerString,questID:this.questID,placeHolder:quest.text,displayClass:this.getDisplayClass()};
        var html = this.textTemplate(vo);   //default is a string

        if (data) {
            //if there's data then render as a list...
            //todo - change to an autocomplete. The calling app will need to attach the A/C control via the class attribute
            //todo - this code should probably be in a fhirhelper
            var html1 = "<select class='form-control'>";
            $.each(data.define.concept,function(inx,item){
                html1 += "<option value='"+item.code + "'>"+item.display+"</option>";
            });
            html1 += "</select>";
            //console.log(quest,html1);
            callback( html1);
        } else {
            if (extensions.answerFormat) {
                switch (extensions.answerFormat) {
                    case 'date' :
                        html = this.dateTemplate(vo);
                        break;
                    case 'datetime' :
                        html = this.datetimeTemplate(vo);
                        break;
                    case 'boolean' :
                        html = this.booleanTemplate(vo);
                        break;
                }
            }
            callback( html);
        }


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