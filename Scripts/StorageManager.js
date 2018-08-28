window.StorageManager = (function () 
{
    /** General Storage Utility Methods **/

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

    /** Checklist Storage Utility Methods (Private) **/

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
        if (assignmentType == 'clear')
        {
            //If the quantity value is not already set to zero...
            if (listItem.quantities[quantityType] != 0)
            {
                //Set the quantity value to zero
                listItem.quantities[quantityType] = 0;
                
                //Execute the provided callback method
                callback();
            }                            
        }
        else if (assignmentType == 'decrement')
        {
            //TODO would it make sense to store this value in the Model so as not to have to access storage unnecessarily? Probably not worth making a change like that just for this case... 
            //If the quantity value is greater than zero...
            if (listItem.quantities[quantityType] > 0)
            {
                //Decrement the quantity value by one
                listItem.quantities[quantityType]--;

                //Execute the provided callback method, passing the updated List Item object as an argument
                callback(listItem);
            }
        }
        else if (assignmentType == 'increment')
        {
            //Increment the quantity value by one
            listItem.quantities[quantityType]++;

            //Execute the provided callback method, passing the updated List Item object as an argument
            callback(listItem);
        }
        else 
        {
            window.DebugController.LogError("ERROR: Tried to perform an invalid operation on a quantity value in storage. List Item ID: " + listItemId);
        }
    }

    //PUBLIC? :

    //TODO Add JSDoc comments to each of the methods below

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

    function modifyList(command, listId, callback, parameters)
    {       
        var commands = 
        {
            EditName : function(data, listIndex, commandSucceededCallback)
            {
                //Update the name of the returned List object
                data.lists[listIndex].name = parameters.updatedName;

                //Execute the provided callback method once the command has been successfully executed
                commandSucceededCallback();
            },
            AddListItem : function(data, listIndex, commandSucceededCallback)
            {
                //Add the new List Item to the returned List object
                data.lists[listIndex].listItems.push(parameters.newListItem);

                //Execute the provided callback method once the command has been successfully executed, passing the new List Item object as an argument
                commandSucceededCallback(parameters.newListItem);
            },
            Remove : function(data, listIndex, commandSucceededCallback)
            {
                //Remove the returned List object from the lists array
                data.lists.splice(listIndex, 1);

                //Execute the provided callback method once the command has been successfully executed
                commandSucceededCallback();
            }
        };

        //Set up the callback method to execute when a List matching the given ID is found
        var runCommand = function(data, listIndex)
        {
            //Set up the callback method to execute once the given command has been executed successfully 
            var commandSucceededCallback = function(args)
            {       
                //Store the updated data object
                storeListData(data);

                //Execute the provided callback method, passing the returned arguments if not null
                args != null ? callback(args) : callback();
            };

            //Execute the method matching the given command
            commands[command](data, listIndex, commandSucceededCallback);
        }

        //Search for the List in storage and, if it's found, execute the method matching the given command
        findListInStorage(listId, runCommand);
    }

    //TODO Since the methods below all follow the same format (mostly), maybe they could be moved into a ModifyList method with 'command' parameter
        //Most likely all methods here should take a callback, and that should help standardize them even further

    function clearListQuantityColumnInStorage(listId, quantityType, callback)
    {
        //Set up the callback method to execute when a List matching the given ID is found
        var clearQuantityColumn = function(data, listIndex)
        {
            //Initialize an array to keep track of any List Items that will have a quantity value be modified
            var modifiedListItems = [];

            //TODO it should be possible to do this without passing the List Item as a param in this callback
            //Set up the callback method to execute when a List Item's quantity value has been modified
            // var storeModifiedQuantityValue = function(listItem)
            // {
            //     modifiedListItems.push(listItem);
            // };

            // //Traverse the List Items array of the returned List Object
            // for (var i = data.lists[listIndex].listItems.length-1; i >= 0; i--)
            // {   
            //     //Clear the List Item's quantity value (i.e. set it to zero)   
            //     modifyListItemQuantityValue(data.lists[listIndex].listItems[i], quantityType, 'clear', storeModifiedQuantityValue);
            // }

            //Initialize a variable that will be used to store the callback method which will execute when a List Item's quantity value has been modified
            var storeModifiedQuantityValue;

            //Traverse the List Items array of the returned List Object
            for (var i = data.lists[listIndex].listItems.length-1; i >= 0; i--)
            {   
                //Set up the callback method to execute when a List Item's quantity value has been modified
                storeModifiedQuantityValue = function()
                {
                    //Add the updated List Item object to the array of modified List Items
                    modifiedListItems.push(data.lists[listIndex].listItems[i]);
                };
                
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

    function modifyListItem(command, listId, listItemId, callback, parameters)
    {       
        var commands = 
        {
            EditName : function(data, listIndex, listItemIndex, commandSucceededCallback)
            {
                //Update the name of the returned List Item object
                data.lists[listIndex].listItems[listItemIndex].name = parameters.updatedName;

                //Execute the provided callback method once the command has been successfully executed
                commandSucceededCallback();
            },
            MoveUpwards : function(data, listIndex, listItemIndex, commandSucceededCallback)
            {
                //If the List Item is not the first in the List...
                if (listItemIndex > 0)
                {
                    //Swap the positions of the List Item matching the given ID, and the previous List Item in the array
                    var prevListItem = data.lists[listIndex].listItems[listItemIndex-1];
                    data.lists[listIndex].listItems[listItemIndex-1] = data.lists[listIndex].listItems[listItemIndex];
                    data.lists[listIndex].listItems[listItemIndex] = prevListItem;

                    //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List Item as an argument
                    commandSucceededCallback(prevListItem.id);
                }
            },
            MoveDownwards : function(data, listIndex, listItemIndex, commandSucceededCallback)
            {
                //If the List Item is not the last in the List...
                if (listItemIndex < data.lists[listIndex].listItems.length-1)
                {
                    //Swap the positions of the List Item matching the given ID, and the next List Item in the array
                    var nextListItem = data.lists[listIndex].listItems[listItemIndex+1];
                    data.lists[listIndex].listItems[listItemIndex+1] = data.lists[listIndex].listItems[listItemIndex];
                    data.lists[listIndex].listItems[listItemIndex] = nextListItem;

                    //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List Item as an argument
                    commandSucceededCallback(nextListItem.id);
                }
            },
            EditQuantityValue : function(data, listIndex, listItemIndex, commandSucceededCallback)
            {
                //Update the List Item's quantity value for the given quantity type
                modifyListItemQuantityValue(data.lists[listIndex].listItems[listItemIndex], parameters.quantityType, parameters.assignmentType, commandSucceededCallback);
            },
            Remove : function(data, listIndex, listItemIndex, commandSucceededCallback)
            {
                //Remove the returned List Item object from the List Items array
                data.lists[listIndex].listItems.splice(listItemIndex, 1);

                //Execute the provided callback method once the command has been successfully executed
                commandSucceededCallback();
            }
        };

        //Set up the callback method to execute when a List Item matching the given ID is found
        var runCommand = function(data, listIndex, listItemIndex)
        {
            //Set up the callback method to execute once the given command has been executed successfully 
            var commandSucceededCallback = function(args)
            {       
                //Store the updated data object
                storeListData(data);

                //Execute the provided callback method, passing the returned arguments if not null
                args != null ? callback(args) : callback();
            };

            //Execute the method matching the given command
            commands[command](data, listIndex, listItemIndex, commandSucceededCallback);
        }

        //Search for the List Item in storage and, if it's found, execute the method matching the given command
        findListItemInStorage(listId, listItemId, runCommand);
    }

    //TODO Continue to update this file to use methods similar to ModifyListItem
    return {
        GetListStorageData : getListStorageData,
        AddListToStorage : addListToStorage,
        ModifyList : modifyList,
        ClearListQuantityColumnInStorage : clearListQuantityColumnInStorage,
        ModifyListItem : modifyListItem
    };
})();  