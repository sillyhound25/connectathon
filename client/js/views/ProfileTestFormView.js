/**
Manage the test data form
 */


var ProfileTestFormView = Backbone.View.extend({
    initialize : function() {
        this.meta = {};     //keep my properties - eg the extension  - in a separate property...
    },
    events : {
        "click #submitTD" : "createSampleMessage",
        "click #btnGenerateTD" : "generateForm",
        "click .myToggle" : "togglePanel",
        "click #td_lookup" : "lookupPatient"
    },
    lookupPatient : function(ev) {
        var that = this;
        ev.preventDefault();
        var query = {resource:'Patient',params : []};
        var v = $('input:text[data-code=patient-identifier]').val();
        if (!v) {
            alert('Please enter the identifier in the input and try again');

            return;
        }
        query.params.push({name:'identifier',value:v});
        var queryString = JSON.stringify(query);
        //console.log(queryString);

        $('#td_lookup').text('Please wait...')
        $.get('/api/generalquery/'+queryString,function(bundle){
            //console.log(bundle);
            $('#td_lookup').text('Find Patient');
            $('#submitTD').attr('disabled',false);        //allow the form to be submitted...
            var numPatients = bundle.entry.length;

            switch (numPatients) {
                case 0 : {
                    alert('No patient with this identifier found, a new Patient resource will be generated, and the other resources attached to it')
                    break;
                }
                case 1 : {
                    alert('Patient found. The new resources will be attached to that patient');
                    var ar = bundle.entry[0].id.split('/');
                    //console.log(bundle.entry[0].id,ar);
                    try {
                        //set the name properties
                        //console.log(bundle);
                        var patientFName = bundle.entry[0].content.name[0].given[0];
                        var patientLName = bundle.entry[0].content.name[0].family[0];
                        var el = $("input[data-code='patient-fname']");
                        $(el).val(patientFName).attr('disabled',true);
                        el = $("input[data-code='patient-lname']");
                        $(el).val(patientLName).attr('disabled',true);

                        $('#patientcreatedID').html(bundle.entry[0].id);


                    } catch (err){
                        console.log("Error setting name property: " + err)
                    }

                    that.patientID = "Patient/"+ar[ar.length-1];
                    //console.log(that.patientID);
                    break;
                }
                default : {
                    alert('Multiple Patients ('+numPatients+') found with this identifier. A new one will be created. You might want to try a new Identifier')
                    break;
                }
            }
        })

    },
    togglePanel : function(ev){
        //toggle the dataentry panel...
        var panel = ev.currentTarget.getAttribute('data-toggle');
        $("#"+panel).toggle();
    },
    generateForm : function() {
        var that = this;
        if (! this.model) {
            alert('Please select a profile first');
            return;
        }

        this.patientID = "";    //re-set the patient ID

        var profile = this.model.get('content');       //the fhir profile object...
        var colVS = this.meta.colVS;
        var profileTestFormModel = new ProfileTestFormModel();
        profileTestFormModel.getExtensions(profile,colVS,function(data){
            //data.resource is the array of resources to render. (also duplictaed as first level members)...
            //daat.profile is the profile
            //data.warnings are warnings
            console.log(data)
            that.render(data);
            //now disable the submit button until the patient ID is checked...
            $('#submitTD').attr('disabled',true);
        })

    },
    createSampleMessage : function() {
        //create the sample (test) data that will be sent to the server. The server will then create a bundle
        //that can be posted to the server...

        //if there are extensions to patient then a new patient will be created. todo ??? what to do about duplicate identifiers??
        // Otherwise, the server
        //will check if there is already a patient with the given identifier and re-use that one...

        var areThereExtensionsToPatient = false;

        //the patientID will only be set if the patient was checked, and there was a single patient with the given identifier
        var sampleData = {profileID:$('#td_profileid').val(),items:[],patientID : this.patientID};
        //get all the controls marked as data controle in the container...
        this.$el.find(".tf-data").each(function(inx,el){
            var value = $(el).val();
            var dataType = $(el).attr('data-dataType');
            //need to fix the value for boolean datatypes.
            switch (dataType) {

                case 'boolean' : {
                    if (value === 'on') {
                        value = true;
                    }
                    break;
                }
            }
            console.log(dataType);
            //todo - need to decied what to do with boolean false - do we always send booleans???
            if (value) {
                var code = $(el).attr('data-code');
                if (code) {
                    //code is in the format <resource>-ext-<code> if an extension
                    //or <resource>-<code> if not.
                    if (code.indexOf('patient-ext') > -1) {
                        areThereExtensionsToPatient = true;
                    }
                    sampleData.items.push({code:code,value:value,dataType:dataType})
                } else {
                    alert('value of '+value+ " didn't have a code...")
                    console.log();
                }

            }

        })

        //Warn the user that there will be a new patient creataed.
        if (areThereExtensionsToPatient) {
            if (! confirm('There are Patient extensions here. This will mean a new Patient resource will be created. Are you sure?')){
                return;
            }
        }

        $('#td_form_data').hide();
        $('#td_waiting').show();
        $('#submitTD').attr('disabled',true);


//alert('submit')
        //return;

        // console.log(sampleData);
        //post the sample to the server
        $.ajax({
            type: "POST",
            url: '/api/createprofilesample',
            headers : {
                'content-type' : 'application/json'
            },
            data: JSON.stringify(sampleData),
            //the return from the proxy server will always be 200. The repsponse form the remote (FHIR) server
            //will be in the statusCode property
            success: function(data,status,xhr) {
                console.log(data);
                //alert('The resources have been successfully saved.')

                if (data.statusCode === 200) {      //note that success for a single resource is 201 but for a bundle is 200
                    $('#td_success').show();
                    //now update the ID's that were created by the server...
                    if (data.response.entry){
                        $.each(data.response.entry,function(inx,ent){
                            //each entry contains the id of the created resource.

                            var ar = ent.id.split('/');
                            var resource = ar[ar.length-2].toLowerCase();
                            var logicalId = ar[ar.length-1];        //not currently used...
                            var elID = resource+'createdID';
                            $('#'+elID).html(ent.id);

                        })
                    }
                    } else {
                        //there was an error. If there's an operationOutcome, then show that otherwise just display the whole body
                        var msg = JSON.stringify(data.response);
                        if (data.response.issue) {
                            msg = "";
                            _.each(data.response.issue,function(issue){
                                msg += issue.details + " ("+issue.severity + ")\n";
                            })
                        }
                        alert("There was a problem: " + msg)

                }
            },
            error : function(xhr,status,err) {
                alert('There was an error: ' + err)

            },
            complete : function(xhr,status) {
                $('#td_form_data').show();
                $('#td_waiting').hide();
                //$('#submitTD').attr('disabled',false);
            }
        });

        console.log(sampleData);
    },
    render : function(rows){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/testDataForm.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw(rows);
            })
        } else {
            this.draw(rows);
        }
    },
    draw : function(rows){
        //actually render out the collection...
        var template = this.template;
        console.log(rows)
        if (rows) {
            this.$el.html(template(rows));
        } else {
            this.$el.html(template({}));
        }


        if (!rows) {
            //there is no form yet...
            $('#submitTD').hide();      //hide the submit button until there is a form...
        } else {

        }


        $('#td_success').hide();    //and hide the success display until there is success!
        $('#td_waiting').hide();


    }

})