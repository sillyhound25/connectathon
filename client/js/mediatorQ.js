/**
 * A mediator for use with the Questionnaire functionality.
 * separate from the profile editing so that they can be split apart easily...
 */


String.prototype.getLogicalID = function (){
    g = this.indexOf('.');
    if (g > -1) {
        return this.substr(0,g)
    } else {
        return this.toString();
    }
}


var MediatorQ={};


//for some reason these aren't working when defined in the mediator script...
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
}

//the questionairre has been updated in the designer...
Backbone.on('Q:updated',function(vo){
    //alert('new')
    //console.log(vo);
    qDesignerView.render();
})

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

//user has selected a template or form to view...
Backbone.listenTo(questionnaireListView,'qlv:view',function(vo){
    var id = vo.id;     //form or template
    //alert(id);

    var entry = _.findWhere(MediatorQ.allQuests.entry,{id:id})
    console.log(entry);

    html = "";
    renderQ.showGroup(entry.content.group,0);  //create the questionnaire form
    $('#displayQ').html(html);
    $('textarea').autosize();



    qDesignerView.init(entry.content);
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