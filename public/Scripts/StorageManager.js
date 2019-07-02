'use strict';
window.StorageManager = (function () 
{
    //TODO Add JSDoc comments to each of the methods below, and add any other comments as needed

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