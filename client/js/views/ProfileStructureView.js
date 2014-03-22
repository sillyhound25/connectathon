/**
 * The view to edit/add a structure...
 */


var ProfileStructureView =  Backbone.View.extend({
    events : {
        "click #esSave" : "saveStructure"
    },

    saveStructure : function() {

    },
    setPath : function(path) {
        //set the path that is to be edited...
        this.path = path;
        console.log(path);
    },
    render : function(){

        var that=this;

        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/editStructure.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            })
        } else {
            this.draw();
        }

    },
    draw : function(){
        var that = this;

        var json = this.model.toJSON();
        console.log(json);


/*
        //get the existing extension (if any)
        var extension = this.meta.extension;
        if (!extension ) {
            //if new, then set some sensible results
            extension = {definition : {}};
            extension.definition.min = 0;
            extension.definition.max = 1;
            extension.definition.type = [{code:'string'}];
        }

        */
        //now render the template, setting the current values
        console.log(this.$el);
        this.$el.html(this.template(json));      //render the dialog

        $('#editStructureDlg').modal();

/*
        //some of the elements - like dropdowns and checkboxes - need to be set separately
        //there's likely a more elegant way to do this...
       // if (extension) {

            if (extension.isModifier) {
                $("#eeIsModifier").attr('checked',true);
            }


            //------------- set the list of resources --------------
            _.each(that.meta.resourceList,function(name){
                var lne = "<option value='"+name + "'";
                //note that we only support one resource
                if (extension.context && name === extension.context[0]) {
                    lne += " selected='selected' ";
                }
                lne += ">"+name+"</option>";
                $("#eeContextResource").append(lne);
            })


            //------------set the datatype ---------------
            var dataType="";
            if (extension.definition.type) {
                dataType = extension.definition.type[0].code;     //current datatype (1 only)
            }
            _.each(that.meta.dataTypeList,function(name){
                var lne = "<option value='"+name + "'";
                //note that we only support one resource at the moment
                if (name === dataType) {
                    lne += " selected='selected' ";
                }
                lne += ">"+name+"</option>";
                $("#eeDataType").append(lne);
            })

            //---------set the valueset -------------
            var vsID = "";
            if (extension.definition.binding && extension.definition.binding.referenceResource) {
                vsID = extension.definition.binding.referenceResource.reference;
            }
            var ar = that.meta.colVS.toJSON();
            //console.log(ar);
            _.each(ar,function(vs){
                //console.log(vs);
                var name=vs.name;
                var lne = "<option value='"+vs.meta.id + "'";

                if (vs.meta.id === vsID) {
                    lne += " selected='selected' ";
                }
                lne += ">"+name+"</option>";
                $("#eeValueSet").append(lne);
            })
       // }


        //this.delegateEvents();
        $('#updatingProfileMsg').hide();


        $('#editExtensionDlg').modal();

        //set the focus appropraitely...
        $('#editExtensionDlg').on('shown.bs.modal',function(){
            if (!extension.code) {
                $('#eeCode').focus();
            } else {
                $('#eeShort').focus();
            }

        })
*/

    }
})