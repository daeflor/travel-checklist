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
        var buttonTrash = CreateButtonWithIcon('buttonTrash', 'btn', 'fa fa-trash');
    
        /* Create Edit Button Elements */
        var iconToggle = CreateNewElement('i', [ ['class','fa fa-pencil-square-o'] ]);    
        var popoverToggle = CreatePopoverToggle('btn buttonEdit', iconToggle, [buttonTrash], 'focus');
        
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            document.getElementById('buttonTrash').addEventListener('click', function()
            {
                GridManager.RemoveRow(divRow);
            });
        });

        divRow.appendChild(CreateNewElement('div', [ ['class','col-1 divEdit'] ], popoverToggle));
    }  

    function CreateDivForItemName(itemName)
    {
        textareaItemName = CreateNewElement('textarea');
        textareaItemName.value = itemName;
        textareaItemName.onchange = GridManager.GridModified;
    
        divItemName = CreateNewElement('div', [ ['class','col-4 divItemName'] ], textareaItemName);
        divRow.appendChild(divItemName);
    }
    
    function CreateDivForQuantityPopover(quantity)
    {
        /* Create Popover Elements */
        var buttonMinus = CreateButtonWithIcon('buttonMinus', 'btn buttonEditQuantity popoverElement', 'fa fa-minus-circle fa-lg popoverElement');
        var buttonPlus = CreateButtonWithIcon('buttonPlus', 'btn buttonEditQuantity popoverElement', 'fa fa-plus-circle fa-lg popoverElement');
    
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
    }

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

    /** Experimental & In Progress **/

    // function TestCollapse()
    // {
    //     var html = '<button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExampleJS" aria-expanded="false" aria-controls="collapseExample">Button with data-target</button><div class="collapse" id="collapseExampleJS"><div class="card card-body">Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.</div></div>';
    //     var newDiv = CreateNewElement('div');
    //     newDiv.innerHTML = html;
    //     divRow.appendChild(newDiv);

    //     //$('.collapse').collapse();
    // }

    // function TestTwo()
    // {
    //     var newDiv = CreateNewElement('div', [ ['class',''] ]);
    //     newDiv. innerHTML = document.getElementById('dropdownHeader').outerHTML;
    //     divRow.appendChild(newDiv);
    // }

    // function Test()
    // {
    //     var dropdownHtml = '<button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Clothes</button><div class="dropdown-menu"><button class="dropdown-item buttonCategory" data-gridindex="0" type="button">Clothes</button><button class="dropdown-item buttonCategory" data-gridindex="1" type="button">Sundries</button><button class="dropdown-item buttonCategory" data-gridindex="2" type="button">Test</button></div>';
    //     var newDiv = CreateNewElement('div', [ ['class','col-4 dropdown header itemCategory'] ]);
    //     newDiv.innerHTML = dropdownHtml;
    //     divRow.appendChild(newDiv);

    //     //$('.dropdown-toggle').dropdown('toggle');
    //     $('[data-toggle="dropdown"]').parent().removeClass('open');
    // }

    // function CreateDropDownForItemName(itemName)
    // {
    //     var buttonTrash = CreateButtonWithIcon('buttonTrashDropdown', 'btn dropdown-item', 'fa fa-trash');
    //     var textareaName = CreateNewElement('textarea', [ ['class','dropdown-item'], ['id','textareaName'] ]);
        
    //     var dropdownWrapper = CreateDropdownWrapper('btn dropdown-toggle', itemName, [buttonTrash, textareaName]);
    //     var dropdownToggle = dropdownWrapper.children[0];

    //     console.log("Dropdown class: " + dropdownToggle.className);

    //     textareaItemName = dropdownToggle;

    //     divItemName = CreateNewElement('div', [ ['class','col-4 divItemName'] ], dropdownWrapper);

    //     dropdownToggle.addEventListener('click', function() 
    //     {
    //         $(dropdownToggle).dropdown('toggle');
    //     });

    //     $(dropdownToggle).on('shown.bs.dropdown', function() 
    //     {
    //         document.getElementById('buttonTrashDropdown').addEventListener('click', function()
    //         {
    //             console.log("DROPDOWNTRASH CLICKED");
    //             GridManager.RemoveRow(divRow);
    //         });

    //         textareaName.text = popoverToggle.textContent;
    //     });

    //     // $(dropdownToggle).on('hide.bs.dropdown', function()
    //     // {
    //     //     dropdownToggle.text = document.getElementById('textareaName').text;
    //     // });

    //     //divItemName = CreateNewElement('div', [ ['class','col-4 divItemName'] ], dropdownWrapper);
    //     divRow.appendChild(divItemName);
    // }
    
    /** Public Functions **/

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
        },
        ClearQuantityValue : function(quantityIndex)
        {
            listQuantityPopovers[quantityIndex].text = 0; 
            SetItemColumnColor();
        }
    };
}

