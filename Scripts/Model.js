window.Model = (function() 
{
    function loadData(callback)
    {
        callback(window.StorageManager.GetListStorageData());
    }

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

    function editListName(listId, callback, updatedName)
    {
        window.StorageManager.ModifyList('EditName', listId, callback, {updatedName:updatedName});
    }

    function clearListQuantityColumn(listId, quantityType, callback)
    {
        window.StorageManager.ModifyList('ClearQuantityValues', listId, callback, {quantityType:quantityType});
    }

    function removeList(listId, callback)
    {
        window.StorageManager.ModifyList('Remove', listId, callback);
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
        
        window.StorageManager.ModifyList('AddListItem', listId, callback, {newListItem:newListItem});
    }

    function editListItemName(listId, listItemId, callback, updatedName)
    {
        window.StorageManager.ModifyListItem('EditName', listId, listItemId, callback, {updatedName:updatedName});
    }

    function moveListItemUpwards(listId, listItemId, callback)
    {
        window.StorageManager.ModifyListItem('MoveUpwards', listId, listItemId, callback);
    }

    //TODO Can these be standardized to work for both List and List Item, and both Up and Down?
    function moveListItemDownwards(listId, listItemId, callback)
    {
        window.StorageManager.ModifyListItem('MoveDownwards', listId, listItemId, callback);
    }

    function editListItemQuantity(listId, listItemId, quantityType, assignmentType, callback)
    {
        //TODO Should probably move the logic here to the Controller?...

        if (assignmentType == 'decrement')
        {
            window.StorageManager.ModifyListItem('DecrementQuantityValue', listId, listItemId, callback, {quantityType:quantityType, assignmentType:assignmentType});
        }
        else if(assignmentType == 'increment')
        {
            window.StorageManager.ModifyListItem('IncrementQuantityValue', listId, listItemId, callback, {quantityType:quantityType, assignmentType:assignmentType});
        }
    }

    function removeListItem(listId, listItemId, callback)
    {
        window.StorageManager.ModifyListItem('Remove', listId, listItemId, callback);
    }

    //TODO RemoveObject and EditName could help consolidate code, here, in StorageManager, and Controllers

    //TODO Update this file to use methods similar to Render or Bind in the View
    return {
        LoadData : loadData,
        CreateList : createList,
        EditListName : editListName,
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
