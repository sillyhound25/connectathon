/**
 * A mediator for use with the Questionnaire functionality.
 * separate from the profile editing so that they can be split apart easily...
 */

/* global alert, _, $, FHIRHelper, Backbone, QuestionnaireMRView, QuestionnaireQuestionView,console,renderQ  */
/* global QuestionnaireDesignerView, QuestionnaireFillinView, QuestionNavView, QuestionnaireSelectView */
/* global QuestionnaireListView, moment  */
String.prototype.getLogicalID = function (){
    var g = this.lastIndexOf('/');
    if (g > -1) {
        return this.substr(g+1,200);
    } else {
        return this.toString();
    }
};

var MediatorQ={};

Backbone.myFunctions = {};



Backbone.myConstants = {};

//default namespaces. todo: dynamically allow these to be added to...
Backbone.myConstants.arSystem = [];
Backbone.myConstants.arSystem.push({label:'http://loinc.org',value:'http://loinc.org/'});
Backbone.myConstants.arSystem.push({label:'http://snomed.info/sct',value:'http://snomed.info/sct/'});
Backbone.myConstants.arSystem.push({label:'http://fhir.orionhealth.com',value:'http://fhir.orionhealth.com/'});

Backbone.myConstants.extensionDefn = {};
Backbone.myConstants.extensionDefn.answerFormat = {url:"http://hl7.org/fhir/questionnaire-extensions#answerFormat",type:'valueCode'};
Backbone.myConstants.extensionDefn.numCol = {url:"http://fhir.orionhealth.com/questionnaire#numcol",type:'valueInteger'};
Backbone.myConstants.extensionDefn.mayRepeat = {url:"http://hl7.org/fhir/questionnaire-extensions#mayRepeat",type:'valueBoolean'};


Backbone.myConstants.currentCounter = 0;

//a function to return an incrementing counter. Used to generate unique ID's in the forms...
Backbone.myFunctions.getNextCounter = function() {
    return Backbone.myConstants.currentCounter++;
};

var questionnaireSelectView = new QuestionnaireSelectView({el:'#qSelect'});
var questionnaireListView = new QuestionnaireListView({el:'#qList'});
//var navView = new QuestionNavView({el:'#formNav'});

var qFillinView = new QuestionnaireFillinView({el:'#form'});

var qDesignerView = new QuestionnaireDesignerView({el:'#qDesigner'});

//a simple assertion checker (based on John Resigs one) that shows a message if the outcome is false
MediatorQ.assert = function( outcome, description ) {
    if (!outcome) {
        alert("Assert Error: " + description);
    }
};

//the questionairre has been updated in the designer...
Backbone.on('Q:updated',function(){
    qDesignerView.redrawOutline();
});

//just want to redraw the template layout after a group or an answer has been modified (ie no new ones)
Backbone.on('Q:redrawContent',function(){
    qDesignerView.redrawContent();
});

//the user wishes to save a new Questionnaire
Backbone.listenTo(qDesignerView,'qd:saveNewQ qd:updateQ',function(vo){

    //always put the questionnaire at the moment...
    if (!vo.id) {
        alert('You must give the questionnaire an ID');
        return;
    }

    //vlaidate reosurce. This strictly belongs somewhere else - ?model
    var Q = vo.Q;
    //the proxy server will make the correct FHIR call based on the contents of the resource...
    var uri = '/api/'+vo.id.getLogicalID();
    MediatorQ.showWorking();
    $.ajax (uri,{
        method : 'PUT',
        data : JSON.stringify(Q),
        headers : {
            'content-type' : 'application/json'
            //'content-location' : vo.historyId // - not version aware updates yet...
        },
        success : function(data){
            MediatorQ.hideWorking();
            alert('Questionnaire updated');
            //set the current version in the view. This is needed for version checking servers...
            if (data.headers) {
                qDesignerView.setVersion(data.headers['content-location']);
            }


        },
        error : function(xhr){
            MediatorQ.hideWorking();
            console.log(xhr.responseText);

            try {
                console.log(JSON.parse(xhr.responseText));
            } catch (e) {
                console.log('invalid json');
            }

            alert('There was an error - check the console');


        }
    });


});

//The user selects either forms or templates
//extend to include patient select
Backbone.listenTo(questionnaireSelectView,'qSelect:select',function(vo){
    var type = vo.type;     //form or template
    MediatorQ.showWorking();
    MediatorQ.getQuests(type,function(bundle){
        MediatorQ.hideWorking();
        questionnaireListView.model = bundle;
        questionnaireListView.render();
    });

});

//user wishes to create a new Questionnaire
Backbone.listenTo(questionnaireSelectView,'qlv:newQ',function(){
    qDesignerView.init();

    qDesignerView.render();
    Backbone.myFunctions.showMainTab("designerTab");

});

//user has selected a template to fill in...
//this could be a new form, or editing an existing
Backbone.listenTo(questionnaireListView,'qlv:fillin',function(vo){
    var questionnaireID = vo.questionnaireID;             //either the id of the template or the form (depending on isNew)
    var patientID = vo.patientID;
    var isNew = vo.isNew;       //true if this is a new form based on this template
    if (! questionnaireID) {
        alert('questionnaireID is null. Cannot create template');
        return;
    }
    if (! patientID) {
        alert('patientID is null. Cannot create template');
        return;
    }
    console.log(questionnaireID,patientID,isNew);


    //get the selected questionnaire
    var uri = '/api/oneresource/Questionnaire/' + questionnaireID.getLogicalID();
    $.get(uri,function(Q){

        qFillinView.init({Q:Q,questionnaireID:questionnaireID,patientID:patientID,isNew:isNew});

        renderQ.readOnly = false;
        qFillinView.render();

/*
        //var form = Q.group;     //the root element of the form

        //navView is the navigational view - the overall layout of the form to assist the user completing it...
        //todo - move to a component of fillinview

        navView.model = Q;      //the navView has the questionnaire as a model
        navView.html = "";      //todo - should have a proper thing
        navView.html += "<h5>Document Navigation</h5>";

        navView.render();
*/
        Backbone.myFunctions.showMainTab('newFormTab');
    });

});

//adding a new form (based on a questionnaire
Backbone.listenTo(qFillinView,'qfv:update',function(vo){
    console.log(vo);
    var questionnaire = vo.questionnaire;       //the completed questionnaire. It will be the template with some answers...
    var questionnaireID = vo.questionnaireID;
    var patientID = vo.patientID;

    if (! questionnaireID) {
        //note that even when creating a new Q, we pass in the ID of the template that it is based on...
        alert('questionnaireID is null. Cannot save');
        return;
    }
    if (! patientID) {
        alert('patientID is null. Cannot save');
        return;
    }

    var isNew = vo.isNew;
    var uri = '/api/';
    var vid = "";       //the version ID. If an update  then this needs to be set for version aware updating

    var http_method = 'PUT';        //default to a PUT (ie an update)

    if (isNew) {
        //if it's new then the http method is a POST
        http_method = 'POST';
    } else {
        //otherwise, leave it as a PUT and add the resource ID
        uri += questionnaireID.getLogicalID();
    }

    console.log(http_method,uri,questionnaire);

    //return;

    delete questionnaire.include;       //todo move this to a 'meta' property
    delete questionnaire.author;        //as a new q copied from the template this will be the author of the Q

    questionnaire.subject = {reference : patientID};
    questionnaire.authored = moment().format();
    questionnaire.status = vo.status;


    $.ajax (uri,{
        method : http_method,
        data : JSON.stringify(questionnaire),
        headers : {
            'content-type' : 'application/json',
            'content-location' : vid
        },
        success : function(data){
            console.log(data);
            alert('Questionnaire successfully saved');
        },
        error : function(xhr,status,err){
            alert('There was an error saving the questionnaire. View the console.');


            console.log(xhr.responseText,status,err);



        }
    });
});

//user has selected a template or form to design...
Backbone.listenTo(questionnaireListView,'qlv:design',function(vo){
    var id = vo.id;     //form or template
    var entry = _.findWhere(MediatorQ.allQuests.entry,{id:id});


    //get the current url
    var hxId;
    if (entry.link) {
        _.each(entry.link,function(lnk){
            if (lnk.rel==='self') {
                hxId = lnk.href;
                console.log(hxId);
            }
        });
    }

    qDesignerView.init(entry);
    qDesignerView.render();
    Backbone.myFunctions.showMainTab("designerTab");

});

//user has selected a template or form to view...
Backbone.listenTo(questionnaireListView,'qlv:view',function(vo){
    var id = vo.id;     //form or template
    var entry = _.findWhere(MediatorQ.allQuests.entry,{id:id});

    //todo - for some reason, as soon as this is true the templates will always receive it as true
    //I cannot figure this out!

    //renderQ.readOnly = true;    //will cause controls to be rendered as text...
    //html = "";
    var ctx = {};
    renderQ.showGroup(entry.content.group,0,ctx);  //create the questionnaire form

    //console.log(ctx);

    if (ctx.html === "") {
        ctx.html = "Not enough content to preview";
    }

    //set the banner above the viewer
    $('#qlHeader').show();          //display the header...
    $('#qlShowID').html(id);
    $('#qlShowDate').html(moment(entry.content.authored).format("dddd, MMMM Do YYYY, h:mm:ss a"));

    //render the Q in the preview area...
    $('#displayQ').html(ctx.html);


});



//at the moment we're getting all questionnaires and filtering here because Furore is not filtering on status...
MediatorQ.getQuests = function(type,callback) {
    var searchQuery = {resource:'Questionnaire',params:[]};
    var uri = '/api/generalquery?query='+JSON.stringify(searchQuery);
    //var uri = './samples/soapQuestionnaire.xml';
    var arStatus;
    if (type === 'template') {
        arStatus=['draft','published'];
    } else {
        arStatus=['in progress','completed','amended'];
    }



    if (MediatorQ.allQuests) {
        filterBundle(MediatorQ.allQuests,callback);
        //callback(MediatorQ.allQuests)
    } else {
        $.get(uri,function(bundle){
            //at the moment, the query
            MediatorQ.allQuests = bundle;
            filterBundle(MediatorQ.allQuests,callback);
        });
    }

    function filterBundle(bundle,callback) {
        //this is only needed until the server handles status query

        $.each(bundle.entry,function(inx,ent){

            ent.include = (arStatus.indexOf(ent.content.status) > -1);
            /*
            if (arStatus.indexOf(ent.content.status) > -1) {
                ent.include=true
            } else {
                ent.include=false
            }
            */

        });

        callback(bundle);
    }


};

MediatorQ.showWorking = function() {
    $('#working').show();
};

MediatorQ.hideWorking = function() {
    $('#working').hide();
};