/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 16/04/14
 * Time: 5:31 PM
 * To change this template use File | Settings | File Templates.
 */

/*global Backbone,$,Handlebars */

var BaseView = Backbone.View.extend({
    getTemplate : function(templateName,callback) {
        var that = this;
        var fileName = 'templates/' + templateName + ".html";
        if (! this.template) {
            $.get(fileName,function(html){
                that.template = Handlebars.compile(html);
                callback(that.template);
            });
        } else {
            callback(this.template);
        }
    }
});