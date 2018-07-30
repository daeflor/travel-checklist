function List(data)
{
    var element = CreateNewElement('div', [ ['class','container-fluid'], ['hidden', 'true'] ]);
    var rows = [];
    var type = data.type; //TODO is it necessary to save these variables? (Maybe just store them in storage instead)
    var toggle = new ListToggle(data.name, data.id);

    return { 
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
            var data = [];
            
            data.push(toggle.GetName());
            data.push(type);

            for (var i = 0; i < rows.length; i++)
            {
                data.push(rows[i].GetDataForStorage());
            }

            return data;
        },
        RemoveRow : function(rowElementToRemove)
        {
            var index = $(rowElementToRemove).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary
            //rowElementToRemove.GetIndex();
            console.log("Index of row to be removed: " + index + ". Class name of row to be removed: " + rowElementToRemove.className);  
            
            if(index > -1) 
            {
                rows.splice(index, 1);
                element.removeChild(rowElementToRemove);
                console.log("Removed row at index " + index + ". Number of Row Items in List's list is now: " + rows.length);
            }
            else
            {
                console.log("Failed to remove row from grid. Row index returned invalid value.");
            }
        },
        AddRow : function(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
        {
            var itemRow = new ListItem(GridManager.GetNextRowId(), itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity);

            rows.push(itemRow);
            
            element.appendChild(itemRow.GetWrapper());
            
            //return itemRow;
        },
        AddNewRow : function()
        {
            var itemRow = new ListItem(GridManager.GetNextRowId(), "", 0, 0, 0, 0);

            rows.push(itemRow);
            
            element.appendChild(itemRow.GetWrapper());
            
            itemRow.ExpandSettings();
        },
        ClearQuantityColumnValues : function(columnIndex)
        {
            for (var i = 0; i < rows.length; i++)
            {
                rows[i].ClearQuantityValue(columnIndex);
            } 
        }
    };
}