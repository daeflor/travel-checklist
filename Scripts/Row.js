function Row(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    var Elements = {
        wrapper: CreateNewElement('div', [ ['class','row divItemRow'] ]),
        nameWrapper: null,
        nameToggle: null,
        settingsWrapper: null,
        editNameTextarea: null,
    };

    var listQuantityPopovers = [];

    //console.log("This: " + this);

    //CreateDivForEditPopover();

    //CreateDivForItemName(itemName);
    CreateCollapsibleDivForItemName(rowId, itemName);
    
    CreateDivForQuantityPopover(neededQuantity);
    CreateDivForQuantityPopover(luggageQuantity);
    CreateDivForQuantityPopover(wearingQuantity);
    CreateDivForQuantityPopover(backpackQuantity);

    Elements.wrapper.appendChild(Elements.settingsWrapper);

    SetItemColumnColor();

    // function CreateDivForEditPopover()
    // {
    //     /* Create Popover Elements */
    //     var buttonTrash = CreateButtonWithIcon('buttonTrash', 'btn', 'fa fa-trash');
    
    //     /* Create Edit Button Elements */
    //     var iconToggle = CreateNewElement('i', [ ['class','fa fa-pencil-square-o'] ]);    
    //     var popoverToggle = CreatePopoverToggle('btn buttonEdit', iconToggle, [buttonTrash], 'focus');
        
    //     $(popoverToggle).on('shown.bs.popover', function() 
    //     {
    //         document.getElementById('buttonTrash').addEventListener('click', function()
    //         {
    //             GridManager.RemoveRow(Elements.wrapper);
    //         });
    //     });

    //     Elements.wrapper.appendChild(CreateNewElement('div', [ ['class','col-1 divEdit'] ], popoverToggle));
    // }  

    // function CreateDivForItemName(itemName)
    // {
    //     textareaItemName = CreateNewElement('textarea');
    //     textareaItemName.value = itemName;
    //     textareaItemName.onchange = GridManager.GridModified;
    
    //     divItemName = CreateNewElement('div', [ ['class','col-4 divItemName'] ], textareaItemName);
    //     Elements.wrapper.appendChild(divItemName);
    // }
    
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
    
        Elements.wrapper.appendChild(CreateNewElement('div', [ ['class','col'] ], popoverToggle));
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

    //TODO maybe the border could be color coded instead of the background
    function SetItemColumnColor()
    {
        if (listQuantityPopovers[QuantityType.Needed].text == 0)
        {
            Elements.nameToggle.style.borderColor = 'rgb(77, 77, 77)';//"darkgrey";
            //Elements.nameToggle.style.backgroundColor = 'rgba(169, 169, 169, 0.6)';
        }
        else if (listQuantityPopovers[QuantityType.Needed].text == (parseInt(listQuantityPopovers[QuantityType.Luggage].text) + parseInt(listQuantityPopovers[QuantityType.Wearing].text) + parseInt(listQuantityPopovers[QuantityType.Backpack].text)))
        {
            Elements.nameToggle.style.borderColor = "mediumseagreen";
            //Elements.nameToggle.style.backgroundColor = 'rgba(60, 179, 113, 0.6)';
        }
        else
        {
            Elements.nameToggle.style.borderColor = "peru"; //lightsalmon is also good
            //Elements.nameToggle.style.backgroundColor = 'rgba(255,160,122, 0.6)';
            
        }
    }

    /** Experimental & In Progress **/

    function CreateCollapsibleDivForItemName(rowId, itemName)
    {
        //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed
        
        Elements.editNameTextarea = CreateNewElement('textarea', [ ['class','rowName'] ]); //, [ ['class',''], ['id','nameRow-'.concat(rowId)] ]            
        var buttonDeleteRow = CreateButtonWithIcon('deleteRow-'.concat(rowId), 'btn settings-button', 'fa fa-trash');
        buttonDeleteRow.addEventListener('click', function()
        {
            GridManager.RemoveRow(Elements.wrapper);
        });

        var divTextareaName = CreateNewElement('div', [ ['class','col-5 divEditName'] ], Elements.editNameTextarea);
        var divButtonDeleteRow = CreateNewElement('div', [ ['class','col-2'] ], buttonDeleteRow);

        //TODO could consider only having to pass custom classes (i.e. the helper function would create element with default classes, and then add on any custom ones passed to it).
        var collapsibleElements = CreateCollapsibleElements('editRow-'.concat(rowId), 'btn buttonItemName', itemName, 'collapse container-fluid divSettingsWrapper', [divTextareaName, divButtonDeleteRow]);
        Elements.nameToggle = collapsibleElements[0];
        Elements.settingsWrapper = collapsibleElements[1];

        Elements.editNameTextarea.textContent = Elements.nameToggle.textContent;
        Elements.editNameTextarea.addEventListener("change", function() 
        {
            Elements.nameToggle.textContent = Elements.editNameTextarea.value;
            GridManager.GridModified();
        });
        Elements.editNameTextarea.addEventListener("keypress", function(e) 
        {
            if(e.keyCode==13)
            {
                Elements.editNameTextarea.blur();
            }
        });

        $(Elements.settingsWrapper).on('show.bs.collapse', function() 
        {
            GridManager.ToggleActiveSettingsView(Elements.settingsWrapper);
        });

        Elements.nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], Elements.nameToggle);

        Elements.wrapper.appendChild(Elements.nameWrapper);
    }

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
            return Elements.wrapper;
        },
        // GetIndex : function()
        // {
        //     return $(Elements.wrapper).index();
        // },
        GetStorageData : function()
        {
            return [
                Elements.nameToggle.textContent, 
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
        },
        ExpandSettings : function()
        {
            $(Elements.settingsWrapper).collapse('show');
            Elements.editNameTextarea.focus();
        }
    };
}

