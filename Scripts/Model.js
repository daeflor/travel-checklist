window.Model = (function() {

    function createListItem(listId)
    {
        var newListItem = {
			id : window.GridManager.GetNextRowId(), //TODO this won't work anymore 
            name : '',
            quantities : {
                needed: 0,
                luggage: 0,
                wearing: 0,
                backpack: 0
            }
        };
        
        window.StorageManager.StoreNewListItem(listId, newListItem);
    }

    return {
        CreateListItem : createListItem
    };
})();