var _ = require("underscore");
var moment = require('moment');
var Common = require('./common.js');

//get a sample in simple format
function getSample(vo) {

    vo.code = vo.code  || {code:'39065001',display:'Burn of ear',system:'http://snomed.info/sct'};
    var entry = {};
    entry.title='Condition';
    entry.id = 'cid:Condition'+ Common.newId();
    entry.updated = moment().format();

    var sam = {};
    sam.resourceType = "Condition";
    sam.code = Common.cc(vo.code);
    sam.category = Common.cc({code:'diagnosis',system:'http://hl7.org/fhir/condition-category',display:'Diagnosis'});
    sam.text = getText(sam);
    entry.content = sam;
    return entry;


}

//generate the text element for the resource...
function getText(obj) {
    var rtn = {status:"generated"};
    var txt = "";
    txt += obj.code.display;
    rtn.div = "<div>" + txt + "</div>";
    return rtn;
}


exports.getSample = getSample;