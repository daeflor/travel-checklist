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

    function clearListQuantityColumn(listId, quantityType, callback)
    {
        window.StorageManager.ClearListQuantityColumnInStorage(listId, quantityType, callback);
    }

    function removeListItem(listId, listItemId)
    {
        window.StorageManager.RemoveListItemFromStorage(listId, listItemId);
    }

    return {
        LoadData : loadData,
        CreateList : createList,
        EditListName : editListName,
        RemoveList : removeList,
        CreateListItem : createListItem,
        EditListItemName : editListItemName,
        EditListItemQuantity : editListItemQuantity,
        ClearListQuantityColumn : clearListQuantityColumn,
        RemoveListItem : removeListItem
    };
})();
