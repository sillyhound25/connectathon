/**
 * A mediator for use with the Questionnaire functionality.
 * separate from the profile editing so that they can be split apart easily...
 */


String.prototype.getLogicalID = function (){
    g = this.lastIndexOf('/');
    if (g > -1) {
        return this.substr(g+1,200)
    } else {
        return this.toString();
    }
};


var MediatorQ={};

Backbone.myFunctions = {};

Backbone.myConstants = {};

//default namespaces. todo: dynamically allow these to be added to...
Backbone.myConstants.arSystem = [];
Backbone.myConstants.arSystem.push({label:'http://loinc.org',value:'http://loinc.org'});
Backbone.myConstants.arSystem.push({label:'http://snomed.info/sct',value:'http://snomed.info/sct'});
Backbone.myConstants.arSystem.push({label:'http://fhir.orionhealth.com',value:'http://fhir.orionhealth.com'});

Backbone.myConstants.extensionDefn = {};
Backbone.myConstants.extensionDefn.answerFormat = {url:"http://hl7.org/fhir/questionnaire-extensions#answerFormat",type:'valueCode'};
Backbone.myConstants.extensionDefn.numCol = {url:"http://fhir.orionhealth.com/questionnaire#numcol",type:'valueInteger'};
Backbone.myConstants.extensionDefn.mayRepeat = {url:"http://hl7.org/fhir/questionnaire-extensions#mayRepeat",type:'valueBoolean'};




var questionnaireSelectView = new QuestionnaireSelectView({el:'#qSelect'});
var questionnaireListView = new QuestionnaireListView({el:'#qList'});
var navView = new QuestionNavView({el:'#formNav'});

var qDesignerView = new QuestionnaireDesignerView({el:'#qDesigner'});
//qDesignerView.render();

//a simple assertion checker (based on John Resigs one) that shows a message if the outcome is false
MediatorQ.assert = function( outcome, description ) {
    if (!outcome) {
        alert("Assert Error: " + description);
    }
};

//the questionairre has been updated in the designer...
Backbone.on('Q:updated',function(vo){
    qDesignerView.redrawOutline();
})

Backbone.on('Q:redrawContent',function(vo){
    qDesignerView.redrawContent();
})


//the user wishes to save a new Questionnaire
Backbone.listenTo(qDesignerView,'qd:saveNewQ qd:updateQ',function(vo){
    console.log(vo);

    //always put the questionnaire at the moment...
    if (!vo.id) {
        alert('You must give the questionnaire an ID');
        return;
    }

    //vlaidate reosurce. This strictly belongs somewhere else - ?model
    var Q = vo.Q



    //the proxy server will make the correct FHIR call based on the contents of the resource...
    var uri = '/api/'+vo.id.getLogicalID();
    MediatorQ.showWorking();
    $.ajax (uri,{
        method : 'PUT',
        data : JSON.stringify(Q),
        headers : {
            'content-type' : 'application/json'
            //'content-location' : vid - not version aware updates yet...
        },
        success : function(xhr,status){
            MediatorQ.hideWorking();
            alert('Questionnaire updated')


        },
        error : function(xhr,status,err){
            MediatorQ.hideWorking();
            console.log(xhr.responseText)

            try {
                console.log(JSON.parse(xhr.responseText))
            } catch (e) {
                console.log('invalid json');
            }

            alert('There was an error - check the console')


        }
    })


});

//The user selects either forms or templates
//extend to include patient select
Backbone.listenTo(questionnaireSelectView,'qSelect:select',function(vo){
    var type = vo.type;     //form or template
    MediatorQ.showWorking();
    MediatorQ.getQuests(type,function(bundle){
        MediatorQ.hideWorking()
        questionnaireListView.model = bundle;
        questionnaireListView.render();
    })

})

//user wishes to create a new Questionnaire
Backbone.listenTo(questionnaireSelectView,'qlv:newQ',function(vo){
    qDesignerView.init();

    qDesignerView.render();
    Backbone.myFunctions.showMainTab("designerTab");

});


//user has selected a template to fill in...
Backbone.listenTo(questionnaireListView,'qlv:fillin',function(vo){
    var id = vo.id;
    console.log(id);

    var uri = '/api/oneresource/Questionnaire/' + id.getLogicalID();
    console.log(uri);
    $.get(uri,function(Q){

        var form = Q.group;     //the root element of the form

        //navView is the navigational view - the overall layout of the form to assist the user completing it...
        navView.model = Q;      //the navView has the questionnaire as a model
        navView.html = "";      //todo - should have a proper thing
        navView.html += "<h5>Document Navigation</h5>";
        //renderQ.Z = Z;

        //sets globals html & htmlNav - todo - there will be a  better way...
        renderQ.showGroup(form,0);  //create the questionnaire form
        navView.html += htmlNav;

        $('#form').html(html);
        navView.render();

        qDesignerView.init({content:Q,id:uri});
        qDesignerView.render();
        Backbone.myFunctions.showMainTab('newFormTab');
    })



})

//user has selected a template or form to view...
Backbone.listenTo(questionnaireListView,'qlv:design',function(vo){
    var id = vo.id;     //form or template
    //alert(id);

    var entry = _.findWhere(MediatorQ.allQuests.entry,{id:id})
    console.log(entry);
    var Q = entry.content; //the questionnaire...

    //qDesignerView.init(Q);
    qDesignerView.init(entry);
    //qDesignerView.init({content:entry,id:id});
    qDesignerView.render();
    Backbone.myFunctions.showMainTab("designerTab");

});

//user has selected a template or form to view...
Backbone.listenTo(questionnaireListView,'qlv:view',function(vo){
    var id = vo.id;     //form or template


    var entry = _.findWhere(MediatorQ.allQuests.entry,{id:id})
    console.log(entry);

    html = "";
    renderQ.showGroup(entry.content.group,0);  //create the questionnaire form


    if (html === "") {
        html = "Not enough content to preview";
    }

    $('#displayQ').html(html);
    $('textarea').autosize();


    qDesignerView.init(entry);
    //qDesignerView.init({content:entry,id:id});
    qDesignerView.render();

});




//at the moment we're getting all questionnaires and filtering here because Furore is not filtering on status...
MediatorQ.getQuests = function(type,callback) {
    var searchQuery = {resource:'Questionnaire',params:[]}
    var uri = '/api/generalquery?query='+JSON.stringify(searchQuery);
    //var uri = './samples/soapQuestionnaire.xml';
    var arStatus
    if (type === 'template') {
        arStatus=['draft','published']
    } else {
        arStatus=['in progress','completed','amended']
    }



    if (MediatorQ.allQuests) {
        filterBundle(MediatorQ.allQuests,callback)
        //callback(MediatorQ.allQuests)
    } else {
        $.get(uri,function(bundle){
            //at the moment, the query
            MediatorQ.allQuests = bundle;
            filterBundle(MediatorQ.allQuests,callback)
        });
    }

    function filterBundle(bundle,callback) {
        //this is only needed until the server handles status query
        $.each(bundle.entry,function(inx,ent){

            if (arStatus.indexOf(ent.content.status) > -1) {
                ent.include=true
            } else {
                ent.include=false
            }
        })

        callback(bundle);
    }


}

MediatorQ.showWorking = function() {
    $('#working').show();
}

MediatorQ.hideWorking = function() {
    $('#working').hide();
}