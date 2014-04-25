/**
 * Has a number of functions:
 *   - Render a list of questionnaire templates and allow selection
 *   - Allows the user to select a patient, view their Q's and create a new form (based on a template)
 */

var QuestionnaireListView = BaseView.extend({
    initialize : function( ) {

        //get the patient name from a Patient resource
        Handlebars.registerHelper('getPName',function(entry){
            try {
                return entry.content.name[0].text;
            } catch (e){
                return 'unknown name';
            }
        });

        //get the Q name from a Questionnaire resource
        Handlebars.registerHelper('getQName',function(entry){
            try {
                return entry.content.name.coding[0].display;
            } catch (e) {
                return 'Unnamed Questionnaire';
            }
        });


        //get a short questionnaire date -
        Handlebars.registerHelper('getQDate',function(entry){
            return moment(entry.content.authored).format('HH:MM');

        });


        //a short template to render a list of patients...
        var listPat = '<ul class="list-unstyled">{{#each entry}}<li>' +
            '<a href="#" class="qlOnePatient" data-id="{{id}}">{{getPName this}}</a></li>{{/each}}</ul>';
        this.listPatientTemplate = Handlebars.compile(listPat);

        //a short template to render a list of questionnaires for a patient...
        var listQ = '<ul class="list-unstyled">{{#each entry}}<li>' +
            '<a href="#" class="qlPatientQ" data-id="{{id}}">{{getQName this}} ({{getQDate this}})</a></li>{{/each}}</ul>';
        listQ += "<div><button class='btn btn-success pull-right' id='qlNewQ'>New Form</button> </div>";
        this.listPatientQTemplate = Handlebars.compile(listQ);

        //list the templates in the modal select box...
        var listTemplates = '<ul class="list-unstyled">{{#each entry}}{{#if include}}<div>' +
            '<input type="radio" name="qlTemplateNew" value="{{id}}"/> ' +
            '{{getQName this}}</div>{{/if}}</li>{{/each}}</ul>';
        this.listTemplates = Handlebars.compile(listTemplates);

    },
    events : {
        "click .viewQ" : "view",
        //"click .fillin" : "fillin",
        "click .designQSource" : "design",
        "click #qlSelectPatient" : "selectPatient",
        "click .qlOnePatient" : "patientselected",
        "click .qlPatientQ" : "QSelected",
        "click #qlNewQ" : "newForm",
        "click #qlEdit" : "edit"
    },
    edit : function() {
        //an existing form is selected for editing
        console.log(this.currentFormID);
        this.trigger('qlv:fillin',{questionnaireID:this.currentFormID,patientID : this.selectedPatientID });

        //this.trigger('qlv:edit',{questionnaireID:this.currentFormID});

    },
    newForm : function() {
        //the user wants to create a new form. Display a list of templates, and create a handler
        //to handle the 'select template' option.
        var that = this;

        //the dialog to display the list of possible templates
        var genDialogFrame = $('#generalModelDlg').html();      //the frams for the modal dialog
        $('#modalDialogDiv').html(genDialogFrame);      //write the frame to the DOM
        //will render the templates as a list. Note that the model is a bundle of Q's
        $('#modal-content').html(this.listTemplates(this.model));
        $('#generalDlgTitle').html('Please select the template to use');

        //this.model = the bundle of templates...
        //console.log(that.selectedPatientID);
        //and show the modal...
        $('#generalDlg').modal();

        //the handler when a template is selected
        $("#generalDlgSelect").on('click',function(){
            //that.newTemplateSelected();
            var qID =$("input[name='qlTemplateNew']:checked").val();

            //will cause the selected template to be displayed by fillin
            that.trigger('qlv:fillin',{questionnaireID:qID,patientID:that.selectedPatientID,isNew:true});

        })

    },
    QSelected : function(ev) {
        //a single questionnaire has been selected for viewing.


        console.log(ev.currentTarget);
        var id = $(ev.currentTarget).attr('data-id');
        this.currentFormID = id;          //save the id of the form so it is available for the edit (see above)
        this.trigger('qlv:view',{id:id});


    },
    patientselected : function(ev) {
        //a patient has been selected from the list. Get their completed questionnaires
        //again, this should probably be in helper functions or the mediator
        var that=this;
        //console.log(ev.currentTarget);
        this.selectedPatientID = $(ev.currentTarget).attr('data-id');

        //console.log(this.selectedPatientID);

        //get all the questionnaires where the subject is this patient
        var query = {resource:'Questionnaire',params : [{name:'subject',value:this.selectedPatientID.getLogicalID()}]};
        //console.log(query)
        var queryString = JSON.stringify(query);

        //console.log(queryString);
        $.get('/api/generalquery?query='+queryString,function(bundle){
            //if there was an error, then we'll get back an operation outcome...
            if (bundle.resourceType.toLowerCase()==='operationoutcome') {
                var err = "There was an error:\n ";
                if (bundle.issue && bundle.issue.length > 0) {
                    bundle.issue.forEach(function(issue){
                        err += issue.details + "\n";
                    })
                }
                alert(err);
            } else {
                //render the list existing questionnaires. There are handlers that allow them to be displayed
                $('#qlPatientQuestionnaires').html("<h4>Current Forms</h4>" + that.listPatientQTemplate(bundle));
            }
        });
    },
    selectPatient : function() {
        //the user has entered a patient name. Find the matching patients on the server and render in a list.
        //when a patient is selected, the handler at "patientselected" will display the current Q's for that person
        $('#qlPatientQuestionnaires').html("");
        var that=this;
        var name = $('#qlSelectPatientName').val();
        // console.log(name);
        //get the patient and update the list. This code probably belongs in mediator
        var query = {resource:'Patient',params : [{name:'name',value:name}]};
        //console.log(query)
        var queryString = JSON.stringify(query);

        //console.log(queryString);
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
                //render the list of matching patients
                that.matchingPatientsBundle = bundle;     //save the bundle with the matching patients for when one is selected
                $('#qlPatientList').html(that.listPatientTemplate(bundle));
            }
        });


    },
    design : function(ev) {
        var that = this;
        var id = ev.currentTarget.getAttribute('data-id');
        that.trigger("qlv:design",{id:id});
    },

    fillinDEP : function(ev) {
        //the user wants to fill in a form...
        var id = ev.currentTarget.getAttribute('data-id');
        this.trigger('qlv:fillin',{id:id});
    },
    view : function(ev){
        var id = ev.currentTarget.getAttribute('data-id');
        this.trigger('qlv:view',{id:id});
    },
    render : function() {
        //initial render. Lays out the overall page (including template list and patient select)
        //then displays all the templates from the server
        var that = this;
        //console.log(this.model);
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
            });
            that.$el.html(that.template(that.model));
        })
    }

});