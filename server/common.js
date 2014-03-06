

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