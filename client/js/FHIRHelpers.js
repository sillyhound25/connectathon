/**
 * display helpers for FHIR
 */

var FHIRHelper = {};

//generate a display for a codeableconcept
FHIRHelper.ccDisplay = function(cc){
    var display = "";
    if (cc){
        if (cc.text) {display = cc.text}
    } else if (cc.coding){
        if (cc.coding[0].display) {
            display = cc.coding[0].display
        } else {
            display = cc.coding[0].code
        }
    }
    return display;
};

//a display for a question
FHIRHelper.questionDisplay = function(quest){
    var display = "No description";     //the text of the question

    //If there is a code with a name then it can be edited...
    //var code;
    if (quest.name && quest.name.coding && quest.name.coding.length > 0 && quest.name.coding[0].code) {
       // code =
        display = quest.name.coding[0].code;
    }
    if (quest.text) {
        display = quest.text;
    }
    return display;
};


FHIRHelper.groupDisplay = function(group){
    var display = "";
    if (group.header) {
        display = group.header;
    }
        return display;
};