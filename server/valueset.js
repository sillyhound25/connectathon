//---------- valueset ----------

var _ = require("underscore");
var moment = require('moment');
var Common = require('./common.js');

//get a sample in simple format
function getSample(vo) {

    var vs = {}
    vs.resourceType = "ValueSet";
    vs.identifier = vo.identifier || 'oh'+new Date().getTime();
    vs.name = vo.name || "test ValueSet";
    vs.publisher = "Orion Health";
    vs.description = "A Test valueset from Orion Health";
    vs.status = "draft";
    vs.experimental = true;
    vs.extensible = false;
    vs.date = moment().format();
    vs.define = {};
    vs.define.system = vo.defineSystem || "http://orionhealth.com/fhir/vs";
    vs.define.concept=[];
    vs.define.concept.push({code:'code1',display:'first code'});
    vs.define.concept.push({code:'code2',display:'second code'});

    var entry = {};
    entry.title='ValueSet';
    entry.id = 'cid:VS'+ Common.newId();
    entry.updated = moment().format();

    entry.content = vs;
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