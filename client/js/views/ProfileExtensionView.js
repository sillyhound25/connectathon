/**
 * The view to edit/add an extension...
 */


var ProfileExtensionView =  Backbone.View.extend({
    events : {
        "click #eeSave" : "saveExtension",
        "change #eeContextResource" : "selectResource",
        "change #eeValueSet" : "valueSetChanged"
    },
    valueSetChanged : function() {
        //the value set has been changed - set the datatype to CodeableConcept
        $("#eeDataType").val("CodeableConcept");
    },
    clearView : function() {
        this.$el.html("");
    },
    selectResource : function(ev,callback) {
        //when a resource is selected, we want to load the path options...
        //need to have the event and callback parameters as sometimes this function is called by an event and sometimes not...
        var resourceName = $('#eeContextResource').val();//.toLowerCase();
        //alert(resourceName);
        //trigger an event that will get all the paths for this resource defined in core.
        //(some are stripped off)
        var $el = $('#eeContextResourcePath');
        $el.empty();
        var lne = "<option value=''>Looking up paths...</option>";
        $el.append(lne);
        this.trigger('profileExtension:selectedResource',{resourceName: resourceName,callback : function(arPaths){
            //OK got all the paths - update the path list combo
            $el.empty();
            $el.append("<option value=''></option>");
            _.each(arPaths,function(path){
                var lne = "<option value='"+path + "'";
                //note that we only support one resource
                //if (extension.context && name === extension.context[0]) {
               //     lne += " selected='selected' ";
              //  }
                lne += ">"+path+"</option>";
                $el.append(lne);

            })
            console.log(callback)
            if (callback) {
                callback();
            }
            //console.log(arPaths);
        }})
    },
    saveExtension : function() {
        //update the extension
        var isNew = false;
        var code = $('#eeCode').val();
        if (!code) {
            alert('An extension must have a code. No changes saved.');
            return;
        }

        if (this.model.getExtension(code)){
            alert("Sorry, there's already an extension with the code '"+code+"' in the Profile.");
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

        //the context path is the full path to the element that is being extended.
        var fullContextPath = $('#eeContextResource').val();        //the resource name

        if (!fullContextPath) {
            alert('You must select the resource to extend');
            return;
        }




        //if there is a path defined, then append it to the resource...
        if ($('#eeContextResourcePath').val()) {
            fullContextPath += '.' + $('#eeContextResourcePath').val();
        }

        //var fullContextPath = $('#eeContextResource').val();        //the resource name


        //at the moment, we're only allowing 1 path per extension...
        extension.context= [fullContextPath];
        //extension.context= [$('#eeContextResource').val()];


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
            delete extension.definition.binding ;
        }

        //update the model...

        if (isNew) {
            this.model.addExtension(extension);
        } else {
            this.model.updateExtension(extension);
        }


       // console.log(this.model.toJSON());


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
            if (!this.model) {
                alert('The model for profileExtensionView is null');
                return;
            }
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
            extension.context = [];
        }
        //now render the template, setting the current values
        this.$el.html(this.template(extension));      //render the dialog

        //some of the elements - like dropdowns and checkboxes - need to be set separately
        //there's likely a more elegant way to do this...
       // if (extension) {

        if (extension.isModifier) {
            $("#eeIsModifier").attr('checked',true);
        }


        //display the resource list, selecting the current resource (if any)
        console.log(extension.context);

            var resourceName;
            var path;


            if (extension.context && extension.context.length > 0) {
                //if there's a context, then need to get the resourceName and path from the context.
                resourceName = extension.context[0];        //actually a full path...

                var g = resourceName.indexOf('.');
                if (g > -1) {
                    path = resourceName.substr(g+1);
                    resourceName = resourceName.substr(0,g);
                }
            }



        console.log(resourceName,path)

            _.each(that.meta.resourceList,function(name){
                var lne = "<option value='"+name + "'";
                //note that we only support one resource
                if (resourceName === name) {
                    lne += " selected='selected' ";
                }
                lne += ">"+name+"</option>";
                $("#eeContextResource").append(lne);
            })




            if (path) {
                //this function can be called by an event handler too
                this.selectResource(null,function(){
                    $("#eeContextResourcePath").val(path);
                });
            }


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


    }
})