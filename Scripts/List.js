function List(data)
{
    //TODO should there be error checking to ensure all the data needed is actually provided when the List is created?
    var element = CreateNewElement('div', [ ['id',data.id], ['class','container-fluid'], ['hidden', 'true'] ]);
    var rows = [];
    var type = data.type; //TODO is it necessary to save these variables? (Maybe just store them in storage instead)
    var toggle = new ListToggle(data.name, data.id);

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
            return toggle.GetName(); //TODO this is pretty janky
        },
        GetType : function()
        {
            return type;
        },
        GetToggle : function()
        {
            return toggle;
        },
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
        ToggleElementVisibility : function()
        {
            if (element.hidden == true)
            {
                element.hidden = false;
            }
            else
            {
                element.hidden = true;
            }
        },
        GetDataForStorage : function()
        {
            var listItemData = [];     

            for (var i = 0; i < rows.length; i++)
            {
                listItemData.push(rows[i].GetDataForStorage());
            }

            return new ListStorageData({
                id: data.id, 
                name: toggle.GetName(), 
                type: type, 
                listItems: listItemData
            });
        },
        AddListItem : function(listItemData)
        {
            var itemRow = new ListItem(listItemData.id, listItemData.name, listItemData.quantities, data.id);

            rows.push(itemRow);
            
            //element.appendChild(itemRow.GetWrapper());

            //Add an event listener to the Delete Button to remove the List Item
            window.View.Bind('deleteButtonPressed', function() {RemoveListItem(listItemData.id)}, {listItemId:listItemData.id});
            
            //itemRow.Init(false);

            //itemRow.UpdateColor(); //TODO shouldn't have to force call this here.
        },
        AddNewListItem : function()
        {
            var listItemId = new Date().getTime();
            var itemRow = new ListItem(listItemId, "", {needed:0, luggage:0, wearing:0, backpack:0}, data.id);

            rows.push(itemRow);
            
            //element.appendChild(itemRow.GetWrapper());

            //Add an event listener to the Delete Button to remove the List Item
            window.View.Bind('deleteButtonPressed', function() {RemoveListItem(listItemId)}, {listItemId:listItemId});

            //itemRow.Init(true);

            // itemRow.UpdateColor(); //TODO shouldn't have to force call this here.
            
            itemRow.ExpandSettings();
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