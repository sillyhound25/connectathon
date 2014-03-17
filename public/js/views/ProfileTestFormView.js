/**
 * Created with JetBrains WebStorm.
 * User: davidha
 * Date: 17/03/14
 * Time: 1:55 PM
 * To change this template use File | Settings | File Templates.
 */


var ProfileTestFormView = Backbone.View.extend({
    initialize : function() {
        this.meta = {};     //keep my properties - eg the extension  - in a separate property...
    },
    events : {
        "click #submitTD" : "createSampleMessage",
        "click #btnGenerateTD" : "generateForm",
        "click .myToggle" : "togglePanel"
    },
    togglePanel : function(ev){
        //toggle the dataentry panel...
        var panel = ev.currentTarget.getAttribute('data-toggle');
        $("#"+panel).toggle();
    },
    generateForm : function() {
        var that = this;
        if (! this.model) {
            alert('Please select a profile first');
            return;
        }
        var profile = this.model.get('content');       //the fhir profile object...
        var colVS = this.meta.colVS;
        var profileTestFormModel = new ProfileTestFormModel();
        profileTestFormModel.getExtensions(profile,colVS,function(data){
            console.log(data)
            that.render(data);
        })

    },
    createSampleMessage : function() {
        //create the sample (test) data that will be sent to the server. The server will then create a bundle
        //that can be posted to the server...
        var sampleData = {profileID:$('#td_profileid').val(),items:[]};
        $(".data").each(function(inx,el){
            var value = $(el).val();
            var dataType = $(el).attr('data-dataType');
            console.log(dataType);
            if (value) {
                var code = $(el).attr('data-code');
                //console.log(code, value);
                sampleData.items.push({code:code,value:value,dataType:dataType})
            }

        })
        // console.log(sampleData);
        //post the sample to the server
        $.ajax({
            type: "POST",
            url: '/api/createprofilesample',
            headers : {
                'content-type' : 'application/json'
            },
            data: JSON.stringify(sampleData),
            success: function(data,status,xhr) {
                console.log(data);
                //alert('The resources have been successfully saved.')

                $('#td_success').show();
                //now update the ID's that were created by the server...
                $.each(data.response.entry,function(inx,ent){
                    //each entry contains the id of the created resource.
                    var ar = ent.id.split('/');
                    var resource = ar[ar.length-2].toLowerCase();
                    var logicalId = ar[ar.length-1];        //not currently used...
                    var elID = resource+'createdID';
                    $('#'+elID).html(ent.id);
                    //console.log(ar)

                })
                //{{name}}createdID


            },
            error : function(xhr,status,err) {
                alert('There was an error: ' + err)

            }
        });

        console.log(sampleData);
    },
    render : function(rows){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/testDataForm.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw(rows);
            })
        } else {
            this.draw(rows);
        }
    },
    draw : function(rows){
        //actually render out the collection...
        var template = this.template;
        //console.log(rows)
        this.$el.html(template(rows));

        if (!rows) {
            //there is no form yet...
            $('#submitTD').hide();      //hide the submit button until there is a form...
        } else {

        }


        $('#td_success').hide();    //and hide the success display until there is success!
    }

})