

/* global alert, _, console, $, FHIRHelper, Backbone, QuestionnaireMRView, QuestionnaireQuestionView  */


//these have to be globals for the recursive algorithm to work. todo would like to fix this...
var renderQ = {mayRepeatViews : {}};    //collection of views manageing repeats




//show a group
renderQ.showGroup = function(grp,lvl,ctx,parent) {

    if (! grp) {
        //legal to have no group, but not helpful.....
        alert('Group is null');
        return;
    }

    //this is the 'top level' of the recursion...
    if (lvl === 0){
        ctx.mayRepeatViews = {} ;  //empty the collection of mayrepeat views...
        ctx.questionViews = {}; //the individual question views. todo may refactor to add a group view and build a tree of related views that can render directly rather than creating html directly here...
        ctx.html = "";
        ctx.navHTML = "<h5>Form Layout</h5>";
    }

    if (grp.header) {
        var klass = 'formNav'+lvl;
        var templateStr = "<div class=' <%= klass%>'><a href='#' class='mynav'><%= text%></a></div>";
        ctx.navHTML += _.template(templateStr,{text:grp.header,klass:klass});//  "<div >"+grp.header+"</div>"
    }

    //set the max displaylevel to 2
    var displayLevel = lvl;
    if (displayLevel > 2) {
        displayLevel = 2;
    }

    var extensions =Backbone.FHIRHelper.getAllExtensions(grp);
    extensions.numCol = extensions.numCol || 1;     //default is 1 col...

    //todo only the 'original' mayRepeat group has all the design artefacts...

    var groupId = "";

    //if the group can repeat, then create a view object that will render the repeat...
    if (extensions.mayRepeat) {
        var mrView = new QuestionnaireMRView();         //a view that will manage the repeating group
        var bbTemplates = Backbone.myTemplates;
        mrView.template = bbTemplates["questionTemplate" + extensions.numCol + "col"];
        groupId = 'groupMR' + Backbone.myFunctions.getNextCounter(); //renderQ.ctr++;      //get the next counter and increment
        mrView.groupId = groupId;
        mrView.group = grp;
        mrView.level = lvl;
        mrView.parent = parent;
        ctx.mayRepeatViews[groupId] = mrView;
    }

    ctx.html += Backbone.myTemplates.groupTemplate({group: grp,level:displayLevel,
        mayRepeat : extensions.mayRepeat,groupId : groupId});

    //nested groups are processed before questions in the group...
    if (grp.group) {
        lvl++;
        _.each(grp.group,function(grp1){
            renderQ.showGroup(grp1,lvl,ctx,grp);
        });
    }

    if (grp.question) {

        ctx.html += "<row>";
        _.each(grp.question,function(quest,inx){
            var id='q-'+lvl+'-'+inx;
            renderQ.showQuestion(quest,id,extensions.numCol,ctx);

            if(inx % extensions.numCol === 1 ) {
                ctx.html += "</row><row>";
            }

            if (quest.group){
                //this question has groups...
                _.each(quest.group,function(questGrp){
                    lvl ++;
                    renderQ.showGroup(questGrp,lvl,ctx,quest);
                });
            }
        });
        ctx.html += "</row>";

    }



    //insert a marker div for where to insert the repeat
    if (extensions.mayRepeat) {
        ctx.html += "<div id='"+groupId + "'></div>";
    }

};

//show a single question (and possibly an answer)
//numCol is the number of columns...
renderQ.showQuestion = function(quest,id,numCol,ctx) {
/*
    var code;
    if (quest.name && quest.name.coding && quest.name.coding.length > 0 && quest.name.coding[0].code) {
        code = quest.name.coding[0].code;
    }
*/
    var display = FHIRHelper.questionDisplay(quest);
    //choose the correct template based on the number of columns...
    var templateName = "questionTemplate" + numCol + "col";

    //this is the value associated with this question. Will need to be expanded to support different answer types...
    var value = quest.answerString;

    var readOnly = renderQ.readOnly;


    var bbTemplates = Backbone.myTemplates;
    var qTemplate = bbTemplates[templateName];

    var qView = new QuestionnaireQuestionView();
    qView.Q = ctx.Q;    //need the Questionnaire respurce to resolve contined valuesets...

    //var qID= 'questID' + renderQ.questCtr++;      //get the next counter and increment
    var qID= 'questID' + Backbone.myFunctions.getNextCounter();
    qView.questID = qID;
    qView.model = quest;
    qView.template = qTemplate;
    ctx.questionViews[qID] = qView;

    //ctx.html +=  qTemplate(
      //  {question: quest,id:id,code:code,display:display,value:value,readOnly: readOnly,
       //     questID:qID,displayClass:qView.getDisplayClass(),html:qView.getHTML()});


    //this has to be an async call, as the server might need to resolve the ValueSet reference
    qView.getHTML(function(html){
        //console.log(html);

        ctx.html +=  qTemplate(
           {display:display,value:value,readOnly: readOnly,html:html});

    });


   // ctx.html +=  qTemplate(
     //   {display:display,value:value,readOnly: readOnly,html:qView.getHTML()});

   // ctx.html +=  bbTemplates[templateName](
     //   {question: quest,id:id,code:code,display:display,value:value,readOnly: readOnly});

};


//get all the valuesets that are references in this questionnaire. These can all be retrieved prior to rendering the questionnaire...
renderQ.getValueSets = function(group) {
    var lst = [];
    //console.log(group);
    renderQ.getGroup(group,{vs:lst});

    console.log(lst);
    return lst;

};


renderQ.getGroup = function(grp,ctx) {
//console.log(grp.group);
    if (grp.question) {
        _.each(grp.question,function(quest){
            renderQ.getQuestion(quest,ctx);
        });
    }

    if (grp.group) {
        //this group has sub-groups
        _.each(grp.group,function(subGroup){
            renderQ.getGroup(subGroup,ctx);
        });


    }
};

renderQ.getQuestion = function(quest,ctx) {
//console.log(arQuestion)
   // _//.each(arQuestion,function(quest){
//console.log(quest.options);
        if (quest.options) {
            ctx.vs.push(quest.options.reference);
            //console.log('x');
        }

        //check that the system for any existing answers exists in

/*
    _.each(Backbone.myConstants.arSystem,function(mysys){
        if (mysys.value === )
            Backbone.myConstants.arSystem.push({label:'http://loinc.org',value:'http://loinc.org/'});

    });
*/

        if (quest.group) {
            //this question has groups
            renderQ.getGroup(quest.group,ctx);
        }
   // });

};