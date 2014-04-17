/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireDesignerView = BaseView.extend({
    events : {
        "click .viewQ" : "view",
        "click .viewQSource" : "source"

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

        var tab = "";
        for (var i=0; i<= lvl;i++) {
            tab += "&nbsp;&nbsp;";
        }

        var display = '<div >' + tab + FHIRHelper.groupDisplay(grp) + '</div>';

        var newNode = $(display).appendTo(node);

        console.log(grp);
        if (grp.question){
            console.log('question');
            ctx.addQuestion(newNode,grp.question,lvl)
        }

        if (grp.group) {
            $.each(grp.group,function(inx,childGroup){
                var newLevel = lvl +1;
                ctx.addGroup(childGroup,newNode,ctx,newLevel)
            })
        }

    },
    addQuestion : function(gNode,arQuest,glvl) {
        //add questions to the group node
        console.log(gNode,arQuest)
        var tab = "";
        for (var i=0; i<= glvl+1;i++) {
            tab += "&nbsp;&nbsp;";
        }

        _.each(arQuest,function(quest){

            var display = '<div>'+tab +FHIRHelper.questionDisplay(quest) + "</div>"
            //console.log(display);
            $(display).appendTo(gNode);

        })

    },
    render : function() {
        var that = this;
        console.log(this.model);
        this.getTemplate('questionnaireDesigner',function(){
            //the skeleton for the Q
            that.$el.html(that.template(that.model));
            that.addGroup(that.model.group,$('#qdGroups'),that,0)

        })
    }


})