/**
 * Created with JetBrains WebStorm.
 * displays the complete list of properties for a profile - all the structures and the extensions...
 */

var ProfileSummaryView = Backbone.View.extend({
    initialize : function() {
        var that = this;
        this.childViews = {};       //this will contain all the child views that represent table rows...
        //get the template for the item views - todo needs refactoring...
        $.get('templates/profileSummaryItem.html',function(html){
            that.itemTemplate = Handlebars.compile(html);
        })
    },
    events : {
        "click #btnCreateSummary" : "createAndShowSummary",
        "click .ps_resource" : "toggleResource"
    },

    createAndShowSummary : function() {
        //called when the 'create summary' button is clicked...
        var that=this;
        this.createSummary(function() {
            that.render();
        });
    },
    updatePath : function(resourceName,path) {
        var that = this;
        //update a single row in the summary table...
        //first, re-generate the whole summary
        this.profileSummaryModel.getSummary(this.model,function(err, arSummary){
            //now locate the model and the view based on this path
            that.arSummary = arSummary;
            var resourceElements = that.arSummary.resources[resourceName];
            _.each(resourceElements.models.models,function(m){
                //console.log(path,resourceName,m)

                if (m.toJSON().path === path) {
                    console.log(m.toJSON())
                    var view = that.childViews[resourceName+"_"+path];
                    //m.set('path','XxXXXX');
                    console.log(view);
                    view.content = m.toJSON();
                    view.model = m;
                    view.render();
                }
            })


        })
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
        })
        //console.log(this.model);
        var model = this.model;
        this.profileSummaryModel = new ProfileSummaryModel();
        //profileSummaryModel.setProfile(this.model);
        this.$el.html("Generating summary, please wait...");
        this.profileSummaryModel.getSummary(model,function(err, arSummary){
            //console.log(err,arSummary);
          //  _.each(arSummary.resources,function(r){
           //     console.log(r.models.toJSON());
           // })
            that.arSummary = arSummary;
           // that.render(arSummary)
            //console.log(models.toJSON());
            if (callback) {callback();}
        })

    },

    render : function(){

        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/profileSummaryContainer.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            })
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
                console.log(resourceName)
                var colModels = res.models;     //this is a BB Collection
                _.each(colModels.models,function(model,inx){
                    var jsonModel = model.toJSON();          //this is a BB model - not a fhir model!!!
                    //add a row with an ID. This will be the container for the child view...
                    var elID = 'tst'+inx;
                    var klass = "";
                    if (jsonModel.max === '0' || jsonModel.max === 0) {
                        klass = " class='notUsed' ";
                    }



                    $('#ps_table tr:last').after("<tr "+klass+"id='"+ elID +"'></tr>");
                    //now create the child view responsible for this row...
                    var key =resourceName + "_"+jsonModel.path;
                    var v = new ProfileSummaryItemView({model:model,el:$('#'+elID)});
                    that.childViews[key] = v;        //save a reference to the view. We'll need it to release the view to avoid zombies...
                    v.template = that.itemTemplate;
                    v.content = model.get('content');       //this is the json representation of the structure.element
                    v.resourceName = resourceName;
                    //v.profileID = that.model.toJSON().meta.id;
                    //console.log(v.profileID)
                    v.render();
                })
            })


        }

    }
})




ProfileSummaryItemView = Backbone.View.extend({

    events : {
        "click .ps_row_item" : "slice"
    },
    slice : function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        var path = $(ev.currentTarget).attr('data-path');
        var type = $(ev.currentTarget).attr('data-type');
        var profileID = $(ev.currentTarget).attr('data-profileid');
        console.log(this.content);
        //console.log('x')
        Backbone.trigger('profileSummary:slice',
            {profileid : profileID,type:type,path:path,element:this.content,resourceName:this.resourceName});
    },
    selectXXX : function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var path = $(ev.currentTarget).attr('data-path');
        alert(path);
    },


    initialize : function() {

    },
    render : function(){
        var json = this.model.toJSON();
        console.log(json);
        this.$el.html(this.template({item:json}));
        //this.$el.html(this.template({item:json}));

    }

});

