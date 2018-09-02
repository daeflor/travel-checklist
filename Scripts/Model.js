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

    //TODO it probably *is* possible to merge modifyList and modifyListItem but it might not be cleaner. In many(?) cases you could set the array based on the type of list object to modify (e.g. array = getLists() or getLists()[listIndex].listItems)
        //Maybe keep MoifyList and ModifyListItem separate, but use this only to set the array and other necessary vars (e.g. in ModifyList, array = getLists())
        //Then the bulk of the logic could be handled elsewhere? maybe... Although it kind of already is... 
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
                //Try to move the List upwards in the array and, if successful, execute the callback method, passing the swapped List as an argument
                SwapElementsInArray(getLists(), listIndex, listIndex-1, commandSucceededCallback);
            },
            MoveDownwards : function(listIndex, commandSucceededCallback)
            {
                //Try to move the List downwards in the array and, if successful, execute the callback method, passing the swapped List as an argument
                SwapElementsInArray(getLists(), listIndex, listIndex+1, commandSucceededCallback);
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
                //Try to move the List Item upwards in the array and, if successful, execute the callback method, passing the swapped List Item as an argument
                SwapElementsInArray(getLists()[listIndex].listItems, listItemIndex, listItemIndex-1, commandSucceededCallback);
            },
            MoveDownwards : function(listIndex, listItemIndex, commandSucceededCallback)
            {
                //Try to move the List Item downwards in the array and, if successful, execute the callback method, passing the swapped List Item as an argument
                SwapElementsInArray(getLists()[listIndex].listItems, listItemIndex, listItemIndex+1, commandSucceededCallback);
            },
            //TODO might be able to merge Decrement and Increment, and pass in a modifier value parameter (e.g. mod=-1 or mod=1) which then gets added to the current/previous quantity value
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

    function clearListQuantityColumn(listId, quantityType, callback)
    {
        modifyList('ClearQuantityValues', listId, callback, {quantityType:quantityType});
    }

    function createListItem(listId, callback)
    {        
        modifyList('AddListItem', listId, callback);
    }

    function editListItemName(listId, listItemId, callback, updatedName)
    {
        modifyListItem('EditName', listId, listItemId, callback, {updatedName:updatedName});
    }

    //TODO RemoveObject and EditName could help consolidate code, here, in StorageManager, and Controllers

    //TODO Update this file to use methods similar to Render or Bind in the View
    //TODO could just have an Update method...
    //TODO Lists and List Items could have a type value associated with them, then no extra type info would need to be passed from the Controller to a method such as 'Update', for example
        //However, the additional data stored in Storage is a bit wasteful, and not really necessary, as it can be avoided with some extra code. 
        //If a change like this is going to be made, might be worth doing that at the same time when (and if) the List Item index is modified to include the List index.
        //Actually, having a type in the data object wouldn't really be necessary if the ID is modified as above. 
    return {
        RetrieveChecklistData : retrieveChecklistData,
        AddList : addList,
        ModifyList : modifyList,
        ModifyListItem : modifyListItem,
        CreateListItem : createListItem,
        EditListItemName : editListItemName,
        ClearListQuantityColumn : clearListQuantityColumn
    };
})();
