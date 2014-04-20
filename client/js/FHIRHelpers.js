/**
 * display helpers for FHIR
 */

var FHIRHelper = {};

Backbone.FHIRHelper = FHIRHelper;       //so helpers can be accessed anywhere..

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


//return a display that identifies a questionnaire group...
FHIRHelper.groupDisplay = function(group){
    var display = "No title";

    if (!group) {
        display = "No Group defined";
        return;
    }

    if (group.text) {
        display = group.text;
    }

    if (group && group.header) {
        display = group.header;
    }

    return display;
};

//get the value of a particular extension
FHIRHelper.getExtensionValue = function(model,url,type) {
    var value;
    if (model && model.extension) {
        _.each(model.extension,function(ext) {
            if (ext.url === url){
                value = ext[type];

            }
        });
    }
    return value;
}

FHIRHelper.addExtension = function(model,url,value,type) {
    //add a particular extension
    var updated = false;
    if (model.extension) {
        _.each(model.extension,function(ext) {
            if (ext.url === url){
                ext[type] = value;
                updated = true;
            }
        });
        if (! updated) {
            var ext = {url:url};
            ext[type] = value;
            model.extension.push(ext)
        }
    } else {
        var ext = {url:url};
        ext[type] = value;
        model.extension = [(ext)];
    }
}