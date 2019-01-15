window.Model = (function() 
{
    //TODO using 'self' makes it more obvious when accessing 'global' variables (even though these aren't actually global)
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
        //Search for the List and, if it's found, execute the callback method
        GetArrayIndexOfObjectWithKVP(getLists(), 'id', listId, callback);
    }

    function findListItem(listId, listItemId, callback)
    {
        //TODO This change doesn't really make this any simpler

        //Set up the callback method to execute when a List matching the given ID is found
        var listFoundCallback = function(listIndex)
        {
            //Set up the callback method to execute when a List Item matching the given ID is found
            var listItemFoundCallback = function(listItemIndex)
            {
                //Execute the provided callback method, passing both the List index and List Item index as arguments
                callback(listIndex, listItemIndex);
            };
            
            //Search for the List Item and, if it's found, execute the callback method
            GetArrayIndexOfObjectWithKVP(getLists()[listIndex].listItems, 'id', listItemId, listItemFoundCallback);
        };
        
        //Search for the List and, if it's found, execute the callback method
        findList(listId, listFoundCallback);
    }

    function editName(dataObject, updatedName, callback)
    {
        //Update the name of the List or List Item data object
        dataObject.name = updatedName;

        //Execute the provided callback method once the name has been updated
        callback();
    }

    function swapChecklistObjects(array, index, indexToSwapWith, callback)
    {
        //Try to swap the object at one index with the object at another index in the array and, if successful, get the swapped object
        var swappedChecklistObject = SwapElementsInArray(array, index, indexToSwapWith);
            
        //If the swap succeeded, execute the callback method, passing the swapped checklist object ID as an argument
        if (swappedChecklistObject != null)
        {
            //TODO could possibly just return the swapped list instead of specifically it's ID
                //The "SwapElementsInArray" helper method could also go back to using a callback, if desired
            callback({swappedChecklistObjectId:swappedChecklistObject.id});
        }
        else
        {
            window.DebugController.Print("Unable to swap the checklist object with ID " + array[index].id);
        }
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

    function addNewList(callback)
    {
        var newList = {
			id : new Date().getTime(), 
            name : '',
            type: ListType.Travel, //TODO this is currently hard-coded
            listItems : []
        };
        
        getLists().push(newList);

        storeChecklistData();

        callback({list:newList});
    }

    //TODO it probably *is* possible to merge modifyList and modifyListItem but it might not be cleaner. In many(?) cases you could set the array based on the type of list object to modify (e.g. array = getLists() or getLists()[listIndex].listItems)
        //Maybe keep ModifyList and ModifyListItem separate, but use this only to set the array and other necessary vars (e.g. in ModifyList, array = getLists())
        //Then the bulk of the logic could be handled elsewhere? maybe... Although it kind of already is... 
    function modifyList(command, listId, callback, options)
    {       
        var commands = 
        {
            UpdateName : function(listIndex, commandSucceededCallback)
            {
                //Update the name of the List and then execute the provided callback method
                editName(getLists()[listIndex], options.updatedValue, commandSucceededCallback);
            },
            MoveUpwards : function(listIndex, commandSucceededCallback)
            {
                //Try to move the List upwards in the array and, if successful, execute the callback method, passing the swapped List ID as an argument
                swapChecklistObjects(getLists(), listIndex, listIndex-1, commandSucceededCallback);
            },
            MoveDownwards : function(listIndex, commandSucceededCallback)
            {
                //Try to move the List downwards in the array and, if successful, execute the callback method, passing the swapped List ID as an argument
                swapChecklistObjects(getLists(), listIndex, listIndex+1, commandSucceededCallback);
            },
            AddNewListItem : function(listIndex, commandSucceededCallback)
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
                commandSucceededCallback({listItem:newListItem});
            },
            ClearQuantityValues : function(listIndex, commandSucceededCallback)
            {
                //Initialize an array to keep track of any List Items that will have a quantity value be modified
                var modifiedListItems = [];

                var clearQuantityValue = function(listItem)
                {
                    //If the quantity value for the given quantity type is not already set to zero...
                    if (listItem.quantities[options.quantityType] != 0)
                    {
                        //Set the quantity value to zero
                        listItem.quantities[options.quantityType] = 0;

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
                    commandSucceededCallback({modifiedListItems:modifiedListItems});
                }
            },
            RemoveList : function(listIndex, commandSucceededCallback)
            {
                //Remove the List object from the lists array and then execute the provided callback method
                RemoveElementFromArray(getLists(), listIndex, commandSucceededCallback);
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

                //TODO it might be better to loop through the arguments array and then return all existing ones through the callback
            };

            //Execute the method matching the given command
            commands[command](listIndex, commandSucceededCallback);
        }

        //Search for the List and, if it's found, execute the method matching the given command
        findList(listId, runCommand);
    }

    function modifyListItem(command, listId, listItemId, callback, options)
    {       
        var commands = 
        {
            UpdateName : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Update the name of the List Item and then execute the provided callback method
                editName(getLists()[listIndex].listItems[listItemIndex], options.updatedValue, commandSucceededCallback);
            },
            MoveUpwards : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Try to move the List Item upwards in the array and, if successful, execute the callback method, passing the swapped List Item ID as an argument
                swapChecklistObjects(getLists()[listIndex].listItems, listItemIndex, listItemIndex-1, commandSucceededCallback);
            },
            MoveDownwards : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Try to move the List Item downwards in the array and, if successful, execute the callback method, passing the swapped List Item ID as an argument
                swapChecklistObjects(getLists()[listIndex].listItems, listItemIndex, listItemIndex+1, commandSucceededCallback);
            },
            //TODO might be able to merge Decrement and Increment, and pass in a modifier value parameter (e.g. mod=-1 or mod=1) which then gets added to the current/previous quantity value
            DecrementQuantityValue : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //If the quantity value for the given quantity type is greater than zero...
                if (getLists()[listIndex].listItems[listItemIndex].quantities[options.quantityType] > 0)
                {
                    //Decrement the quantity value by one
                    getLists()[listIndex].listItems[listItemIndex].quantities[options.quantityType]--;

                    //Execute the provided callback method once the command has been successfully executed, passing the quantity type as an argument
                    commandSucceededCallback();
                }
            },
            IncrementQuantityValue : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Increment the quantity value for the given quantity type by one
                getLists()[listIndex].listItems[listItemIndex].quantities[options.quantityType]++;
                
                //Execute the provided callback method once the command has been successfully executed, passing the quantity type as an argument
                commandSucceededCallback();
            },
            RemoveListItem : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Remove the List Item object from the listItems array and then execute the provided callback method
                RemoveElementFromArray(getLists()[listIndex].listItems, listItemIndex, commandSucceededCallback);
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

                //TODO It would be possible here to insert the updated checklistObject into the return arguments. 
                    //But it wouldn't work for ClearQuantityValues (in ModifyList)

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

    //TODO Can reorder and other commands be standardized to work for both List and List Item, and both Up and Down?

    //TODO RemoveObject and EditName could help consolidate code, here, in StorageManager, and Controllers

    //TODO Update this file to use methods similar to Render or Bind in the View
    //TODO could just have an Update method...
    //TODO Lists and List Items could have a type value associated with them, then no extra type info would need to be passed from the Controller to a method such as 'Update', for example
        //However, the additional data stored in Storage is a bit wasteful, and not really necessary, as it can be avoided with some extra code. 
        //If a change like this is going to be made, might be worth doing that at the same time when (and if) the List Item index is modified to include the List index.
        //Actually, having a type in the data object wouldn't really be necessary if the ID is modified as above. 
    return {
        RetrieveChecklistData : retrieveChecklistData,
        AddNewList : addNewList,
        ModifyList : modifyList,
        ModifyListItem : modifyListItem
    };
})();
