window.Model = (function() 
{
    var checklistData;

    //TODO Add JSDoc comments to each of the methods here/below, and add any other comments as needed

    /** Private Checklist Data Utility Methods **/

    function getLists() 
    {
        //If checklist data already has been loaded from storage
        if (checklistData != null)
        {
            //Return the Lists array
            return checklistData.lists;
        }

        window.DebugController.LogError("ERROR: Checklist data is null");
    }
    
    function storeChecklistData()
    {
        window.StorageManager.StoreChecklistData(checklistData);
    }

    function findList(listId, callback)
    {
        //Traverse the Lists array for one that matches the given List ID
        for (var i = getLists().length-1; i >= 0; i--)
        {
            //If the List IDs match, call the passed callback method and end execution of this method
            if (getLists()[i].id == listId)
            {
                callback(i);
                return;
            }
        } 

        window.DebugController.LogError("ERROR: Unable to find requested List in checklist data object");
    }

    function findListItem(listId, listItemId, callback)
    {
        //Set up the callback method to execute when a List matching the given ID is found
        var findListItem = function(listIndex)
        {
            //Traverse the List Items array of the returned List Object, searching for one that matches the given List Item ID
            for (var i = getLists()[listIndex].listItems.length-1; i >= 0; i--)
            {
                //If the List Item IDs match, call the passed callback method and end execution of this method
                if (getLists()[listIndex].listItems[i].id == listItemId)
                {
                    callback(listIndex, i);
                    return;
                }
            } 

            window.DebugController.LogError("ERROR: Unable to find requested List Item in checklist data object");
        };
        
        //Search for the List and, if it's found, execute the callback method
        findList(listId, findListItem);
    }

    /** Publicly Exposed Methods To Access & Modify List Data **/

    //TODO it might make more sense to do this in some sort of init method
    function retrieveChecklistData(callback)
    {
        checklistData = window.StorageManager.RetrieveChecklistData();

        window.DebugController.Print("Checklist data retrieved from storage");

        //TODO this callback should be passed through to the storage method call (above)
        callback(checklistData.lists);        
    }

    function addList(callback)
    {
        var newList = {
			id : new Date().getTime(), 
            name : '',
            type: ListType.Travel,
            listItems : []
        };
        
        getLists().push(newList);

        storeChecklistData();

        callback(newList);
    }

    function modifyList(command, listId, callback, parameters)
    {       
        var commands = 
        {
            EditName : function(listIndex, commandSucceededCallback)
            {
                //Update the name of the returned List object
                getLists()[listIndex].name = parameters.updatedName;

                //Execute the provided callback method once the command has been successfully executed
                commandSucceededCallback();
            },
            MoveUpwards : function(listIndex, commandSucceededCallback)
            {
                //Set up the callback method to execute when the Lists have been swapped
                var listsSwappedCallback = function(swappedList)
                {
                    //Execute the provided callback method, passing the ID of the swapped List as an argument
                    commandSucceededCallback(swappedList.id);
                }
                
                //Swap the positions of the List matching the given ID, and the previous List in the array
                swapElementsInArray(getLists(), listIndex, listIndex-1, listsSwappedCallback);
            },
            MoveDownwards : function(listIndex, commandSucceededCallback)
            {
                //If the List is not the last in the Lists array...
                if (listIndex < getLists().length-1)
                {
                    //Swap the positions of the List matching the given ID, and the next List in the array
                    var nextList = getLists()[listIndex+1];
                    getLists()[listIndex+1] = getLists()[listIndex];
                    getLists()[listIndex] = nextList;

                    //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List as an argument
                    commandSucceededCallback(nextList.id);
                }
            },
            AddListItem : function(listIndex, commandSucceededCallback)
            {
                var newListItem = {
                    id : new Date().getTime(), 
                    name : '',
                    quantities : {
                        needed: 0,
                        luggage: 0,
                        wearing: 0,
                        backpack: 0
                    }
                };
                
                //Add the new List Item to the returned List object
                getLists()[listIndex].listItems.push(newListItem);

                //Execute the provided callback method once the command has been successfully executed, passing the new List Item object as an argument
                commandSucceededCallback(newListItem);
            },
            ClearQuantityValues : function(listIndex, commandSucceededCallback)
            {
                //Initialize an array to keep track of any List Items that will have a quantity value be modified
                var modifiedListItems = [];

                var clearQuantityValue = function(listItem)
                {
                    //If the quantity value for the given quantity type is not already set to zero...
                    if (listItem.quantities[parameters.quantityType] != 0)
                    {
                        //Set the quantity value to zero
                        listItem.quantities[parameters.quantityType] = 0;

                        //Add the List Item to the array of modified List Items
                        modifiedListItems.push(listItem);
                    }
                };

                //For each List Item in the List, clear the quantity value (i.e. set it to zero)   
                getLists()[listIndex].listItems.forEach(clearQuantityValue);
           
                //If the quantity value of any List Item was actually changed...
                if (modifiedListItems.length > 0)
                {
                    //Execute the provided callback method once the command has been successfully executed, passing the array of modified List Items as an argument
                    commandSucceededCallback(modifiedListItems);
                }
            },
            Remove : function(listIndex, commandSucceededCallback)
            {
                //Remove the returned List object from the lists array
                getLists().splice(listIndex, 1);

                //Execute the provided callback method once the command has been successfully executed
                commandSucceededCallback();
            }
        };

        //TODO Is it possible to somehow merge this with the same method in modifyListItem?... Maybe at least the commandSucceededCallback can be abstracted? But it wouldn't help much
        //Set up the callback method to execute when a List matching the given ID is found
        var runCommand = function(listIndex)
        {
            //Set up the callback method to execute once the given command has been executed successfully 
            var commandSucceededCallback = function(args)
            {       
                //Store the updated checklist data
                storeChecklistData();

                //Execute the provided callback method, passing the returned arguments if not null
                args != null ? callback(args) : callback();
            };

            //Execute the method matching the given command
            commands[command](listIndex, commandSucceededCallback);
        }

        //Search for the List and, if it's found, execute the method matching the given command
        findList(listId, runCommand);
    }

    function modifyListItem(command, listId, listItemId, callback, parameters)
    {       
        var commands = 
        {
            EditName : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Update the name of the returned List Item object
                getLists()[listIndex].listItems[listItemIndex].name = parameters.updatedName;

                //Execute the provided callback method once the command has been successfully executed
                commandSucceededCallback();
            },
            MoveUpwards : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //If the List Item is not the first in the List...
                if (listItemIndex > 0)
                {
                    //Swap the positions of the List Item matching the given ID, and the previous List Item in the array
                    var prevListItem = getLists()[listIndex].listItems[listItemIndex-1];
                    getLists()[listIndex].listItems[listItemIndex-1] = getLists()[listIndex].listItems[listItemIndex];
                    getLists()[listIndex].listItems[listItemIndex] = prevListItem;

                    //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List Item as an argument
                    commandSucceededCallback(prevListItem.id);
                }
            },
            MoveDownwards : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //If the List Item is not the last in the List...
                if (listItemIndex < getLists()[listIndex].listItems.length-1)
                {
                    //Swap the positions of the List Item matching the given ID, and the next List Item in the array
                    var nextListItem = getLists()[listIndex].listItems[listItemIndex+1];
                    getLists()[listIndex].listItems[listItemIndex+1] = getLists()[listIndex].listItems[listItemIndex];
                    getLists()[listIndex].listItems[listItemIndex] = nextListItem;

                    //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List Item as an argument
                    commandSucceededCallback(nextListItem.id);
                }
            },
            DecrementQuantityValue : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //If the quantity value for the given quantity type is greater than zero...
                if (getLists()[listIndex].listItems[listItemIndex].quantities[parameters.quantityType] > 0)
                {
                    //Decrement the quantity value by one
                    getLists()[listIndex].listItems[listItemIndex].quantities[parameters.quantityType]--;

                    //Execute the provided callback method once the command has been successfully executed, passing the updated List Item object as an argument
                    commandSucceededCallback(getLists()[listIndex].listItems[listItemIndex]);
                }
            },
            IncrementQuantityValue : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Increment the quantity value for the given quantity type by one
                getLists()[listIndex].listItems[listItemIndex].quantities[parameters.quantityType]++;
                
                //Execute the provided callback method once the command has been successfully executed, passing the updated List Item object as an argument
                commandSucceededCallback(getLists()[listIndex].listItems[listItemIndex]);
            },
            Remove : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Remove the returned List Item object from the List Items array
                getLists()[listIndex].listItems.splice(listItemIndex, 1);

                //Execute the provided callback method once the command has been successfully executed
                commandSucceededCallback();
            }
        };

        //Set up the callback method to execute when a List Item matching the given ID is found
        var runCommand = function(listIndex, listItemIndex)
        {
            //Set up the callback method to execute once the given command has been executed successfully 
            var commandSucceededCallback = function(args)
            {       
                //Store the updated checklist data object
                storeChecklistData();

                //Execute the provided callback method, passing the returned arguments if not null
                args != null ? callback(args) : callback();
            };

            //Execute the method matching the given command
            commands[command](listIndex, listItemIndex, commandSucceededCallback);

            // //Execute the method matching the given command
            // commands[command](listIndex, listItemIndex, modelUpdated);
        }

        //Search for the List Item and, if it's found, execute the method matching the given command
        findListItem(listId, listItemId, runCommand);
    }

    // function modelUpdated(callback, args)
    // {
    //     //Store the updated checklist data object
    //     storeChecklistData();

    //     // //If a callback was provided, execute the provided callback method, passing the returned arguments if not null
    //     // callback != null ?
    //     //             (args != null ? callback(args) : callback())
    //     //           : (window.DebugController.LogError("ERROR: Callback parameter is null"));

    //     //If a callback method was provided...
    //     if (callback != null)
    //     {
    //         //Execute the provided callback method, passing the returned arguments if not null
    //         args != null ? callback(args) : callback();
    //     }
    //     else
    //     {
    //         window.DebugController.LogError("ERROR: Callback parameter is null");
    //     }
    // }

//////

    function swapElementsInArray(array, index, indexToSwap, callback)
    {
        // //If the List Item is not the first in the List...
        // if (listItemIndex > 0)
        // {
        //     //Swap the positions of the List Item matching the given ID, and the previous List Item in the array
        //     var prevListItem = getLists()[listIndex].listItems[listItemIndex-1];
        //     getLists()[listIndex].listItems[listItemIndex-1] = getLists()[listIndex].listItems[listItemIndex];
        //     getLists()[listIndex].listItems[listItemIndex] = prevListItem;

        //     //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List Item as an argument
        //     commandSucceededCallback(prevListItem.id);
        // }

        // //If the List Item is not the last in the List...
        // if (listItemIndex < getLists()[listIndex].listItems.length-1)
        // {
        //     //Swap the positions of the List Item matching the given ID, and the next List Item in the array
        //     var nextListItem = getLists()[listIndex].listItems[listItemIndex+1];
        //     getLists()[listIndex].listItems[listItemIndex+1] = getLists()[listIndex].listItems[listItemIndex];
        //     getLists()[listIndex].listItems[listItemIndex] = nextListItem;

        //     //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List Item as an argument
        //     commandSucceededCallback(nextListItem.id);
        // }

        //Declare the element in the array that should be swapped with the one selected
        var elementToSwap = array[indexToSwap];

        //If the element is not null...
        if (elementToSwap != null)
        {
            //Swap the positions of the elements in the array
            array[indexToSwap] = array[index];
            array[index] = elementToSwap;

            //Execute the provided callback method once the swap has been executed, passing the swapped element as an argument
            callback(elementToSwap);
        }
        else
        {
            window.DebugController.Print("Unable to swap elements in array as the element to swap with is not defined");
        }
    }

    function moveListUpwards(listId, callback)
    {
        modifyList('MoveUpwards', listId, callback);
    }

    //TODO might be able to standardize reorder / move upwards/downwards by passing it an array (getLists() or getLists(x).listItems)
        //It doesn't necessarily need to know which array it is, it can just generically reorder objects


    //TODO Can these be standardized to work for both List and List Item, and both Up and Down?
    function moveListDownwards(listId, callback)
    {
        modifyList('MoveDownwards', listId, callback);
    }

    function clearListQuantityColumn(listId, quantityType, callback)
    {
        modifyList('ClearQuantityValues', listId, callback, {quantityType:quantityType});
    }

    function removeList(listId, callback)
    {
        modifyList('Remove', listId, callback);
    }

    function createListItem(listId, callback)
    {
        // var newListItem = {
		// 	id : new Date().getTime(), 
        //     name : '',
        //     quantities : {
        //         needed: 0,
        //         luggage: 0,
        //         wearing: 0,
        //         backpack: 0
        //     }
        // };
        
        modifyList('AddListItem', listId, callback);
    }

    function editListItemName(listId, listItemId, callback, updatedName)
    {
        modifyListItem('EditName', listId, listItemId, callback, {updatedName:updatedName});
    }

    function moveListItemUpwards(listId, listItemId, callback)
    {
        modifyListItem('MoveUpwards', listId, listItemId, callback);
    }

    //TODO Can these be standardized to work for both List and List Item, and both Up and Down?
    function moveListItemDownwards(listId, listItemId, callback)
    {
        modifyListItem('MoveDownwards', listId, listItemId, callback);
    }

    function editListItemQuantity(listId, listItemId, quantityType, assignmentType, callback)
    {
        //TODO Should probably move the logic here to the Controller?...
        //TODO having all of this here is temporary

        if (assignmentType == 'decrement')
        {
            modifyListItem('DecrementQuantityValue', listId, listItemId, callback, {quantityType:quantityType});
        }
        else if(assignmentType == 'increment')
        {
            modifyListItem('IncrementQuantityValue', listId, listItemId, callback, {quantityType:quantityType});
        }
    }

    function removeListItem(listId, listItemId, callback)
    {
        modifyListItem('Remove', listId, listItemId, callback);
    }

    //TODO RemoveObject and EditName could help consolidate code, here, in StorageManager, and Controllers

    //TODO Update this file to use methods similar to Render or Bind in the View
    return {
        RetrieveChecklistData : retrieveChecklistData,
        // GetLists : getLists,
        AddList : addList,
        ModifyList : modifyList,
        ModifyListItem : modifyListItem,
        //LoadData : loadData,
        // CreateList : createList,
        // EditListName : editListName,
        MoveListUpwards : moveListUpwards,
        MoveListDownwards : moveListDownwards,
        RemoveList : removeList,
        CreateListItem : createListItem,
        EditListItemName : editListItemName,
        MoveListItemUpwards : moveListItemUpwards,
        MoveListItemDownwards : moveListItemDownwards,
        EditListItemQuantity : editListItemQuantity,
        ClearListQuantityColumn : clearListQuantityColumn,
        RemoveListItem : removeListItem
    };
})();
