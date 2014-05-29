/**
 * Created with JetBrains WebStorm.
 * displays the complete list of properties for a profile - all the structures and the extensions...
 */

    /*global Backbone,$,Handlebars,alert,console,_ ,ProfileSummaryModel*/

var ProfileSummaryView = Backbone.View.extend({
    initialize : function() {
        var that = this;
        this.changesMade = false;
        this.childViews = {};       //this will contain all the child views that represent table rows...
        //get the template for the item views - todo needs refactoring...
        $.get('templates/profileSummaryItem.html',function(html){
            that.itemTemplate = Handlebars.compile(html);
        });
    },
    events : {
        "click #btnCreateSummary" : "createAndShowSummary",
        "click .ps_resource" : "toggleResource",
        "click #btnSaveChanges" : "saveChanges"
    },
    saveChanges : function() {
        $('#btnSaveChanges').text('Updating').attr('disabled',true);
        this.model.save({},{
            success : function() {
                $('#btnSaveChanges').hide();

            },
            error : function(xhr,status,err) {
                console.log(xhr,status,err);

                alert('sorry, there was an error saving the profile - check the console log');
                $('#btnSaveChanges').text('Update').attr('disabled',false);
            }
        });
    },
    isDirty : function() {
        //return true if there have been any modifications to the profile...
        return this.changesMade;
    },

    clearView : function() {
        //clear the view and all related models. called when the user selects another profile...
        delete this.model;
        this.$el.html("");
        this.changesMade = false;
        if (this.childViews) {
            _.each(this.childViews,function(view){
                view.remove();
            });
        }
        this.$el.html("");
        $('#btnSaveChanges').hide();

    },
    createAndShowSummary : function() {
        //called when the 'create summary' button is clicked...
        var that=this;
        this.createSummary(function() {
            that.render();
        });
    },
    updatePath : function(resourceName,path) {
        //update a single structire (=row in the display table)...
        var that = this;

        //first, re-generate the whole summary
        this.profileSummaryModel.getSummary(this.model,function(err, arSummary){
            //now locate the model and the view based on this path
            that.arSummary = arSummary;

            //console.log(arSummary)
            var resourceElements = that.arSummary.resources[resourceName];

            _.each(resourceElements.models.models,function(m){
                //m is of type ProfileSummaryItemModel

                if (m.toJSON().path === path) {
                    var view = that.childViews[resourceName+"_"+path];
                    console.log(view);
                    view.content = m.toJSON();
                    view.model = m;//.toJSON();
                    view.render();
                    //if a re-render is being called, then the profile is likely to have been changed...
                    that.changesMade = true;
                    $('#btnSaveChanges').show();
                    $('#btnSaveChanges').text('Update').attr('disabled',false);
                }
            });


        });
    },
    toggleResource : function(ev){
        var resource = $(ev.currentTarget).attr('data-code');
        console.log(resource);
        var filter = ".ps_row_"+resource;
        //this.$el.find('.ps_row').hide();        //hide all the rows...
        this.$el.find(filter).toggle();
        //ps_row_{{resource}}

    },
    createSummary : function(callback){
        //generate the profile summary. This is quite time consuming...
        var that=this;

        //first, remove any child views we may have...
        _.each(this.childViews,function(view){
            view.remove();
        });
        //console.log(this.model);
        var model = this.model;
        this.profileSummaryModel = new ProfileSummaryModel();
        //profileSummaryModel.setProfile(this.model);
        this.$el.html("Generating summary, please wait...");
        this.profileSummaryModel.getSummary(model,function(err, arSummary){
            that.arSummary = arSummary;
            if (callback) {callback();}
        });

    },

    render : function(){

        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/profileSummaryContainer.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            });
        } else {
            this.draw();
        }
    },
    draw : function(){
        var that = this;
        //actually render out the collection...

        var template = this.template;
        this.$el.html(template(this.arSummary));

        //$('#ps_content').html('content');



        if (this.arSummary) {
            //create a view for each item and render
            var html = "";
            _.each(this.arSummary.resources,function(res,resourceName){
                //console.log(path)
                var colModels = res.models;     //this is a BB Collection where each model represents a strcutire or an extension...
                _.each(colModels.models,function(psiModel,inx){
                    var jsonModel = psiModel.toJSON();          //this is a BB model - not a fhir model!!!


                    //ignore the 'standard' paths...

                    //console.log(jsonModel.path)
                    var toShow = true;
                    _.each(['.extension','.text','.contained'],function(exclude){
                        if (jsonModel.path.indexOf(exclude) !== -1) {
                            toShow = false;
                        }
                    });


                    if (toShow) {       //ie it's not one of the standard ones...
                        //add a row with an ID. This will be the container for the child view...
                        var elID = resourceName+inx;
                        $('#ps_table tr:last').after("<tr id='"+ elID +"'></tr>");
                        //now create the child view responsible for this row...
                        var key =resourceName + "_"+jsonModel.path;

                        //each line in the table (representing a path) will have its own view...
                        var v = new ProfileSummaryItemView({model:psiModel,el:$('#'+elID)});
                        that.childViews[key] = v;        //save a reference to the view. We'll need it to release the view to avoid zombies...
                        v.template = that.itemTemplate;
                        //console.log(model.get('content'));
                        //v.content = psiModel.get('content');       //this is the json representation of the structure.element fom the profile
                        v.resourceName = resourceName;
                        v.render();

                        //now see if there are extensions against this path.
                        //todo - need to handle nested extensions...
                        if (jsonModel.extensions.length > 0) {
                            //console.log('s')
                            //need to create a view model for each extension...
                            _.each(jsonModel.extensions,function(ext,inx1){
                                //ext is a bbModel...
                                var elID = resourceName+inx + '-' + inx1;
                                $('#ps_table tr:last').after("<tr id='"+ elID +"'></tr>");

                                var v1 = new ProfileSummaryItemView({model:ext,el:$('#'+elID)});
                                that.childViews[key] = v;        //save a reference to the view. We'll need it to release the view to avoid zombies...
                                v1.template = that.itemTemplate;

                                v1.content = psiModel.get('content');       //this is the json representation of the structure.element
                                console.log(ext,v1.content);
                                v1.resourceName = resourceName;
                                v1.render();
                            });

                        }

                    }

                });
            });


        }

    }
});



//note: var wasn't there before hint...
//a single item in the summary
var ProfileSummaryItemView = Backbone.View.extend({

    events : {
        "click .ps_row_item" : "slice"
    },
    //not really a slice, but editing an element
    slice : function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var path = $(ev.currentTarget).attr('data-path');
        var type = $(ev.currentTarget).attr('data-type');
        var profileID = $(ev.currentTarget).attr('data-profileid');
        //console.log(this.content);
        //console.log('x')
        Backbone.trigger('profileSummary:slice',
            {profileid : profileID,type:type,path:path,psiModel:this.model,resourceName:this.resourceName});
    },

    render : function(){
        var json = this.model.toJSON();
        //console.log(json);

        this.$el.addClass('summaryRow'+json.type);

        this.$el.html(this.template({item:json}));

        //if teh max is 0, then this is not used...
        if (json.max === '0' || json.max === 0) {
            this.$el.addClass('notUsed');

        }
    }

});

