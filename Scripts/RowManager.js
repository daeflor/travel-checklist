var QuantityType = {
    Needed: 0,
    Luggage: 1,
    Wearing: 2,
    Backpack: 3,
};

function Row(itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    var divRow = CreateNewElement('div', [ ['class','row divItemRow'] ]);
    var divItemName;
    var textareaItemName;
    var listQuantityPopovers = [];

    CreateDivForEditPopover();
    CreateDivForItemName(itemName);
    CreateDivForQuantityPopover(neededQuantity);
    CreateDivForQuantityPopover(luggageQuantity);
    CreateDivForQuantityPopover(wearingQuantity);
    CreateDivForQuantityPopover(backpackQuantity);

    SetItemColumnColor();

    function CreateDivForEditPopover()
    {
        /* Create Popover Elements */
        //var iconTrash = CreateNewElement('i', [['class','fa fa-trash']]);
        //var buttonTrash = CreateNewElement('button', [ ['class','btn'], ['type','button'] ], iconTrash);
        var buttonTrash = CreateButtonEdit('buttonTrash', 'fa fa-trash');
    
        var iconToggle = CreateNewElement('i', [ ['class','fa fa-pencil-square-o'] ]);    
        var popoverToggle = CreatePopoverToggle('btn buttonEdit', iconToggle, [buttonTrash], 'focus');
        
        /* Create Edit Button Elements */
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            //console.log("Popup has been opened; onclick event will be set.");
            document.getElementById('buttonTrash').addEventListener('click', function()
            {
                GridManager.RemoveRow(divRow);
            });
        });

        divRow.appendChild(CreateNewElement('div', [ ['class','col-1 divEdit'] ], popoverToggle));
        //return CreateNewElement('div', [ ['class','col-1 divEdit'] ], popoverToggle);
    }  

    function CreateDivForItemName(itemName)
    {
        textareaItemName = CreateNewElement('textarea');
        textareaItemName.value = itemName;
        textareaItemName.onchange = GridManager.GridModified;
    
        divItemName = CreateNewElement('div', [ ['class','col-4 divItemName'] ], textareaItemName);
        divRow.appendChild(divItemName);
        //return divItemName;
    }
    
    function CreateDivForQuantityPopover(quantity)
    {
        /* Create Popover Elements */
        var buttonMinus = CreateButtonQuantity('buttonMinus', 'fa fa-minus-circle fa-lg popoverElement');
        var buttonPlus = CreateButtonQuantity('buttonPlus', 'fa fa-plus-circle fa-lg popoverElement');
    
        var popoverToggle = CreatePopoverToggle('btn btn-sm buttonQuantity', quantity, [buttonMinus, buttonPlus], 'manual');
    
        popoverToggle.addEventListener('click', function() 
        {
            //If there is already a popover active, remove focus from the selected quantity button. Otherwise, show the button's popover. 
            if(GridManager.GetActivePopover() == null)
            {
                $(popoverToggle).popover('show');
            }
            else
            {
                popoverToggle.blur();
            }
        });
    
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            GridManager.SetActivePopover(popoverToggle);
    
            document.getElementById('buttonMinus').addEventListener('click', function() 
            {
                ModifyQuantityValue(popoverToggle, false);
            });         
            document.getElementById('buttonPlus').addEventListener('click', function() 
            {
                ModifyQuantityValue(popoverToggle, true);
            }); 
    
            document.addEventListener('click', GridManager.HideActiveQuantityPopover);
        });
    
        $(popoverToggle).on('hidden.bs.popover', function()
        {
            GridManager.SetActivePopover(null);
        });

        listQuantityPopovers.push(popoverToggle);
    
        divRow.appendChild(CreateNewElement('div', [ ['class','col divQuantity'] ], popoverToggle));
        //return CreateNewElement('div', [ ['class','col divQuantity'] ], popoverToggle);        
    }

    //TODO could an enum be used for the different quantities and then pass a number which corresponds to one of the quantities
    function ModifyQuantityValue(quantityElement, increase)
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

    function SetItemColumnColor()
    {
        if (listQuantityPopovers[QuantityType.Needed].text == 0)
        {
            divItemName.style.backgroundColor = "darkgrey";
        }
        else if (listQuantityPopovers[QuantityType.Needed].text == (parseInt(listQuantityPopovers[QuantityType.Luggage].text) + parseInt(listQuantityPopovers[QuantityType.Wearing].text) + parseInt(listQuantityPopovers[QuantityType.Backpack].text)))
        {
            divItemName.style.backgroundColor = "mediumseagreen";
        }
        else
        {
            divItemName.style.backgroundColor = "peru";
        }
    }

    return { 
        GetDiv : function()
        {
            return divRow;
        },
        GetStorageData : function()
        {
            return [
                textareaItemName.value, 
                listQuantityPopovers[QuantityType.Needed].text, 
                listQuantityPopovers[QuantityType.Luggage].text, 
                listQuantityPopovers[QuantityType.Wearing].text, 
                listQuantityPopovers[QuantityType.Backpack].text
            ];
        }
    };
}

//TODO these two functions could probably be merged into one (e.g. CreateButtonWithIcon?)
    //Also they should probably be moved into Row or standardized and moved elsewhere
function CreateButtonEdit(buttonId, iconClass)
{
    return CreateNewElement(
        'button', 
        [['id',buttonId], ['class','btn'], ['type','button']], 
        CreateNewElement('i', [['class',iconClass]])
    );
}

function CreateButtonQuantity(buttonId, iconClass)
{
    return CreateNewElement(
        'button', 
        [['id',buttonId], ['class','btn'], ['type','button']], 
        CreateNewElement('i', [['class',iconClass]])
    );
}

