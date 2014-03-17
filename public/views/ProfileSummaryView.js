/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 17/03/14
 * Time: 1:24 PM
 * To change this template use File | Settings | File Templates.
 */

var ProfileSummaryView = Backbone.View.extend({
    events : {
        "click #btnCreateSummary" : "createSummary",
        "click #new_profilexx" : "newProfile"
    },

/*
    setProfile: function(profile) {
        //sets the profile to use. called (via events) when a user selects a profile from the list
        //todo it may be an optimization to generate the summary at that time with the button as a refresh...
        this.profile = profile;
    },
*/
    createSummary : function(){
        //generate the profile summary. This is quite time consuming...
        var that=this;
        console.log(this.model);
        var model = this.model;
        var profileSummaryModel = new ProfileSummaryModel();
        //profileSummaryModel.setProfile(this.model);
        profileSummaryModel.getSummary(model,function(err, arSummary){
            console.log(err,arSummary);
            that.render(arSummary)
        })

    },

    render : function(arSummary){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/profileSummary.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw(arSummary);
            })
        } else {
            this.draw(arSummary);
        }
    },
    draw : function(arSummary){
        //actually render out the collection...
        var template = this.template;
        console.log(this.collection)
        this.$el.html(template(arSummary));
    }

})