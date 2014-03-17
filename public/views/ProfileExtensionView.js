/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 17/03/14
 * Time: 9:43 AM
 * To change this template use File | Settings | File Templates.
 */


var ProfileExtensionView =  Backbone.View.extend({
    events : {
        "click #eeSave" : "saveExtension"
    },

    saveExtension : function() {
        //update the extension
        var isNew = false;
        if (!$('#eeCode').val()) {
            alert('An extension must have a code. No changes saved.');
            return;
        }

        var extension = this.meta.extension;    //for right now, assume update
        if (!extension) {
            isNew = true;
            extension = {definition : {}};
        }


        extension.code=$('#eeCode').val();
        extension.definition.short=$('#eeShort').val();
        extension.definition.formal=$('#eeFormal').val();
        extension.definition.min=$('#eeMin').val();
        extension.definition.max=$('#eeMax').val();
        extension.definition.type = [{code:$('#eeDataType').val()}];

        extension.context= [$('#eeContextResource').val()];

        if ($('#eeIsModifier').is(':checked')) {
            extension.definition.isModifier = true;
        } else {
            extension.definition.isModifier = false;
        }


        //get the value set (if selected)
        var vsValue = $('#eeValueSet').val();
        if (vsValue) {
            var vsText = $("#eeValueSet option:selected").text();
            extension.definition.binding = {name:vsText,referenceResource: {reference :vsValue}};
        } else {
            extension.definition.binding ;
        }

        //update the model...

        if (isNew) {
            this.model.addExtension(extension);
        } else {
            this.model.updateExtension(extension);
        }




        $('#editExtensionDlg').modal('hide');

        //let the world know that the extension was modified - the profile can be re-drawn...
        this.trigger('profileExtension:updated');

    },
    initialize : function() {
        this.meta = {};     //keep my properties - eg the extension  - in a separate property...
    },
    setCode : function(code){
        var that = this;
        //called when the extension is being edited. We locate the existing extension and set it as a property
        //of the view - a more elegant solution might be to create another BB model...
        if (code) {
            var model = this.model.toJSON();
            _.each(model.extensionDefn,function(ext){
                if (ext.code === code) {
                    that.meta.extension = ext;
                }
            })
        } else {
            delete that.meta.extension;
        }

    },
    render : function(){
        //this.undelegateEvents();
        var that=this;



        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/editExtension.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            })
        } else {
            this.draw();
        }

    },
    draw : function(){
        var that = this;

        //get the existing extension (if any)
        var extension = this.meta.extension;
        if (!extension ) {
            //if new, then set some sensible results
            extension = {definition : {}};
            extension.definition.min = 0;
            extension.definition.max = 1;
            extension.definition.type = [{code:'string'}];
        }
        //now render the template, setting the current values
        this.$el.html(this.template(extension));      //render the dialog

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
            if (extension.definition.binding) {
                vsID = ext.definition.binding.referenceResource.reference;
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


    }
})