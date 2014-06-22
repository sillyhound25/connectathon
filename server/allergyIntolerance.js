
/*global require,exports */
var _ = require("underscore");
var moment = require('moment');

//get a sample in simple format
function getSample(vo) {

    vo.substance = vo.substance || "Sticking Plaster";
    vo.reaction =  vo.reaction  || "Hives";

    var entry = {};
    entry.title='AllergyIntolerance';
    entry.id = 'cid:Allergy'+ new Date().getTime();
    entry.updated = moment().format();

    var sam = {};
    sam.resourceType = "AllergyIntolerance";
    sam.status = "confirmed";
    sam.substance = {display:vo.substance};
    sam.reaction = {display:vo.reaction};
    sam.text = getText(sam);
    entry.content = sam;
    return entry;
}

//generate the text element for the resource...
function getText(obj) {
    //console.log
    var rtn = {status:"generated"};
    var txt = "";
    txt = "<div>"+obj.substance.display + " causes " + obj.reaction.display + "</div>";
    rtn.div = "<div>" + txt + "</div>";
    return rtn;
}


exports.getSample = getSample;