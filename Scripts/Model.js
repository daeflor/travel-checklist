window.Model = (function() {

    function createList(listId)
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
        
        window.StorageManager.StoreNewListItem(listId, newListItem);
    }

    function createListItem()
    {
        var newList = {
			id : new Date().getTime(), 
            name : '',
            type: '0',
            listItems : []
        };
        
        window.StorageManager.StoreNewList(newList);
    }

    return {
        CreateListItem : createListItem
    };
})();