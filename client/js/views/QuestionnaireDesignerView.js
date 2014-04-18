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
        "click .qQuestion" : "group",
        "shown.bs.tab a[data-toggle='tab']" : "tabSelect"
    },
    tabSelect : function(ev) {
        if (ev.target.getAttribute('href') === '#qdPreview') {
            //moving to the preview mode - render the form...

            //todo - the renderer uses the global html & htmlNav. There must be a better way...
            html = "";
            renderQ.showGroup(this.model.group,0);  //create the questionnaire form
            $('#qdPreviewDiv').html(html);
            //console.log(html);
        }

    },
    group : function(ev) {
        //the user has selected a group or question detail...
        ev.preventDefault();
        ev.stopPropagation();
        $('.qdgDetail').hide(); //hide all the detail views...

        var id = ev.currentTarget.getAttribute('data-id');
        //console.log(id)

        _.each(this.viewRef,function(view){
            if (view.cid === id) {
                //console.log('render')
                view.render();
                return;
            }
        })


    },
    questionDEP : function(ev) {
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
        //each instance of the view needs to have its own DOM element...
        var el = $('<div></div>').appendTo($('#qdDetail'));
        var groupView = new QuestionnaireDesignerGroupView({el:el,model:grp});
        ctx.viewRef.push(groupView);
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
            var el = $('<div></div>').appendTo($('#qdDetail'));

            var questView = new QuestionnaireDesignerQuestionView({el:el,model:quest});
            ctx.viewRef.push(questView);

            var display = "<div class='qQuestion' data-id='"+questView.cid+"'>"+tab +FHIRHelper.questionDisplay(quest) + "</div>"
            $(display).appendTo(gNode);

        })
    },
    render : function() {
        var that = this;
        //console.log(this.model);
        this.getTemplate('questionnaireDesigner',function(){
            //the skeleton for the Q
            that.$el.html(that.template(that.model));

            that.viewRef = [];
            //that.questRef = [];

            that.addGroup(that.model.group,$('#qdGroups'),that,0)

            //console.log(that.viewRef)
           // console.log(that.questRef)
        })
    }


})