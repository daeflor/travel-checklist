'use strict';
window.Model = (function() 
{
    //TODO using 'self' makes it more obvious when accessing 'global' variables (even though these aren't actually global)
    var checklistData;

    /** Private Checklist Data Utility Methods **/

    /**
     * Saves the Checklist data object to storege
     */
    function storeChecklistData()
    {
        window.StorageManager.StoreChecklistData(checklistData);
    }

    /**
     * Gets the lists array from the Checklist data object
     * @returns the lists array if the Checklist data object exists, otherwise logs an error and returns undefined
     */
    function getLists() 
    {
        //If checklist data has already been loaded from storage, return the Lists array
        if (checklistData != null)
        {
            return checklistData.lists;
        }
        else
        {
            window.DebugController.LogError("ERROR: Tried to retrieve Lists array but Checklist data is null");
        }
    }

    //TODO Should this be in ChecklistUtilities instead?
    /**
     * Gets the data object, index, and parent array for the checklist object matching the provided ID
     * @param {*} id The ID of the checklist object (List or List Item) //TODO currently this can be a string or an integer. In the future it would be good to standardize it. 
     * @returns an object containing a reference to the checklist object, its index, and its parent array 
     */
    function getChecklistObjectDataFromId(id)
    {
        let _listId = id.toString().split('-')[0];
        let _listItemSuffix = id.toString().split('-')[1];
        let _listIndex = GetArrayIndexOfObjectWithKVP(getLists(), 'id', _listId);

        if (_listIndex != null)
        {
            let _parentArray = (_listItemSuffix == null) ? getLists() : getLists()[_listIndex].listItems;
            let _index = (_listItemSuffix == null) ? _listIndex : GetArrayIndexOfObjectWithKVP(_parentArray, 'id', id);
        
                return {
                    index: _index,
                    parentArray: _parentArray,
                    object: _parentArray[_index]
                };
        }
        else
        {
            DebugController.LogError("Tried to access data about a checklist object but a valid List ID was not provided or could not be determined. Full ID value provided: " + id);
        }
    }

    /** Publicly Exposed Methods To Access & Modify List Data **/

    //TODO it might make more sense to do this in some sort of init method
    /**
     * Fetches the Checklist data from storage and then executes the provided callback function
     * @param {function} callback The function to execute once the Checklist data has been retrieved from storage
     */
    function retrieveChecklistData(callback)
    {
        checklistData = window.StorageManager.RetrieveChecklistData();

        window.DebugController.Print("Checklist data retrieved from storage");

        //TODO Consider passing this callback through to the storage method call (above). (In case accessing the date from storage becomes async at some point). 
        callback(checklistData.lists);        
    }

    /**
     * Adds a new List to the Checklist data
     * @param {function} callback The function to execute once the new List has been added to the Checklist data
     */
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

    /**
     * Adds a new List Item to the List matching the provided ID
     * @param {*} listId The ID of the List that the List Item will belong to
     * @param {function} callback The function to execute once the new List Item has been added to the Checklist data
     */
    function addNewListItem(listId, callback)
    {
        //Retrieve data about the List based on its ID
        let _data = getChecklistObjectDataFromId(listId); 

        let newListItem = {
            id : _data.object.id.toString().concat('-').concat(new Date().getTime()), //TODO if we ever start using Firebase or some other server, we should just keep an incrementing counter for this ID.
            name : '',
            quantities : {
                needed: 0,
                luggage: 0,
                wearing: 0,
                backpack: 0
            }
        };
        
        //Add the new List Item to the List object matching the provided ID
        _data.object.listItems.push(newListItem);

        //Store the updated checklist data
        storeChecklistData();

        //Execute the provided callback function, passing the new List Item object as an argument
        callback({newListItem:newListItem});
    }

    /**
     * Updates the name of the checklist object matching the provided ID
     * @param {*} id The ID of the checklist object (List or List Item) which is being renamed
     * @param {function} callback The function to execute once the checklist object has been renamed
     * @param {string} updatedValue The updated name value of the checklist object
     */
    function modifyName(id, callback, updatedValue)
    {
        //If a valid name was provided...
        if (updatedValue != null)
        {
            //Update the name of the List or List Item data object
            getChecklistObjectDataFromId(id).object.name = updatedValue;

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

    /**
     * Removes the checklist object matching the provided ID from its parent array
     * @param {*} id The ID of the checklist object (List or List Item) which is being removed
     * @param {function} callback The function to execute once the checklist object has been removed
     */
    function remove(id, callback)
    {
        //Retrieve data about the checklist object based on its ID
        let _data = getChecklistObjectDataFromId(id);

        //Remove the checklist object from its parent array
        RemoveElementFromArray(_data.parentArray, _data.index);

        //Store the updated checklist data
        storeChecklistData();

        //Execute the provided callback function
        callback();
    }

    /**
     * Moves the checklist object matching the provided ID upwards or downwards in its parent array
     * @param {*} id The ID of the checklist object (List or List Item) which is being re-odered
     * @param {function} callback The function to execute once the checklist object has been re-ordered
     * @param {string} direction Specifies whether the checklist object should be moved upwards or downwards
     */
    function modifyPosition(id, callback, direction)
    {
        if (direction === 'Upwards' || direction === 'Downwards')
        {
            //Retrieve data about the checklist object based on its ID
            let _data = getChecklistObjectDataFromId(id);
            
            //If the specified direction is 'Upwards', swap with the previous index, otherwise swap with the next index.
            let _indexToSwapWith = (direction === 'Upwards') ? _data.index-1 : _data.index+1;

            //Try to swap the object with the one at an adjacent index in the array and, if successful, get the swapped object
            let _swappedChecklistObject = SwapElementsInArray(_data.parentArray, _data.index, _indexToSwapWith); 
        
            //If the swap was successful...
            if (_swappedChecklistObject != null)
            {
                //Store the updated checklist data
                storeChecklistData();

                //Execute the provided callback function, passing the ID of swapped checklist object as an argument
                callback({swappedChecklistObjectId:_swappedChecklistObject.id});
            }
            else
            {
                window.DebugController.Print("Unable to modify the position of the checklist object with ID " + id);
            }
        }
        else
        {
            window.DebugController.LogError("Request received to modify a checklist object's position, but an invalid direction was provided. Valid directions are 'Upwards' and 'Downwards'");
        }
    }

    /**
     * Updates the quantity value for the given quantity type of the List Item matching the provided ID
     * @param {*} listItemId The ID of the List Item which is having its quantity value modified
     * @param {function} callback The function to execute once the List Item's quantity value has been updated
     * @param {string} modification Specifies whether the List Item's quantity value should be incremented or decremented 
     * @param {string} quantityType Specifies the quantity type which should be updated ('needed', 'luggage', 'wearing', or 'backpack')
     */
    function modifyQuantityValue(listItemId, callback, modification, quantityType)
    {
        //If a valid modification and quantity type is provided...
        if (QuantityType[quantityType] != null && (modification === 'Decrement' || modification === 'Increment'))
        {
            //Retrieve data about the List Item based on its ID
            let _data = getChecklistObjectDataFromId(listItemId);

            //If the request is to decrement the quantity value, and the current value for the given quantity type is greater than zero...
            if (modification === 'Decrement' && _data.object.quantities[quantityType] > 0)
            {
                //Decrement the quantity value for the given quantity type by one
                _data.object.quantities[quantityType]--;

                //Store the updated checklist data
                storeChecklistData();

                //Execute the provided callback function
                callback();
            }
            else if (modification === 'Increment') //Else, if the request is to increment the quantity value
            {
                //Increment the quantity value for the given quantity type by one
                _data.object.quantities[quantityType]++; 

                //Store the updated checklist data
                storeChecklistData();

                //Execute the provided callback function
                callback();

                //TODO Instead of always passing a callback, would it make sense to not, and instead have a 'respondToController' function (with a better name obviously)
                    //This function would take as a parmeter any argument(s) that needs to be sent back to the Controller
                    //It would store the checklist data (perhaps there could be a param option for whether or not to do this - to account for the list balance edge case...)
                    //It would then call a dedicated function in the Controller, which would pass along actions in the View
                    //The PROBLEM with this is that there are options from the initial bind that need to passed back to the View, but which the controller doesn't need to be aware of. So sending them through the controller just to be passed back doesn't seem like a good idea. 
                    //Although now that the different Model commands are separated, it would be possible to insert the updated checklistObject into the return arguments of the callback, only when applicable. That should cover most of the needs that the Render commands have...
            }
        }
        else
        {
            //TODO could be more consistent with capitaliation
            window.DebugController.LogError("Request received to modify a List Item's quantity value, but an invalid modification or quantity type was provided. Valid modifications are 'Decrement' and 'Increment'. Valid quantity types are 'needed', 'luggage', 'wearing', and 'backpack'.");
        }
    }

    /**
     * Clears all the quantity values for the given quantity type in the List matching the provided ID
     * @param {*} listId The ID of the List which is having its quantity values cleared
     * @param {function} callback The function to execute once the List's quantity values for the given quantity type have been cleared
     * @param {string} quantityType Specifies the quantity type which should be cleared ('needed', 'luggage', 'wearing', or 'backpack')
     */
    function clearQuantityValues(listId, callback, quantityType)
    {
        if (QuantityType[quantityType] != null)
        {
            //Retrieve data about the List based on its ID
            let _data = getChecklistObjectDataFromId(listId);

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
            _data.object.listItems.forEach(_clearQuantityValue);

            //If the quantity value of any List Item was actually changed...
            if (modifiedListItems.length > 0)
            {
                //Store the updated checklist data
                storeChecklistData();
                
                //Execute the provided callback function, passing the array of modified List Items as an argument
                callback({modifiedListItems:modifiedListItems});
            }
        }
        else
        {
            window.DebugController.LogError("Request received to clear a List's quantity values for a given quantity type, but an invalid quantity type was provided. Valid quantity types are 'needed', 'luggage', 'wearing', and 'backpack'.");
        }     
    }

    /**
     * Get a the balance of a List matching the provided ID, and using the calculation function in ChecklistUtilities
     * @param {string} id The ID of the List
     * @returns the List's balance, in the form of a ChecklistObjectBalance value
     */
    function getListBalance(id)
    {
        //Retrieve data about the checklist object based on its ID
        let _data = getChecklistObjectDataFromId(id);

        return ChecklistUtilities.CalculateListBalance(_data.object.listItems);
    }

    //TODO Would it be worth it to add some sort of singular entrypoint method in the Model that determines if it needs to modify a List or List Item
        //It could be something like Model.Update() but should also make sense for getting a List's Balance...
        //In many(?) cases you could set the array based on the type of list object to modify (e.g. array = getLists() or getLists()[listIndex].listItems)
        //Maybe keep a separate ModifyList and ModifyListItem, but use this only to set the array and other necessary vars (e.g. in ModifyList, array = getLists())
        //Then the bulk of the logic could be handled elsewhere? maybe... Although it kind of already is... 

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

    //TODO RemoveObject and EditName could help consolidate code, here, in StorageManager, and Controllers

    return {
        RetrieveChecklistData : retrieveChecklistData,
        AddNewList : addNewList,
        AddNewListItem: addNewListItem,
        ModifyName: modifyName,
        Remove: remove,
        ModifyPosition: modifyPosition,
        ModifyQuantityValue: modifyQuantityValue,
        ClearQuantityValues: clearQuantityValues,
        GetListBalance: getListBalance
    };
})();