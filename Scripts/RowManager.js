function Row()
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
                GridManager.GridModified();
            }
            else if (parseInt(quantityElement.text) > 0)
            {
                quantityElement.text = parseInt(quantityElement.text) - 1;
                SetItemColumnColor();
                GridManager.GridModified();
            }
        }
    };
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
            //TODO shouldn't need to use parent elements anymore
            GridManager.RemoveRow(buttonEdit.parentElement.parentElement);
        });
    });

    return CreateNewElement('div', [ ['class','col-1 divEdit'] ], buttonEdit);
}  

function CreateItemColumn(itemName)
{
    var textareaItemName = CreateNewElement('textarea');
    textareaItemName.value = itemName;
    textareaItemName.onchange = GridManager.GridModified;
    var divCol = CreateNewElement('div', [ ['class','col-4 divItemName'] ], textareaItemName);
    return divCol;
}

function CreateQuanitytButton(buttonId, iconClass)
{
    return CreateNewElement(
        'button', 
        [['id',buttonId], ['class','btn btn-lg buttonEditQuantity popoverElement'], ['type','button']], 
        CreateNewElement('i', [['class',iconClass]])
    );
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
        if(GridManager.GetActivePopover() == null)
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
        GridManager.SetActivePopover(buttonQuantity);

        document.getElementById('buttonMinus').addEventListener('click', function() 
        {
            itemRow.ModifyQuantityValue(buttonQuantity, false);
        });         
        document.getElementById('buttonPlus').addEventListener('click', function() 
        {
            itemRow.ModifyQuantityValue(buttonQuantity, true);
        }); 

        document.addEventListener('click', GridManager.HideActiveQuantityPopover);
    });

    $(buttonQuantity).on('hidden.bs.popover', function()
    {
        GridManager.SetActivePopover(null);
    });

    return CreateNewElement('div', [ ['class','col divQuantity'] ], buttonQuantity);        
}