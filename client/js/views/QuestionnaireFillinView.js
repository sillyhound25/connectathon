/**
 * The view that manages a form being completed.
 */

var QuestionnaireFillinView = BaseView.extend({
    events : {
        "click #qfSave" : "save",
        "click .mayRepeat" : 'mayRepeat'
    },
    mayRepeat : function(ev){
        //the user wants to repeat a group...
        ev.preventDefault();
        ev.stopPropagation();
        //get the id of the group to repeat...

        var groupid = ev.currentTarget.getAttribute('data-groupid');

        //console.log('repeat '+groupid);
        //locate the view representing this mayRepeat group...
        var view = this.mayRepeatViews[groupid];

        //set the form context in the question view...
        view.setContext({questionViews:this.questionViews,mayRepeatViews:this.mayRepeatViews});

        view.render();


    },
    save : function() {
        //console.log('save',this.model);
        var status = 'in progress';
        //this.getGroup(this.model.group,this);     //this actually reads all the answers and appends to the Q...
        this.altGetAnswers();

        console.log(this.model);
        //console.log('save',this.model);
        if (this.isNew) {
            if (confirm('Please confirm that you wish to create a new form based on the template with id '+ this.questionnaireID)) {
                this.trigger('qfv:update',{patientID:this.patientID,questionnaire:this.model,
                    status:status,isNew:true,questionnaireID : this.questionnaireID});
            }

        } else {

            if (confirm('Please confirm that you wish to update this form: id='+this.questionnaireID)) {
                this.trigger('qfv:update',{patientID:this.patientID,questionnaire:this.model,
                    status:status,isNew:false,questionnaireID : this.questionnaireID});
            }
        }

    },
    init : function(vo) {
        //inialise a new form for completion.
        //the model represents the template (and if this is re-editing  then there may also be some answers)
        //if isNew is true, then:
        //         the model will be the template, and saving will create a new instance with patient details
        //          the id will be the id of the template
        //if isNew is false then:
        //          the model will have some of the answers
        //          the id will be the id of the actual form instance
        this.model = vo.Q;      //the model is a clone of the entire questionnaire (including header)
        this.isNew = vo.isNew;
        this.questionnaireID = vo.questionnaireID;
        this.patientID = vo.patientID;

        MediatorQ.assert(this.questionnaireID != null,'questionnaireID is null!');
        MediatorQ.assert(this.patientID != null,'PatientID is null!');
        //console.log(vo);
    },
    altGetAnswers : function() {
        //an alternate way of getting the answers that walking the questionnaire
        $.each(this.questionViews,function(inx,qView) {
            var ID = qView.questID;     //the ID that was assigned to the control at creation time
            var quest = qView.model;    //the node in the questionnaire object
            var v = $('#'+ID).val();
            if (v) {
                console.log(quest.name.coding[0].code,v);
                //todo - check for answerFormat
                quest.answerString = v;
            }

        });

    },
    //root to walk the questionnaire tree and get the answers
    getGroup : function(grp,ctx) {
        if (grp.question){
            ctx.getQuestions(grp.question,ctx)
        }

        if (grp.group) {
            $.each(grp.group,function(grpInx,childGroup){
                ctx.getGroup(childGroup,ctx)
            })
        }
    },
    getQuestions : function(arQuest,ctx) {

        _.each(arQuest,function(quest){
            //todo - ignoring the system for now...
            if (quest.name && quest.name.coding && quest.name.coding.length > 0 && quest.name.coding[0].code) {
                var resultKlass = 'data-' + quest.name.coding[0].code;
                //console.log(resultKlass);
                //must search only in this views container!
                //todo - will need to consider how to manage mayRepeat - maybe a prefix? ie, when the user
                //clicks mayRepeat, another set of controls is generated with a unique previx - ie we update
                //the backing model as well as the html controls and the name will always be unique. Stick with a class
                //rather than a group though, as the top lavel page may have multiple instances of this template...
                var results = ctx.$el.find('.'+resultKlass);

                var v = results.val();  //think this is OK for all controls...
                if (v) {
                    console.log(quest.name.coding[0].code,v);
                    //todo - check for answerFormat
                    quest.answerString = v;
                }

            }
            if (quest.group) {
                //this question also has groups attached
                _.each(quest.group,function(questGroup){
                    ctx.getGroup(questGroup,ctx)
                })
            }
        })
    },
    render : function(){
        //console.log(renderQ);
        var that=this;
        this.getTemplate('questionnaireFillinContainer',function(){

            that.$el.html(that.template());
            if (that.isNew) {
                $('#qfHeaderText').html("This will create a new form based on the template at: "+that.questionnaireID)
            } else {
                $('#qfHeaderText').html("This will update the partially completed form at "+that.questionnaireID);
            }

            var ctx = {};       //the context object...
            renderQ.showGroup(that.model.group,0,ctx);  //create the questionnaire form

            //create clones of the view objects. This is in case the renderer runs again and re-creates the view objects.
            that.mayRepeatViews = {};
            $.extend(true,that.mayRepeatViews,ctx.mayRepeatViews);

            that.questionViews = {};
            $.extend(true,that.questionViews,ctx.questionViews);

            $('#qfMain').html(ctx.html);

            //iterate through the 'mayRepeats' and set the container. We have to do this after the fillinView has rendered.
            //todo This is not quite right - the container needs to be after any previous repeats...
            $.each(that.mayRepeatViews,function(inx,view) {
                var el = $('#'+ view.groupId);
                //console.log(el.html());
                view.setElement(el);
                //view.setElement(view.groupId);
                //console.log(view.groupId)
            });

            //now associate the individual question views with their DOM element.
            //todo an enhancement might be to build a render tree rather than building HTML manually

            //ctx.questionViews[qID] = qView;

            $.each(that.questionViews,function(inx,qView) {
                var qEl = $('#'+ qView.questID);
                qView.setElement(qEl);

            });

            //console.log(renderQ.mayRepeatViews);



        });

    }
});
