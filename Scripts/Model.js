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
        //Search for the List Item and return its index
        return GetArrayIndexOfObjectWithKVP(getListItems(listId), 'id', listItemId); 
    }

    // function editName(checklistObject, updatedName, callback)
    // {
    //     //Update the name of the List or List Item data object
    //     checklistObject.name = updatedName;

    //     //Execute the provided callback method once the name has been updated
    //     callback();
    // }

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
        //TODO instead of prefixing the List Item ID with the List's ID, is it viable to just add a 'type' key?
        let newListItem = {
            id : listObject.id.toString().concat('-').concat(new Date().getTime()), //TODO if we ever start using Firebase or some other server, we should just keep an incrementing counter for this ID.
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
        callback({newListItem:newListItem});
    }

    function convertListItemIds(lists)
    {
        //For each List loaded from Storage...
        for (let i = 0; i < lists.length; i++) 
        {            
            //For each List Item in the List...
            for (let j = 0; j < lists[i].listItems.length; j++) 
            {
                //Get the List Item's previous/old ID assign it to a temporary variable
                let _oldListItemId = lists[i].listItems[j].id

                if (_oldListItemId.includes('-') == false)
                {
                    //Set the List Item's new ID as a concatention of the List ID and the previous/old List Item ID
                    lists[i].listItems[j].id = lists[i].id.toString().concat('-').concat(_oldListItemId);

                    window.DebugController.Print("Replaced old List Item ID with: " + lists[i].listItems[j].id);
                }
                else
                {
                    window.DebugController.Print("List Item ID is in current format and doesn't need to be updated.");
                }
            }
        }

        storeChecklistData();
    }

    /** Publicly Exposed Methods To Access & Modify List Data **/

    //TODO it might make more sense to do this in some sort of init method
    function retrieveChecklistData(callback)
    {
        checklistData = window.StorageManager.RetrieveChecklistData();

        //convertListItemIds(checklistData.lists);

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

        callback({newList:newList});
    }

    // function getChecklistObjectIndexFromId(id)
    // {
    //     if (id.includes('-') === false)
    //     {
    //         return getListIndexFromId(id);
    //     }
    //     else
    //     {
    //         return getListItemIndexFromId(id);
    //     }
    // }

    function getChecklistObjectIndicesFromId(id)
    {
        let _listId = id.toString().split('-')[0];
        let _listItemSuffix = id.toString().split('-')[1];
    
        return {
            listIndex: GetArrayIndexOfObjectWithKVP(getLists(), 'id', _listId),
            //listItemIndex: null,
            listItemIndex: (_listItemSuffix != null) ? GetArrayIndexOfObjectWithKVP(getListItems(_listId), 'id', id) : null
        };

        // if (_listItemSuffix != null)
        // {
        //     _indices.listItemIndex = GetArrayIndexOfObjectWithKVP(getListItems(_listId), 'id', id);
        // }

        //return _indices;
    }

    function getChecklistObjectFromId(id)
    {
        let _indices = getChecklistObjectIndicesFromId(id);

        if (_indices.listIndex != null)
        {
            return (_indices.listItemIndex == null) ? getLists()[_indices.listIndex] : getLists()[_indices.listIndex].listItems[_indices.listItemIndex];
            
            // if (_indices.listItemIndex == null)
            // {
            //     return getLists()[_indices.listIndex];
            // }
            // else 
            // {
            //     return getLists()[_indices.listIndex].listItems[_indices.listItemIndex];
            // }
        }
        else 
        {
            DebugController.LogError("Tried to retrieve a Checklist Object but a valid List ID was not provided or could not be determined.");
        }
    }

    function getListIdPrefixFromListItemId(listItemId)
    {
        if (listItemId != null)
        {
            return listItemId.split('-')[0];
        }
        else
        {
            DebugController.LogError("Tried to get the List ID prefix from a List Item ID, but the List Item ID provided is invalid.");
        }
    }

    function getListItemIndexFromFullId(listItemId) //TODO rename eventually (remove 'full')
    {
        //Search for the List Item and return its index
        return GetArrayIndexOfObjectWithKVP(getListItems(getListIdPrefixFromListItemId(listItemId)), 'id', listItemId); 
    }

    function getChecklistObjectFromId_OLD(id)
    {
        let _listId = id.split('-')[0];
        let _listItemSuffix = id.split('-')[1];

        if (_listId != null)
        {
            if (_listItemSuffix == null)
            {
                return getLists()[getListIndexFromId(_listId)];
            }
            else
            {
                return getListItems(_listId)[getListItemIndexFromFullId(id)];
            }
        }
        else 
        {
            DebugController.LogError("Tried to retrieve a Checklist Object but a valid ID was not provided.");
        }
    }

    function updateName(id, callback, updatedValue)
    {
        //If a valid name was provided...
        if (updatedValue != null)
        {
            //Update the name of the List or List Item data object
            getChecklistObjectFromId(id).name = updatedValue;

            //Store the updated checklist data
            storeChecklistData();

            //Execute the provided callback function 
            callback();
        }
        else
        {
            DebugController.LogError("An 'updatedValue' option was expected but not provided. Model could not be updated.");
        }
    }

    function getChecklistObjectDataFromId(id)
    {
        let _listId = id.toString().split('-')[0];
        let _listItemSuffix = id.toString().split('-')[1];
        let _listIndex = GetArrayIndexOfObjectWithKVP(getLists(), 'id', _listId);
    
        if (_listIndex != null)
        {
            return {
                listIndex: _listIndex,
                listItemIndex: (_listItemSuffix != null) ? GetArrayIndexOfObjectWithKVP(getListItems(_listId), 'id', id) : null,
                //parentArray: (_listItemSuffix == null) ? getLists() : getListItems(_listId)
                parentArray: (_listItemSuffix == null) ? getLists() : getLists()[_listIndex].listItems
                //type: (_listItemSuffix == null) ? 'list' : 'listItem'
            };
        }
        else
        {
            DebugController.LogError("Tried to access data about a checklist object but a valid List ID was not provided or could not be determined. Full ID value provided: " + id);
        }
    }

    function modifyPosition(id, callback, direction)
    {
        if (direction === 'Upwards' || direction === 'Downwards')
        {
            //Retrieve data about the checklist object based on its ID
            let _data = getChecklistObjectDataFromId(id);
            
            //If the checklist object has List Item Index value, use that. Otherwise, use the List Index value.
            let _index = (_data.listItemIndex == null) ? _data.listIndex : _data.listItemIndex;

            //If the specified direction is 'Upwards', swap with the previous index, otherwise swap with the next index.
            let _indexToSwapWith = (direction === 'Upwards') ? _index-1 : _index+1;

            //Try to swap the object with the one at an adjacent index in the array and, if successful, get the swapped object
            let _swappedChecklistObject = SwapElementsInArray(_data.parentArray, _index, _indexToSwapWith); 
        
            //If the swap succeeded, store the updated checklist data and then execute the callback function, passing the ID of swapped checklist object
            if (_swappedChecklistObject != null)
            {
                storeChecklistData();            
                callback({swappedChecklistObjectId:_swappedChecklistObject.id});
            }
            else
            {
                window.DebugController.Print("Unable to modify the position of the checklist object with ID " + id);
            }
        }
        else
        {
            DebugController.LogError("Request received to modify a checklist object's position, but in invalid direction was provided. Valid directions are 'Upwards' and 'Downwards'");
        }
    }

    // function modifyPosition(id, callback, direction)
    // {
    //     if (direction === 'Upwards' || direction === 'Downwards')
    //     {
    //         let _indices = getChecklistObjectIndicesFromId(id);

    //         if (_indices.listIndex != null) 
    //         {
    //             let _parentArray = (_indices.listItemIndex == null) ? getLists() : getLists()[_indices.listIndex].listItems;
            
    //             let _indexToSwapWith = (direction === 'Upwards') ? index - 1 : index+ + 1;

    //             /////

    //             //let _parentArray = null;
    //             let _index = null;
    //             //let _indexToSwapWith = null;

    //             if (_indices.listItemIndex == null)
    //             {
    //                 _parentArray = getLists();
    //                 _indexToSwapWith = _indices.listIndex
    //             }
    //             else 
    //             {
    //                 _parentArray = getLists()[_indices.listIndex].listItems;
    //             }
            



    //             /////
            
    //             //Store the updated checklist data
    //             storeChecklistData();

    //             //Execute the provided callback function 
    //             callback();
    //         }
    //         else
    //         {
    //             DebugController.LogError("Tried to retrieve a Checklist Object but a valid List ID was not provided or could not be determined.");
    //         }

    //         let _indexToSwapWith = (direction === 'Upwards') ? index - 1 : index+ + 1;
    //     }
    //     else
    //     {
    //         DebugController.LogError("Request received to modify a checklist object's position, but in invalid direction was provided. Valid directions are 'Upwards' and 'Downwards'");
    //     }



    //     if (direction === 'Upwards')
    //     {
            

    //         //Store the updated checklist data
    //         storeChecklistData();

    //         //Execute the provided callback function 
    //         callback();
    //     }
    //     else if (direction === 'Downwards')
    //     {

    //     }
    //     else
    //     {
    //         DebugController.LogError("Request received to modify a checklist object's position, but in invalid direction was provided. Valid directions are 'Upwards' and 'Downwards'");
    //     }
            
        
    //     //Try to move the List upwards in the array and, if successful, execute the callback method, passing the swapped List ID as an argument
    //     swapChecklistObjects(getLists(), listIndex, listIndex-1, commandSucceededCallback);
        
    //     //
        

    //     //Store the updated checklist data
    //     storeChecklistData();

    //     //Execute the provided callback function 
    //     callback();
    // }

    //TODO it probably *is* possible to merge modifyList and modifyListItem but it might not be cleaner. In many(?) cases you could set the array based on the type of list object to modify (e.g. array = getLists() or getLists()[listIndex].listItems)
        //Maybe keep ModifyList and ModifyListItem separate, but use this only to set the array and other necessary vars (e.g. in ModifyList, array = getLists())
        //Then the bulk of the logic could be handled elsewhere? maybe... Although it kind of already is... 
    function modifyList(command, listId, callback, options)
    {       
        let commands = 
        {
            // UpdateName : function(listIndex, commandSucceededCallback)
            // {
            //     let updatedValue = options.updatedValue;

            //     if (updatedValue != null)
            //     {
            //         //Update the name of the List and then execute the provided callback method
            //         editName(getLists()[listIndex], updatedValue, commandSucceededCallback);
            //     }
            //     else
            //     {
            //         DebugController.LogError("An 'updatedValue' option was expected but not provided. Model could not be updated.");
            //     }
            // },
            // MoveUpwards : function(listIndex, commandSucceededCallback)
            // {
            //     //Try to move the List upwards in the array and, if successful, execute the callback method, passing the swapped List ID as an argument
            //     swapChecklistObjects(getLists(), listIndex, listIndex-1, commandSucceededCallback);
            // },
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

    //TODO Would it be worth it to add some sort of singular entrypoint method in the Model that determines if it needs to modify a List or List Item
        //It could be something like Model.Update() but should also make sense for getting a List's Balance...
    // TODO Change List Item IDs to be prefixed by the listId.
        //Then it may be possible to more easily attempt some of the suggestions above. 

    function modifyListItem(command, listId, listItemId, callback, options)
    {       
        let commands = 
        {
            // UpdateName : function(listItemIndex, commandSucceededCallback)
            // {
            //     let updatedValue = options.updatedValue;

            //     if (updatedValue != null)
            //     {
            //         //Update the name of the List Item and then execute the provided callback method
            //         editName(getListItems(listId)[listItemIndex], updatedValue, commandSucceededCallback);
            //     }
            //     else
            //     {
            //         DebugController.LogError("An 'updatedValue' option was expected but not provided. Model could not be updated.");
            //     }                
            // },
            // MoveUpwards : function(listItemIndex, commandSucceededCallback)
            // {
            //     //Try to move the List Item upwards in the array and, if successful, execute the callback method, passing the swapped List Item ID as an argument
            //     swapChecklistObjects(getListItems(listId), listItemIndex, listItemIndex-1, commandSucceededCallback);
            // },
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
        GetListBalance: getListBalance,
        UpdateName: updateName,
        ModifyPosition: modifyPosition
    };
})();

const ChecklistObjectBalance = {
    None: 'None',
    Balanced: 'Balanced',
    Unbalanced: 'Unbalanced'
};
