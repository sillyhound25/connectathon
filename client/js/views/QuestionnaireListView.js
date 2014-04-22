/**
 * Render a list of questionnaires and allow selection
 */

var QuestionnaireListView = BaseView.extend({
    initialize : function( ) {
        //a short template to render a list of patients...
        Handlebars.registerHelper('getPName',function(entry){
            try {
                return entry.content.name[0].text;
            } catch (e){
                return 'unknown name';
            }

        })
        Handlebars.registerHelper('getQName',function(entry){
            try {
                return entry.content.name.coding[0].display;
            } catch (e) {
                return 'Unnamed Questionnaire';
            }

        })

        var listPat = '<ul class="list-unstyled">{{#each entry}}<li>' +
            '<a href="#" class="qlOnePatient" data-id="{{id}}">{{getPName this}}</a></li>{{/each}}</ul>';
        this.listPatientTemplate = Handlebars.compile(listPat);

        var listQ = '<ul class="list-unstyled">{{#each entry}}<li>' +
            '<a href="#" class="qlPatientQ" data-id="{{id}}">{{getQName this}}</a></li>{{/each}}</ul>';
        this.listPatientQTemplate = Handlebars.compile(listQ);

    },
    events : {
        "click .viewQ" : "view",
        "click .fillin" : "fillin",
        "click .designQSource" : "design",
        "click #qlSelectPatient" : "selectPatient",
        "click .qlOnePatient" : "patientselected"
    },
    patientselected : function(ev) {
        //a patient has been selected from the list. Get their completed questionnaires
        //again, this should probably be in helper functions or the mediator
        var that=this;
        console.log(ev.currentTarget);
        var id = $(ev.currentTarget).attr('data-id');


        console.log(id);

        //get the patient and update the list. This code probably belongs in mediator
        var query = {resource:'Questionnaire',params : [{name:'subject',value:id.getLogicalID()}]};
        console.log(query)
        var queryString = JSON.stringify(query);

        console.log(queryString);
        $.get('/api/generalquery?query='+queryString,function(bundle){
            //if there was an error, then we'll get back an operation outcome...
            if (bundle.resourceType.toLowerCase()==='operationoutcome') {
                var err = "There was an error:\n ";
                if (bundle.issue && bundle.issue.length > 0) {
                    bundle.issue.forEach(function(issue){
                        err += issue.details + "\n";
                    })
                }
                alert(err)
            } else {


                console.log(bundle);
                //$('#pq_results').html(that.resultsTemplate(bundle));


                //render the list of matching patients
                $('#qlPatientQuestionnaires').html(that.listPatientQTemplate(bundle));


            }


        });



    },
    selectPatient : function() {
        var that=this;
        var name = $('#qlSelectPatientName').val();
console.log(name);
        //get the patient and update the list. This code probably belongs in mediator
        var query = {resource:'Patient',params : [{name:'name',value:name}]};
        console.log(query)
        var queryString = JSON.stringify(query);

        console.log(queryString);
        $.get('/api/generalquery?query='+queryString,function(bundle){
            //if there was an error, then we'll get back an operation outcome...
            if (bundle.resourceType.toLowerCase()==='operationoutcome') {
                var err = "There was an error:\n ";
                if (bundle.issue && bundle.issue.length > 0) {
                    bundle.issue.forEach(function(issue){
                        err += issue.details + "\n";
                    })
                }
                alert(err)
            } else {


                console.log(bundle);
                //$('#pq_results').html(that.resultsTemplate(bundle));


                //render the list of matching patients
                $('#qlPatientList').html(that.listPatientTemplate(bundle));


            }


        });


    },
    design : function(ev) {
        var that = this;
        var id = ev.currentTarget.getAttribute('data-id');
        that.trigger("qlv:design",{id:id});
    },

    fillin : function(ev) {
        var id = ev.currentTarget.getAttribute('data-id');
        this.trigger('qlv:fillin',{id:id});
    },
    view : function(ev){
        var id = ev.currentTarget.getAttribute('data-id');
        this.trigger('qlv:view',{id:id});
    },
    render : function() {
        var that = this;
        console.log(this.model);
        this.getTemplate('questionnaireList',function(){
            //will setup that.template as a handlebars template
            //model is a fhir bundle...
            //get the display title - not all Q;s have a name...
            _.each(that.model.entry,function(ent){
                ent.meta = {};
                if (ent.content.name) {
                    //console.log(ent.content.name);
                    ent.meta.name = FHIRHelper.ccDisplay(ent.content.name)
                } else {
                    ent.meta.name = ent.id.getLogicalID();
                }
            })
            that.$el.html(that.template(that.model));
        })
    }

});