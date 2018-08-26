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

    /** List-Specific / Private / Helper Methods **/

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

    function findListItemInStorage(listId, listItemId, callback)
    {
        //Set up he callback method to execute when a List matching the given ID is found
        var findListItem = function(data, listIndex)
        {
            //Traverse the List Items array of the returned List Object, searching for one that matches the given List Item ID
            for (var i = data.lists[listIndex].listItems.length-1; i >= 0; i--)
            {
                //If the List Item IDs match, call the passed callback method and end execution of this method
                if (data.lists[listIndex].listItems[i].id == listItemId)
                {
                    callback(data, listIndex, i);
                    return;
                }
            } 

            window.DebugController.LogError('ERROR: Unable to find requested List Item in Storage');
        };
        
        //Search for the List in storage and, if it's found, execute the callback method
        findListInStorage(listId, findListItem);
    }

    function modifyListItemQuantityValue(listItem, quantityType, assignmentType, callback)
    {
        //Increment, decrement, or clear the specified List Item's quantity value as applicable
        //TODO could use more comments in this method
        if (assignmentType == 'clear')
        {
            if (listItem.quantities[quantityType] != 0)
            {
                listItem.quantities[quantityType] = 0;
                
                callback(listItem);
            }                            
        }
        else if (assignmentType == 'decrement')
        {
            //TODO would it make sense to store this value in the Model so as not to have to access storage unnecessarily? Probably not worth making a change like that just for this case... 
            if (listItem.quantities[quantityType] > 0)
            {
                listItem.quantities[quantityType]--;

                callback(listItem);
            }
        }
        else if (assignmentType == 'increment')
        {
            listItem.quantities[quantityType]++;

            callback(listItem);
        }
        else 
        {
            window.DebugController.LogError("ERROR: Tried to perform an invalid operation on a quantity value in storage. List Item ID: " + listItemId);
        }
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

    /** Access & Modify Lists **/

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

    /** Modify List **/

    //TODO Since the methods below all follow the same format (mostly), maybe they could be moved into a ModifyList method with 'command' parameter
        //Most likely all methods here should take a callback, and that should help standardize them even further

    function editListNameInStorage(listId, updatedName)
    {
        //Set up the callback method to execute when a List matching the given ID is found
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

    function removeListFromStorage(listId)
    {
        //Set up the callback method to execute when a List matching the given ID is found
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
        //Set up the callback method to execute when a List matching the given ID is found
        var addListItem = function(data, index)
        {
            //Add the new List Item to the returned List object
            data.lists[index].listItems.push(newListItem);

            //Store the updated data object
            storeListData(data);

            //Execute the provided callback method
            callback(newListItem);
        };
        
        //Search for the List in storage and, if it's found, execute the callback method
        findListInStorage(listId, addListItem);
    }

    function clearListQuantityColumnInStorage(listId, quantityType, callback)
    {
        //Set up the callback method to execute when a List matching the given ID is found
        var clearQuantityColumn = function(data, listIndex)
        {
            //Initialize an array to keep track of any List Items that will have a quantity value be modified
            var modifiedListItems = [];

            //TODO it should be possible to do this without passing the List Item as a param in this callback
            //Set up the callback method to execute when a List Item's quantity value has been modified
            var storeModifiedQuantityValue = function(listItem)
            {
                modifiedListItems.push(listItem);
            };

            //Traverse the List Items array of the returned List Object
            for (var i = data.lists[listIndex].listItems.length-1; i >= 0; i--)
            {   
                //Clear the List Item's quantity value (i.e. set it to zero)   
                modifyListItemQuantityValue(data.lists[listIndex].listItems[i], quantityType, 'clear', storeModifiedQuantityValue);
            }
                        
            //If any quantity value was actually changed...
            if (modifiedListItems.length > 0)
            {
                //Store the updated data object
                storeListData(data);

                //Execute the provided callback method
                callback(modifiedListItems);
            }
        };

        //Search for the List in storage and, if it's found, execute the callback method
        findListInStorage(listId, clearQuantityColumn);
    }

    /** Modify List Items **/

    function editListItemNameInStorage(listId, listItemId, updatedName)
    {
        //Set up the callback method to execute when a List Item matching the given ID is found
        var updateListItemName = function(data, listIndex, listItemIndex)
        {
            //Update the name of the returned List Item object
            data.lists[listIndex].listItems[listItemIndex].name = updatedName;

            //Store the updated data object
            storeListData(data);
        };
        
        //Search for the List Item in storage and, if it's found, execute the callback method
        findListItemInStorage(listId, listItemId, updateListItemName);
    }

    function moveListItemUpwardsInStorage(listId, listItemId, callback)
    {
        //TOOD would prefer to make this a more standardized SwapLists method
            //Instead, could just be part of a ModifyListItem method with commands. Maybe...

        //Set up the callback method to execute when a List Item matching the given ID is found
        var moveUpwards = function(data, listIndex, listItemIndex)
        {
            //If the List Item is not the first in the List...
            if (listItemIndex > 0)
            {
                //Swap the positions of the List Item matching the given ID, and the previous List Item in the array
                var prevListItem = data.lists[listIndex].listItems[listItemIndex-1];
                data.lists[listIndex].listItems[listItemIndex-1] = data.lists[listIndex].listItems[listItemIndex];
                data.lists[listIndex].listItems[listItemIndex] = prevListItem;

                //Store the updated data object
                storeListData(data);

                //Execute the provided callback method
                callback(prevListItem.id);
            }
        };
        
        //Search for the List Item in storage and, if it's found, execute the callback method
        findListItemInStorage(listId, listItemId, moveUpwards);
    }

    function moveListItemDownwardsInStorage(listId, listItemId, callback)
    {
        //Set up the callback method to execute when a List Item matching the given ID is found
        var moveDownwards = function(data, listIndex, listItemIndex)
        {
            //If the List Item is not the last in the List...
            if (listItemIndex < data.lists[listIndex].listItems.length-1)
            {
                //Swap the positions of the List Item matching the given ID, and the next List Item in the array
                var nextListItem = data.lists[listIndex].listItems[listItemIndex+1];
                data.lists[listIndex].listItems[listItemIndex+1] = data.lists[listIndex].listItems[listItemIndex];
                data.lists[listIndex].listItems[listItemIndex] = nextListItem;

                //Store the updated data object
                storeListData(data);

                //Execute the provided callback method
                callback(nextListItem.id);
            }
        };
        
        //Search for the List Item in storage and, if it's found, execute the callback method
        findListItemInStorage(listId, listItemId, moveDownwards);
    }

    function editListItemQuantityInStorage(listId, listItemId, quantityType, assignmentType, callback)
    {
        //Set up the callback method to execute when a List Item matching the given ID is found
        var editQuantity = function(data, listIndex, listItemIndex)
        {
            //Set up the callback method to execute when the List Item quantity has been modified
            var storeModifiedQuantity = function(listItem)
            {
                //Store the updated data object
                storeListData(data);

                //Execute the provided callback method
                callback(listItem);
            };

            //Update the List Item's quantity value for the given quantity type
            modifyListItemQuantityValue(data.lists[listIndex].listItems[listItemIndex], quantityType, assignmentType, storeModifiedQuantity);
        };
        
        //Search for the List Item in storage and, if it's found, execute the callback method
        findListItemInStorage(listId, listItemId, editQuantity);
    }

    function removeListItemFromStorage(listId, listItemId)
    {
        //Set up the callback method to execute when a List Item matching the given ID is found
        var removeListItem = function(data, listIndex, listItemIndex)
        {
            //Remove the returned List Item object from the List Items array
            data.lists[listIndex].listItems.splice(listItemIndex, 1);

            //Store the updated data object
            storeListData(data);
        };
        
        //Search for the List Item in storage and, if it's found, execute the callback method
        findListItemInStorage(listId, listItemId, removeListItem);
    }

    //TODO Could update this file to use methods similar to Render or Bind in the View
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