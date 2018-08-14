window.Model = (function() 
{
    function loadListData(callback)
    {
        var lists = window.StorageManager.GetListStorageData();

        //Traverse all the Lists in the object returned from storage
        for (var i = 0; i < lists.length; i++) 
        {
            //TODO Long term it should be simplified so that the lists aren't 'recreated'


            //Create a new List based on the parsed data
            var list = new List({
                id: lists[i].id, 
                name: lists[i].name, 
                type: lists[i].type
            });

            //TODO really should probably just pass along all the list data to the Controller and then View to recreate it in the DOM
            
            //TODO The Model shouldn't interact directly with the View
            //TODO Shouldn't be passing element data to the View. The View should take care of that using IDs
            //window.View.Render('addList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});
            callback(list);

            console.log("Regenerating List. Index: " + i + " Name: " + list.GetName() + " Type: " + list.GetType() + " ----------");
            
            //Check if there is a 'listItems' object in the parsed storage data for the current list
            if (lists[i].listItems !== null)
            {
                //Traverse all the List Items belonging to the current list, in local storage
                for (var j = 0; j < lists[i].listItems.length; j++) 
                {
                    if (list.GetType() == ListType.Travel)
                    {
                        console.log("List: " + i + ". Row: " + j + ". Item: " + lists[i].listItems[j].name);
                        
                        //Add a row to current List, passing along the data parsed from storage
                        list.LoadListItem({
                            id: lists[i].listItems[j].id, 
                            name: lists[i].listItems[j].name, 
                            quantities: lists[i].listItems[j].quantities
                        });

                        //TODO maybe ListItems should get added to the View here...? hmm no the model shouldn't talk to the View
                    }
                    else if (list.GetType() == null)
                    {
                        console.log("ERROR: Tried to load a List with a ListType of null from storage");
                    }
                }
            }
            else
            {
                console.log("ERROR: Tried to load list item data from storage but no listItems object could be found for the current list");
            }
        }
    }

    //TODO Maybe getting the quantity data is too specific. Could just get all the ListItem data and then parse it later
    // function getListItemQuantityData(listId, listItemId)
    // {
    //     return window.StorageManager.GetListItemDataFromStorage(listId, listItemId).quantities;
    // } //TODO use this to then get the balance, rather than getting it from soon-to-be-deprecated 'ListItemModifier' or the DOM
    
    function createList(callback)
    {
        var newList = {
			id : new Date().getTime(), 
            name : '',
            type: ListType.Travel,
            listItems : []
        };
        
        window.StorageManager.AddListToStorage(newList, callback);
    }

    function editListName(listId, updatedValue)
    {
        window.StorageManager.EditListNameInStorage(listId, updatedValue);
    }

    function removeList(listId)
    {
        window.StorageManager.RemoveListFromStorage(listId);
    }

    function createListItem(listId, callback)
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
        
        window.StorageManager.AddListItemToStorage(listId, newListItem, callback);
    }

    function editListItemName(listId, listItemId, updatedValue)
    {
        window.StorageManager.EditListItemNameInStorage(listId, listItemId, updatedValue);
    }

    function editListItemQuantity(listId, listItemId, quantityType, assignmentType, callback)
    {
        window.StorageManager.EditListItemQuantityInStorage(listId, listItemId, quantityType, assignmentType, callback);
    }

    function removeListItem(listId, listItemId)
    {
        window.StorageManager.RemoveListItemFromStorage(listId, listItemId);
    }

    return {
        LoadListData : loadListData,
        CreateList : createList,
        EditListName : editListName,
        RemoveList : removeList,
        CreateListItem : createListItem,
        EditListItemName : editListItemName,
        EditListItemQuantity : editListItemQuantity,
        RemoveListItem : removeListItem
    };
})();
