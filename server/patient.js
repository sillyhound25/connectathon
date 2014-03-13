var _ = require("underscore");
var moment = require('moment');

//get a sample in simple format
function getSample(vo) {
    vo.fname = vo.fname || "John";
    vo.lname = vo.lname || "Cardinal";
    vo.identifier = vo.identifier || "PRP1660"
    var entry = {};
    entry.title='Patient';
    entry.id = 'cid:Patient'+ new Date().getTime();
    entry.updated = moment().format();

    var sam = {};
    sam.resourceType = "Patient";
    sam.identifier = [{use:"Usual",value:vo.identifier,system:"http://moh.govt.nz/fhir/nhi"}];
    sam.name = [{family:[vo.lname],given:[vo.fname]}];
    sam.text = getText(this);
    entry.content = sam;
    return entry;


}

//generate the text element for the resource...
function getText(obj) {
    var rtn = {status:"generated"};
    var txt = "";
    txt += "<div>Identifiers</div><ul>";
    _.each(obj.identifier,function(ident){
        txt += "<li>Use:" + ident.use + ": " + ident.value + " (" + ident.system + ")</li>"
    });
    txt += "</ul>";
    rtn.div = "<div>" + txt + "</div>";
    return rtn;
}


exports.getSample = getSample;