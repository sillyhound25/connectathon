/**
 * The view that manages a form being completed.
 */

var QuestionnaireFillinView = BaseView.extend({
    events : {
        "click #qfSave" : "save"
    },
    save : function() {
        //console.log('save',this.model);
        var status = 'in progress'
        this.getGroup(this.model.group,this);     //this actually reads all the answers and appends to the Q...
        //console.log('save',this.model);
        if (this.isNew) {
            alert('will create a new form based on the template with id '+ this.id);
            this.trigger('qfv:new',{patientID:this.patientID,questionnaire:this.model,status:status});
        } else {
            alert('Updating this form: id='+this.id)
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
        this.model = vo.Q;      //the model is the entire questionnaire (including header)
        this.isNew = vo.isNew;
        this.questionnaireID = vo.questionnaireID;
        this.patientID = vo.patientID;

        MediatorQ.assert(this.patientID !== null,'PatientID is null!');
        //console.log(vo);
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
            if (quest.name && quest.name.coding && quest.name.coding.length > 0 && quest.name.coding[0].code) {
                var resultKlass = 'data-' + quest.name.coding[0].code;
                var results = $('.'+resultKlass);
                var v = results.val();  //think this is OK for all controls...
                if (v) {
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
        var that=this;
        this.getTemplate('questionnaireFillinContainer',function(){


            that.$el.html(that.template());
            if (that.isNew) {
                $('#qfHeaderText').html("This will create a new form based on the template at: "+that.questionnaireID)
            } else {
                $('#qfHeaderText').html("This will update the partially completed form at "+that.questionnaireID);
            }



            //will establish html and htmlNav
            renderQ.showGroup(that.model.group,0);  //create the questionnaire form
            $('#qfMain').html(html);
            //this.$el.html(html);
        });

    }
});
