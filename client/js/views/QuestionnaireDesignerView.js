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
        "shown.bs.tab a[data-toggle='tab']" : "tabSelect",
        "click #qdFormUpdate" : "update"
    },
    update : function() {
        //need to get any updates from the header. This will update the shared mode directly..
        //alert(JSON.stringify(this.model,null,2))

        this.headerView.update();

        alert(JSON.stringify(this.model,null,2))

        if (this.isNew) {
            var desiredId = $('#qdId').val();
            this.trigger('qd:saveNewQ',{id:desiredId,Q:this.model})
        } else {
            this.trigger('qd:updateQ',{id:this.id,Q:this.model})
        }

    },
    init : function(entry) {
        //create a new model. The model will be a FHIR Questionnaire resource, but the
        //object passed in is a bundle entry (and so contains the id). If no object is passed in,
        //then it is a new questionnaire.
        //at the momebt there is a memory leak (viewRef is not being cleared) but I'm leaving that so I can
        //experiment with chrome memory checking...

        console.log(entry);
        if (entry) {
            this.model = entry.content;
            this.id = entry.id;
            this.isNew = false;

        } else {
            this.model = {group : {}};       //model.group holds the layout...
            this.isNew = true;
            delete this.id;         //no id for a new resource
        }

        //create a view object for the header...  (the el is set in in render from questionerDesigner.html)
        //this.headerView = new QuestionnaireDesignerHeaderView({el: $('#qdHeaderDiv')});
        //this.headerView = null;//new QuestionnaireDesignerHeaderView({el: $('#qdHeaderDiv'),model:this.model});
        },

    tabSelect : function(ev) {
        if (ev.target.getAttribute('href') === '#qdPreview') {
            //moving to the preview mode - render the form...
            if (this.model.group && (this.model.group.group || this.model.group.question)) {
                //todo - the renderer uses the global html & htmlNav. There must be a better way...
                html = "";
                renderQ.showGroup(this.model.group,0);  //create the questionnaire form
                $('#qdPreviewDiv').html(html);
            } else {
                alert('You need some groups or questions first!')
            }


        }

    },
    group : function(ev) {
        //the user has selected a group or question  in the outline, so show the detail...
        ev.preventDefault();
        ev.stopPropagation();

        $('.qdgDetail').hide(); //hide all the detail views...

        var id = ev.currentTarget.getAttribute('data-id');


        _.each(this.viewRef,function(view){
            if (view.cid === id) {

                view.render();
                return;
            }
        })
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

            var text = FHIRHelper.questionDisplay(quest);
            if (text.length > 50) {
                text = text.substr(0,47) + '...';
            }

            var display = "<div class='qQuestion' data-id='"+questView.cid+"'>"+tab + text + "</div>"
            var questNode = $(display).appendTo(gNode);

            if (quest.group) {
                //this question also has groups attached
                _.each(quest.group,function(questGroup){

                        var newQuestionLevel = glvl +1;
                        ctx.addGroup(questGroup,questNode,ctx,newQuestionLevel)

                })
            }

        })


    },
    redrawOutline : function() {
        //called when the outline has been updated

        if (this.viewRef) {
            _.each(this.viewRef,function(view){
               // console.log(view)
                view.remove();
            })
        }
        $('#qdGroups').html("");

        html="";        //the global variable - I don;t like this!
        this.addGroup(this.model.group,$('#qdGroups'),this,0)

    },
    render : function() {
        var that = this;
        //console.log(this.model);
        this.getTemplate('questionnaireDesigner',function(){
            //create the skeleton for the Questionnaire...
            that.$el.html(that.template({id:that.id}));

            //now, disable the ID unless this is a new model
            if (that.isNew) {
                //$("#qdIdText").text("Enter ID")
                $("#qdId").attr('placeholder','Enter an ID or leave blank for the server to assign');
            } else {
                $("#qdId").attr('disabled',true);
            }

            //need to create the headerview after the DOM node has been created...
            that.headerView = new QuestionnaireDesignerHeaderView({el: $('#qdHeaderDiv'),model:that.model});
            that.headerView.render();
            //that.$el.html(that.template(that.model));

            that.viewRef = [];  //will hold the child views for group and question...

            //create the hierarchical model of the questionnaires. This will directly populate the DOM
            //and will create references to viewRef so the Questionnaire can be updated.
            that.addGroup(that.model.group,$('#qdGroups'),that,0)
        })
    }


})