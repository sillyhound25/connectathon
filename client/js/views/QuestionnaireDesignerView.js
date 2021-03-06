/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */

    /*global BaseView,$,_,console, alert,renderQ,Backbone,QuestionnaireDesignerGroupView, QuestionnaireDesignerQuestionView */
/*global QuestionnaireDesignerHeaderView */

var QuestionnaireDesignerView = BaseView.extend({
    events : {
        "click .qGroup" : "itemSelected",
        "click .qQuestion" : "itemSelected",
        "shown.bs.tab a[data-toggle='tab']" : "tabSelect",
        "click #qdFormUpdate" : "update"
    },
    update : function() {
        //need to get any updates from the header. This will update the shared model directly..
        this.headerView.update();

        console.log(this.model);

        if (! window.confirm("Are you sure you wish to update this Questionnaire?")) {
            return;
        }

        if (this.isNew) {
            var desiredId = $('#qdId').val();
            this.trigger('qd:saveNewQ',{id:desiredId,Q:this.model,historyId: this.historyId});
        } else {
            this.trigger('qd:updateQ',{id:this.id,Q:this.model,historyId: this.historyId});
        }

    },
    init : function(entry) {
        //create a new model. The model will be a FHIR Questionnaire resource, but the
        //object passed in is a bundle entry (and so contains the id). If no object is passed in,
        //then it is a new questionnaire.
        //at the moment I susyect there is a memory leak (viewRef is not being cleared) but I'm leaving that so I can
        //experiment with chrome memory checking...

        //todo scan the code systems and add to the list of options so they will render...
        var that = this;
        if (entry) {
            this.model = entry.content;     //this is the Q model

            if (! this.model.group) {
                //It's legal for a questionnaire not to have a top level group, but the designer expects one...
                this.model.group = {};
            }

            this.id = entry.id;
            this.isNew = false;

            //get the version specific id...
            if (entry.link) {
                _.each(entry.link,function(lnk){
                    if (lnk.rel==='self') {
                        that.historyId = lnk.href;
                        console.log(that.historyId);
                    }
                });
            }

            //this.redrawContent();
        } else {
            this.model = {resourceType:'Questionnaire', group : {header:'Root',group : [{header : 'group1'}]}};       //model.group holds the layout...
            this.isNew = true;
            delete this.id;         //no id for a new resource
        }
    },

    tabSelect : function(ev) {
        if (ev.target.getAttribute('href') === '#qdPreview') {
            //moving to the preview mode - render the form...
            if (this.model.group && (this.model.group.group || this.model.group.question)) {
                //todo - the renderer uses the global html & htmlNav. There must be a better way...
                //html = "";
                var ctx = {};
                renderQ.showGroup(this.model.group,0,ctx);  //create the questionnaire outline
                $('#qdPreviewDiv').html(ctx.html);

            } else {
                alert('You need some groups or questions first!');
            }


        }

    },
    itemSelected : function(ev) {
        //the user has selected a group or question  in the outline, so show the detail...
        ev.preventDefault();
        ev.stopPropagation();

        $('.qdgDetail').hide(); //hide all the detail views...

        //the client id the view (group or question) repsonsible for rendering this item
        var id = ev.currentTarget.getAttribute('data-id');

        $('.qQuestion').removeClass('qdSelected qdNotSelected');
        $('.qGroup').removeClass('qdSelected qdNotSelected');

        $(ev.currentTarget).addClass('qdSelected');
        //because nodes are hierarchical, the class will cover children unless overridden....
        $(ev.currentTarget).children().addClass('qdNotSelected');


        _.each(this.viewRef,function(view){
            if (view.cid === id) {

                view.render();
                //return;
            }
        });
    },
    setVersion : function(v){
        //set the version specific Id. Needed for servers (like blaze) that check that sort of thing...
        this.historyId = v;
        console.log(v);
    },
    //note: no longer a hierarchy of nodes rooted at $('#qdGroups')
    addGroup : function(grp,node,ctx,lvl,parentGroup,parentGroupIndex) {
        //adds a group to the layout...
        var tab = "";
        for (var i=0; i<= lvl;i++) {
            tab += "&nbsp;&nbsp;&nbsp;";
        }

        //each instance of the view needs to have its own DOM element...
        var el = $('<div></div>').appendTo($('#qdDetail'));
        var groupView = new QuestionnaireDesignerGroupView({el:el,model:grp});
        if (lvl === 0) {
            groupView.isRoot = true;       //the root group. Can't have questions
        }

        //pass in the parents to this group (if any). These will be used in the re-ordering...
        groupView.parentGroup = parentGroup;
        groupView.positionInList = parentGroupIndex;     //the position of the questionin the list


        ctx.viewRef.push(groupView);
        //console.log(inx);
        var display = "<div class='qGroup' data-indent='"+lvl+"' data-id='"+groupView.cid+"'>" + tab + Backbone.FHIRHelper.groupDisplay(grp) + '</div>';
        var newNode = $(display).appendTo($('#qdGroups'));

        //if this is a new group, then render it immediately. If there are more than one - or a new group -  then
        //the last one will be rendered...
        if (grp.header === 'new group') {
            $('#qdgDetail').children().hide(); //hide all the detail views...
            groupView.render();
        }

        if (grp.question){
            ctx.addQuestions(grp.question,lvl,ctx,grp);
            //ctx.addQuestions(newNode,grp.question,lvl,ctx,grp)
        }

        if (grp.group) {
            $.each(grp.group,function(grpInx,childGroup){
                var newLevel = lvl +1;
                ctx.addGroup(childGroup,newNode,ctx,newLevel,grp,grpInx);
            });
        }
    },
    addQuestions : function(arQuest,glvl,ctx,grp) {
        //addQuestions : function(gNode,arQuest,glvl,ctx,grp) {
        //add questions to the group node in the layout
        var tab = "";
        for (var i=0; i<= glvl+1;i++) {
            tab += "&nbsp;&nbsp;&nbsp;";
        }

        _.each(arQuest,function(quest,inx){
            var el = $('<div></div>').appendTo($('#qdDetail'));

            var questView = new QuestionnaireDesignerQuestionView({el:el,model:quest});
            //store a reference to the parent group. Used to allow a question to create a sibling...
            questView.parentGroup = grp;
            questView.positionInList = inx;     //the position of the questionin the list
            ctx.viewRef.push(questView);

            var text = Backbone.FHIRHelper.questionDisplay(quest);
            if (text.length > 40) {
                text = text.substr(0,37) + '...';
            }

            var display = "<div class='qQuestion' data-indent='"+glvl+"' data-id='"+questView.cid+"'>"+tab + text + "</div>";


            //var questNode = $(display).appendTo(gNode);
            var questNode = $(display).appendTo($('#qdGroups'));
            //if this is a new question, then render it immediately. If there are more than one - or a new group -  then
            //the last one will be rendered...
            if (quest.text === 'new question') {
                $('.qdgDetail').hide(); //hide all the detail views...
                questView.render();
            }

            if (quest.group) {
                //this question also has groups attached
                _.each(quest.group,function(questGroup,inx){
                        var newQuestionLevel = glvl +2;     //<<<<<<<<< not sure why this isn't 1...
                        ctx.addGroup(questGroup,questNode,ctx,newQuestionLevel,quest,inx);
                });
            }
        });
    },
    redrawContent : function() {
        //re-display the content of the questionnaire - as an xml  resource...
        //$('#qdSourceDiv').val(FHIRHelper.getXML(this.model));
        $('#qdSourceDiv').val(JSON.stringify(this.model,null,2));

    },
    redrawOutline : function() {
        //called when the outline has been updated

        if (this.viewRef) {
            _.each(this.viewRef,function(view){
               // console.log(view)
                view.remove();
            });
        }
        var el = $('#qdGroups');
        el.html("");

        //html="";        //the global variable - I don't like this!

        this.addGroup(this.model.group,el,this,0);

    },
    render : function() {
        var that = this;
        //console.log(this.model);
        this.getTemplate('questionnaireDesigner',function(){
            //create the skeleton for the Questionnaire Designer tabs...
            that.$el.html(that.template({id:that.id}));

            //display the content of the Q as XML...
            that.redrawContent();

            //now, disable the ID unless this is a new model
            //changed my mind...
            if (that.isNew) {
                //$("#qdIdText").text("Enter ID")
                $("#qdId").attr('placeholder','Enter an ID or leave blank for the server to assign');
                $("#qdId").val('test42');      //<<<< just to be lazt!
            }

            //need to create the headerview after the DOM node has been created...
            that.headerView = new QuestionnaireDesignerHeaderView({el: $('#qdHeaderDiv'),model:that.model});
            that.headerView.render();
            //that.$el.html(that.template(that.model));

            that.viewRef = [];  //will hold the child views for group and question...

            //create the hierarchical model of the questionnaires. This will directly populate the DOM
            //and will create references to viewRef so the Questionnaire can be updated.
            that.addGroup(that.model.group,$('#qdGroups'),that,0);
        });
    }


});