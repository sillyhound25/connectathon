/**
 * show the raw content of a Profile
 */
    /*global Backbone,$,jQuery,json2xml,Handlebars */

var ProfileContentView =  Backbone.View.extend({
    events : {
        "click .pc_display_btn" : "toggle"
    },
    toggle : function(ev) {
        var toShow = ev.currentTarget.getAttribute('data-id');
        $('.pc_display').hide();
        $('#'+toShow).show();
        $('.pc_display_btn').removeClass('active');
        $(ev.currentTarget).addClass('active');

    },
    setModel : function(model) {
        //set the model & render
        this.model = model;
        this.render();
    },
    clearView : function() {
        this.$el.html("");
    },
    getXML : function() {
        //http://goessner.net/download/prj/jsonxml/
        if (this.model) {
            var json = this.model.toJSON();
            var clone = jQuery.extend(true, {}, json);
            delete clone.resourceType;
            return (formatXml(json2xml(clone)));
        }
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
                    if (pad !== 0) {        //quality thing objected
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

    },
    render : function(){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/profileContent.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            });
        } else {
            this.draw();
        }
    },
    draw : function(){
        //actually render out the collection...
        var template = this.template;
        if (this.model) {
            var json = JSON.stringify(this.model.toJSON(),undefined,2);
            //console.log(json);

            var xml = this.getXML();

            this.$el.html(template({json:json,xml:xml}));

            this.getXML();
        }

    }

});
