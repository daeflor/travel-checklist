window.GridManager = function()
{
    //var divGrid;
    var activePopover = null; //TODO should there be a separate popover manager? Maybe if Grid and ItemRow classes split out from this, it will not be necessary
    var grids = [];
    var activeGrid;

    function Grid(gridElement)
    {
        var element = gridElement;
        var rows = [];

        //TODO does it make sense to track active state here?

        return { 
            // SetRowList : function(rowList)
            // {
            //     rows = rowList;
            // },
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
            AddChildElement : function(elementToAdd, updateGrid=true)
            {
                element.appendChild(elementToAdd);  
               
                //TODO should this be done elsewhere?
                if (updateGrid == true)
                {
                    UpdateGrid();        
                }    
            },
            RemoveChildElement : function(elementToRemove)
            {
                element.removeChild(elementToRemove);
            },
            //TODO creating an element and object (for the row list) should maybe be handled separately from one another
            AddRow : function(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity, updateGrid=true)
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
            
                itemRow.SetupRowElements(divRow);
                rows.push(itemRow);

                console.log("Adding a new row. 'This' element is: " + this);
                //TODO this is all quite messy. Take some time to clean up row creation. Really this should be happening in the Row 'class'.
                this.AddChildElement(divRow, updateGrid); 
                //return divRow;
            }
        };
    }

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
            GetStorageData : function()
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

    function RemoveRowFromGrid(rowToRemove)
    {        
        var index = $(rowToRemove).index(); //TODO could use a custom data-index to avoid jquery, but doesn't seem necessary
        console.log("Index of row to be removed: " + index + ". Class name of row to be removed: " + rowToRemove.className);  
        if(index > -1) 
        {
            activeGrid.GetRowList().splice(index, 1);
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

    //TODO could/should (?) still have an Add method here in GridManager, that just calls Grid's add methid and also the Update

    // function AddElementToGrid(elementToAdd, updateGrid=true)
    // {
    //     //console.log("Adding element to grid: " + elementToAdd + ". Before element: " + elementToPrecede + ". UpdateGrid value: " + updateGrid)
    //     activeGrid.appendChild(elementToAdd);  
       
    //     if (updateGrid == true)
    //     {
    //         UpdateGrid();        
    //     }    
    // }

    function RemoveElementFromGrid(elementToRemove)
    {
        //activeGrid.removeChild(elementToRemove);
        activeGrid.RemoveChildElement(elementToRemove);
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

    function CategorySelected()
    {
        //If the category selected is different from the one currently active, switch grids to the selected category
        if (this.dataset.gridindex != grids.indexOf(activeGrid))
        {
            SwitchGrids(this.dataset.gridindex, this.textContent);
        }
    }

    function SwitchGrids(indexToDisplay, categoryTextToDisplay)
    {
        console.log("Request received to switch grids to grid index: " + indexToDisplay);

        //activeGrid.GetElement().hidden = true;
        activeGrid.ToggleElementVisibility();
        activeGrid = grids[indexToDisplay];
        activeGrid.ToggleElementVisibility();
        //grids[this.dataset.gridindex].GetElement().hidden = false;

        document.getElementById('buttonCurrentCategory').textContent = categoryTextToDisplay;
    }

    function GetVisibleGrid()
    {
        for (var i = 0; i < grids.length; i++)
        {
            if (grids[i].GetElement().hidden == false)
            {
                return grids[i];
            }
        }
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

    return { //TODO only calls should be made here (e.g. getters/setters), not actual changes
        SetupGrids : function()
        {
            var gridElements = document.getElementsByClassName('grid');
            console.log("Number of grids: " + gridElements.length);

            for (var i = 0; i < gridElements.length; i++)
            {
                console.log('Adding grid ' + gridElements[i] + ' to grid list');
                grids.push(new Grid(gridElements[i]));
            }

            var categoryButtons = document.getElementsByClassName('buttonCategory');

            for (var i = 0; i < categoryButtons.length; i++)
            {
                categoryButtons[i] .addEventListener('click', CategorySelected); 
            }

            activeGrid = GetVisibleGrid();
            console.log("Active Grid set to: " + activeGrid);
        },
        GetStorageData : function()
        {
            var gridData = [];
            //console.log('There are currently ' + gridData.length + ' grids.');

            for (var i = 0; i < grids.length; i++)
            {
                gridData.push(grids[i].GetStorageData());
            }

            return gridData;
        },//TODO some of these could probably be moved into new Grid class, and Grid and Row 'classes' could be moved to a separate file, potentially
        AddNewRow : function()
        {
            //AddElementToGrid(CreateRow("", 0, 0, 0, 0));
            //activeGrid.AddChildElement(CreateRow("", 0, 0, 0, 0));

            //console.log("Adding a new row at grid: " + activeGrid.GetElement().outerHTML);
            activeGrid.AddRow("", 0, 0, 0, 0);
        },
        ReloadGridDataFromStorage : function(gridData)
        {
            console.log('There are ' + gridData.length + ' grids saved in local storage.');

            for (var i = 0; i < gridData.length; i++)
            {
                for (var j = 0; j < gridData[i].length; j++)
                {
                    console.log("Grid: " + i + ". Row: " + j + ". Item: " + gridData[i][j][0]);
                    
                    //AddElementToGrid(CreateRow(rowValues[i][0], rowValues[i][1], rowValues[i][2], rowValues[i][3], rowValues[i][4]), false);
                    //activeGrid.AddChildElement(CreateRow(rowValues[i][0], rowValues[i][1], rowValues[i][2], rowValues[i][3], rowValues[i][4]), false); 

                    //AddRowToGrid();

                    grids[i].AddRow(gridData[i][j][0], gridData[i][j][1], gridData[i][j][2], gridData[i][j][3], gridData[i][j][4], false);

                    //activeGrid.AddRow(rowValues[i][0], rowValues[i][1], rowValues[i][2], rowValues[i][3], rowValues[i][4], false);
                }
            }
        }
    };
}();