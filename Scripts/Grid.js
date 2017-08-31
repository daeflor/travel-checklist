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
        //TODO creating an element and object (for the row list) should maybe be handled separately from one another
        //TODO some of these might make more sense in the Row class
        AddRow : function(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
        {
            var itemRow = new Row();

            var divRow = CreateNewElement('div', [ ['class','row divItemRow'] ]); 

            divRow.appendChild(CreatePopoverEdit());
            
            divRow.appendChild(CreateItemColumn(itemName));

            //TODO should popovers really know about their row object? Probably not
                //Maybe these sub-elements should be part of the ItemRow
            divRow.appendChild(CreateQuantityPopover(itemRow, neededQuantity));
            divRow.appendChild(CreateQuantityPopover(itemRow, luggageQuantity));
            divRow.appendChild(CreateQuantityPopover(itemRow, wearingQuantity));
            divRow.appendChild(CreateQuantityPopover(itemRow, backpackQuantity));
        
            itemRow.SetupRowElements(divRow);
            rows.push(itemRow);

            //TODO this is all quite messy. Take some time to clean up row creation. Really this should be happening in the Row 'class'.
            element.appendChild(divRow); 
        }
    };
}