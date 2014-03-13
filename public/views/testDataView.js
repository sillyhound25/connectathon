/*
 * backbone view for test data generation
 */

var testDataView = Backbone.View.extend({
    events : {
        "click #submitTD" : function(ev) {
            this.createSampleMessage()
        },
         "click .myToggle" : function(ev){
             //toggle the dataentry panel...
             var panel = ev.currentTarget.getAttribute('data-toggle');
             $("#"+panel).toggle();
         }
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
        console.log(sampleData);
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
    render : function() {
        //console.log(this.attributes)
        //var warnings = this.attributes.warnings;
        var that=this;
        console.log(this.model);
        $.get('../templates/testDataForm.html',function(html){
            var template = Handlebars.compile(html);
            that.$el.html(template(that.model));
            $('#td_success').hide();
            return that;
        })
    }

})