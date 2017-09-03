function Grid(gridElement)
{
    var element = gridElement;
    var rows = [];

    return { 
        GetElement : function()
        {
            return element;
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
        GetStorageData : function()
        {
            var rowData = [];
            //console.log('There are currently ' + rows.length + ' item rows.');
    
            for (var i = 0; i < rows.length; i++)
            {
                rowData.push(rows[i].GetStorageData());
                //console.log('Saved the values for Row ' + i + '. Name = ' + rowValues[i][0]);
            }

            //console.log('There are ' + rowValues.length + ' rows getting saved to local storage.');
            return rowData;
        },
        RemoveRow : function(rowElementToRemove)
        {
            var index = $(rowElementToRemove).index(); //TODO could use a custom data-index to avoid jquery, but doesn't seem necessary
            //rowElementToRemove.GetIndex();
            console.log("Index of row to be removed: " + index + ". Class name of row to be removed: " + rowElementToRemove.className);  
            
            if(index > -1) 
            {
                rows.splice(index, 1);
                element.removeChild(rowElementToRemove);
                console.log("Removed row at index " + index + ". Number of Row Items in Grid's list is now: " + rows.length);
            }
            else
            {
                console.log("Failed to remove row from grid. Row index returned invalid value.");
            }
        },
        AddRow : function(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
        {
            var itemRow = new Row(GridManager.GetNextRowId(), itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity);

            rows.push(itemRow);
            
            element.appendChild(itemRow.GetDiv()); 
            //itemRow.ExpandSettings();
            //TODO would be nice if new rows auto-expanded when created, but this needs a bit more work
        },
        ClearQuantityColumnValues : function(columnIndex)
        {
            for (var i = 0; i < rows.length; i++)
            {
                rows[i].ClearQuantityValue(columnIndex);
            } 
        },
        CollapseSettings : function()
        {
            for (var i = 0; i < rows.length; i++)
            {    
                rows[i].CollapseSettings();
            }
        }
    };
}