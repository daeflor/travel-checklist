window.StorageManager = (function () {

    //function Storage() {}

    /** Utility Methods **/

    function saveNameValuePairToLocalStorage(name, value)
    {
        if (typeof(Storage) !== "undefined") 
        {
            localStorage.setItem(name, value);
            console.log('Pair added to localstorage, with name "' + name + '" and value "' + value + '".');
        } 
        else 
        {
            alert('No Local Storage Available');
        }
    }

    function loadValueFromLocalStorage(name)
    {
        if (typeof(Storage) !== "undefined") 
        {
            console.log('Request to load value for "' + name +'" from localstorage.');        
            return localStorage.getItem(name);
        } 
        else 
        {
            alert('No Local Storage Available');
        }
    }

    /** List-Specific Methods **/

    function saveDataToStorage(data)
    {
        //TODO
        saveNameValuePairToLocalStorage('TraveList-Data', JSON.stringify(data));
        // saveNameValuePairToLocalStorage('gridData', JSON.stringify(getDataForStorage()));
    }

    //TODO Could be renamed for clarity (to note that this is more specifically about getting and parsing all the list data and recreating it, not just generally loading something from storage)
        //TODO Though I guess long term it should be simplified so that the lists aren't 'recreated'
    function loadDataFromStorage()
    {
        var storageData = loadValueFromLocalStorage('gridData');
    
        if (storageData != null)
        {
            console.log("Loaded from Local Storage: " + storageData);
            parseListDataFromStorage(JSON.parse(storageData));        
        }    
        else
        {
            console.log("Could not find any list data saved in local storage.");
        }
    }

    function parseListDataFromStorage(storageData)
    {
        var storedFormatVersion = storageData[0];
        var storedFormat;

        console.log("The parsed Format Version from storage data is: " + storedFormatVersion + ". The current Format Version is: " + CurrentStorageDataFormat.Version);        

        if (storedFormatVersion == CurrentStorageDataFormat.Version)
        {
            storedFormat = CurrentStorageDataFormat;
            console.log("The data in storage is in the current format.");            
        }
        else
        {
            storedFormat = PreviousStorageDataFormat;
            console.log("The data in storage is in an old format. Parsing it using legacy code.")            
        }

        console.log("There are " + ((storageData.length) - storedFormat.FirstListIndex) + " lists saved in local storage.");
        
        //TODO this can probably be greatly improved by using objects better
        //Traverse the data for all of the lists saved in local storage
        for (var i = storedFormat.FirstListIndex; i < storageData.length; i++) 
        {
            var list = new List({name:storageData[i][storedFormat.ListNameIndex], type:storageData[i][storedFormat.ListTypeIndex], id:window.GridManager.GetNextListId()});
            
            //TODO Do Something with the Model here first
            window.View.Render('addList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});

            console.log("Regenerating List. Index: " + (i-storedFormat.FirstListIndex) + " Name: " + list.GetName() + " Type: " + list.GetType() + " ----------");
            
            //Traverse all the rows belonging to the current list, in local storage
            for (var j = storedFormat.FirstRowIndex; j < storageData[i].length; j++) 
            {
                if (list.GetType() == ListType.Travel)
                {
                    console.log("List: " + (i-storedFormat.FirstListIndex) + ". Row: " + (j-storedFormat.FirstRowIndex) + ". Item: " + storageData[i][j][0]);
                    list.AddRow(storageData[i][j][0], storageData[i][j][1], storageData[i][j][2], storageData[i][j][3], storageData[i][j][4]);
                }
                else if (list.GetType() == null)
                {
                    console.log("ERROR: Tried to load a List with a ListType of null from storage");
                }
            }

            window.GridManager.AddListFromStorage(list);
            // lists.push(list);
        }
    }

    // function getDataForStorage()
    // {
    //     var data = [];

    //     console.log("Current Format Version is: " + CurrentStorageDataFormat.Version);
    //     data.push(CurrentStorageDataFormat.Version);

    //     for (var i = 0; i < lists.length; i++)
    //     {
    //         data.push(lists[i].GetDataForStorage());
    //     }

    //     return data;
    // }

    return {
        SaveDataToStorage : saveDataToStorage,
        LoadDataFromStorage : loadDataFromStorage
    };
})();  

//TODO move these inside of the StorageManager
//TODO It might be time to deprecate this
var PreviousStorageDataFormat = {
    FirstListIndex: 1,
    ListNameIndex: 0,
    ListTypeIndex: 0,
    FirstRowIndex: 1,
};

var CurrentStorageDataFormat = {
    Version: 'fv1',
    FirstListIndex: 1,
    ListNameIndex: 0,
    ListTypeIndex: 1, //TODO this and above could be their own sub-object, contained within index 1
    FirstRowIndex: 2, //TODO this could then always be 1, even if new properties about the list need to be stored
};

//

//Data Model:

function ListStorageData(data)
{
    this.id = data.id;
    this.name = data.name;
    this.type = data.type;
    this.listItems = data.listItems;
}

// var ListStorageData = {
//     id: null,
//     name: null,
//     type: null,
//     listItems : null,
// };

function ListItemStorageData(data)
{
    this.id = data.id;
    this.name = data.name;
    this.quantityNeeded = data.quantityNeeded;
    this.quantityLuggage = data.quantityLuggage;
    this.quantityWearing = data.quantityWearing;
    this.quantityBackpack = data.quantityBackpack;
}

// var ListItemStorageData = {
//     id: null,
//     name: null,
//     quantityNeeded: null,
//     quantityLuggage: null,
//     quantityWearing: null,
//     quantityBackpack: null,
// };