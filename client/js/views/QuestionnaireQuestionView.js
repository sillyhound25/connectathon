/**
 * render a single question
 * User: davidha
 * Date: 26/04/14
 * Time: 6:20 AM
 * To change this template use File | Settings | File Templates.
 */

/* global $,BaseView, Backbone, console, Handlebars,_ */


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
        var Q = this.Q;
        var quest = this.model;

        if (quest.options){
            //todo - at the moment the assumption is that the reference is to a valueset on the same server...
            //todo - note that at this point, we assume the valueset is cached... - see the mediator for details...
            var valueSetID = quest.options.reference.getLogicalID();

            //todo - need to check for relative and contained valuesets
            //need to get the valueset form whereever it is stored...



            //this is a contained valueset (SCTT 2006 Psychosocial))
            if (quest.options.reference.substr(0,1) === '#') {
                //this is an internal valueset
                var internalId = quest.options.reference.substr(1);
                var vs;
                console.log(internalId,Q);
                _.each(Q.contained,function(res){
                    if (res.id === internalId) {
                        vs = res;
                    }
                });
                if (vs) {
                    that.generateControl(callback,vs);
                }

            } else {
                //this is an external valueset...
                var url = '/api/oneresourceabsolute/'+ btoa(quest.options.reference);
                that.generateControl(callback,Backbone.myCache[url]);
            }




        } else {
            that.generateControl(callback);
        }

    },

    generateControl : function(callback,data) {
        var quest = this.model;
        var that = this;
        var extensions =Backbone.FHIRHelper.getAllExtensions(quest);
        var vo = {'value': quest.answerString,questID:this.questID,placeHolder:quest.text,displayClass:this.getDisplayClass()};
        var html = this.textTemplate(vo);   //default is a string

        if (data && data.define && data.define.concept) {
            //if there's data then render as a list...
            var html1 = "";
            var numberOfOptions = data.define.concept.length;


            console.log(quest.answerString);


            //if there are more than 5 in the list, make it an autocomplete
            var klass = '';

            if (numberOfOptions < 4) {
                //if less that 4 then render as radios
                $.each(data.define.concept,function(inx,item){
                    html1 +=  " <div><input type='radio' value='"+item.code + "'/> "+item.display + "</div>";
                });
            } else {
                //if more than 8 then use an autocomplete, otherwise an ordinary dropdown...
                if (numberOfOptions > 8) {
                    klass='makeAC';
                }
                html1 = "<select id='"+that.questID +"' class='form-control "+klass+"'>";
                html1 += "<option value=''></option>";

                $.each(data.define.concept,function(inx,item){
                    html1 += "<option value='"+item.code + "'";

                    if (quest.answerString && quest.answerString == item.code) {
                        html1 += " selected = 'selected' ";
                    }


                    html1 += ">"+item.display+"</option>";
                });
            }


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