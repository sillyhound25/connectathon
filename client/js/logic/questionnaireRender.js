
var renderQ = {},
    html = "",
    htmlNav = "";


//show a group
renderQ.showGroup = function(grp,lvl) {
    //console.log(lvl, grp.header);
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


    //display all the questions in this group -
    var numCol = 1;         //the number of columns to display (like a flow layout) - come fron an extension
    var mayRepeat = false;  //if the group can repeat...
    if (grp.extension){     //there are extensions to this group...
        _.each(grp.extension,function(ext){
            switch (ext.url) {
                case 'fhir.orionhealth.com/questionnaire#numcol' : {
                    numCol = ext.valueInteger;
                    break;
                }
                case 'http://hl7.org/fhir/questionnaire-extensions#mayRepeat' : {
                    mayRepeat = ext.valueBoolean;
                    break;
                }
            }
        })
    }


    html += renderQ.Z.templates.groupTemplate({group: grp,level:displayLevel});



    if (grp.question) {
        html += "<row>"
        _.each(grp.question,function(quest,inx){
            var id='q-'+lvl+'-'+inx;
            html += renderQ.showQuestion(quest,id,numCol);
            //console.log(inx % numCol);
            if(inx % numCol === 1 ) {
                //if at the col count then close the row and create a now one
                html += "</row><row>"
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

    var display = "No description";     //the text of the question

    //If there is a code with a name then it can be edited...
    var code;
    if (quest.name && quest.name.coding && quest.name.coding.length > 0 && quest.name.coding[0].code) {
        code = quest.name.coding[0].code;
        display = code;
    }
    if (quest.text) {
        display = quest.text;
    }


    //FHIRHelper.ccDisplay
    //choose the correct template based on the number of columns...
    var templateName = "questionTemplate" + numCol + "col";
    return renderQ.Z.templates[templateName]({question: quest,id:id,code:code,display:display});
}

