/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 19/04/14
 * Time: 12:01 PM
 * To change this template use File | Settings | File Templates.
 */

    /*global BaseView, moment, $, _, Backbone */

var QuestionnaireDesignerHeaderView = BaseView.extend({
    initialize : function() {
        //this.arStatus = []
        this.arSystem = [];
        this.arSystem.push({label:'http://loinc.org',value:'http://loinc.org'});
        this.arSystem.push({label:'http://snomed.info/sct',value:'http://snomed.info/sct'});
        //this.arSystem.push('');
    },
    events : {
        "click .viewQDEP" : "view"


    },
    update : function() {
        //apply the updates to the model. Called by the designer...
        var model = this.model;     //this will be a pojo of the Questionnaire
        model.status =$("input[name='qdhStatus']:checked").val();
        //---- the name...

        model.authored = moment().format();

        var text = $('#qdh_text').val();
        var code = $('#qdh_code').val();
        var system = $('#qdh_system').val();
        if (text || code || system) {
            model.name = {coding: []};
            model.name.coding.push({system:system,code:code,display:text});
            model.name.text = text;

        } else {
            //name might be removed...
            if (model.name) {
                delete model.name;
            }
        }

        //console.log(model)

    },
    render: function() {
        var that = this;
        this.getTemplate('questionnaireDesignerHeader',function(){
            //create theheader for the Questionnaire...

            //console.log(that.model);
            //need to have the name property for rendering to work...

            if (! that.model.name) {
                that.model.name = {text:"",coding : [{code:"",system:""}]};
            }

            that.$el.html(that.template(that.model));
            //console.log(that.model);


            //ensure that we have all the system values as selectize won;t show it...
            _.each(that.model.name.coding,function(coding){
                Backbone.FHIRHelper.addToSystem(coding.system);
                /*
                var fnd = false;
                _.each(Backbone.myConstants.arSystem,function(mysys){
                    if (mysys.value === coding.system) {fnd=true;}
                });
                if (! fnd) {
                    //console.log('add')
                    Backbone.myConstants.arSystem.push({label:coding.system,value:coding.system});
                }
 */
            });

            //if there is an existing system, it needs to be added to Backbone.myConstants.arSystem
            //or selectize won't show it
/*
            if ()
            var fnd = false;
            _.each(Backbone.myConstants.arSystem,function(mysys){
                if (mysys.value === )
                Backbone.myConstants.arSystem.push({label:'http://loinc.org',value:'http://loinc.org/'});

            });
             */



            $('#qdh_system').selectize({
                //delimiter: ',',
                persist: false,
                maxItems: 1,
                create:true,
                options: Backbone.myConstants.arSystem,
                labelField: "label",
                valueField: "value"
            });

            //that.$el.html('here!');
            //console.log(that.model)
        });
    }
});

/*            {{#unless coding}}
 <div class="col-sm-5">
 <input type='text' class="form-control" id="qdh_text" placeholder="Form Name" value='{{display}}'/>
 </div>
 <div class="col-sm-2">
 <div><input type='text' class="form-control" id="qdh_code" placeholder="Code" value='{{code}}'/></div>
 </div>
 <div class="col-sm-3">
 <div><input type='text' class="" id="qdh_system" placeholder="System" value='{{system}}'/></div>
 </div>
 {{/unless}}*/