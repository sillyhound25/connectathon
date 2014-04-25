/**
 * The view that manages a repeating group
 */

var QuestionnaireMRView = BaseView.extend({


    cleanGroup : function(group,ctx) {
        //remove any answers in any questions...
        if (group.question) {
            ctx.removeAnswers(group.question,ctx);
        }



        if (group.group) {
            //this group has sub-groups
            ctx.cleanGroup(group.group,ctx)
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
                ctx.cleanGroup(quest.group,ctx)
            }
        })

    },
    render : function() {
        console.log(this.$el.attr('id'));

        //html = "";
        var ctx = {};
        ctx.mayRepeatViews = {} ;  //empty the collection of mayrepeat views...
        ctx.html = "";
        ctx.navHTML = "";
        var newGroup = {};
        $.extend(true,newGroup,this.group);
        this.cleanGroup(newGroup,this);     //remove all the existing answers...

        //add the 'mayRepeat' extension. Idea is that the last member of the repeat group has the extension
        //that should make it easier for new additions to be in order...
        Backbone.FHIRHelper.addExtension(newGroup,Backbone.myConstants.extensionDefn.mayRepeat,true);

        //and remove it from the group that is being duplicated
        Backbone.FHIRHelper.removeExtension(newGroup,Backbone.myConstants.extensionDefn.mayRepeat);

        if (this.parent) {
            //add the new group at the end of the parents list of groups...
            //console.log(this.parent);
            MediatorQ.assert(this.parent.group !== null,'The parent node of a mayRepeat did not have a group collection');
            //this.parent.group = this.parent.group || [];        //surely unnessecary
            this.parent.group.push(newGroup);
            renderQ.showGroup(newGroup,this.level,ctx);

            this.$el.after(ctx.html);
        } else {
            alert('There is a mayRepeat group without a parent');
        }
    }

});