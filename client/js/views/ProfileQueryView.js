/**
 * Query a FHIR server based on profiles
 */

var ProfileQueryView = Backbone.View.extend({
    initialize : function() {
        var t = "{{#each resources}}<div><input type='radio' name='pq_resource' value='{{this}}'/> {{this}}</div>{{/each}}";
        this.resourceTemplate = Handlebars.compile(t);

        var t1 = "<ul>{{#each entry}}<li><a href='#' data-inx = '{{@index}}' class='pq_oneResult'>Item {{@index}}</a></li>{{/each}}</ul>";
        this.resultsTemplate = Handlebars.compile(t1);

        //console.log(this.resourceTemplate)
    },
    events : {
        "click .pq_profile" : "selectProfile",
        "click #pq_getPatient" : "getPatient",
        "click #pq_execute" : "executeQuery",
        "click .pq_oneResult" : "showOneResult"
    },
    showOneResult : function(ev){

        var inx = $(ev.currentTarget).attr('data-inx');
        var entry = this.resultBundle.entry[inx];
        $('#pq_one_result').text(JSON.stringify(entry.content,undefined,2));
        $('#pq_resourceid').html(entry.id);

    },
    clearResults : function() {
        $('#pq_one_result').text("");
        $('#pq_resourceid').html("");
        $('#pq_results').html("");

    },
    executeQuery : function() {
        var that = this;
        var patient = $('#pq_select_patient').val();
        var resource = $('input[name=pq_resource]:checked').val();
        if (!patient || ! resource){
            alert('Please select the Patient and the Resource to query');
            return;
        }
        var ar = patient.split('/');
        var logicalId = ar[ar.length-1];
        var query = {resource:resource,params : []};
        //this is a problem with FHIR - some of the resources (notable the medications) use 'patient' not 'subject'
        if (['medicationadministration','medicationprescription','medicationdispense','medicationstatement'].indexOf(resource.toLowerCase()) > -1) {
            query.params.push({name:'patient',value:logicalId});
        } else {
            query.params.push({name:'subject',value:logicalId});
        }


        var queryString = JSON.stringify(query);
        //console.log(queryString,patient,resource);
        this.clearResults();
        console.log(queryString);
        $.get('/api/generalquery/'+queryString,function(bundle){
            that.resultBundle = bundle;
            console.log(bundle);
            $('#pq_results').html(that.resultsTemplate(bundle));
        });

    },
    getPatient : function() {
        //locate the patient with the given identifier (there may be multiple)
        var query = {resource:'Patient',params : []};
        var v = $('#pq_identifier').val();
        if (!v) {
            alert('Please enter the identifier in the input and try again');
            return;
        }
        query.params.push({name:'identifier',value:v});
        var queryString = JSON.stringify(query);
        console.log(queryString);
        $('#pq_select_patient').empty();
        $('#pq_warning').show();
        $.get('/api/generalquery/'+queryString,function(bundle){
            console.log(bundle);
            $('#pq_warning').hide();
            if (bundle.entry.length === 0) {
                alert('No patient found with that identifier')
            } else {
                _.each(bundle.entry,function(ent){
                    var id = ent.id;
                    var name = 'Unknown';
                    try {
                        name = ent.content.name[0].text;
                    } catch (ex){}

                    $('#pq_select_patient').append("<option value='"+id+"'>"+ name + " (" + id+")</option>");
                })

                if (bundle.entry.length > 1) {
                    alert('Be warned: there are multiple patients with this identifier...');
                }

            }

        })

    },
    selectProfile : function(ev){
        var profileName = $(ev.currentTarget).attr('data-name');
        //alert(profileName);
        //extract the resources that are mentioned in the profile...
        var arResources = [];
        _.each(this.profiles,function(profile){
            if (profile.name === profileName){
                //at the moment, the resources are in the extensions. Will want to support slicing later on...
                _.each(profile.extensionDefn,function(ext){
                    var resource = ext.context[0];
                    if (arResources.indexOf(resource) === -1) {
                        arResources.push(resource);
                    }
                })
            }
        })
        //console.log(arResources)
        this.resources = arResources;
        $('#pq_resources').html(this.resourceTemplate({resources:arResources}));
        $("input:radio[name=pq_resource]:first").attr('checked', true);
        //this.render()
        //display the list of resources in the params box

       // var list = "<% _.each(resource, function(name) { %> <input type='radio' name='pq_r' value='><%= name %>'/> <% }); %>";
       // $("#pq_resources").html(_.template(list, {resource: arResources}));



    },
    setProfiles : function(colProfile){
        //pass in the set of profiles
        this.profiles = colProfile.toJSON();     //the set of profiles in json format
        this.render();
    },
    render : function(){
        var that=this;
        //retrieve the template the first time render is called...
        if (! this.template) {
            $.get('templates/profileQuery.html',function(html){
                that.template = Handlebars.compile(html);
                that.draw();
            })
        } else {
            this.draw();
        }
    },
    draw : function(){
        //actually render out the collection...
        var template = this.template;

        this.$el.html(template({profiles:this.profiles,resources:this.resources}));
        $('#pq_warning').hide();
    }

})