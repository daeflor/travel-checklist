window.GridManager = function()
{
    var divGrid;
    var rows = [];
    var activePopover = null;

    function ItemRow()
    {
        var itemColumn;
        var item;
        var needed;
        var luggage;
        var wearing;
        var backpack;

        function SetItemColumnColor()
        {
            if (needed.text == 0)
            {
                itemColumn.style.backgroundColor = "darkgrey";
            }
            else if (needed.text == (parseInt(luggage.text) + parseInt(wearing.text) + parseInt(backpack.text)))
            {
                itemColumn.style.backgroundColor = "mediumseagreen";
            }
            else
            {
                itemColumn.style.backgroundColor = "peru";
            }
        }

        return { 
            //TODO should probably just pass the different elements directly as params
            SetupRowElements : function(row)
            {
                itemColumn = row.children[1];
                item = itemColumn.children[0];
                needed = row.children[2].children[0];
                luggage = row.children[3].children[0];
                wearing = row.children[4].children[0];
                backpack = row.children[5].children[0];

                SetItemColumnColor();
            },
            GetRowValues : function()
            {
                return [item.value, needed.text, luggage.text, wearing.text, backpack.text];
            },
            //TODO could an enum be used for the different quantities and then pass a number which corresponds to one of the quantities
            //TODO does it really make sense for this to be part of itemRow? 
            ModifyQuantityValue : function(quantityElement, increase)
            {
                console.log("Request called to modify a quantity value.");

                if (increase == true)
                {
                    quantityElement.text = parseInt(quantityElement.text) + 1;
                    SetItemColumnColor();
                    UpdateGrid();
                }
                else if (parseInt(quantityElement.text) > 0)
                {
                    quantityElement.text = parseInt(quantityElement.text) - 1;
                    SetItemColumnColor();
                    UpdateGrid();
                }
            }
        };
    }

    //TODO creating an element and object (for the row list) should maybe be handled separately from one another
    function CreateRow(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
    {
        var itemRow = new ItemRow();

        var divRow = CreateNewElement('div', [ ['class','row divItemRow'] ]); 

        divRow.appendChild(CreateEditColumn());
        
        divRow.appendChild(CreateItemColumn(itemName));
        //TODO should popovers really know about their row object? Probably not
            //Maybe these sub-elements should be part of the ItemRow
        divRow.appendChild(CreateQuantityPopover(itemRow, neededQuantity));
        divRow.appendChild(CreateQuantityPopover(itemRow, luggageQuantity));
        divRow.appendChild(CreateQuantityPopover(itemRow, wearingQuantity));
        divRow.appendChild(CreateQuantityPopover(itemRow, backpackQuantity));
    
        //rows.push(new ItemRow(divRow));
        itemRow.SetupRowElements(divRow);
        rows.push(itemRow);
        return divRow;
        //AddElementToGrid(divRow, document.getElementById('buttonAddRow'));
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

    function CreateEditColumn()
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

        var buttonEdit = CreateNewElement('a', [ ['class','btn buttonEdit'], ['href','#!'], ['tabIndex','0'] ], iconEdit);

        $(buttonEdit).popover(
        {
            placement: 'bottom',
            animation: true,
            html: true,
            trigger: 'focus',
            content: '<div class="popoverElement"><button id="buttonTrash" class="btn" type="button"><i class="fa fa-trash"></i></button></div>'
        }); //TODO For trash we do actually want the popover to go away when it's clicked... but for move up/down, we probably won't... Is popoverElement class necessary?

        $(buttonEdit).on ('shown.bs.popover', function() 
        {
            //console.log("Popup has been opened; onclick event will be set.");
            
            document.getElementById('buttonTrash').addEventListener('click', function()
            {
                RemoveRowFromGrid(buttonEdit.parentElement.parentElement);
            });
        });

        return CreateNewElement('div', [ ['class','col-1 divEdit'] ], buttonEdit);
    }  

    function CreateItemColumn(itemName)
    {
        var textareaItemName = CreateNewElement('textarea');
        textareaItemName.value = itemName;
        textareaItemName.onchange = UpdateGrid;
        var divCol = CreateNewElement('div', [ ['class','col-4 divItemName'] ], textareaItemName);
        return divCol;
    }

    function CreateQuanitytButton(buttonId, iconClass)
    {
        //var icon = CreateNewElement('i', [['class',iconClass]]);

        return CreateNewElement(
            'button', 
            [['id',buttonId], ['class','btn btn-lg buttonEditQuantity popoverElement'], ['type','button']], 
            CreateNewElement('i', [['class',iconClass]])
        );
    }

    /** **/

    function HideActiveQuantityPopover(e)
    {     
        //TODO this is very hacky, and relies not only on my own class names but Bootstrap's too.
            //Does a quantity group function (object) make sense? To have this more controlled
        if (!e.target.className.includes('popover')) //ignore any clicks on any elements within a popover
        {
            document.removeEventListener('click', HideActiveQuantityPopover);
            $(activePopover).popover('hide');
        }
    }

    //TODO is it possible to pass itemRow's function instead of the object itself?
    function CreateQuantityPopover(itemRow, quantity)
    {
        /* Create Popup Elements */
        var buttonMinus = CreateQuanitytButton('buttonMinus', 'fa fa-minus-circle fa-lg popoverElement');
        var buttonPlus = CreateQuanitytButton('buttonPlus', 'fa fa-plus-circle fa-lg popoverElement');
        var divPopover = CreateNewElement('div', [ ['class','popoverElement'] ]); 
        divPopover.appendChild(buttonMinus);
        divPopover.appendChild(buttonPlus);

        /* Create Quantity Button Elements */
        var buttonQuantity = CreateNewElement('a', [ ['class','btn btn-sm buttonQuantity'], ['href','#!'], ['tabIndex','0'] ]); //Could also use 'javascript://' for the href attribute
        buttonQuantity.text = quantity;

        //TODO can probably do all this on a class basis, affecting all quantity buttons at once. But does it make any difference? Not really...
        $(buttonQuantity).popover(
        {
            placement: 'bottom',
            animation: true,
            html: true,
            trigger: 'manual',
            content: divPopover.outerHTML
        }); 

        buttonQuantity.addEventListener('click', function() 
        {
            //If there is already a popover active, remove focus from the selected quantity button. Otherwise, show the button's popover. 
            if(activePopover == null)
            {
                $(buttonQuantity).popover('show');
            }
            else
            {
                buttonQuantity.blur();
            }
        });

        $(buttonQuantity).on('shown.bs.popover', function() 
        {
            activePopover = buttonQuantity;

            document.getElementById('buttonMinus').addEventListener('click', function() 
            {
                itemRow.ModifyQuantityValue(buttonQuantity, false);
            });         
            document.getElementById('buttonPlus').addEventListener('click', function() 
            {
                itemRow.ModifyQuantityValue(buttonQuantity, true);
            }); 

            document.addEventListener('click', HideActiveQuantityPopover);
        });

        $(buttonQuantity).on('hidden.bs.popover', function()
        {
            activePopover = null;
        });

        return CreateNewElement('div', [ ['class','col divQuantity'] ], buttonQuantity);        
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

    // function ModifyElementInGrid(element, attribute, value)
    // {
    //     element.setAttribute(attribute, value);
    //     UpdateGrid();
    // }

    function UpdateGrid()
    {
        StoreGrid();
    }

    /** Helpers **/

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
                    element.setAttribute(attributes[i][0], attributes[i][1]);
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

    /** **/

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
            AddElementToGrid(CreateRow("", 0, 0, 0, 0), document.getElementById('newRow'));
        },
        RecreateRowsFromStorage : function(rowValues)
        {
            //console.log('Row Values from local storage : ' + rowValues);
            console.log('There are ' + rowValues.length + ' rows saved in local storage.');
            for (var i = 0; i < rowValues.length; i++)
            {
                console.log('Row ' + i + ' : name = ' + rowValues[i][0]);
                AddElementToGrid(CreateRow(rowValues[i][0], rowValues[i][1], rowValues[i][2], rowValues[i][3], rowValues[i][4]), document.getElementById('newRow'), false);
            }
        }
    };
}();