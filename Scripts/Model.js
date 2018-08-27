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

    function editListName(listId, updatedValue)
    {
        window.StorageManager.EditListNameInStorage(listId, updatedValue);
    }

    function clearListQuantityColumn(listId, quantityType, callback)
    {
        window.StorageManager.ClearListQuantityColumnInStorage(listId, quantityType, callback);
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

    function editListItemName(listId, listItemId, callback, updatedName)
    {
        window.StorageManager.ModifyListItem('EditName', listId, listItemId, callback, {updatedName:updatedName});
        //window.StorageManager.EditListItemNameInStorage(listId, listItemId, updatedValue);
    }

    function moveListItemUpwards(listId, listItemId, callback)
    {
        window.StorageManager.ModifyListItem('MoveUpwards', listId, listItemId, callback);
        // //TODO don't like this name much
        // window.StorageManager.MoveListItemUpwardsInStorage(listId, listItemId, callback);
    }

    //TODO Can these be standardized to work for both List and List Item, and both Up and Down?
    function moveListItemDownwards(listId, listItemId, callback)
    {
        window.StorageManager.ModifyListItem('MoveDownwards', listId, listItemId, callback);
        //window.StorageManager.MoveListItemDownwardsInStorage(listId, listItemId, callback);
    }

    function editListItemQuantity(listId, listItemId, quantityType, assignmentType, callback)
    {
        window.StorageManager.ModifyListItem('EditQuantityValue', listId, listItemId, callback, {quantityType:quantityType, assignmentType:assignmentType});
        //window.StorageManager.EditListItemQuantityInStorage(listId, listItemId, quantityType, assignmentType, callback);
    }

    function removeListItem(listId, listItemId, callback)
    {
        window.StorageManager.ModifyListItem('Remove', listId, listItemId, callback);
        //window.StorageManager.RemoveListItemFromStorage(listId, listItemId);
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
