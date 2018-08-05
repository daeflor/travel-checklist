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

    function storeListData(data)
    {
        //TODO
        saveNameValuePairToLocalStorage('TraveList-Data', JSON.stringify(data));
        // saveNameValuePairToLocalStorage('gridData', JSON.stringify(getDataForStorage()));
    }

    //TODO Could be renamed for clarity (to note that this is more specifically about getting and parsing all the list data and recreating it, not just generally loading something from storage)
        //TODO Though I guess long term it should be simplified so that the lists aren't 'recreated'
    function loadDataFromStorage()
    {
        var storageData = loadValueFromLocalStorage('TraveList-Data');
    
        if (storageData != null)
        {
            console.log("Loaded from Local Storage: " + storageData);

            //Load all list data based on the parsed storage data
            loadAllListData(JSON.parse(storageData));  
            // parseListDataFromStorage(JSON.parse(storageData));        
        }    
        else
        {
            console.log("Could not find any list data saved in local storage.");
        }
    }

    function loadAllListData(parsedData)
    {
        //Check if there is a 'lists' object in the parsed storage data
        if (parsedData.lists != null)
        {
            //Traverse all the Lists saved in local storage
            for (var i = 0; i < parsedData.lists.length; i++) 
            {
                //Create a new List based on the parsed data
                var list = new List({
                    id: parsedData.lists[i].id, 
                    name: parsedData.lists[i].name, 
                    type: parsedData.lists[i].type
                });
                
                //TODO Do Something with the Model here first. These interactions should go through the Model instead of directly to the View or Controller

                //TODO Shouldn't be passing element data to the View. Thw View should take care of that. I think...
                window.View.Render('addList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});

                console.log("Regenerating List. Index: " + i + " Name: " + list.GetName() + " Type: " + list.GetType() + " ----------");
                
                //Check if there is a 'listItems' object in the parsed storage data for the current list
                if (parsedData.lists != null)
                {
                    //Traverse all the List Items belonging to the current list, in local storage
                    for (var j = 0; j < parsedData.lists[i].listItems.length; j++) 
                    {
                        if (list.GetType() == ListType.Travel)
                        {
                            console.log("List: " + i + ". Row: " + j + ". Item: " + parsedData.lists[i].listItems[j].name);
                            
                            //Add a row to current List, passing along the data parsed from storage
                            list.AddListItem({
                                id: parsedData.lists[i].listItems[j].id, 
                                name: parsedData.lists[i].listItems[j].name, 
                                quantities: parsedData.lists[i].listItems[j].quantities
                            });
                        }
                        else if (list.GetType() == null)
                        {
                            console.log("ERROR: Tried to load a List with a ListType of null from storage");
                        }
                    }
                }
                else
                {
                    console.log("ERROR: Tried to load list item data from storage but no listItems object could be found for the current list");
                }

                window.GridManager.AddListFromStorage(list);
            }
        }
        else
        {
            console.log("ERROR: Tried to load list data from storage but no lists object could be found");
        }
    }

    // function parseListDataFromStorage(storageData)
    // {
    //     var storedFormatVersion = storageData[0];
    //     var storedFormat;

    //     console.log("The parsed Format Version from storage data is: " + storedFormatVersion + ". The current Format Version is: " + CurrentStorageDataFormat.Version);        

    //     if (storedFormatVersion == CurrentStorageDataFormat.Version)
    //     {
    //         storedFormat = CurrentStorageDataFormat;
    //         console.log("The data in storage is in the current format.");            
    //     }
    //     else
    //     {
    //         storedFormat = PreviousStorageDataFormat;
    //         console.log("The data in storage is in an old format. Parsing it using legacy code.")            
    //     }

    //     console.log("There are " + ((storageData.length) - storedFormat.FirstListIndex) + " lists saved in local storage.");
        
    //     //TODO this can probably be greatly improved by using objects better
    //     //Traverse the data for all of the lists saved in local storage
    //     for (var i = storedFormat.FirstListIndex; i < storageData.length; i++) 
    //     {
    //         var list = new List({name:storageData[i][storedFormat.ListNameIndex], type:storageData[i][storedFormat.ListTypeIndex], id:window.GridManager.GetNextListId()});
            
    //         //TODO Do Something with the Model here first
    //         window.View.Render('addList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});

    //         console.log("Regenerating List. Index: " + (i-storedFormat.FirstListIndex) + " Name: " + list.GetName() + " Type: " + list.GetType() + " ----------");
            
    //         //Traverse all the rows belonging to the current list, in local storage
    //         for (var j = storedFormat.FirstRowIndex; j < storageData[i].length; j++) 
    //         {
    //             if (list.GetType() == ListType.Travel)
    //             {
    //                 console.log("List: " + (i-storedFormat.FirstListIndex) + ". Row: " + (j-storedFormat.FirstRowIndex) + ". Item: " + storageData[i][j][0]);
    //                 list.AddListItem(storageData[i][j][0], storageData[i][j][1], storageData[i][j][2], storageData[i][j][3], storageData[i][j][4]);
    //             }
    //             else if (list.GetType() == null)
    //             {
    //                 console.log("ERROR: Tried to load a List with a ListType of null from storage");
    //             }
    //         }

    //         window.GridManager.AddListFromStorage(list);
    //         // lists.push(list);
    //     }
    // }

    //TODO this isn't used yet
    function storeNewList(newList)
    {
        var rawStorageData = loadValueFromLocalStorage('TraveList-Data');

        var parsedStorageData = JSON.parse(rawStorageData);

        var lists = parsedStorageData.lists;

        lists.push(newList);
        
        saveNameValuePairToLocalStorage('TraveList-Data', JSON.stringify(parsedStorageData));
    }

    //TODO Usage of this is In Progress
    function storeNewListItem(listId, newListItem)
    {
        var rawStorageData = loadValueFromLocalStorage('TraveList-Data');

        var parsedStorageData = JSON.parse(rawStorageData);

        var lists = parsedStorageData.lists;

        for (var i = 0; i < lists.length; i++)  
        {
            if (lists[i].id == listId)
            {
                lists[i].listItems.push(newListItem);
            }
        }
        
        saveNameValuePairToLocalStorage('TraveList-Data', JSON.stringify(parsedStorageData));
    }

    return {
        StoreListData : storeListData,
        LoadDataFromStorage : loadDataFromStorage,
        StoreNewList : storeNewList,
        StoreNewListItem : storeNewListItem
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

function ListItemStorageData(data)
{
    this.id = data.id;
    this.name = data.name;
    this.quantities = {
        needed: data.quantityNeeded,
        luggage: data.quantityLuggage,
        wearing: data.quantityWearing,
        backpack: data.quantityBackpack
    };
}