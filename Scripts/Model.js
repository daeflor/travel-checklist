window.Model = (function() 
{
    function addList()
    {
        var newList = {
			id : new Date().getTime(), 
            name : '',
            type: '0',
            listItems : []
        };
        
        window.StorageManager.AddListToStorage(newList);
    }

    function editListName(listId, updatedName)
    {
        window.StorageManager.EditListNameInStorage(listId, updatedName);
    }

    function removeList(listId)
    {
        window.StorageManager.RemoveListFromStorage(listId);
    }

    function addListItem(listId)
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
        
        window.StorageManager.AddListItemToStorage(listId, newListItem);
    }

    function editListItemName(listId, listItemId, updatedName)
    {
        window.StorageManager.EditListItemNameInStorage(listId, listItemId, updatedName);
    }

    //TODO It might not be possible to know the quantity type
    function editListItemQuantity(listId, listItemId, quantityType, updatedValue)
    {
        window.StorageManager.EditListItemQuantityInStorage(listId, listItemId, quantityType, updatedValue);
    }

    function removeListItem(listId, listItemId)
    {
        window.StorageManager.RemoveListItemFromStorage(listId, listItemId);
    }

    return {
        AddList : addList,
        EditListName : editListName,
        RemoveList : removeList,
        AddListItem : addListItem,
        EditListItemName : editListItemName,
        EditListItemQuantity : editListItemQuantity,
        RemoveListItem : removeListItem
    };
})();