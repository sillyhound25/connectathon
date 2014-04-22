/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 22/04/14
 * Time: 7:12 PM
 * To change this template use File | Settings | File Templates.
 */

var QuestionnaireFillinView = BaseView.extend({
    events : {
        "click #qfSave" : "save"
    },
    save : function() {
        console.log('save',this.model)
        this.getGroup(this.model,this);
        console.log('save',this.model)

    },
    init : function(vo) {
        this.model = vo.Q.group;    //

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

        _.each(arQuest,function(quest,inx){
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
                _.each(quest.group,function(questGroup,inx){
                    ctx.getGroup(questGroup,ctx)
                })
            }
        })
    },
    render : function(){
        var that=this;
        this.getTemplate('questionnaireFillinContainer',function(){
            //will establish html and htmlNav
            that.$el.html(that.template());

            renderQ.showGroup(that.model,0);  //create the questionnaire form
            $('#qfMain').html(html);
            //this.$el.html(html);
        });

    }
})
