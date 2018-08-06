function List(data)
{
    //TODO should there be error checking to ensure all the data needed is actually provided when the List is created?
    var element = CreateNewElement('div', [ ['class','container-fluid'], ['hidden', 'true'] ]);
    var rows = [];
    var type = data.type; //TODO is it necessary to save these variables? (Maybe just store them in storage instead)
    var toggle = new ListToggle(data.name, data.id);

    // function GetNextListItemId()
    // {
    //     if (rows.length == 0)
    //     {
    //         return parseFloat(data.id + '.' + 0);
    //     }
    //     else 
    //     {   
    //         console.log("Current highest List Item ID is: " + data.id + "." + (rows[rows.length-1].GetId()));
    //         return parseFloat(data.id + '.' + (rows[rows.length-1].GetId()+1));
    //         //return (rows[rows.length-1].GetId()+1);
    //     }
    // }

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
        AddListItem : function(listItemData)
        {
            var itemRow = new ListItem(listItemData.id, listItemData.name, listItemData.quantities, );

            rows.push(itemRow);
            
            element.appendChild(itemRow.GetWrapper());
            
            itemRow.UpdateColor(); //TODO shouldn't have to force call this here.
        },
        AddNewRow : function()
        {
            var itemRow = new ListItem(new Date().getTime(), "", {needed:0, luggage:0, wearing:0, backpack:0});

            rows.push(itemRow);
            
            element.appendChild(itemRow.GetWrapper());

            itemRow.UpdateColor(); //TODO shouldn't have to force call this here.
            
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