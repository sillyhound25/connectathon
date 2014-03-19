/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 15/03/14
 * Time: 10:58 AM
 * To change this template use File | Settings | File Templates.
 */

var ValueSetDetailView =  Backbone.View.extend({
    events : {
        "click .define_concept_del" : "removeConcept",
        "click #define_new_add" : "addConcept",
        "click #save_change_vs" : "saveModel",
        "blur .data" : "fieldChanged"
    },
    hasChanged : function() {
        //has the underlying model changed?
        if (this.model) {
            return this.model.get('isDirty');
        } else return false;

    },
    fieldChanged : function(ev) {
        //update the text field values
        var vs = this.model.get('content'); //get the valueset
        vs.name = $('#vs_name').val();
        vs.description = $('#vs_description').val();
        vs.define.system = $('#vs_system').val();
        this.model.set({'isDirty':true});
        console.log(this.model.get('isDirty'));
    },
    saveModel : function(){
        var that = this;
        var vs = this.model.get('content'); //get the valueset
        vs.name = $('#vs_name').val();
        vs.description = $('#vs_description').val();
        //this.model.save();
        this.model.save({},{
            success : function() {
                that.model.set({'isDirty':false});
                alert('ValueSet saved')
            }
        });

    },
    addConcept : function() {
        var newConcept = {code:$('#define_new_code').val(),display:$('#define_new_display').val()};
        if (!newConcept.code || !newConcept.display) {
            alert('You must enter both code and display');
            return;
        }
        //console.log(newConcept);
        var vs = this.model.get('content'); //get the valueset
        vs.define.concept.push(newConcept);
        this.model.set({'isDirty':true});
        this.render();
    },
    removeConcept : function(ev){
        ev.preventDefault();
        //remove a concept from the list of concepts...
        var codeToRemove = ev.currentTarget.getAttribute('data-code');
        var vs = this.model.get('content'); //get the valueset
        var newConceptList = _.reject(vs.define.concept,function(con) {return con.code===codeToRemove});
        vs.define.concept = newConceptList;
        this.model.set({'content':vs})
        this.render();

    },
    setNewValueSet : function() {
        //initializes the view for a new ValueSet
        var newContent = {};
        newContent.publisher = "Orion Health";
        newContent.resourceType = "ValueSet";
        newContent.identifier = 'oh'+new Date().getTime();
        newContent.name =  "No name";
        //content.description = content.description ||  "No Description";
        newContent.status = "draft";
        newContent.experimental = true;
        newContent.extensible = false;
        newContent.date = moment().format();
        newContent.define = {system:'fhir.orionhealth.com'}
        this.model = new ValueSetModel();
        this.model.set({'content':newContent});
        this.model.set({'isDirty':false});

    },
    render : function(){
        //this.undelegateEvents();
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/oneVS.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            })
        } else {
            this.draw();
        }

    },
    draw : function(){
        //actually render out the valueset...

        this.$el.html(this.template(this.model.toJSON()));
        //this.delegateEvents();
    }
});