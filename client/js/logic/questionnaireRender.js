
//these have to be globals for the recursive algorithm to work. todo would like to fix this...
var renderQ = {},
    html = "",
    htmlNav = "";


//show a group
renderQ.showGroup = function(grp,lvl) {
    if (! grp) {
        //legal to have no group..
        alert('Group is null');
        return;
    }

    if (grp.header) {
        var klass = 'formNav'+lvl;

        //todo - move this into the view...
        var templateStr = "<div class=' <%= klass%>'><a class='mynav'><%= text%></a></div>"
        htmlNav += _.template(templateStr,{text:grp.header,klass:klass});//  "<div >"+grp.header+"</div>"
    }

    //set the max displaylevel to 2
    var displayLevel = lvl;
    if (displayLevel > 2) {
        displayLevel = 2;
    }

    var extensions = FHIRHelper.getAllExtensions(grp);
    extensions.numCol = extensions.numCol || 1;     //default is 1 col...

    html += Backbone.myTemplates.groupTemplate({group: grp,level:displayLevel, mayRepeat : extensions.mayRepeat});



    if (grp.question) {
        html += "<row>"
        _.each(grp.question,function(quest,inx){
            var id='q-'+lvl+'-'+inx;
            renderQ.showQuestion(quest,id,extensions.numCol);
            //html += renderQ.showQuestion(quest,id,numCol);
            //console.log(inx % numCol);
            if(inx % extensions.numCol === 1 ) {
                //if at the col count then close the row and create a now one
                html += "</row><row>"
            }


            if (quest.group){
                //this question has groups...
                _.each(quest.group,function(questGrp){
                    lvl ++;
                    renderQ.showGroup(questGrp,lvl);
                })


            }

        })
        html += "</row>";
    }

    if (grp.group) {
        lvl++;
        _.each(grp.group,function(grp1){
            renderQ.showGroup(grp1,lvl);
        })
    }
    return;// {form: html,nav : htmlNav};
}

//show a single question (and possibly an answer)
//numCol is the number of columns...
renderQ.showQuestion = function(quest,id,numCol) {

    var code;
    if (quest.name && quest.name.coding && quest.name.coding.length > 0 && quest.name.coding[0].code) {
        code = quest.name.coding[0].code;
    }

    var display = FHIRHelper.questionDisplay(quest)

    //FHIRHelper.ccDisplay
    //choose the correct template based on the number of columns...
    var templateName = "questionTemplate" + numCol + "col";

    //console.log(templateName)


    //this is the value associated with this question. Will need to be expanded to support different answer types...
    var value = quest.answerString;

    html +=  Backbone.myTemplates[templateName](
        {question: quest,id:id,code:code,display:display,value:value,readOnly:renderQ.readOnly});




}

