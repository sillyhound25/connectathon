/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 18/04/14
 * Time: 9:16 AM
 * To change this template use File | Settings | File Templates.
 */

    /* global BaseView,Backbone, console, alert,$ */
var QuestionnaireDesignerGroupView = BaseView.extend({

    events : {
        "click #qdgAddQuestion" : "addQuestion",
        "click #qdgAddSubGroup" : "addGroup",
        "click #qdgUpdateGroup" : "update",
        "click #qdgMoveUp" : 'moveUp',
        "click #qdgMoveDown" : 'moveDown'
    },
    moveUp : function() {
        var parentGroup = this.parentGroup; //the parent of this group
        var inx = this.positionInList;      //the position of this group in that list
        //var lst = parentGroup.group;
        if (inx > 0) {
            this.swapGroups(parentGroup.group,inx,inx-1);
            Backbone.trigger('Q:updated');
        } else {
            alert('Already at the top');
        }
    },
    moveDown : function() {
        //console.log('dn')
        var parentGroup = this.parentGroup; //the parent of this group
        var inx = this.positionInList;      //the position of this group in that list
        if (inx < parentGroup.group.length-1){
            this.swapGroups(parentGroup.group,inx,inx+1);
            Backbone.trigger('Q:updated');
        }  else {
            alert('Already at the bottom');
        }
    },
    swapGroups : function(lst, index_a, index_b) {
        var temp = lst[index_a];
        lst[index_a] = lst[index_b];
        lst[index_b] = temp;
    },
    update : function() {
        var group = this.model;     //the model is the fhir pojo group
        var cid = this.cid;         //client id of the view...
        group.text = $('#'+cid+'qdgText').val();
        group.header = $('#'+cid+'qdgHeader').val();




        var numCols =$("input[name='qdGroupCols']:checked").val();
        //console.log(numCols)

        Backbone.FHIRHelper.addExtension(this.model,Backbone.myConstants.extensionDefn.numCol,numCols);


        var id = '#'+cid + "qdgMayRepeat";
        //console.log(id, $(id).is(':checked'));
        if ($(id).is(':checked')){
            Backbone.FHIRHelper.addExtension(this.model,Backbone.myConstants.extensionDefn.mayRepeat,true);
        }


        //the entry in the Table Of Contents for this group...
        var tocEntry = $("div[data-id='"+cid+"']");
        var indent = parseInt(tocEntry.attr('data-indent'),10);
        var txt = "";

        for (var i=0; i <= indent; i++){
            txt += "&nbsp;&nbsp;&nbsp;";
        }

        txt += group.header.trim();
        tocEntry.html(txt);

        $('#'+cid+'qdgNotice').show().addClass('alert alert-success').html('Changes saved').fadeOut(2000);


        Backbone.trigger('Q:redrawContent');
    },
    addGroup : function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        var group = this.model;     //the model is the fhir pojo group

        group.group = group.group || [];
        //group.group.push({text:'new group',header:'new group'});
        group.group.push({header:'new group'});
        //console.log(group)


        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    addQuestion : function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        var group = this.model;     //the model is the fhir pojo group
        group.question = group.question || [];
        group.question.push({text:'new question'});
        //console.log(group)

        Backbone.trigger('Q:updated');  //will cause the designer to re-render
    },
    render : function() {
        var that = this;
        //console.log(this.model);
        this.getTemplate('questionnaireDesignerGroup',function(){

            //need to use a clone as we're adding illegal properties (cid) to the model so the id's can be unique......
            //note: **must** be a deep clone, or the coding will pick up the cid...
            var clone = {};
            $.extend(true,clone,that.model);
            clone.cid = that.cid;
            clone.isRoot = that.isRoot;     //the root group can't have questions...

            that.$el.html(that.template(clone));

            //set the mayRepeat

            var mayRepeat = Backbone.FHIRHelper.getExtensionValue(that.model,
                Backbone.myConstants.extensionDefn.mayRepeat);
            if (mayRepeat) {
                var id = '#'+that.cid + "qdgMayRepeat";
                $(id).attr('checked',true);
            }

            //set the column count
            //note we're not using cid: and it still seems to work - is cid: unnessecary as the event is captured
            //by the view???
            var numCols = Backbone.FHIRHelper.getExtensionValue(that.model,
                Backbone.myConstants.extensionDefn.numCol);
            //console.log(numCols)
            if (numCols) {
                $('input[name="qdGroupCols"]').val([numCols]);
            }
        });
    }

});