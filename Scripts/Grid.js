function Grid(gridElement)
{
    var element = gridElement;
    var rows = [];

    //TODO does it make sense to track active state here?

    return { 
        GetRowList : function()
        {
            return rows;
        },
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
        // AddChildElement : function(elementToAdd)
        // {
        //     element.appendChild(elementToAdd);  
        // },
        RemoveChildElement : function(elementToRemove)
        {
            element.removeChild(elementToRemove);
        },
        AddRow : function(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
        {
            var itemRow = new Row(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity);

            rows.push(itemRow);

            element.appendChild(itemRow.GetDiv()); 
        }
    };
}