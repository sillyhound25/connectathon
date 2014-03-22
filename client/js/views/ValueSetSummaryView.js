/**
 *Display teh contents of a ValueSet. Editing not allowed.
 */

var ValueSetSummaryView = Backbone.View.extend({

    render : function(uri){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/oneVS.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw(uri);
            })
        } else {
            this.draw(uri);
        }
    },
    draw : function(uri){
        var that=this;
        //get the resource. Note this is the actual resource - not a bundle.entry
        $.get( "/api/valueset/id/"+encodeURIComponent(uri), function( vsResource ) {
            //alert(data);
            console.log(vsResource)
            var genDialogFrame = $('#generalModelDlg').html();      //the frams for the modal dialog
            $('#modalDialogDiv').html(genDialogFrame);      //write the frame to the DOM



            //var model = {content:vsResource};
            vsResource.id = {meta:uri};
            vsResource.readOnly = true;

            $('#modal-content').html(that.template(vsResource));    //use the BS template to write out the dialog

            $('#generalDlgTitle').html('Contents of ValueSet')


            //and show the modal...
            $('#generalDlg').modal();

        });

    }

})