window.GridManager = function()
{
    var divGrid;
    var rows = [];

    function ItemRow(row)
    {
        var itemColumn = row.children[1];
        var item = itemColumn.children[0];
        var needed = row.children[2].children[0];
        var luggage = row.children[3].children[0];
        var wearing = row.children[4].children[0];
        var backpack = row.children[5].children[0];
    
        needed.oninput = SetItemColumnColor;
        luggage.oninput = SetItemColumnColor;
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
            else if (needed.value == (parseInt(luggage.value) + parseInt(wearing.value) + parseInt(backpack.value)))
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
                return [item.value, needed.value, luggage.value, wearing.value, backpack.value];
            }
        };
    }

    function UpdateGrid()
    {
        StoreGrid();
    }

    function AddElementToGrid(elementToAdd, elementToPrecede, updateGrid=true)
    {
        //console.log("Adding element to grid: " + elementToAdd + ". Before element: " + elementToPrecede + ". UpdateGrid value: " + updateGrid)
        divGrid.insertBefore(elementToAdd, elementToPrecede);  
       
        if (updateGrid == true)
        {
            UpdateGrid();        
        }    
    }

    function RemoveElementFromGrid(elementToRemove)
    {
        divGrid.removeChild(elementToRemove);
        UpdateGrid();
    }

    function ModifyElementGrid(elementToModify, value)
    {
        /* */
        UpdateGrid();
    }
    

    function RemoveRowFromGrid(rowToRemove)
    {        
        var index = $(rowToRemove).index();
        console.log("Index of row to be removed: " + index + ". Class name of row to be removed: " + rowToRemove.className);  
        if(index > -1) 
        {
            rows.splice(index, 1);
            RemoveElementFromGrid(rowToRemove);
            console.log("Removed row at index " + index);
        }
        else
        {
            console.log("Failed to remove row from grid. Row index returned invalid value.");
        }
    }

    //TODO could change child parameter to a list of children instead
    function CreateNewElement(elementName, attributes, child)
    {
        var element;
        
        if (elementName != null)
        {
            element = document.createElement(elementName);

            if (attributes != null)
            {
                for (var i = 0; i < attributes.length; i++)
                {
                    element.setAttribute(attributes[i][0], attributes[i][1])
                }
            }

            if (child != null)
            {
                element.appendChild(child);
            }

            return element;
        }
        else
        {
            console.log("Failed to create new element. No name provided.");
        }
    }

    function CreatePopoverRowSettings()
    {
        /* Create Tooltip Elements */
        
        //var iconTrash = CreateNewElement('i', [['class','fa fa-trash']]);
        // var iconTrash = document.createElement('i');
        // iconTrash.className = 'fa fa-trash';

        //var buttonTrash = CreateNewElement('button', [['class','btn'], ['type','button']]);
        // var buttonTrash = document.createElement('button');
        // buttonTrash.type = 'button';
        // buttonTrash.className = 'btn';
        // buttonTrash.appendChild(iconTrash);

        // var divPopover = document.createElement('div');
        // divPopover.appendChild(buttonTrash);

        /* Create Edit Button Elements */
        
        var iconEdit = CreateNewElement('i', [ ['class','fa fa-pencil-square-o'] ]);
        // var iconEdit = document.createElement('i');
        // iconEdit.className = 'fa fa-pencil-square-o';

        var buttonEdit = CreateNewElement('a', [ ['class','btn buttonEdit'], ['href','#'], ['tabIndex','0'] ], iconEdit);
        //buttonEdit.appendChild(iconEdit);

        //buttonEdit.href = '#';
        //buttonEdit.tabindex = '0';

        // var buttonEdit = document.createElement('button');
        // buttonEdit.type = 'button';
        // buttonEdit.className = 'btn';

        // buttonEdit.dataset.toggle = 'popover';
        // buttonEdit.dataset.placement = 'bottom';
        // buttonEdit.dataset.html = 'true';
        // buttonEdit.dataset.animation = 'true';
        // buttonEdit.dataset.title = 'popoverTitle';
        // buttonEdit.dataset.content = divPopover.outerHTML;
        //$(buttonEdit).popover(); 

        $(buttonEdit).popover(
        {
            toggle: 'popover',
            placement: 'bottom',
            animation: true,
            html: true,
            //title: "MyPop",
            trigger: 'focus',
            //tabindex: 0,
            //href: '#',
            //delay: { "show": 0, "hide": 100 },
            content: '<div><button class="btn buttonTrash" type="button"><i class="fa fa-trash"></i></button></div>'
        }); 

        $(buttonEdit).on (
            'shown.bs.popover',
             function () 
            {
                console.log("Popup has been opened; onclick event will be set.");
                //var $buttonTrash = $(this).find('#buttonTrash');                
                $(".buttonTrash").click(function(){RemoveRowFromGrid(buttonEdit.parentElement.parentElement);});
            }
        )

        //TODO may need to dispose of popover, especially if not using unique IDs

        /* Create Div Wrapper */
        
        return CreateNewElement('div', [ ['class','col-1 columnEdit'] ], buttonEdit);
        // var divCol = document.createElement('div');
        // divCol.className = "col-1 settings"; 
        // divCol.appendChild(buttonEdit);
        // return divCol;
    }

    function CreateInputElement(type, value, cssClass, min)
    {
        // var input = document.createElement('input');
        // input.type = type;
        // input.value = value;
        // input.className = cssClass;
        // input.min = min;
        // parent.appendChild(input);

        return CreateNewElement('input', [ ['class',cssClass], ['type',type], ['value',value], ['min',min] ]);
    }

    function CreateItemColumn(itemName)
    {
        var textareaItemName = CreateNewElement('textarea');
        textareaItemName.value = itemName;
        var divCol = CreateNewElement('div', [ ['class','col-4 itemColumn'] ], textareaItemName);
        return divCol;
    }

    function CreateQuantityColumn(quantity)
    {
        return CreateNewElement('div', [ ['class','col divQuantity'] ], CreateInputElement("number", quantity, "inputQuantity", 0)); 
        // divCol = document.createElement('div');
        // divCol.className = "col"; 
        // divCol.style.backgroundColor = "bisque";
        // divCol.appendChild(CreateInputElement("number", quantity, "quantity", 0));
        // return divCol;
    }

    function CreateRow(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
    {
        var divRow = CreateNewElement('div', [ ['class','row'] ]); 

        divRow.appendChild(CreatePopoverRowSettings());
        
        divRow.appendChild(CreateItemColumn(itemName));
        divRow.appendChild(CreateQuantityColumn(neededQuantity));
        divRow.appendChild(CreateQuantityColumn(luggageQuantity));
        divRow.appendChild(CreateQuantityColumn(wearingQuantity));
        divRow.appendChild(CreateQuantityColumn(backpackQuantity));
    
        rows.push(new ItemRow(divRow));
        return divRow;
        //AddElementToGrid(divRow, document.getElementById('buttonAddRow'));
    }

    return { 
        SetGridDiv : function(div)
        {
            divGrid = div;
        },
        GetNumRows : function()
        {
            return rows.length; 
        },
        GetAllRowValues : function()
        {
            var rowValues = [];

            //console.log('There are currently ' + rows.length + ' item rows.');

            for (var i = 0; i < rows.length; i++)
            {
                //console.log('Row ' + i + ' : ' + rows[i]);
                rowValues.push(rows[i].GetRowValues());
                //console.log('Saved the values for row ' + i);
                //console.log('Row ' + i + ' : name = ' + rowValues[i][0]);
            }

            //console.log('There are ' + rowValues.length + ' rows getting saved to local storage.');
            return rowValues;
        },
        AddNewRow : function()
        {
            //CreateRow("", 0, 0, 0, 0);
            AddElementToGrid(CreateRow("", 0, 0, 0, 0), document.getElementById('buttonAddRow'));
        },
        RecreateRowsFromStorage : function(rowValues)
        {
            //console.log('Row Values from local storage : ' + rowValues);
            console.log('There are ' + rowValues.length + ' rows saved in local storage.');
            for (var i = 0; i < rowValues.length; i++)
            {
                console.log('Row ' + i + ' : name = ' + rowValues[i][0]);
                AddElementToGrid(CreateRow(rowValues[i][0], rowValues[i][1], rowValues[i][2], rowValues[i][3], rowValues[i][4]), document.getElementById('buttonAddRow'), false);
            }
        }
    };
}();