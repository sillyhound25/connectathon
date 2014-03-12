/**
 * for functions related to generating test data
 */

function setupTestData(Z) {
    Z.localFunctions.testData = {};       //patent object

    //get resources
    Z.localFunctions.testData.getExtensions = function(callback){
        var vo = {};
        //first, generate a object that has all extensions for all resources in the profile
        $.each(Z.currentProfile.content.extensionDefn,function(inx,ext){
            console.log(ext);
            var resource = ext.context[0];      //the resource that this extends
            if (! vo[resource]) {
                vo[resource] = {extensions:[]}
            }


            var oneInput = {raw : ext}; //the raw extension
            if (! ext.definition.binding) {
                //this is a binding to a valueset. We assume that we've loaded the valueset already - obviously not scaleable...
                //but a simple matter to retrieve the the valueset direclty from the server if we need to
                oneInput.type='dropdown';   //generate a dropdown list

            } else {
                //this is a 'simple' input
                oneInput.type='input';      //generate an input elements
                var vsID = ext.definition.binding.referenceResource.reference;      //the ID of the valueset
                //now find the valueset
                console.log(Z.valueSets);
                $.each(Z.valueSets,function(inx1,vs) {
                    if (vs.id === vsID) {
                        oneInput.vs = vs;   //again, actually an entry property...
                    }
                });
                //oneInput.
            }
            vo[resource].extensions.push(oneInput);


        })
        console.log(vo);
        callback(vo);



    }
}