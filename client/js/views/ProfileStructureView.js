
var ProfileStructureView =  Backbone.View.extend({
    initialize : function() {
        this.meta = {};     //keep my properties - eg the extension  - in a separate property...
    },
    events : {
        "click #esSave" : "saveStructure"
    },

    saveStructure : function() {
        //save any changes made to a structure. This is where we'd check to ensure they were valid changes...

        //we're going to return an updated verison of the psiModel.content - ie the json rendition of the element

        var clone = jQuery.extend(true, {}, this.model.toJSON().content);

        var element = clone

        clone.definition.min = $('#esMin').val();
        clone.definition.max = $('#esMax').val();

        $('#editStructureDlg').modal('hide');

        //the medicator will save the changes and re-draw...
        this.trigger('element:updated',{element:clone,type:this.type,resourceName : this.resourceName});
    },
    setType : function(type) {
        //the type can be 'core' or 'prof' - whether this element comes from the core, or is already profiled...
        this.type = type;
        //console.log(path);
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

        //the model is a ProfileSummaryItemModel (defined in ProfileSumaryModel)
        //get the content node, which is a json rendition of the element...
        var json = this.model.toJSON().content;

        console.log(json)

        //now render the template, setting the current values
        //console.log(this.$el);
        this.$el.html(this.template(json));      //render the dialog



        //------------set the datatype ---------------
        var dataType="";
        if (json.definition.type) {
            dataType = json.definition.type[0].code;     //current datatype (1 only)
        }
        _.each(that.meta.dataTypeList,function(name){
            var lne = "<option value='"+name + "'";
            //note that we only support one resource at the moment
            if (name === dataType) {
                lne += " selected='selected' ";
            }
            lne += ">"+name+"</option>";
            $("#esDataType").append(lne);
        })



        $('#editStructureDlg').modal();

    }
})