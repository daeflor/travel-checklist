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
        //Get a reference to a new or exisiting document for the currently authenticated user in the 'UserListData' collection
        const userListData = firestoreDatabase.collection("UserListData").doc(firebase.auth().currentUser.uid);

        //Add the provided list data to the document, merging it with any existing data in the document, if applicable
        userListData.set(data, { merge: true })
        .catch(function(error) {
            window.DebugController.LogError("Error writing document to storage:" + error);
        });
    }

    function retrieveChecklistData(callback)
    {
        //If the Firestore database has not already been initialized, initialize it. 
        if (firestoreDatabase == null)
        {            
            firestoreDatabase = firebase.firestore();
        }
        
        //Get a reference to a new or exisiting document for the currently authenticated user in the "UserListData" collection
        let userListData = firestoreDatabase.collection("UserListData").doc(firebase.auth().currentUser.uid);

        //Attempt to extract app data from the document
        userListData.get().then(function(doc) 
        {
            //If the user's document already contains app data in Cloud Firestore, attmept to load it. Otherwise create new template data.
            const rawStorageData = doc.exists ? doc.data() : {}; 

            //If the data object does not contain a 'lists' key, add one to it
            if (rawStorageData.hasOwnProperty('lists') == false)
            {
                rawStorageData.lists = [];
            }
            
            //Execute the provided callback function, passing as a parameter the data object parsed from the JSON string in Firestore
            callback(rawStorageData);
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