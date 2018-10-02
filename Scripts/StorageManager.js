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
        var checklistType = document.location.hash.split('/')[1];

        DebugController.Print("Checklist type determined based on hash: " + checklistType);

        //TODO forthis to work, need to force default page to go to <defaultURL>#/travel

        if (checklistType == 'travel')
        {
            return 'TraveList-Data';
        }
        // else if (checklistType == 'shopping')
        // {
        //     return 'daeflor-checklist-shopping';
        // }
    }

    function storeChecklistData(data)
    {
        //Stringify the data object to JSON and then store it alongside the key specified below
        saveNameValuePairToLocalStorage('TraveList-Data', JSON.stringify(data));
    }

    function retrieveChecklistData()
    {
        //Try to load the raw data from storage. If there is none, create new template data.
        var rawStorageData = loadValueFromLocalStorage('TraveList-Data') || '{"lists":[]}';

        //Return the data object parsed from the JSON string in Storage
        return JSON.parse(rawStorageData);
    }
  
    return {
        RetrieveChecklistData : retrieveChecklistData,
        StoreChecklistData : storeChecklistData
    };
})();  