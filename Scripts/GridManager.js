window.GridManager = function()
{
    var divGrid;
    var rows = [];
    document.addEventListener('DOMContentLoaded', function(){divGrid = document.getElementById('grid')});

    //console.log('GridManager accessed for first time');

    //TODO could possibly set up button events and other elements here
    // function SetupGridElements()
    // {
    // }

    function ItemRow(row)
    {
        //var row = row;
        var itemColumn = row.children[0];
        var item = row.children[0].children[0];
        var needed = row.children[1].children[0];
        var packed = row.children[2].children[0];
        var wearing = row.children[3].children[0];
        var backpack = row.children[4].children[0];
    
        needed.oninput = SetItemColumnColor;
        packed.oninput = SetItemColumnColor;
        wearing.oninput = SetItemColumnColor;
        backpack.oninput = SetItemColumnColor;

        SetItemColumnColor();

        console.log('New Row Added');
    
        function SetItemColumnColor()
        {
            if (needed.value == 0)
            {
                itemColumn.style.backgroundColor = "grey";
            }
            else if (needed.value == (parseInt(packed.value) + parseInt(wearing.value) + parseInt(backpack.value)))
            {
                itemColumn.style.backgroundColor = "green";
            }
            else
            {
                itemColumn.style.backgroundColor = "orange";
            }
        }

        return { 
            GetRowValues : function()
            {
                return [item.value, needed.value, packed.value, wearing.value, backpack.value];
            }
        };
    }

    function AddInputElement(type, parent, value, cssClass, min)
    {
        var input = document.createElement('input');
        input.type = type;
        input.value = value;
        input.className = cssClass;
        input.min = min;
        parent.appendChild(input);
    }

    function CreateItemColumn(name)
    {
        var divCol = document.createElement('div');
        divCol.className = "col-3"; 
        //divCol.style.backgroundColor = "grey";
        //parent.appendChild(divCol);
        AddInputElement("text", divCol, name);

        return divCol;
    }

    function CreateQuantityColumn(quantity)
    {
        divCol = document.createElement('div');
        divCol.className = "col"; 
        divCol.style.backgroundColor = "bisque";
        //parent.appendChild(divCol);
        AddInputElement("number", divCol, quantity, "quantity", 0);

        return divCol;
    }

    function CreateRow(itemName, neededQuantity, packedQuantity, wearingQuantity, backpackQuantity)
    {
        var divRow = document.createElement('div');
        divRow.className = "row"; 

        divRow.appendChild(CreateItemColumn(itemName));
        divRow.appendChild(CreateQuantityColumn(neededQuantity));
        divRow.appendChild(CreateQuantityColumn(packedQuantity));
        divRow.appendChild(CreateQuantityColumn(wearingQuantity));
        divRow.appendChild(CreateQuantityColumn(backpackQuantity));
    
        //CreateItemColumn(divRow, itemName);
    
        // CreateQuantityColumn(divRow, neededQuantity);
        // CreateQuantityColumn(divRow, packedQuantity);
        // CreateQuantityColumn(divRow, wearingQuantity);
        // CreateQuantityColumn(divRow, backpackQuantity);
    
        divGrid.insertBefore(divRow, divGrid.children[divGrid.childElementCount-3]);    

        //var itemRow = new ItemRow(divRow);

        rows.push(new ItemRow(divRow));
    }

    return { 
        GetNumRows : function()
        {
            return rows.length; 
        },
        // GetValuesAtRow : function(index)
        // {
        //     return rows[index].GetRowValues();
        // },
        GetAllRowValues : function()
        {
            var rowValues = [];

            //console.log('There are currently ' + rows.length + ' item rows.');

            for (var i = 0; i < rows.length; i++)
            {
                console.log('Row ' + i + ' : ' + rows[i]);
                rowValues.push(rows[i].GetRowValues());
                //console.log('Saved the values for row ' + i);
                console.log('Row ' + i + ' : name = ' + rowValues[i][0]);
            }

            console.log('There are ' + rowValues.length + ' rows getting saved to local storage.');
            return rowValues;
        },
        AddNewRow : function()
        {
            CreateRow("", 0, 0, 0, 0);
            
            // var divRow = document.createElement('div');
            // divRow.className = "row"; 
        
            // CreateItemColumn(divRow, "");
        
            // for (var i = 0; i < 4; i++)
            // {
            //     CreateQuantityColumn(divRow, 0);
            // }
        
            // this.parentElement.insertBefore(divRow, this.parentElement.children[this.parentElement.childElementCount-3]);    

            // var itemRow = new ItemRow(divRow);

            // rows.push(itemRow);
        },
        // RecreateRow : function(itemName, neededQuantity, packedQuantity, wearingQuantity, backpackQuantity)
        // {
        //     var divRow = document.createElement('div');
        //     divRow.className = "row"; 
        
        //     CreateItemColumn(divRow, itemName);
        
        //     CreateQuantityColumn(divRow, neededQuantity);
        //     CreateQuantityColumn(divRow, packedQuantity);
        //     CreateQuantityColumn(divRow, wearingQuantity);
        //     CreateQuantityColumn(divRow, backpackQuantity);
        
        //     this.parentElement.insertBefore(divRow, this.parentElement.children[this.parentElement.childElementCount-3]);    

        //     var itemRow = new ItemRow(divRow);

        //     rows.push(itemRow);
        // },
        RecreateRowsFromStorage : function(rowValues)
        {
            console.log('Row Values from local storage : ' + rowValues);
            console.log('There are ' + rowValues.length + ' rows saved in local storage.');
            for (var i = 0; i < rowValues.length; i++)
            {
                console.log('Row ' + i + ' : name = ' + rowValues[i][0]);
                CreateRow(rowValues[i][0], rowValues[i][1], rowValues[i][2], rowValues[i][3], rowValues[i][4]);
            }
        }
    };
}();