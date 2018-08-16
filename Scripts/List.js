function List(data)
{
    //TODO should there be error checking to ensure all the data needed is actually provided when the List is created?
    //var element = CreateNewElement('div', [ ['id',data.id], ['class','container-fluid'], ['hidden', 'true'] ]);
    var rows = [];
    //var toggle = new ListToggle(data.name, data.id);

    console.log("List created, with ID: " + data.id);

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
        'deleteButtonPressed', 
        function() {
            window.GridManager.RemoveList(data.id);
        }, 
        {id:data.id}
    );

    function RemoveListItem(listItemId)
    {
        for (var i = rows.length-1; i >= 0; i--)
        {
            if (rows[i].GetId() == listItemId)
            {
                rows.splice(i, 1);
                break;
            }
        } 

        Model.RemoveListItem(data.id, listItemId);
        window.View.Render('removeListItem', {listItemId:listItemId});
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
            //return toggle.GetName(); //TODO this is pretty janky
        },
        GetType : function()
        {
            return data.type;
        },
        // GetToggle : function()
        // {
        //     return toggle;
        // },
        GetHighestListItemId : function() //TODO this is temp and hacky
        {
            if (rows.length == 0)
            {
                return null;
            }
            else 
            {
                return rows[rows.length-1].GetId();
            }
        },
        // ToggleElementVisibility : function() //TODO this needs to be addressed
        // {
        //     if (element.hidden == true)
        //     {
        //         element.hidden = false;
        //     }
        //     else
        //     {
        //         element.hidden = true;
        //     }
        // },
        // GetDataForStorage : function()
        // {
        //     var listItemData = [];     

        //     for (var i = 0; i < rows.length; i++)
        //     {
        //         listItemData.push(rows[i].GetDataForStorage());
        //     }

        //     //TODO Getting info from the DOM is all a TEMP hack while the storage refactor is in progress
        //     return new ListStorageData({
        //         id: data.id, 
        //         name: document.getElementById('NameButton-'.concat(data.id)).textContent, 
        //         type: data.type, 
        //         listItems: listItemData
        //     });
        // },
        LoadListItem : function(listItemData)
        {
            var itemRow = new ListItem(listItemData.id, listItemData.name, listItemData.quantities, data.id);

            rows.push(itemRow);
            
            //element.appendChild(itemRow.GetWrapper());

            //Add an event listener to the Delete Button to remove the List Item
            window.View.Bind(
                'deleteButtonPressed', 
                function() {
                    RemoveListItem(listItemData.id);
                }, 
                {id:listItemData.id}
            );
            //window.View.Bind('deleteButtonPressed', function() {RemoveListItem(listItemData.id)}, {listItemId:listItemData.id});
        },
        AddNewListItem : function()
        {
            window.Model.CreateListItem(
                data.id,
                function(newListItem) {
                    rows.push(new ListItem(newListItem.id, newListItem.name, newListItem.quantities, data.id));
                    
                    window.View.Bind(
                        'deleteButtonPressed', 
                        function() {
                            RemoveListItem(newListItem.id);
                        }, 
                        {id:newListItem.id}
                    );

                    window.View.Render(
                        'ExpandSettingsView', 
                        {id:newListItem.id}
                    );
                }
            );

            ///

            // var listItemId = new Date().getTime();
            // var itemRow = new ListItem(listItemId, "", {needed:0, luggage:0, wearing:0, backpack:0}, data.id);

            // rows.push(itemRow);
            
            // //element.appendChild(itemRow.GetWrapper());

            // window.Model.AddListItem(data.id);

            // //Add an event listener to the Delete Button to remove the List Item
            // window.View.Bind(
            //     'deleteButtonPressed', 
            //     function() {
            //         RemoveListItem(listItemId);
            //     }, 
            //     {id:listItemId}
            // );
            // //window.View.Bind('deleteButtonPressed', function() {RemoveListItem(listItemId)}, {listItemId:listItemId});
            
            // //Manually trigger the Settings View to begin expanding and bring focus to the Text Area to edit the List Item name
            // window.View.Render('ExpandSettingsView', {id:listItemId});
            // //itemRow.ExpandSettings();
        },
        ClearQuantityColumnValues : function(quantityType)
        {
            for (var i = 0; i < rows.length; i++)
            {
                rows[i].ClearQuantityValue(quantityType);
            } 
        }
    };
}