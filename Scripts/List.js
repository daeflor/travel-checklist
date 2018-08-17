function List(data)
{
    //TODO should there be error checking to ensure all the data needed is actually provided when the List is created?

    //var rows = [];

    Print("List created, with ID: " + data.id);

    window.View.Render('AddListElements', {listId:data.id, listName:data.name});

    //When the animation to expand the Settings View starts, inform the GridManager to change the Active Settings View
    window.View.Bind(
        'SettingsViewExpansionStarted', 
        function(element) {
            window.View.Render('HideActiveSettingsView'); 
        },
        {id:data.id}
    );

    //When the Text Area to edit a list name gets modified, update the text in the List name toggle
    window.View.Bind(
        'NameEdited', 
        function(updatedValue) {
            window.Model.EditListName(data.id, updatedValue);
            window.View.Render('UpdateName', {id:data.id, updatedValue:updatedValue}); 
        },
        {id:data.id}
    );

    //Add an event listener to the Delete Button to remove the List Item
    window.View.Bind(
        'DeleteButtonPressed', 
        function() {
            window.GridManager.RemoveList(data.id);
        }, 
        {id:data.id}
    );

    function RemoveListItem(listItemId)
    {
        // for (var i = rows.length-1; i >= 0; i--)
        // {
        //     if (rows[i].GetId() == listItemId)
        //     {
        //         rows.splice(i, 1);
        //         break;
        //     }
        // } 

        Model.RemoveListItem(data.id, listItemId);
        window.View.Render('removeListItem', {listItemId:listItemId});
    }

    function loadListItem(listItemId, listItemName, quantities)
    {
        //TODO Maybe split this up into things that need to be rendered, and things that need to be bound

        window.View.Render(
            'AddListItem', 
            { //TODO would it be better to just pass a ListItem object and let the View parse it, rather than splitting up the params here?
                listItemId: listItemId, 
                listItemName: listItemName,
                quantityValues: quantities,
                listId: data.id, //TODO Don't really like calling this data.id... If List always requires exact params, maybe should just have them explicitly stated
            }
        );

        updateListItemNameColor(listItemId, quantities);

        //Bind user interaction with the quantity toggles to corresponding behavior
        for (var key in quantities)
        {
            window.View.Bind(
                'QuantityPopoverShown', 
                function(popoverToggle, quantityType) {
                    window.GridManager.SetActivePopover(popoverToggle);

                    //TODO There might be a better way to do this, where the BIND can be done when the +/- buttons are created and not when the popover is shown.

                    window.View.Bind('DecrementQuantityButtonPressed', function()
                    {   
                        updateListItemQuantityValue(listItemId, quantityType, 'decrement');
                    });
        
                    window.View.Bind('IncrementQuantityButtonPressed', function()
                    {
                        updateListItemQuantityValue(listItemId, quantityType, 'increment');
                    });
        
                    window.View.Bind('ClickDetected', window.GridManager.HideActiveQuantityPopover);
                },
                {listItemId:listItemId, quantityType:key}
            );
        }

        //When the animation to expand the Settings View starts, inform the View to hide the Active Settings View
        window.View.Bind(
            'SettingsViewExpansionStarted', 
            function(element) {
                window.View.Render('HideActiveSettingsView'); 
            },
            {id:listItemId}
        );

        //TODO might be nice to move the anonymous functions within the bindings above and below into named functions that are just reference by the bind, for potentially better readability
            //yeah it would be good to make this section smaller and more readable

        //Add an event listener for when the Text Area to edit the List Item name is modified
        window.View.Bind(
            'NameEdited', 
            function(updatedValue) {
                window.Model.EditListItemName(data.id, listItemId, updatedValue);
                window.View.Render('UpdateName', {id:listItemId, updatedValue:updatedValue}); 
            },
            {id:listItemId}
        ); 

        //Add an event listener to the Delete Button to remove the List Item
        window.View.Bind(
            'DeleteButtonPressed', 
            function() {
                RemoveListItem(listItemId);
            }, 
            {id:listItemId}
        );
    }

    function updateListItemQuantityValue(listItemId, quantityType, assignmentType)
    {
        Model.EditListItemQuantity(data.id, listItemId, quantityType, assignmentType, function(updatedQuantities) {
            updateListItemQuantityText(listItemId, quantityType, updatedQuantities);
            updateListItemNameColor(listItemId, updatedQuantities);
        });
    }

    function updateListItemQuantityText(listItemId, quantityType, updatedQuantities)
    {
        window.View.Render('updateListItemQuantityText', {
            listItemId:listItemId, 
            quantityType:quantityType, 
            updatedValue:updatedQuantities[quantityType]
        });
    }

    function updateListItemNameColor(listItemId, updatedQuantities)
    {
        window.View.Render('updateListItemNameColor', {
            listItemId:listItemId, 
            quantityNeeded:updatedQuantities.needed, 
            quantityBalance:(updatedQuantities.needed - updatedQuantities.luggage - updatedQuantities.wearing - updatedQuantities.backpack)
        });
    }

    return { 
        GetId : function()
        {
            return data.id;
        },
        GetElement : function()
        {
            return element;
        },
        GetName : function()
        {
            return data.name; //TODO this will only ever return the original name for the list during a particular session, but this is good enough for its current usage, and will be deprecated soon anyway.
        },
        GetType : function()
        {
            return data.type;
        },
        // GetHighestListItemId : function() //TODO this is temp and hacky
        // {
        //     if (rows.length == 0)
        //     {
        //         return null;
        //     }
        //     else 
        //     {
        //         return rows[rows.length-1].GetId();
        //     }
        // },
        LoadListItem : function(listItemData)
        {
            loadListItem(listItemData.id, listItemData.name, listItemData.quantities, data.id);
            //var itemRow = new ListItem(listItemData.id, listItemData.name, listItemData.quantities, data.id);

            //rows.push(itemRow);
            
            // //Add an event listener to the Delete Button to remove the List Item
            // window.View.Bind(
            //     'DeleteButtonPressed', 
            //     function() {
            //         RemoveListItem(listItemData.id);
            //     }, 
            //     {id:listItemData.id}
            // );
        },
        AddNewListItem : function()
        {
            window.Model.CreateListItem(
                data.id,
                function(newListItem) {
                    loadListItem(newListItem.id, newListItem.name, newListItem.quantities, data.id);
                    //rows.push(new ListItem(newListItem.id, newListItem.name, newListItem.quantities, data.id));
                    
                    // window.View.Bind(
                    //     'DeleteButtonPressed', 
                    //     function() {
                    //         RemoveListItem(newListItem.id);
                    //     }, 
                    //     {id:newListItem.id}
                    // );

                    window.View.Render(
                        'ExpandSettingsView', 
                        {id:newListItem.id}
                    );
                }
            );
        },
        // ClearQuantityColumnValues : function(quantityType)
        // {
        //     for (var i = 0; i < rows.length; i++)
        //     {
        //         rows[i].ClearQuantityValue(quantityType);
        //     } 
        // }
    };
}