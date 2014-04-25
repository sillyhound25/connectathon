/**
 * The view that manages a repeating group
 */

/* global BaseView */
/* global $ */
/* global Backbone */
/* global console */
/* global MediatorQ */
/* global renderQ */
/* global alert */
var QuestionnaireMRView = BaseView.extend({

    initialize : function() {

    },

    setContext : function(context){
        //this is the context of the form being completed. used to add the questionnaireQuestion views...
        this.formContext = context;
    },

    cleanGroup : function(group,ctx) {
        //remove any answers in any questions...
        if (group.question) {
            ctx.removeAnswers(group.question,ctx);
        }

        if (group.group) {
            //this group has sub-groups
            ctx.cleanGroup(group.group,ctx);
        }
    },
    removeAnswers : function(arQuestion,ctx) {

        $.each(arQuestion,function(inx,quest){

            if (quest.answerString) {
                //todo need to do this for all answerTypes...
                delete quest.answerString;
            }

            if (quest.group) {
                //this question has groups
                ctx.cleanGroup(quest.group,ctx);
            }
        });

    },
    render : function() {
        var that = this;
        console.log(this.$el.attr('id'));

        //html = "";
        var ctx = {};
        ctx.mayRepeatViews = {} ;  //empty the collection of mayrepeat views...
        ctx.html = "";
        ctx.navHTML = "";
        ctx.questionViews = {};

        var newGroup = {};
        $.extend(true,newGroup,this.group);
        //this.newQuestionViews = {};     //will hold the new questionviews we create (they get added to the form collection after rendering)

        //remove all the existing answers...
        this.cleanGroup(newGroup,this);

        //add the 'mayRepeat' extension. Idea is that the last member of the repeat group has the extension
        //that should make it easier for new additions to be in order...
        Backbone.FHIRHelper.addExtension(newGroup,Backbone.myConstants.extensionDefn.mayRepeat,true);

        //and remove it from the group that is being duplicated
        Backbone.FHIRHelper.removeExtension(this.group,Backbone.myConstants.extensionDefn.mayRepeat);

        if (this.parent) {
            //add the new group at the end of the parents list of groups...
            //console.log(this.parent);
            MediatorQ.assert(this.parent.group !== null,'The parent node of a mayRepeat did not have a group collection');
            //this.parent.group = this.parent.group || [];        //surely unnessecary
            this.parent.group.push(newGroup);       //add the new group to the questionnaire resource...

            //render the group to be inserted. Will add the questionViews as required and add to ctx.questionViews
            renderQ.showGroup(newGroup,this.level,ctx);

            //attach the generated html to the DOM after the last 'instance' of this group
            this.$el.after(ctx.html);

            //connect each new question view to the DOM element it controls. Then, add the new view to the form context...
            $.each(ctx.questionViews,function(inx,qView) {
                var qEl = $('#'+ qView.questID);
                qView.setElement(qEl);
                that.formContext.questionViews[qView.questID] = qView;
            });

            //add the new group(s) to the list of 'mayRepeat' groups (so it can be repeated as well
            //note that the renderQ generator will create new group views for the repeated groups, and these are the
            //ones we want to keep.
            $.each(ctx.mayRepeatViews,function(inx,gView) {
                that.formContext.mayRepeatViews[gView.groupId] = gView;
            });

            //and we're done...

        } else {
            alert("There is a mayRepeat group without a parent - can't repeat it");
        }

        console.log(newGroup);
    }

});