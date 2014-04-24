/**
 *  helpers for FHIR
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
        //return;
    } else {
        if (group.text) {
            display = group.text;
        }

        if (group && group.header) {
            display = group.header;
        }
    }



    return display;
};


//generate a resource reference - todo not yet used
FHIRHelper.createReference = function(type,url) {

};

//return an object with all known extensions in it. Others will be ignored...
FHIRHelper.getAllExtensions = function(model) {
    var vo = {};
    if (model.extension){     //there are extensions to this group...

        _.each(model.extension,function(ext){
            _.each(Backbone.myConstants.extensionDefn,function(extDefn,key){
                //console.log(extDefn)
                if (ext.url === extDefn.url) {
                    vo[key] = ext[extDefn.type]
                }

            })

        });
/*
        console.log(vo);
        vo = {}


        _.each(model.extension,function(ext){
            console.log(ext.url)
            switch (ext.url) {
                case 'http://fhir.orionhealth.com/questionnaire#numcol' : {
                    vo.numCol = ext.valueInteger;
                    break;
                }
                case 'http://hl7.org/fhir/questionnaire-extensions#mayRepeat' : {
                    vo.mayRepeat = ext.valueBoolean;
                    break;
                }
            }
        })

        */
    }
    return vo;

};

//remove an extension
FHIRHelper.removeExtension = function(model,extensionDefn) {
    var url = extensionDefn.url;
    //var type = extensionDefn.type;
    var pos = -1;
    //var value;
    if (model && model.extension) {
        _.each(model.extension,function(ext,inx) {
            if (ext.url === url){
                pos = inx;
            }
        });
        if (pos) {
            model.extension.splice(pos,1);  //remove the extension
        }
    }
};

//get the value of a particular extension
FHIRHelper.getExtensionValue = function(model,extensionDefn) {
    var url = extensionDefn.url;
    var type = extensionDefn.type;
    var value = null;
    if (model && model.extension) {
        _.each(model.extension,function(ext) {
            if (ext.url === url){
                value = ext[type];

            }
        });
    }
    return value;
};

//set an extension value on a model
FHIRHelper.addExtension = function(model,extensionDefn,value) {
    //add a particular extension
    var url = extensionDefn.url;
    var type = extensionDefn.type;

    var updated = false;
    if (model.extension) {
        _.each(model.extension,function(ext) {
            if (ext.url === url){
                ext[type] = value;
                updated = true;
            }
        });
        if (! updated) {
            var ext1 = {url:url};
            ext1[type] = value;
            model.extension.push(ext1)
        }
    } else {
        var ext = {url:url};
        ext[type] = value;
        model.extension = [(ext)];
    }
};


FHIRHelper.getXML = function(obj) {
    //http://goessner.net/download/prj/jsonxml/
    var str = "";
    if (obj) {
        //var json = obj;
        var clone = jQuery.extend(true, {}, obj);
        delete clone.resourceType;

        str =  (formatXml(json2xml(clone)));
    }
    return str;

    //https://gist.github.com/sente/1083506
    function formatXml(xml) {
        var formatted = '';
        var reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, '$1\r\n$2$3');
        var pad = 0;
        jQuery.each(xml.split('\r\n'), function(index, node) {
            var indent = 0;
            if (node.match( /.+<\/\w[^>]*>$/ )) {
                indent = 0;
            } else if (node.match( /^<\/\w/ )) {
                if (pad != 0) {
                    pad -= 1;
                }
            } else if (node.match( /^<\w[^>]*[^\/]>.*$/ )) {
                indent = 1;
            } else {
                indent = 0;
            }

            var padding = '';
            for (var i = 0; i < pad; i++) {
                padding += '  ';
            }

            formatted += padding + node + '\r\n';
            pad += indent;
        });

        return formatted;
    }

};