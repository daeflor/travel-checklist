function List(data)
{
    //TODO should there be error checking to ensure all the data needed is actually provided when the List is created?
    var element = CreateNewElement('div', [ ['class','container-fluid'], ['hidden', 'true'] ]);
    var rows = [];
    var type = data.type; //TODO is it necessary to save these variables? (Maybe just store them in storage instead)
    var toggle = new ListToggle(data.name, data.id);

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
        AddListItem : function(data)
        {
            var itemRow = new ListItem(data.id, data.name, data.quantities);

            rows.push(itemRow);
            
            element.appendChild(itemRow.GetWrapper());
        },
        AddNewRow : function()
        {
            var itemRow = new ListItem(window.GridManager.GetNextRowId(), "", 0, 0, 0, 0);

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