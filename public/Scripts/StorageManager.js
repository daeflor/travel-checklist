'use strict';
window.StorageManager = (function () 
{
    //TODO Add JSDoc comments to each of the methods below, and add any other comments as needed

    let firestoreDatabase;

    /** General Storage Utility Methods **/

    //TODO does it make sense to use alerts here but nowhere else?

    //TODO rename to keyvaluepair, and move to utlities
    // function loadValueFromLocalStorage(name)
    // {
    //     if (typeof(Storage) !== "undefined") 
    //     {
    //         return localStorage.getItem(name);
    //     } 
    //     else 
    //     {
    //         alert('No Local Storage Available');
    //     }
    // }

    //TODO abstract this and add it to Utilities, maybe?
    function saveNameValuePairToCloudFirestore(value)
    {
        //Get a reference to a new or exisiting document for the currently authenticated user in the "users" collection
        const userDocument = firestoreDatabase.collection("users").doc(firebase.auth().currentUser.uid);

        //Update the user's document with their latest app data, merging it with the previous data if the document already existed.
        userDocument.set({
            TraveListData: value //TODO this is hardcoded currently
        }, { merge: true })
        // .then(function() {
        //     console.log("Document successfully written!");
        // })
        .catch(function(error) {
            window.DebugController.LogError("Error writing document to storage:" + error);
        });
    }

    /** Publicly Exposed Methods To Access & Modify List Data In Storage **/

    // function getStorageKey()
    // {
    //     //TODO Should the StorageManager be accessing the location hash directly? Seems like it would be good to have a single point of entry for that.
    //     //if (GetLocationHashRoute() == 'travel') 
    //     //{
    //         return 'TraveList-Data';
    //     //}
    //     // else if (checklistType == 'shopping')
    //     // {
    //     //     return 'daeflor-checklist-shopping';
    //     // }
    // }

    //TODO could probably skip this extra function/step, unless the helper gets abstracted, which it probably should
    function storeChecklistData(data)
    {
        //Stringify the data object to JSON and then store it in Cloud Firestore
        saveNameValuePairToCloudFirestore(JSON.stringify(data));
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