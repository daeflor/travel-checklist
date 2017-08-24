window.GridManager = function()
{
    var divGrid;
    var rows = [];
    //document.addEventListener('DOMContentLoaded', function(){divGrid = document.getElementById('grid')});

    //TODO could possibly set up button events and other elements here
    // function SetupGridElements()
    // {
    // }

    function DeleteElementFromGrid(element)
    {
        console.log('Class name of element to remove: ' + element.className)
        divGrid.removeChild(element);
    }

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

    function AddInputElement(type, parent, value, cssClass, min)
    {
        var input = document.createElement('input');
        input.type = type;
        input.value = value;
        input.className = cssClass;
        input.min = min;
        parent.appendChild(input);
    }

    //TODO change this to take a list of name-value-pairs and use setAttribute to assign them
    function CreateNewElement(elementName, elementClass, elementType, elementValue)
    {
        var element;
        
        if (elementName != null)
        {
           element = document.createElement(elementName);

            if (elementClass != null)
            {
                element.className = elementClass;
            }

            if (elementType != null)
            {
                element.type = elementType;
            }

            if (elementValue != null)
            {
                element.className = elementValue;
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
        
        // var iconTrash = document.createElement('i');
        // iconTrash.className = 'fa fa-trash';
        // //$(iconTrash).attr('aria-hidden', 'true');

        // var buttonTrash = document.createElement('button');
        // buttonTrash.type = 'button';
        // buttonTrash.className = 'btn';
        // //buttonTrash.onclick = function(){ console.log('BUTTON PRESSED'); };
        // buttonTrash.appendChild(iconTrash);

        // var divPopover = document.createElement('div');
        // divPopover.appendChild(buttonTrash);

        /* Create Edit Button Elements */
        
        var iconEdit = document.createElement('i');
        iconEdit.className = 'fa fa-pencil-square-o';

        var buttonEdit = CreateNewElement('a', 'btn');
        buttonEdit.href = '#';
        buttonEdit.tabindex = '0';

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
            content: '<div><button class="btn buttonTrash" type="button"><i class="fa fa-trash"></i></button></div>' //onclick="alert()"
        }); 

        $(buttonEdit).on (
            'shown.bs.popover',
             function () 
            {
                console.log("Possibly... Popup has been opened, and onclick event will be set.");
                //var $buttonTrash = $(this).find('#buttonTrash');
                //console.log("Tried to find trash button by ID: " + $buttonTrash.className);
                //$buttonTrash.click(function(){Test();});
                //console.log($("#buttonTrash"));
                
                $(".buttonTrash").click(function(){DeleteElementFromGrid(buttonEdit.parentElement.parentElement);});
            }
        )

        //TODO may need to dispose of popover, especially if not using unique IDs

        buttonEdit.appendChild(iconEdit);

        /* Create Div Wrapper */
        var divCol = document.createElement('div');
        divCol.className = "col-2 settings"; 
        divCol.appendChild(buttonEdit);

        return divCol;
    }

    function CreateItemColumn(name)
    {
        var divCol = document.createElement('div');
        divCol.className = "col-3 itemColumn"; 
        AddInputElement("text", divCol, name);

        return divCol;
    }

    function CreateQuantityColumn(quantity)
    {
        divCol = document.createElement('div');
        divCol.className = "col"; 
        divCol.style.backgroundColor = "bisque";
        AddInputElement("number", divCol, quantity, "quantity", 0);

        return divCol;
    }

    function CreateRow(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
    {
        var divRow = document.createElement('div');
        divRow.className = "row"; 

        divRow.appendChild(CreatePopoverRowSettings());
        
        divRow.appendChild(CreateItemColumn(itemName));
        divRow.appendChild(CreateQuantityColumn(neededQuantity));
        divRow.appendChild(CreateQuantityColumn(luggageQuantity));
        divRow.appendChild(CreateQuantityColumn(wearingQuantity));
        divRow.appendChild(CreateQuantityColumn(backpackQuantity));
    
        divGrid.insertBefore(divRow, divGrid.children[divGrid.childElementCount-3]);    

        rows.push(new ItemRow(divRow));
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
            CreateRow("", 0, 0, 0, 0);
        },
        RecreateRowsFromStorage : function(rowValues)
        {
            //console.log('Row Values from local storage : ' + rowValues);
            //console.log('There are ' + rowValues.length + ' rows saved in local storage.');
            for (var i = 0; i < rowValues.length; i++)
            {
                //console.log('Row ' + i + ' : name = ' + rowValues[i][0]);
                CreateRow(rowValues[i][0], rowValues[i][1], rowValues[i][2], rowValues[i][3], rowValues[i][4]);
            }
        }
    };
}();