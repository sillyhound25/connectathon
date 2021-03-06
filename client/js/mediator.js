/**
 * This was supposed to be a mediator - but it's really just a collection of event handlers in one plce.
 * I'll do a real mediator when I figure out how to do it!
 *
 * todo: all the views/models should be scoped to another object - ?the Mediator???
 */


/*global $,Backbone,alert,profileCollection,ProfileQueryView,ValueSetCollection,ValueSetListView */
/*global ValueSetDetailView,ProfileCollection,confirm,_,console,ProfileDetailView,ProfileExtensionView */
/*global ProfileContentView,ProfileTestFormView, ExtensionCollection,ExtensionView,ValueSetSummaryView */
/*global ProfileSummaryView,ProfileModel,ProfileStructureView, ProfileListView,ProfileSummaryModel,QueryView*/

//add a function to the string prototype to get the resource name from a path...

String.prototype.getResourceNameFromPath = function (){
    var g = this.indexOf('.');
    if (g > -1) {
        return this.substr(0,g);
    } else {
        return this.toString();
    }
};



//alert("test.test".getResourceNameFromPath())

//a cache of resource profiles. used by profileSummaryModel. keyed on resource name.
Backbone.fhirResourceCache = {};

//a list of test data builders. These are the ones that the test form can use...
Backbone.fhirTestBuilders = [];
$.get('admin/builders',function(builders){
    Backbone.fhirTestBuilders = builders;
});



var Mediator={};

//a simple assertion checker (based on John Resigs one) that shows a message if the outcome is false
Mediator.assert = function( outcome, description ) {
    if (!outcome) {
        alert("Assert Error: " + description);
    }
};

//the list of permissable datatypes in a profile...
var dataTypeList = ['boolean','code','date','string','integer','uri','Coding','CodeableConcept','Period','ResourceReference'];
var resourceList = ['CarePlan','Encounter','MedicationAdministration','MedicationPrescription','Medication','Observation','Patient','Practitioner'];


var colVS = new ValueSetCollection();           //collection of ValueSets
var listVS = new ValueSetListView({collection:colVS,el:$('#display')}); //List View for the ValueSets
var vsDetailView = new ValueSetDetailView({el:$('#workAreaVS')});       //Detail/edit view for a single VS

var profileQueryView = new ProfileQueryView({el:$('#workAreaProfileQuery')});
profileQueryView.render();
//Mediator.start = function() {

var colProfile = new ProfileCollection();

    //============================== ValueSet objects and handlers ==========================


    //The user selects a VS in the list
    Backbone.listenTo(listVS,'vsList:select',function(vo){
        //see if the existing valueset has been changed...
        var canShowVS = true;
        if (vsDetailView.hasChanged()) {
            canShowVS = confirm("There are unsaved changes. Are you sure you wish to continue?");
        }
        if (canShowVS) {
            //var selectedModel = colVS.findModelByResourceID(vo.id);       //the vs selected in the list view
            vsDetailView.model = colVS.findModelByResourceID(vo.id);
            vsDetailView.render();
        }
    });

    //the handler when the option to create a new ValueSet is selected
    Backbone.listenTo(listVS,'vsList:new',function(){
        vsDetailView.setNewValueSet();
        vsDetailView.render();
    });

//when a valueset is to be deleted
//todo - the overall logic flow requires review...

Backbone.listenTo(listVS,'valueSet:delete',function(vo){


    var selectedVS = colVS.findModelByResourceID(vo.id);
    if (selectedVS) {

        //find any profiles that are using this valueset. (Note that a direct string comparison is used)
        var profiles = colProfile.findProfilesUsingValueSet(vo.id);
        if (profiles.length > 0) {
            //OK there were matching profiles...
            var msg = "Sorry, there are profiles using this ValueSet, so it cannot be deleted. There are: \n";
            _.each(profiles,function(prof){
                msg += prof.toJSON().name + " (" + prof.id + ")\n";

            });
            alert(msg);
            return;
        }


        //console.log(profiles)
        if (confirm('Please confirm you wish to delete the valueset with the ID: ' + vo.id)) {

            selectedVS.destroy({
                success : function() {
                    Mediator.clearValueSetWorkareas();   //clear all the work areas associated with profile editing
                    Mediator.loadValueSets();
                },
                error : function(xhr,status,err) {
                    console.log(xhr,status,err);
                    //$('#save_profile_changes').text('Update Profile').attr('disabled',false)
                    alert('sorry, there was an error deleting the profile ');
                }
            });

            //selectedVS.deleteVS();
        }

    }
});


    //when a new valueset is added...
    Backbone.listenTo(vsDetailView,'vsList:added',function(){
        Mediator.loadValueSets();
        vsDetailView.render();
    });


//}

//load the ValueSet. At the moment this is only Orion sourced resources... - Later we'll allow a select of some sort
//display the list when finished...



/*
colVS.fetch({
    success : function() {

        $('#loading').hide();
        listVS.render();      //render the list of valuesets...
    },
    error : function() {
        alert('There was an error loading the ValueSets')
    }
});
*/

//============================= Profile objects and handlers


var listProfiles = new ProfileListView({collection:colProfile,el:$('#orionProfilesDiv')}); //List View for the Profiles
var profileDetailView = new ProfileDetailView({el:$('#workAreaProfile')});       //Detail/edit view for a single VS
var profileExtensionView = new ProfileExtensionView({el:$('#editExtensionDiv')});
//todo - these should probably be a method on the View rather than a direct setting like this...
profileExtensionView.meta.dataTypeList = dataTypeList;      //the permissable datatypes
profileExtensionView.meta.colVS = colVS;    //the collection of known valuesets (or at least, those we can choose from)
profileExtensionView.meta.resourceList = resourceList;

var profileStructureView = new ProfileStructureView({el:$('#editStructureDiv')});
profileStructureView.meta.dataTypeList = dataTypeList;      //the permissable datatypes
profileStructureView.meta.colVS = colVS;    //the collection of known valuesets (or at least, those we can choose from)
//profileStructureView.meta.resourceList = resourceList;

var profileSummaryView = new ProfileSummaryView({el:$('#workAreaSummaryProfile')});       //generate a profile summary
profileSummaryView.render();


var profileContentView = new ProfileContentView({el:$('#workAreaContentProfile')});       //generate a profile summary
//profileContentView.render();


var profileTestFormView = new ProfileTestFormView({el:$('#workAreaTestData')});       //generate a test form...
profileTestFormView.meta.colVS = colVS;    //needse the valueset
profileTestFormView.render();   //as there is no model, this will just render the 'create form' button...

var valueSetSummaryView = new ValueSetSummaryView();

var extensionCollection = new ExtensionCollection();
var extensionView = new ExtensionView({collection:extensionCollection, el:$('#allExtensionsDiv')});


//The user selects a Profile from the  in the list. Make sure that all the views that have an interest in
//this profile have their model set...
Backbone.listenTo(listProfiles,'profileList:select',function(vo){

    //check for unsaved changes...
   // if (Mediator.canSelectNewProfile() ) {
        var selectedModel = colProfile.findModelByID(vo.id);       //the vs selected in the list view
        profileDetailView.setModel(selectedModel);

        profileSummaryView.clearView();         //clears the models and views...
        profileSummaryView.model = selectedModel;
        profileSummaryView.createSummary(function(){
            profileSummaryView.render();            //render the summary. This might be slow if the resource profile needs to be loaded...
        });

        profileTestFormView.model = selectedModel;
        profileContentView.setModel(selectedModel);     //set the model and render

        //make sure the details tab is displayed...
        //$('.nav-tabs a[href="#profileDetailSubTab"]').tab('show');

        //and render the details of the profile
        profileDetailView.render();

});

//creating a new profile
Backbone.listenTo(listProfiles,'profileList:new',function(){
    $('.nav-tabs a[href="#profileDetailSubTab"]').tab('show');

    //the setNewProfile will check is there are unsaved changes, and only return true if there are none,
    //or if the user allows it
    if ( profileDetailView.setNewProfile()) {      //so the view knows that this is a new profile - will allow the)

        var m = new ProfileModel();     //will set defaults on creation...
       // m.cid='new';
        console.log(m.cid);
        //m.set('cid','new');
        colProfile.add(m);
        profileSummaryView.clearView();

        profileDetailView.setModel(m);
        profileContentView.setModel(m);

        profileSummaryView.model = m;

        console.log(m.toJSON());
        //profileDetailView.model =  m;

        profileDetailView.render();
    }
});

//delete a profile - for this we use the ID rather than the cid
Backbone.listenTo(listProfiles,'profileList:delete',function(vo){

    var selectedModel = colProfile.findModelByID(vo.id);
    if (selectedModel) {
        Mediator.showWorking();
        selectedModel.destroy({
            success : function() {
                Mediator.clearProfileWorkareas();   //clear all the work areas associated with profile editing
                Mediator.loadProfiles();
            },
            error : function(xhr,status,err) {
                console.log(xhr,status,err);
                //$('#save_profile_changes').text('Update Profile').attr('disabled',false)
                alert('sorry, there was an error deleting the profile ');
            }
        });

    } else {
        alert("can't find the model with the ID: " + vo.id);
    }

    profileDetailView.render();
});

//handler for when a user clicks on an existing extension definition in a profile
Backbone.listenTo(profileDetailView,'profileDetail:editExtension',function(vo){
    //console.log(vo);
    //var selectedModel = colProfile.findModelByCID(vo.cid);       //the vs selected in the list view

    profileExtensionView.model = colProfile.findModelByCID(vo.cid);
    profileExtensionView.setCode(vo.code);
    profileExtensionView.render();

});

//handler for when a new extension is to be added to a profile
Backbone.listenTo(profileDetailView,'profileDetail:addExtension',function(vo){
    console.log(vo);
    //find a model that matches the id. If none, then find one with a cid: of 'new' (ie a new, unsaved profile)
    var selectedModel = colProfile.findModelByCID(vo.cid);     //the profile selected in the list view

    Mediator.assert(selectedModel,"No model with an id of '" + vo.id + "' was found");

    console.log(selectedModel);

    profileExtensionView.model = selectedModel;
    profileExtensionView.setCode("");   //an empty code will mean a new extension...
    profileExtensionView.render();
});

//the user wishes to view a valueset from within a profile...
Backbone.listenTo(profileDetailView,'profileDetail:showVS',function(vo){

    valueSetSummaryView.render(vo.uri);
});


//a new profile was added
Backbone.listenTo(profileDetailView,'profile:added',function(vo){
    console.log(vo);
    profileSummaryView.clearView();
    //re-read all the models. May be able to add it to the collection directly...
    colProfile.fetch({
        success : function() {
            $('#loading').hide();
            listProfiles.render();      //render the profile list
            profileQueryView.setProfiles(colProfile);
            profileQueryView.render();  //render the query view (has a list of profiles)
            //todo - might want to find the new profile and render a summary...

        },
        error : function() {
            alert('There was an error loading the Profiles');
        }
    });
});

//an extension in a profile has been updated.
Backbone.listenTo(profileExtensionView,'profileExtension:updated',function(){
    //re-render the profile - the model should already be set...
    profileDetailView.render();
    profileContentView.render();
    profileSummaryView.createSummary(function(){

        profileSummaryView.render();
    });

});

//the user has selected a resource. Need to get the defined paths for that resource...
Backbone.listenTo(profileExtensionView,'profileExtension:selectedResource',function(vo){
    var resourceName = vo.resourceName;
    var sum = new ProfileSummaryModel();
    sum.getPathsForResource(resourceName,function(arPaths){
        vo.callback(arPaths);
    });


});


Backbone.listenTo(profileDetailView,'profile:updated',function(){
    //re-render the profile - the model should already be set...
    profileDetailView.render();
    profileContentView.render();
    profileSummaryView.createSummary(function(){

        profileSummaryView.render();
    });
});

//a user is modifying a resource path...  (not just slicing)
Backbone.on('profileSummary:slice',function(vo){

    var selectedProfileModel = colProfile.findModelByID(vo.profileid);       //the profile model

    //console.log(selectedProfileModel)
        if (selectedProfileModel) {
            //console.log(vo)
            if (vo.type==='ext') {
                //this is an extensio
                //todo - changes are not being saved here...

                profileExtensionView.model = selectedProfileModel;
                profileExtensionView.setCode(vo.path);  //the code of the extension is in the path in the summary view...
                profileExtensionView.render();
            } else {
                //this is a structure
                profileStructureView.resourceName = vo.resourceName;
                profileStructureView.profileModel = selectedProfileModel;
                profileStructureView.model = vo.psiModel;     //this is json structure.element
                console.log(vo.psiModel);
                profileStructureView.setType(vo.type);  //the code of the extension is in the path in the summary view...
                profileStructureView.render();
            }
        } else {
            alert('No model with the ID ' + vo.profileid + " was found...");
        }
});


//triggered when the 'all extensions' page is shown - re-render the page...
Backbone.on("extensions:render",function(){

    extensionView.render();

});

//when a structure.element is altered in the UI but not yet saved......  NOT extensions...
Backbone.listenTo(profileStructureView,'element:updated',function(vo){
    //first get the profile we're editing...
    var profileModel = profileStructureView.profileModel;       //the profile model was set as an attribute when the profileStructureView was displayed...

    //now the JSON rendition of the profile...
    var profileJson = profileModel.get('content');

    //find the structure element in the resource - or create it
    profileJson.structure = profileJson.structure || [];

    //remove any existing structure with this path...
    var lst = [];   //this will be the new list of elements...
    _.each(profileJson.structure,function(struc){
        if (struc.element[0].path !== vo.element.path) {
            lst.push(struc);
        }
    });

    //add a new resource (structure)
    //var structure = {name:vo.resourceName,element:[]};
    var structure = {element:[]};
    structure.name = 'struc'+profileJson.structure.length;      //the name is so the structure can be referred to from elsewhere
    structure.type = vo.resourceName;       //assume that the structure being extended is the resource.
    structure.element.push(vo.element);

    lst.push(structure);
    profileJson.structure = lst;
    profileSummaryView.updatePath(vo.resourceName,vo.element.path);


});


//extension definitions that were located while parsing profiles
Backbone.listenTo(colProfile,'profile:extensiondefs',function(vo) {
    //that.trigger("profile:extensiondefs",{ext:entry.content.extensionDefn})
    var arED = vo.ext;
    var profile = vo.profile;
    extensionCollection.addExtensions(arED,profile);    //add all the extensiondefs to the collection

});


var viewQuery = new QueryView({el:$('#workAreaQuery')});
viewQuery.render();

Mediator.loadProfiles = function(){
    //console.log(colProfile.length)
    colProfile.fetch({
        success : function() {
            $('#loading').hide();
            _.each(colProfile.models,function(m){
                //console.log(m.get('vid'));
            });
            //console.log(colProfile.length)
            Mediator.hideWorking();
            //console.log(colProfile.models);
            listProfiles.render();      //render the list of valuesets...
            profileQueryView.setProfiles(colProfile);
        },
        error : function(collection,response) {
            console.log(response);
            alert('There was an error loading the Profiles');
            Mediator.hideWorking();
        }
    });
};


Mediator.loadValueSets = function() {
    colVS.fetch({
        success : function() {

            $('#loading').hide();
            listVS.render();      //render the list of valuesets...
        },
        error : function() {
            alert('There was an error loading the ValueSets - Did the server repsond in time?');
        }
    });
};

//load the profiles & valuesets...
Mediator.loadProfiles();
Mediator.loadValueSets();

//====================== mediator utilities ========================


//clear all the workareas associated with editing profiles...
Mediator.clearProfileWorkareas = function() {
    profileSummaryView.clearView();

    profileTestFormView.clearView();

    profileContentView.clearView();

    profileExtensionView.clearView();

    //$('#workAreaContentProfile').html();

};


//clear workareas associated with valuesets...
Mediator.clearValueSetWorkareas = function(){
    vsDetailView.clearView();
};



//show/hide the 'working/loading' display...
Mediator.showWorking = function() {
    $('#loading').show();
};
Mediator.hideWorking = function() {
    $('#loading').hide();
};

//check if the current profile has been altered. If is has, then prompt the user to save or abandon changes...

Mediator.canSelectNewProfile = function() {
    console.log(profileSummaryView.isDirty());
    if (profileSummaryView.isDirty()) {
        var msg = 'The current profile has been changed. Do you wish to abandon these changes and proceed, or cancel';
        return window.prompt(msg);

    } else {
        return true;
    }
};