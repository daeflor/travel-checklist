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

    // function findListInStorage(listId, callback)
    // {
    //     //Get the parsed data from storage
    //     var parsedStorageData = getParsedDataFromStorage();

    //     //Traverse the stored List data for one that matches the given List ID
    //     for (var i = parsedStorageData.lists.length-1; i >= 0; i--)
    //     {
    //         //If the List IDs match, call the passed callback method and end execution of this method
    //         if (parsedStorageData.lists[i].id == listId)
    //         {
    //             callback(parsedStorageData, i);
    //             return;
    //         }
    //     } 

    //     window.DebugController.LogError('ERROR: Unable to find requested List in Storage');
    // }

    // function findListItemInStorage(listId, listItemId, callback)
    // {
    //     //Set up the callback method to execute when a List matching the given ID is found
    //     var findListItem = function(data, listIndex)
    //     {
    //         //Traverse the List Items array of the returned List Object, searching for one that matches the given List Item ID
    //         for (var i = data.lists[listIndex].listItems.length-1; i >= 0; i--)
    //         {
    //             //If the List Item IDs match, call the passed callback method and end execution of this method
    //             if (data.lists[listIndex].listItems[i].id == listItemId)
    //             {
    //                 callback(data, listIndex, i);
    //                 return;
    //             }
    //         } 

    //         window.DebugController.LogError('ERROR: Unable to find requested List Item in Storage');
    //     };
        
    //     //Search for the List in storage and, if it's found, execute the callback method
    //     findListInStorage(listId, findListItem);
    // }

    //TODO Add JSDoc comments to each of the methods below, and add any other comments as needed


    /** Publicly Exposed Methods To Access & Modify List Data In Storage **/

    // function getListStorageData()
    // {
    //     return getParsedDataFromStorage().lists;
    // }

    // function addListToStorage(newList, callback)
    // {
    //     var parsedStorageData = getParsedDataFromStorage();

    //     parsedStorageData.lists.push(newList);

    //     storeListData(parsedStorageData);

    //     callback(newList);
    // }

    // function modifyList(command, listId, callback, parameters)
    // {       
    //     var commands = 
    //     {
    //         EditName : function(data, listIndex, commandSucceededCallback)
    //         {
    //             //Update the name of the returned List object
    //             data.lists[listIndex].name = parameters.updatedName;

    //             //Execute the provided callback method once the command has been successfully executed
    //             commandSucceededCallback();
    //         },
    //         MoveUpwards : function(data, listIndex, commandSucceededCallback)
    //         {
    //             //If the List is not the first in the List...
    //             if (listIndex > 0)
    //             {
    //                 //Swap the positions of the List matching the given ID, and the previous List in the array
    //                 var prevList = data.lists[listIndex-1];
    //                 data.lists[listIndex-1] = data.lists[listIndex];
    //                 data.lists[listIndex] = prevList;

    //                 //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List as an argument
    //                 commandSucceededCallback(prevList.id);
    //             }
    //         },
    //         MoveDownwards : function(data, listIndex, commandSucceededCallback)
    //         {
    //             //If the List is not the last in the Lists array...
    //             if (listIndex < data.lists.length-1)
    //             {
    //                 //Swap the positions of the List matching the given ID, and the next List in the array
    //                 var nextList = data.lists[listIndex+1];
    //                 data.lists[listIndex+1] = data.lists[listIndex];
    //                 data.lists[listIndex] = nextList;

    //                 //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List as an argument
    //                 commandSucceededCallback(nextList.id);
    //             }
    //         },
    //         AddListItem : function(data, listIndex, commandSucceededCallback)
    //         {
    //             //Add the new List Item to the returned List object
    //             data.lists[listIndex].listItems.push(parameters.newListItem);

    //             //Execute the provided callback method once the command has been successfully executed, passing the new List Item object as an argument
    //             commandSucceededCallback(parameters.newListItem);
    //         },
    //         ClearQuantityValues : function(data, listIndex, commandSucceededCallback)
    //         {
    //             //Initialize an array to keep track of any List Items that will have a quantity value be modified
    //             var modifiedListItems = [];

    //             var clearQuantityValue = function(listItem)
    //             {
    //                 //If the quantity value for the given quantity type is not already set to zero...
    //                 if (listItem.quantities[parameters.quantityType] != 0)
    //                 {
    //                     //Set the quantity value to zero
    //                     listItem.quantities[parameters.quantityType] = 0;

    //                     //Add the List Item to the array of modified List Items
    //                     modifiedListItems.push(listItem);
    //                 }
    //             };

    //             //For each List Item in the List, clear the quantity value (i.e. set it to zero)   
    //             data.lists[listIndex].listItems.forEach(clearQuantityValue);
           
    //             //If the quantity value of any List Item was actually changed...
    //             if (modifiedListItems.length > 0)
    //             {
    //                 //Execute the provided callback method once the command has been successfully executed, passing the array of modified List Items as an argument
    //                 commandSucceededCallback(modifiedListItems);
    //             }
    //         },
    //         Remove : function(data, listIndex, commandSucceededCallback)
    //         {
    //             //Remove the returned List object from the lists array
    //             data.lists.splice(listIndex, 1);

    //             //Execute the provided callback method once the command has been successfully executed
    //             commandSucceededCallback();
    //         }
    //     };

    //     //TODO Is it possible to somehow merge this with the same method in modifyListItem?... Maybe at least the commandSucceededCallback can be abstracted? But it wouldn't help much
    //     //Set up the callback method to execute when a List matching the given ID is found
    //     var runCommand = function(data, listIndex)
    //     {
    //         //Set up the callback method to execute once the given command has been executed successfully 
    //         var commandSucceededCallback = function(args)
    //         {       
    //             //Store the updated data object
    //             storeListData(data);

    //             //Execute the provided callback method, passing the returned arguments if not null
    //             args != null ? callback(args) : callback();
    //         };

    //         //Execute the method matching the given command
    //         commands[command](data, listIndex, commandSucceededCallback);
    //     }

    //     //Search for the List in storage and, if it's found, execute the method matching the given command
    //     findListInStorage(listId, runCommand);
    // }

    // function modifyListItem(command, listId, listItemId, callback, parameters)
    // {       
    //     var commands = 
    //     {
    //         EditName : function(data, listIndex, listItemIndex, commandSucceededCallback)
    //         {
    //             //Update the name of the returned List Item object
    //             data.lists[listIndex].listItems[listItemIndex].name = parameters.updatedName;

    //             //Execute the provided callback method once the command has been successfully executed
    //             commandSucceededCallback();
    //         },
    //         MoveUpwards : function(data, listIndex, listItemIndex, commandSucceededCallback)
    //         {
    //             //If the List Item is not the first in the List...
    //             if (listItemIndex > 0)
    //             {
    //                 //Swap the positions of the List Item matching the given ID, and the previous List Item in the array
    //                 var prevListItem = data.lists[listIndex].listItems[listItemIndex-1];
    //                 data.lists[listIndex].listItems[listItemIndex-1] = data.lists[listIndex].listItems[listItemIndex];
    //                 data.lists[listIndex].listItems[listItemIndex] = prevListItem;

    //                 //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List Item as an argument
    //                 commandSucceededCallback(prevListItem.id);
    //             }
    //         },
    //         MoveDownwards : function(data, listIndex, listItemIndex, commandSucceededCallback)
    //         {
    //             //If the List Item is not the last in the List...
    //             if (listItemIndex < data.lists[listIndex].listItems.length-1)
    //             {
    //                 //Swap the positions of the List Item matching the given ID, and the next List Item in the array
    //                 var nextListItem = data.lists[listIndex].listItems[listItemIndex+1];
    //                 data.lists[listIndex].listItems[listItemIndex+1] = data.lists[listIndex].listItems[listItemIndex];
    //                 data.lists[listIndex].listItems[listItemIndex] = nextListItem;

    //                 //Execute the provided callback method once the command has been successfully executed, passing the ID of the swapped List Item as an argument
    //                 commandSucceededCallback(nextListItem.id);
    //             }
    //         },
    //         DecrementQuantityValue : function(data, listIndex, listItemIndex, commandSucceededCallback)
    //         {
    //             //TODO would it make sense to store this value in the Model so as not to have to access storage unnecessarily? Probably not worth making a change like that just for this case... 
    //             //If the quantity value for the given quantity type is greater than zero...
    //             if (data.lists[listIndex].listItems[listItemIndex].quantities[parameters.quantityType] > 0)
    //             {
    //                 //Decrement the quantity value by one
    //                 data.lists[listIndex].listItems[listItemIndex].quantities[parameters.quantityType]--;

    //                 //Execute the provided callback method once the command has been successfully executed, passing the updated List Item object as an argument
    //                 commandSucceededCallback(data.lists[listIndex].listItems[listItemIndex]);
    //             }
    //         },
    //         IncrementQuantityValue : function(data, listIndex, listItemIndex, commandSucceededCallback)
    //         {
    //             //Increment the quantity value for the given quantity type by one
    //             data.lists[listIndex].listItems[listItemIndex].quantities[parameters.quantityType]++;
                
    //             //Execute the provided callback method once the command has been successfully executed, passing the updated List Item object as an argument
    //             commandSucceededCallback(data.lists[listIndex].listItems[listItemIndex]);
    //         },
    //         Remove : function(data, listIndex, listItemIndex, commandSucceededCallback)
    //         {
    //             //Remove the returned List Item object from the List Items array
    //             data.lists[listIndex].listItems.splice(listItemIndex, 1);

    //             //Execute the provided callback method once the command has been successfully executed
    //             commandSucceededCallback();
    //         }
    //     };

    //     //Set up the callback method to execute when a List Item matching the given ID is found
    //     var runCommand = function(data, listIndex, listItemIndex)
    //     {
    //         //Set up the callback method to execute once the given command has been executed successfully 
    //         var commandSucceededCallback = function(args)
    //         {       
    //             //Store the updated data object
    //             storeListData(data);

    //             //Execute the provided callback method, passing the returned arguments if not null
    //             args != null ? callback(args) : callback();
    //         };

    //         //Execute the method matching the given command
    //         commands[command](data, listIndex, listItemIndex, commandSucceededCallback);
    //     }

    //     //Search for the List Item in storage and, if it's found, execute the method matching the given command
    //     findListItemInStorage(listId, listItemId, runCommand);
    // }

    return {
        // GetListStorageData : getListStorageData,
        // AddListToStorage : addListToStorage,
        // ModifyList : modifyList,
        // ModifyListItem : modifyListItem,

        RetrieveChecklistData : getParsedDataFromStorage,
        StoreChecklistData : storeListData
    };
})();  