/*global require,exports */

var _ = require("underscore");
var moment = require('moment');
var builder = {};
builder.common = require('./common.js');

//get a sample in simple format
function getSample(vo) {
    var entry = {};
    entry.title='Encounter';
    entry.id = 'cid:Encounter'+ new Date().getTime();
    entry.updated = moment().format();


    var sam = {};
    sam.resourceType = "Encounter";
    sam.status = vo.status || 'in progress';
    sam.class = vo.class || 'inpatient';
    sam.identifier = [{value:"ZZZ",system:"http://myhospital/ID"}];
    sam.text = getText(this);
    sam.subject = {reference:vo.patientID};


    var participant = {individual : {reference:vo.practitionerID},
        type: [builder.common.cc({code:'CON',display:'Consultant',system:'http://hl7.org/fhir/v3/ParticipationType'})]};
    sam.participant = [participant];

    entry.content = sam;
    return entry;
}

//generate the text element for the resource...
function getText(obj) {
    var rtn = {status:"generated"};
    var txt = "MyHospital admission";
    /*
    txt += "<div>Identifiers</div><ul>";
    _.each(obj.identifier,function(ident){
        txt += "<li>Use:" + ident.use + ": " + ident.value + " (" + ident.system + ")</li>"
    })
    txt += "</ul>";
    */
    rtn.div = "<div>" + txt + "</div>";
    return rtn;
}


exports.getSample = getSample;
exports.getDependencies = function() {
    return ['patient','practitioner'];
}