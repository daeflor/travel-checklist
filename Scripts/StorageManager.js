window.StorageManager = (function () 
{
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
            window.DebugController.Print('Pair added to localstorage, with name "' + name + '" and value "' + value + '".');
        } 
        else 
        {
            alert('No Local Storage Available');
        }
    }

    /** List-Specific / Private Methods **/

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

    function findListInStorage(listId, callback)
    {
        //Get the parsed data from storage
        var parsedStorageData = getParsedDataFromStorage();

        //Traverse the stored List data for one that matches the given List ID
        for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
        {
            //If the List IDs match, call the passed callback method and end execution of this method
            if (parsedStorageData.lists[i].id == listId)
            {
                callback(parsedStorageData, i);
                return;
            }
        } 

        window.DebugController.LogError('ERROR: Unable to find requested List in Storage');
    }

    //PUBLIC? :

    // function accessStorage(command, parameters, callback)
    // {
    //     var commands = 
    //     {
    //         EditListNameInStorage: function() 
    //         {
    //             //Set up he callback method to call when a List matching the given ID is found
    //             var updateListName = function(data, index)
    //             {
    //                 //Update the name of the returned list object
    //                 data.lists[index].name = parameters.updatedName;

    //                 //Store the updated data object
    //                 storeListData(data);
    //             };
                
    //             findListInStorage(parameters.listId, updateListName);
    //         }
    //     };

    //     commands[command]();
    // }

    //

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
        //Set up he callback method to call when a List matching the given ID is found
        var updateListName = function(data, index)
        {
            //Update the name of the returned List object
            data.lists[index].name = updatedName;

            //Store the updated data object
            storeListData(data);
        };
        
        //Search for the List in storage and, if it's found, execute the callback method
        findListInStorage(listId, updateListName);
    }

    function removeListFromStorage(listId, updatedName)
    {
        //Set up he callback method to call when a List matching the given ID is found
        var removeList = function(data, index)
        {
            //Remove the returned List object from the lists array
            data.lists.splice(index, 1);

            //Store the updated data object
            storeListData(data);
        };
        
        //Search for the List in storage and, if it's found, execute the callback method
        findListInStorage(listId, removeList);
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

        //TODO does it make sense for this to be outside of the for loops?
        //Store the updated storage data object
        storeListData(parsedStorageData);
    }

    function moveListItemUpwardsInStorage(listId, listItemId, callback)
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
                        //If the List Item is not the first in the List...
                        //TODO the button should be greyed out if it can't be used, which means that the controller would already know if this isn't possible...?...
                        if (j > 0)
                        {
                            //Swap the positions of the List Item and the previous List Item
                            var prevListItem = parsedStorageData.lists[i].listItems[j-1];
                            parsedStorageData.lists[i].listItems[j-1] = parsedStorageData.lists[i].listItems[j];
                            parsedStorageData.lists[i].listItems[j] = prevListItem;

                            //Store the updated storage data object and call the provided callback method
                            storeListData(parsedStorageData);
                            callback(prevListItem.id);
                        }

                        break;
                    }
                } 
            }
        } 
    }

    function moveListItemDownwardsInStorage(listId, listItemId, callback)
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
                        window.DebugController.Print("Received request to swap List Item positions in Storage");

                        //If the List Item is not the last in the List...
                        if (j < parsedStorageData.lists[i].listItems.length-1)
                        {
                            //Swap the positions of the List Item and the next List Item
                            var nextListItem = parsedStorageData.lists[i].listItems[j+1];
                            parsedStorageData.lists[i].listItems[j+1] = parsedStorageData.lists[i].listItems[j];
                            parsedStorageData.lists[i].listItems[j] = nextListItem;

                            window.DebugController.Print("Swapped List Item positions in Storage");

                            //Store the updated storage data object and call the provided callback method
                            storeListData(parsedStorageData);
                            callback(nextListItem.id);
                        }

                        break;
                    }
                } 
            }
        } 
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

                        //Increment or decrement the specified List Item's quantity value as applicable

                        // if (assignmentType == 'set')
                        // {
                        //     if (quantities[quantityType] != assignment.value)
                        //     {
                        //         quantities[quantityType] = assignment.value;
                        //         dataModified = true;
                        //     }                            
                        // }
                        // if (assignmentType == 'clear')
                        // {
                        //     if (quantities[quantityType] != 0)
                        //     {
                        //         quantities[quantityType] = 0;
                        //         dataModified = true;
                        //     }                            
                        // }
                        if (assignmentType == 'decrement')
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
                            window.DebugController.LogError("ERROR: Tried to make in invalid modification to a quantity value in storage. List Item ID: " + listItemId);
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

    function clearListQuantityColumnInStorage(listId, quantityType, callback)
    {
        //Get the parsed data from storage
        var parsedStorageData = getParsedDataFromStorage();

        //Traverse the stored List data for one that matches the given List ID
        for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
        {
            if (parsedStorageData.lists[i].id == listId)
            {
                //var dataModified = false;
                var modifiedListItems = [];

                //If the List IDs match, traverse the list's items array
                for (var j = parsedStorageData.lists[i].listItems.length-1; j >= 0; j--)
                {      
                    //If the List Item's quantity value for the given type is not 0, set it to 0              
                    if (parsedStorageData.lists[i].listItems[j].quantities[quantityType] != 0)
                    {
                        parsedStorageData.lists[i].listItems[j].quantities[quantityType] = 0;
                        modifiedListItems.push(parsedStorageData.lists[i].listItems[j]);
                    }  
                }

                //If any quantity value was actually changed, store the updated data and perform the callback
                if (modifiedListItems.length > 0)
                {
                    storeListData(parsedStorageData);
                    callback(modifiedListItems); //TODO is it correct to only call the callback under certain circumstances?... In this case the alternative isn't an error.. But if the view doesn't need to get updated, it seems right to not call back
                }

                break;
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

    //TODO Update this file to use methods similar to Render or Bind in the View
    return {
        //AccessStorage : accessStorage,
        StoreListData : storeListData,
        GetListStorageData : getListStorageData,
        AddListToStorage : addListToStorage,
        EditListNameInStorage : editListNameInStorage,
        RemoveListFromStorage : removeListFromStorage,
        AddListItemToStorage : addListItemToStorage,
        EditListItemNameInStorage : editListItemNameInStorage,
        MoveListItemUpwardsInStorage : moveListItemUpwardsInStorage,
        MoveListItemDownwardsInStorage : moveListItemDownwardsInStorage,
        EditListItemQuantityInStorage : editListItemQuantityInStorage,
        ClearListQuantityColumnInStorage : clearListQuantityColumnInStorage,
        RemoveListItemFromStorage : removeListItemFromStorage
    };
})();  