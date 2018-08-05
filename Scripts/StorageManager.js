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
        saveNameValuePairToLocalStorage('TraveList-Data', JSON.stringify(data));
    }

    //TODO Could be renamed for clarity (to note that this is more specifically about getting and parsing all the list data and recreating it, not just generally loading something from storage)
        //TODO Though I guess long term it should be simplified so that the lists aren't 'recreated'
    function loadDataFromStorage()
    {
        var storageDataString = loadValueFromLocalStorage('TraveList-Data');
    
        //If the data string loaded from storage is not null or empty, parse the string to JSON and load the list data from that
        if (storageDataString != null && storageDataString.length>0)
        {
            //console.log("Loaded from Local Storage: " + storageDataString);

            //Load all list data based on the parsed storage data
            loadAllListData(JSON.parse(storageDataString));  
        }    
        else
        {
            console.log("Could not find any data for this app saved in local storage.");
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