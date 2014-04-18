

//the navigation bar for a questionnaire.
var QuestionNavView = Backbone.View.extend({
    initialize : function() {
        //console.log('init');
    },
    events : {
        "click .mynav" : "select",
        "click #saveForm": "save"
    },
    select : function() {
        //select a single group
        //todo - need scroll into view + how many questions completed and other stats
        //??? could the link have the number of incomplete questions in the display
        alert('This will do stuff relating to an individual group')
    },
    save : function(ev) {
        //collect all the entered data and update the questionnaire...
        console.log(this.model);        //should be the questionnaire

        //this.getGroup(this.model.group,this);
        this.getGroup(this.model.group,this);

        console.log(this.model);

    },
    getGroup : function(grp,ctx) {

        //console.log(grp)

        //process any questions in this group first...
        if (grp.question) {
            _.each(grp.question,function(quest){
                ctx.getQuestion(quest,ctx)
            })
        }

        if (grp.group) {
            _.each(grp.group,function(subGrp){
                ctx.getGroup(subGrp,ctx)
            })
        }
        return;
    },
    getQuestion : function(quest,ctx) {
        var code;       //the code for this particular question. todo: think about namespace
        if (quest.name && quest.name.coding && quest.name.coding.length > 0 && quest.name.coding[0].code) {
            code = quest.name.coding[0].code;
        }

        if (code){
            //this question is coded, so we can get the answer. Note that there can be more than one...
            var ctrls = $('.data-'+code);
            var cnt = 0;  //keep a track of the number of answers...
            $.each(ctrls,function(inx,ctrl){
                var v = $(ctrl).val();
                if (v) {
                    cnt++
                    if (cnt > 1) {
                        //there is more than one answer given. need to add a new question property with the answer. Use an extend of quest...
                    }
                    //for now, assume the answer is always a string...
                    quest.answerString = v;
                }
                //console.log(code + " "+ v);
            })

        }

        //a question can have groups as well...
        if (quest.group) {
            _.each(quest.group,function(subGrp){
                ctx.getGroup(subGrp,ctx)
            })

        }


    },
    render : function(){
        this.html += $('#saveButtonTemplate').html();   //render the save button
        this.$el.html(this.html);
    }
});