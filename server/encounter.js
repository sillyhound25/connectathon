/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 21/02/14
 * Time: 10:53 AM
 * To change this template use File | Settings | File Templates.
 */
var _ = require("underscore");
var moment = require('moment');

//get a sample in simple format
function getSample(inx) {
    var entry = {};
    entry.title='Encounter';
    entry.id = 'cid:Encounter'+ new Date().getTime();
    entry.updated = moment().format();

    var sam = {};
    sam.resourceType = "Encounter";
    sam.status = 'in progress';
    sam.class = 'inpatient';
    sam.identifier = [{value:"ZZZ",system:"http://myhospital/ID"}];
    sam.text = getText(this);

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