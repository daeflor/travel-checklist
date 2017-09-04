function Row(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    var Elements = {
        wrapper: CreateNewElement('div', [ ['class','row divItemRow'] ]),
        nameWrapper: null,
        nameToggle: null,
        listQuantityPopovers: [],
        settingsWrapper: null,
        editNameTextarea: null,
    };

    //var listQuantityPopovers = [];

    CreateCollapsibleDivForItemName(rowId, itemName);
    CreateDivForQuantityPopover(neededQuantity);
    CreateDivForQuantityPopover(luggageQuantity);
    CreateDivForQuantityPopover(wearingQuantity);
    CreateDivForQuantityPopover(backpackQuantity);

    // Elements.wrapper.appendChild(Elements.nameWrapper);
    // for (var i = 0; i < Elements.listQuantityPopovers.length; i++)
    // {
    //     Elements.wrapper.appendChild(Elements.listQuantityPopovers[i]);
    // }
    Elements.wrapper.appendChild(Elements.settingsWrapper);

    SetItemColumnColor();

    /** Private Functions **/
    
    function CreateDivForQuantityPopover(quantity)
    {
        /* Create Popover Elements */
        var buttonMinus = CreateButtonWithIcon('buttonMinus', 'btn buttonEditQuantity popoverElement', 'fa fa-minus-circle fa-lg popoverElement');
        var buttonPlus = CreateButtonWithIcon('buttonPlus', 'btn buttonEditQuantity popoverElement', 'fa fa-plus-circle fa-lg popoverElement');
    
        var popoverToggle = CreatePopoverToggle('btn btn-sm buttonQuantity', quantity, [buttonMinus, buttonPlus], 'manual');
    
        popoverToggle.addEventListener('click', function(e) 
        {
            console.log("A Popover toggle was pressed");

            //If there is no popover currently active, show the popover for the selected toggle
            if(GridManager.GetActivePopover() == null)
            {
                //When there is no active popover and a toggle is selected, prevent further click events from closing the popover immediately
                if(e.target == popoverToggle)
                {
                    console.log("Prevented click event from bubbling up");
                    e.stopPropagation();
                }

                $(popoverToggle).popover('show');
            }
        });
    
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            console.log("A Popover was shown");
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
            console.log("An onclick listener was added to the whole document");
        });
    
        $(popoverToggle).on('hidden.bs.popover', function()
        {
            console.log("A Popover was hidden");
            GridManager.SetActivePopover(null);
        });

        Elements.listQuantityPopovers.push(popoverToggle);
    
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

    function SetItemColumnColor()
    {
        if (Elements.listQuantityPopovers[QuantityType.Needed].text == 0)
        {
            Elements.nameToggle.style.borderColor = 'rgb(77, 77, 77)';//"darkgrey";
            //Elements.nameToggle.style.backgroundColor = 'rgba(169, 169, 169, 0.6)';
        }
        else if (Elements.listQuantityPopovers[QuantityType.Needed].text == (parseInt(Elements.listQuantityPopovers[QuantityType.Luggage].text) + parseInt(Elements.listQuantityPopovers[QuantityType.Wearing].text) + parseInt(Elements.listQuantityPopovers[QuantityType.Backpack].text)))
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
                Elements.listQuantityPopovers[QuantityType.Needed].text, 
                Elements.listQuantityPopovers[QuantityType.Luggage].text, 
                Elements.listQuantityPopovers[QuantityType.Wearing].text, 
                Elements.listQuantityPopovers[QuantityType.Backpack].text
            ];
        },
        ClearQuantityValue : function(quantityIndex)
        {
            Elements.listQuantityPopovers[quantityIndex].text = 0; 
            SetItemColumnColor();
        },
        ExpandSettings : function()
        {
            $(Elements.settingsWrapper).collapse('show');
            Elements.editNameTextarea.focus();
        }
    };
}

