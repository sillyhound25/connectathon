
/*global require,exports */
var _ = require("underscore");
var moment = require('moment');

//get a sample in simple format
function getSample(vo) {
    vo.fname = vo.fname || "John";
    vo.lname = vo.lname || "Cardinal";
    vo.identifier = vo.identifier || "PRP1660";
    var entry = {};
    entry.title='Patient';
    entry.id = 'cid:Patient'+ new Date().getTime() + "@bundle";
    entry.updated = moment().format();

    var sam = {};
    sam.resourceType = "Patient";
    sam.identifier = [{use:"Usual",value:vo.identifier,system:"http://moh.govt.nz/fhir/nhi"}];
    sam.name = [{family:[vo.lname],given:[vo.fname],text:vo.fname + " " + vo.lname }];
    sam.text = getText(sam);
    entry.content = sam;
    return entry;


}

//generate the text element for the resource...
function getText(obj) {
    //console.log(obj)
    var rtn = {status:"generated"};
    var txt = "";
    var fullName = obj.name[0].given + " " + obj.name[0].family;
    /*
    txt += "<div>Identifiers</div><ul>";
    _.each(obj.identifier,function(ident){
        txt += "<li>Use:" + ident.use + ": " + ident.value + " (" + ident.system + ")</li>"
    });
    txt += "</ul>";
    */
    rtn.div = "<div>" + fullName + "</div>";
    return rtn;
}


exports.getSample = getSample;