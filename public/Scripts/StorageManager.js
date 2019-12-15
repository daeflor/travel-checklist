'use strict';
window.StorageManager = (function () 
{
    //TODO Add JSDoc comments to each of the methods below, and add any other comments as needed

    let firestoreDatabase;

    /** Publicly Exposed Methods To Access & Modify List Data In Storage **/

    function getStorageKey()
    {
        //TODO Should the StorageManager be accessing the location hash directly? Seems like it would be good to have a single point of entry for that.
        //if (GetLocationHashRoute() == 'travel') 
        //{
            return 'TraveListData';
        //}
        // else if (checklistType == 'shopping')
        // {
        //     return 'daeflor-checklist-shopping';
        // }
    }

    function storeChecklistData(data)
    {
        //Stringify the data object to JSON and then store it in Cloud Firestore
        saveKeyValuePairToCloudFirestoreUserData(firestoreDatabase.collection("users"), getStorageKey(), JSON.stringify(data)); 
        //TODO is it really necessary to stringify the data if it's just going to be added to an object right away again?
    }

    function retrieveChecklistData(callback)
    {
        //If the Firestore database has not already been initialized, initialize it. 
        if (firestoreDatabase == null)
        {            
            firestoreDatabase = firebase.firestore();
        }
        
        //Get a reference to a new or exisiting document for the currently authenticated user in the "users" collection
        let userDocument = firestoreDatabase.collection("users").doc(firebase.auth().currentUser.uid);

        //Attempt to extract app data from the document
        userDocument.get().then(function(doc) 
        {
            //If the user's document already contains app data in Cloud Firestore, attmept to load it. Otherwise create new template data.
            const rawStorageData = doc.exists ? doc.data().TraveListData : '{"lists":[]}'; 
            //TODO this is hard-coded; should use getStorageKey() instead
            
            //Execute the provided callback function, passing as a parameter the data object parsed from the JSON string in Firestore
            callback(JSON.parse(rawStorageData));
        })
        .catch(function(error) {
            window.DebugController.LogError("Error getting document from storage:" + error);
        });
    }
  
    return {
        RetrieveChecklistData: retrieveChecklistData,
        StoreChecklistData: storeChecklistData
    };
})();  