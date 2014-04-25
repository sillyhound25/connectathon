/**
 * The view that manages a repeating group
 */

var QuestionnaireMRView = BaseView.extend({

    render : function() {
        console.log(this.$el.attr('id'));

        html = "";
        renderQ.showGroup(this.group,0);

        this.$el.append(html);
    }

})