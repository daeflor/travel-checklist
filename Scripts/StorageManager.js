window.StorageManager = (function () 
{
    //function Storage() {}

    /** Utility Methods **/

    function loadValueFromLocalStorage(name)
    {
        if (typeof(Storage) !== "undefined") 
        {
            //console.log('Request to load value for "' + name +'" from localstorage.');        
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

    function getListStorageData()
    {
        return getParsedDataFromStorage().lists;
    }

    function addListToStorage(newList, callback)
    {
        var parsedStorageData = getParsedDataFromStorage();

        parsedStorageData.lists.push(newList);

        storeListData(parsedStorageData);

        callback(newList);
    }

    function editListNameInStorage(listId, updatedName)
    {
        //Get the parsed data from storage
        var parsedStorageData = getParsedDataFromStorage();

        //Traverse the stored list data for one that matches the given ID
        for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
        {
            if (parsedStorageData.lists[i].id == listId)
            {
                //Update the name of the matching list object
                parsedStorageData.lists[i].name = updatedName;
                break;
            }
        } 

        //Store the updated storage data object
        storeListData(parsedStorageData);
    }

    function removeListFromStorage(listId)
    {
        //Get the parsed data from storage
        var parsedStorageData = getParsedDataFromStorage();

        //Traverse the stored list data for one that matches the given ID
        for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
        {
            if (parsedStorageData.lists[i].id == listId)
            {
                console.log("Removing List from Storage. List ID: " + listId);
                //Remove the matching List object from the lists array
                parsedStorageData.lists.splice(i, 1);
                break;
            }
        } 

        //Store the updated storage data object
        storeListData(parsedStorageData);
    }

    function addListItemToStorage(listId, newListItem, callback)
    {
        //Get the parsed data from storage
        var parsedStorageData = getParsedDataFromStorage();

        //Traverse the stored List data for one that matches the given List ID
        for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
        {
            if (parsedStorageData.lists[i].id == listId)
            {
                //Add the new List Item to the matching List object
                parsedStorageData.lists[i].listItems.push(newListItem);
                break;
            }
        } 

        //Store the updated storage data object
        storeListData(parsedStorageData);

        callback(newListItem);
    }

     function editListItemNameInStorage(listId, listItemId, updatedName)
     {
         //Get the parsed data from storage
         var parsedStorageData = getParsedDataFromStorage();
 
         //Traverse the stored List data for one that matches the given List ID
         for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
         {
             if (parsedStorageData.lists[i].id == listId)
             {
                 //If the List IDs match, traverse the list's items array, searching for one that matches the given ListItem ID
                 for (var j = parsedStorageData.lists[i].listItems.length-1; j >= 0; j--)
                 {
                     if (parsedStorageData.lists[i].listItems[j].id == listItemId)
                     {
                         //Update the name of the matching ListItem object
                         parsedStorageData.lists[i].listItems[j].name = updatedName;
                         break;
                     }
                 } 
             }
         } 
 
         //Store the updated storage data object
         storeListData(parsedStorageData);
     }

     function editListItemQuantityInStorage(listId, listItemId, quantityType, assignmentType, callback)
     {
        //Get the parsed data from storage
        var parsedStorageData = getParsedDataFromStorage();

        //Traverse the stored List data for one that matches the given List ID
        for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
        {
            if (parsedStorageData.lists[i].id == listId)
            {
                //If the List IDs match, traverse the list's items array, searching for one that matches the given ListItem ID
                for (var j = parsedStorageData.lists[i].listItems.length-1; j >= 0; j--)
                {
                    if (parsedStorageData.lists[i].listItems[j].id == listItemId)
                    {
                        //TODO Error handling here wouldn't hurt

                        var dataModified = false;
                        var quantities = parsedStorageData.lists[i].listItems[j].quantities;

                        //Set, increment, or decrement the specified List Item's quantity value as applicable
                        // if (assignmentType == 'set')
                        // {
                        //     if (quantities[quantityType] != assignment.value)
                        //     {
                        //         quantities[quantityType] = assignment.value;
                        //         dataModified = true;
                        //     }                            
                        // }
                        if (assignmentType == 'clear')
                        {
                            if (quantities[quantityType] != 0)
                            {
                                quantities[quantityType] = 0;
                                dataModified = true;
                            }                            
                        }
                        else if (assignmentType == 'decrement')
                        {
                            if (quantities[quantityType] > 0)
                            {
                                quantities[quantityType]--;
                                dataModified = true;
                            }
                        }
                        else if (assignmentType == 'increment')
                        {
                            quantities[quantityType]++;
                            dataModified = true;
                        }
                        else 
                        {
                            console.log("ERROR: Tried to make in invalid modification to a quantity value in storage. List Item ID: " + listItemId);
                        }
            
                        //If the quantity value was actually changed, store the updated data and perform the callback
                        if (dataModified == true)
                        {
                            storeListData(parsedStorageData);
                            callback(quantities); //TODO is it correct to only call the callback under certain circumstances?... I think it's fine if the alternative is an ERROR message
                        }
                                                
                        break;
                    }
                }
            }
        } 
     }

    function removeListItemFromStorage(listId, listItemId)
    {
        //Get the parsed data from storage
        var parsedStorageData = getParsedDataFromStorage();

        //Traverse the stored List data for one that matches the given List ID
        for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
        {
            if (parsedStorageData.lists[i].id == listId)
            {
                //If the List IDs match, traverse the list's items array, searching for one that matches the given ListItem ID
                for (var j = parsedStorageData.lists[i].listItems.length-1; j >= 0; j--)
                {
                    if (parsedStorageData.lists[i].listItems[j].id == listItemId)
                    {
                        //Remove the matching List Item object from the List's items array
                        parsedStorageData.lists[i].listItems.splice(j, 1);
                        break;
                    }
                }
            }
        } 

        //Store the updated storage data object
        storeListData(parsedStorageData);
    }

    // function findListInStorage(listId)
    // {
    //     //Get the parsed data from storage
    //     var parsedStorageData = getParsedDataFromStorage();

    //     //Traverse the stored List data for one that matches the given List ID
    //     for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
    //     {
    //         if (parsedStorageData.lists[i].id == listId)
    //         {
    //             //If the List IDs match, return the list object 
    //             return parsedStorageData.lists[i]
    //         }
    //     } 

    //     console.log('ERROR: Unable to find requested List in Storage');
    // }

    //TODO This ended up complicating things even more. A simple solution could be to have this return an object with both a ListItem and parsedStorage sub-object, but this seems like an incorrect way of handling this
    // function findListItemInStorage(listId, listItemId, callback)
    // {
    //     var list = findListInStorage(listId);

    //     if (list != null)
    //     {
    //         //Traverse the list's items array, searching for one that matches the given ListItem ID
    //         for (var i = list.listItems.length-1; i >= 0; i--)
    //         {
    //             if (list.listItems[i].id == listItemId)
    //             {
    //                 //If the ListItem IDs match, return the list item object 
    //                 //return list.listItems[i];
    //                 callback(list.listItems[i]);
    //             }
    //         } 
    //     }

    //     console.log('ERROR: Unable to find requested ListItem in Storage');
    // }

    //TODO Could re-use the traversing code with callbacks, rather than always repeating code in this file
        //This is the attempt to see if this idea works
        //TODO see if this method can be utilized by the methods above, in some form. Could also create a similar one for finding just a List
    // function findListItemInStorage(listId, listItemId)
    // {
    //     //Get the parsed data from storage
    //     var parsedStorageData = getParsedDataFromStorage();

    //     //Traverse the stored List data for one that matches the given List ID
    //     for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
    //     {
    //         if (parsedStorageData.lists[i].id == listId)
    //         {
    //             //If the List IDs match, traverse the list's items array, searching for one that matches the given ListItem ID
    //             for (var j = parsedStorageData.lists[i].listItems.length-1; j >= 0; j--)
    //             {
    //                 if (parsedStorageData.lists[i].listItems[j].id == listItemId)
    //                 {
    //                     return parsedStorageData.lists[i].listItems[j];
    //                     // callback();
    //                     // break;
    //                 }
    //             } 
    //         }
    //     } 

    //     console.log('ERROR: Unable to find requested ListItem in Storage');
    // }


    // function getListItemDataFromStorage(listId, listItemId)
    // {
    //     return findListItemInStorage(listId, listItemId);
    // }

    return {
        StoreListData : storeListData,
        GetListStorageData : getListStorageData,
        AddListToStorage : addListToStorage,
        EditListNameInStorage : editListNameInStorage,
        RemoveListFromStorage : removeListFromStorage,
        AddListItemToStorage : addListItemToStorage,
        EditListItemNameInStorage : editListItemNameInStorage,
        EditListItemQuantityInStorage : editListItemQuantityInStorage,
        RemoveListItemFromStorage : removeListItemFromStorage
    };
})();  

//Data Model:
//TODO should be possible to get rid of these

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