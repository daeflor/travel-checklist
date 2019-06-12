'use strict';
window.Model = (function() 
{
    //TODO using 'self' makes it more obvious when accessing 'global' variables (even though these aren't actually global)
    var checklistData;

    //TODO Add JSDoc comments to each of the methods here/below, and add any other comments as needed

    /** Private Checklist Data Utility Methods **/

    function getLists() 
    {
        //If checklist data has already been loaded from storage, return the Lists array
        if (checklistData != null)
        {
            return checklistData.lists;
        }

        window.DebugController.LogError("ERROR: Tried to retrieve Lists array but Checklist data is null");
    }

    /**
     * Get the array of List Items for the List matching the provided ID
     * @param {string} listId The ID of the List
     * @returns the array of List Items
     */
    function getListItems(listId)
    {
        return getLists()[getListIndexFromId(listId)].listItems;
    }
    
    function storeChecklistData()
    {
        window.StorageManager.StoreChecklistData(checklistData);
    }

    /**
     * Get the index of the List in the Lists array that matches the provided ID
     * @param {string} listId The ID of the List to search for
     * @returns the index of the List in the Lists array that matches the provided ID
     */
    function getListIndexFromId(listId)
    {
        //Search for the List and return its index
        return GetArrayIndexOfObjectWithKVP(getLists(), 'id', listId);
    }

    /**
     * Get the index of the List Item in a List's List Items array, matching the provided List and List Item IDs
     * @param {string} listId The ID of the List Item's parent List
     * @param {string} listItemId The ID of the List Item to search for
     * @returns the index of the List Item
     */
    function getListItemIndexFromId(listId, listItemId) //TODO eventually this should only require the List Item ID, which should include the list ID as a prefix
    {
        //Get the index of the list in the Lists array
        let _listIndex = getListIndexFromId(listId);

        if (_listIndex != null) //TODO replace this with try catch 
        {
            //Search for the List Item and return its index
            return GetArrayIndexOfObjectWithKVP(getListItems(listId), 'id', listItemId); 
        }
    }

    function editName(checklistObject, updatedName, callback)
    {
        //Update the name of the List or List Item data object
        checklistObject.name = updatedName;

        //Execute the provided callback method once the name has been updated
        callback();
    }

    function swapChecklistObjects(array, index, indexToSwapWith, callback)
    {
        //Try to swap the object at one index with the object at another index in the array and, if successful, get the swapped object
        let swappedChecklistObject = SwapElementsInArray(array, index, indexToSwapWith);
            
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

    function clearQuantityValues(listObject, quantityType, callback)
    {
        //Initialize an array to keep track of any List Items that will have a quantity value be modified
        let modifiedListItems = [];

        let _clearQuantityValue = function(listItem)
        {
            //If the quantity value for the given quantity type is not already set to zero...
            if (listItem.quantities[quantityType] != 0)
            {
                //Set the quantity value to zero
                listItem.quantities[quantityType] = 0;

                //Add the List Item to the array of modified List Items
                modifiedListItems.push(listItem);
            }
        };

        //For each List Item in the List, clear the quantity value (i.e. set it to zero)   
        listObject.listItems.forEach(_clearQuantityValue);

        //If the quantity value of any List Item was actually changed...
        if (modifiedListItems.length > 0)
        {
            //Execute the provided callback method once the quantity values have been cleared, passing the array of modified List Items as an argument
            callback({modifiedListItems:modifiedListItems});
        }
    }

    function addNewListItem(listObject, callback)
    {
        let newListItem = {
            id : new Date().getTime(), 
            name : '',
            quantities : {
                needed: 0,
                luggage: 0,
                wearing: 0,
                backpack: 0
            }
        };
        
        //Add the new List Item to the given List object
        listObject.listItems.push(newListItem);

        //Execute the provided callback method once the new List Item has been added to the List, passing the List Item object as an argument
        callback({listItem:newListItem});
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
        let newList = {
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
        let commands = 
        {
            UpdateName : function(listIndex, commandSucceededCallback)
            {
                let updatedValue = options.updatedValue;

                if (updatedValue != null)
                {
                    //Update the name of the List and then execute the provided callback method
                    editName(getLists()[listIndex], updatedValue, commandSucceededCallback);
                }
                else
                {
                    DebugController.LogError("An 'updatedValue' option was expected but not provided. Model could not be updated.");
                }
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
                //Add a new List Item to the given List and then execute the provided callback method
                addNewListItem(getLists()[listIndex], commandSucceededCallback); 
            },
            ClearQuantityValues : function(listIndex, commandSucceededCallback)
            {
                let quantityType = options.quantityType; //TODO I don't think this is necessary

                if (quantityType != null)
                {
                    //Clear the List's quantity values for the given quantity type, and then execute the provided callback method
                    clearQuantityValues(getLists()[listIndex], quantityType, commandSucceededCallback)
                }
                else
                {
                    DebugController.LogError("A 'quantityType' option was expected but not provided. Model could not be updated.");
                }     
            },
            RemoveList : function(listIndex, commandSucceededCallback)
            {
                //Remove the List object from the lists array and then execute the provided callback method
                RemoveElementFromArray(getLists(), listIndex, commandSucceededCallback);
            }
        };

        //TODO Is it possible to somehow merge this with the same method in modifyListItem?
        //Set up the callback method to execute once the given command has been executed successfully 
        let commandSucceededCallback = function(args)
        {       
            //Store the updated checklist data
            storeChecklistData();

            //Execute the provided callback method, passing the returned arguments if not null
            args != null ? callback(args) : callback();
        };

        //Execute the method matching the given command
        commands[command](getListIndexFromId(listId), commandSucceededCallback);
    }

    //TODO what if instead of ModifyList vs ModifyListItem, we break it down by purpose/outcome. For example:
        //UpdateName(callback, updatedValue, listId, listItemId(optional(and temporary)))
        //ChangePosition(callback, direction, listId, listItemId(optional(and temporary))) - (Maybe leave it ias MoveUpwards & MoveDownwards)
        //Remove(callback, listId, listItemId(optional(and temporary)))
        //AddList
        //AddListItem
        //Decrement
        //Increment
        //clearQuantityValues(callback, quantityType, listId)
    //Disadvantages is that it may less neat and more difficult to keep track of what can be done to a List vs List Item
        //Advantage would be no longer relying on an options object

    function modifyListItem(command, listId, listItemId, callback, options)
    {       
        let commands = 
        {
            UpdateName : function(listItemIndex, commandSucceededCallback)
            {
                let updatedValue = options.updatedValue;

                if (updatedValue != null)
                {
                    //Update the name of the List Item and then execute the provided callback method
                    editName(getListItems(listId)[listItemIndex], updatedValue, commandSucceededCallback);
                }
                else
                {
                    DebugController.LogError("An 'updatedValue' option was expected but not provided. Model could not be updated.");
                }                
            },
            MoveUpwards : function(listItemIndex, commandSucceededCallback)
            {
                //Try to move the List Item upwards in the array and, if successful, execute the callback method, passing the swapped List Item ID as an argument
                swapChecklistObjects(getListItems(listId), listItemIndex, listItemIndex-1, commandSucceededCallback);
            },
            MoveDownwards : function(listItemIndex, commandSucceededCallback)
            {
                //Try to move the List Item downwards in the array and, if successful, execute the callback method, passing the swapped List Item ID as an argument
                swapChecklistObjects(getListItems(listId), listItemIndex, listItemIndex+1, commandSucceededCallback);
            },
            //TODO might be able to merge Decrement and Increment, and pass in a modifier value parameter (e.g. mod=-1 or mod=1) which then gets added to the current/previous quantity value
            DecrementQuantityValue : function(listItemIndex, commandSucceededCallback)
            {
                let quantityType = options.quantityType;

                if (quantityType != null)
                {
                    //If the quantity value for the given quantity type is greater than zero...
                    if (getListItems(listId)[listItemIndex].quantities[quantityType] > 0)
                    {
                        //Decrement the quantity value by one
                        getListItems(listId)[listItemIndex].quantities[quantityType]--;

                        //Execute the provided callback method once the command has been successfully executed, passing the quantity type as an argument
                        commandSucceededCallback();
                    }
                }
                else
                {
                    DebugController.LogError("A 'quantityType' option was expected but not provided. Model could not be updated.");
                }
            },
            IncrementQuantityValue : function(listItemIndex, commandSucceededCallback)
            {
                let quantityType = options.quantityType;

                if (quantityType != null)
                {
                    //Increment the quantity value for the given quantity type by one
                    getListItems(listId)[listItemIndex].quantities[quantityType]++;
                    
                    //Execute the provided callback method once the command has been successfully executed, passing the quantity type as an argument
                    commandSucceededCallback();
                }
                else
                {
                    DebugController.LogError("A 'quantityType' option was expected but not provided. Model could not be updated.");
                }
            },
            RemoveListItem : function(listItemIndex, commandSucceededCallback)
            {
                //Remove the List Item object from the listItems array and then execute the provided callback method
                RemoveElementFromArray(getListItems(listId), listItemIndex, commandSucceededCallback);
            }
        };

        //Set up the callback method to execute once the given command has been executed successfully 
        let commandSucceededCallback = function(args)
        {       
            //Store the updated checklist data object
            storeChecklistData();

            //TODO It would be possible here to insert the updated checklistObject into the return arguments. 
                //But it wouldn't work for ClearQuantityValues (in ModifyList)

            //Execute the provided callback method, passing the returned arguments if not null
            args != null ? callback(args) : callback();
        };

        //Execute the method matching the given command
        commands[command](getListItemIndexFromId(listId, listItemId), commandSucceededCallback);
    }

    // //TODO It's not very logical/intuitive that access list items would execute a call back
    // function accessListItems(listId, callback)
    // {     
    //     let _listItems = getListItems(listId);

    //     callback(_listItems);
    // }

    /**
     * Get a the balance of a List matching the provided ID, and using the calculation function provided
     * @param {string} listId The ID of the List
     * @param {function} calculationFunction The function which contains the logic used to calculate the balance 
     * @returns the List's balance, in the form of a ChecklistObjectBalance value
     */
    function getListBalance(listId, calculationFunction)
    {
        return calculationFunction(getListItems(listId)); //TODO maybe it would make more sense for the calculation function to be a helper method in a custom helpers file
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

    //TODO Update this file to use methods similar to Render or Bind in the View, maybe
    //TODO could just have an Update method...
    //TODO Lists and List Items could have a type value associated with them, then no extra type info would need to be passed from the Controller to a method such as 'Update', for example
        //However, the additional data stored in Storage is a bit wasteful, and not really necessary, as it can be avoided with some extra code. 
        //If a change like this is going to be made, might be worth doing that at the same time when (and if) the List Item index is modified to include the List index.
        //Actually, having a type in the data object wouldn't really be necessary if the ID is modified as above. 
    return {
        RetrieveChecklistData : retrieveChecklistData,
        AddNewList : addNewList,
        //AccessListItems : accessListItems,
        ModifyList : modifyList,
        ModifyListItem : modifyListItem,
        GetListBalance: getListBalance
    };
})();

const ChecklistObjectBalance = {
    None: 'None',
    Balanced: 'Balanced',
    Unbalanced: 'Unbalanced'
};
