var _ = require("underscore");
var moment = require('moment');

//get a sample in simple format
function getSample(vo) {
    vo.name = vo.name || "John Kildaire";

    var entry = {};
    entry.title='Practitioner';
    entry.id = 'cid:Practitioner'+ new Date().getTime();
    entry.updated = moment().format();


    var sam = {};
    sam.resourceType = "Practitioner";
    sam.identifier = [{use:"Usual",value:"11889",system:"http://moh.govt.nz/fhir/mcnumber"}];
    sam.name = {text:vo.name};
    sam.text = getText(sam);
    entry.content = sam;
    return entry;
}

//generate the text element for the resource...
function getText(obj) {
    //console.log
    var rtn = {status:"generated"};
    var txt = "";
    //txt = obj.name.given[0] + " " + obj.name.family[0];
    txt = obj.name.text;
    rtn.div = "<div>" + txt + "</div>";
    return rtn;
}


exports.getSample = getSample;