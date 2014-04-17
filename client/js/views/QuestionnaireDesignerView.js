/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireDesignerView = BaseView.extend({
    events : {
        "click .qGroup" : "group",
        "click .qQuestion" : "question"
    },
    group : function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var id = ev.currentTarget.getAttribute('data-id');
        alert(id)

    },
    question : function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var id = ev.currentTarget.getAttribute('data-id');
        alert(id)

    },
    init : function(Q) {
        //create a new model. This will be a FHIR Questionnaire resource
        if (Q) {
            this.model = Q
        } else {
            this.model = {group : []};       //model.group holds the
        }
    },
    addGroup : function(grp,node,ctx,lvl) {
        //adds a group to the layout...
        var tab = "";
        for (var i=0; i<= lvl;i++) {
            tab += "&nbsp;&nbsp;&nbsp;";
        }

        //var inx = ctx.setRef(ctx);
        var groupView = new QuestionnaireDesignerGroupView();
        ctx.groupRef.push(groupView);
        //console.log(inx);
        var display = "<div class='qGroup' data-id='"+groupView.cid+"'>" + tab + FHIRHelper.groupDisplay(grp) + '</div>';
        var newNode = $(display).appendTo(node);

        if (grp.question){

            ctx.addQuestions(newNode,grp.question,lvl,ctx)
        }

        if (grp.group) {
            $.each(grp.group,function(inx,childGroup){
                var newLevel = lvl +1;
                ctx.addGroup(childGroup,newNode,ctx,newLevel)
            })
        }
    },
    addQuestions : function(gNode,arQuest,glvl,ctx) {
        //add questions to the group node in the layout
        var tab = "";
        for (var i=0; i<= glvl+1;i++) {
            tab += "&nbsp;&nbsp;&nbsp;";
        }

        _.each(arQuest,function(quest){
            var questView = new QuestionnaireDesignerQuestionView();
            ctx.questRef.push(questView);

            var display = "<div class='qQuestion' data-id='"+questView.cid+"'>"+tab +FHIRHelper.questionDisplay(quest) + "</div>"
            $(display).appendTo(gNode);

        })
    },
    render : function() {
        var that = this;
        console.log(this.model);
        this.getTemplate('questionnaireDesigner',function(){
            //the skeleton for the Q
            that.$el.html(that.template(that.model));

            that.groupRef = [];
            that.questRef = [];

            that.addGroup(that.model.group,$('#qdGroups'),that,0)

            console.log(that.groupRef)
            console.log(that.questRef)
        })
    }


})