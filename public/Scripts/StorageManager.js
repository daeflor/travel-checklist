'use strict';
window.StorageManager = (function () 
{
    //TODO Add JSDoc comments to each of the methods below, and add any other comments as needed

    let firestoreDatabase;

    /** General Storage Utility Methods **/

    //TODO does it make sense to use alerts here but nowhere else?

    function loadValueFromLocalStorage(name)
    {
        if (typeof(Storage) !== "undefined") 
        {
            return localStorage.getItem(name);
        } 
        else 
        {
            alert('No Local Storage Available');
        }
    }

    function saveNameValuePairToLocalStorage(name, value)
    {
        if (typeof(Storage) !== "undefined") 
        {
            localStorage.setItem(name, value);
            window.DebugController.Print('Pair added to localstorage, with name "' + name + '" and value "' + value + '".');
        
            //Get a reference to a new or exisiting document for the currently authenticated user in the "users" collection
            const userDocument = firestoreDatabase.collection("users").doc(firebase.auth().currentUser.uid);

            //Update the user's document with their latest app data, merging it with the previous data if the document already existed.
            userDocument.set({
                TraveListData: value
            }, { merge: true })
            .then(function() {
                console.log("Document successfully written!");
            })
            .catch(function(error) {
                console.error("Error writing document: ", error);
            });
        } 
        else 
        {
            alert('No Local Storage Available');
        }
    }

    /** Publicly Exposed Methods To Access & Modify List Data In Storage **/

    function getStorageKey()
    {
        //TODO Should the StorageManager be accessing the location hash directly? Seems like it would be good to have a single point of entry for that.
        //if (GetLocationHashRoute() == 'travel') 
        //{
            return 'TraveList-Data';
        //}
        // else if (checklistType == 'shopping')
        // {
        //     return 'daeflor-checklist-shopping';
        // }
    }

    function storeChecklistData(data)
    {
        //Stringify the data object to JSON and then store it alongside the key specified below
        saveNameValuePairToLocalStorage(getStorageKey(), JSON.stringify(data));
    }

    function retrieveChecklistData()
    {
        if (firestoreDatabase == null)
        {            
            firestoreDatabase = firebase.firestore();
        }
        
        //Try to load the raw data from storage. If there is none, create new template data.
        var rawStorageData = loadValueFromLocalStorage(getStorageKey()) || '{"lists":[]}';

        //Return the data object parsed from the JSON string in Storage
        return JSON.parse(rawStorageData);
    }
  
    return {
        RetrieveChecklistData: retrieveChecklistData,
        StoreChecklistData: storeChecklistData
    };
})();  