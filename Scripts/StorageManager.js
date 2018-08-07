window.StorageManager = (function () 
{
    //function Storage() {}

    /** Utility Methods **/

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

    /** List-Specific Methods **/

    function storeListData(data)
    {
        saveNameValuePairToLocalStorage('TraveList-Data', JSON.stringify(data));
    }

    function getParsedDataFromStorage()
    {
        //Try to load the raw data from storage. If there is none, create new template data.
        var rawStorageData = loadValueFromLocalStorage('TraveList-Data') || '{"lists":[]}';

        return JSON.parse(rawStorageData);
    }

    //TODO Long term it should be simplified so that the lists aren't 'recreated'
    function loadListData()
    {
        var lists = getParsedDataFromStorage().lists;

        //Traverse all the Lists saved in local storage
        for (var i = 0; i < lists.length; i++) 
        {
            //Create a new List based on the parsed data
            var list = new List({
                id: lists[i].id, 
                name: lists[i].name, 
                type: lists[i].type
            });
            
            //TODO Do Something with the Model here first. These interactions should go through the Model instead of directly to the View or Controller
            //TODO Storage shouldn't be interacting with the View
            //TODO Shouldn't be passing element data to the View. Thw View should take care of that. I think...
            window.View.Render('addList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});

            console.log("Regenerating List. Index: " + i + " Name: " + list.GetName() + " Type: " + list.GetType() + " ----------");
            
            //Check if there is a 'listItems' object in the parsed storage data for the current list
            if (lists[i].listItems !== null)
            {
                //Traverse all the List Items belonging to the current list, in local storage
                for (var j = 0; j < lists[i].listItems.length; j++) 
                {
                    if (list.GetType() == ListType.Travel)
                    {
                        console.log("List: " + i + ". Row: " + j + ". Item: " + lists[i].listItems[j].name);
                        
                        //Add a row to current List, passing along the data parsed from storage
                        list.AddListItem({
                            id: lists[i].listItems[j].id, 
                            name: lists[i].listItems[j].name, 
                            quantities: lists[i].listItems[j].quantities
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

    //TODO this isn't used yet
    function storeNewList(newList)
    {
        var parsedStorageData = getParsedDataFromStorage();

        parsedStorageData.lists.push(newList);

        storeListData(parsedStorageData);
    }

    //TODO this isn't used yet
    function removeList(id)
    {
        //Get the parsed data from storage
        var parsedStorageData = getParsedDataFromStorage();

        //Traverse the stored list data for one that matches the given ID
        for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
        {
            if (parsedStorageData.lists[i].id == id)
            {
                //Remove the matching list object from the lists array
                parsedStorageData.lists.splice(i, 1);
                break;
            }
        } 

        //Store the updated storage data object
        storeListData(parsedStorageData);
    }

    //TODO STILL IN PROGRESS and also this isn't used yet
    // function storeNewListItem(listId, newListItem)
    // {
    //     var rawStorageData = loadValueFromLocalStorage('TraveList-Data');

    //     var parsedStorageData = JSON.parse(rawStorageData);

    //     var lists = parsedStorageData.lists;

    //     for (var i = 0; i < lists.length; i++)  
    //     {
    //         if (lists[i].id == listId)
    //         {
    //             lists[i].listItems.push(newListItem);
    //         }
    //     }
        
    //     saveNameValuePairToLocalStorage('TraveList-Data', JSON.stringify(parsedStorageData));
    // }

    return {
        StoreListData : storeListData,
        LoadListData : loadListData,
        StoreNewList : storeNewList,
        RemoveList : removeList,
        // StoreNewListItem : storeNewListItem
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

//TODO Storage Cases Needed:
//Create New List
//Edit List Name
//Delete List
//Create New List Item
//Edit List Item Name
//Edit List Item Quantity / Modifier Value
//Delete List Item