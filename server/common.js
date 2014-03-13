

exports.cc = function(vo) {
    var cc = {};
    cc.coding = [{system:vo.system,code:vo.code,display:vo.display}]
    return cc;


}

exports.newId = function(){
    var start = 'x' + new Date().getTime();
    var min= 1, max=100;
    var r = Math.floor(Math.random() * (max - min + 1) + min);
    return start+r;       //return a string
}

exports.extension = function(url,datatype,value) {
    var ext = {};
    ext.url = url;
    var dt = datatype.charAt(0).toUpperCase() + datatype.slice(1);
    var propertyName = 'value'+dt;
    ext[propertyName] = value;
    return ext;
}