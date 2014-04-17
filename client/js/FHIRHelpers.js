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
}