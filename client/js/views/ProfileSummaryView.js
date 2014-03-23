/**
 * Created with JetBrains WebStorm.
 * displays the complete list of properties for a profile - all the structures and the extensions...
 */

var ProfileSummaryView = Backbone.View.extend({
    initialize : function() {
        var that = this;
        this.childViews = [];       //this will contain all the child views that represent table rows...
        //get the template for the item views - todo needs refactoring...
        $.get('templates/profileSummaryItem.html',function(html){
            that.itemTemplate = Handlebars.compile(html);
        })
    },
    events : {
        "click #btnCreateSummary" : "createSummary",
        "click .ps_resource" : "toggleResource"
    },

    toggleResource : function(ev){
        var resource = $(ev.currentTarget).attr('data-code');
        console.log(resource);
        var filter = ".ps_row_"+resource;
        //this.$el.find('.ps_row').hide();        //hide all the rows...
        this.$el.find(filter).toggle();
        //ps_row_{{resource}}

    },
    createSummary : function(){
        //generate the profile summary. This is quite time consuming...
        var that=this;

        //first, remove any child views we may have...
        _.each(this.childViews,function(view){
            view.remove();
        })
        //console.log(this.model);
        var model = this.model;
        var profileSummaryModel = new ProfileSummaryModel();
        //profileSummaryModel.setProfile(this.model);
        this.$el.html("Generating summary, please wait...");
        profileSummaryModel.getSummary(model,function(err, arSummary){
            //console.log(err,arSummary);
          //  _.each(arSummary.resources,function(r){
           //     console.log(r.models.toJSON());
           // })
            that.arSummary = arSummary;
            that.render(arSummary)
            //console.log(models.toJSON());
        })

    },

    render : function(arSummary){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/profileSummaryContainer.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw(arSummary);
            })
        } else {
            this.draw(arSummary);
        }
    },
    draw : function(arSummary){
        var that = this;
        //actually render out the collection...
        var template = this.template;
        this.$el.html(template(arSummary));

        //$('#ps_content').html('content');



        if (this.arSummary) {
            //create a view for each item and render
            var html = "";
            _.each(this.arSummary.resources,function(res,resourceName){
                console.log(resourceName)
                var colModels = res.models;     //this is a BB Collection
                _.each(colModels.models,function(model,inx){
                    console.log(model.toJSON())          //this is a BB model - not a fhir model!!!
                    //add a row with an ID. This will be the container for the child view...
                    var elID = 'tst'+inx;
                    var klass = "";
                    if (model.toJSON().max === '0' || model.toJSON().max === 0) {
                        klass = " class='notUsed' ";
                    }



                    $('#ps_table tr:last').after("<tr "+klass+"id='"+ elID +"'></tr>");
                    //now create the child view responsible for this row...
                    var v = new ProfileSummaryItemView({model:model,el:$('#'+elID)});
                    that.childViews.push(v);        //save a reference to the view. We'll need it to release the view to avoid zombies...
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
        //console.log(this.model.toJSON())
        var json = this.model.toJSON();

      ///  if (json.max = 0) {
        //    json.notUsed = true;
       // }
        //this.content =
        //json.profileid = this.profileID;
        //console.log(json);
        this.$el.html(this.template({item:json}));

    }

});


/*
* {{#with item}}
 <tr class="ps_row ps_row_{{resource}} {{#if notUsed}} notUsed {{/if}}">
 <td><a href='#' class="ps_row_item" data-type="{{datatype}}" data-path="{{path}}">{{path}}</a> </td>
 <td>{{min}}..{{max}}</td>
 <td>{{datatype}}</td>
 <td>{{description}}</td>
 </tr>
 {{/with}}
* */