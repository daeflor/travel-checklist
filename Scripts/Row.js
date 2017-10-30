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

    SetupElements();
    SetItemColumnColor();

    /** Private Functions **/

    function SetupElements()
    {
        //CreateCollapsibleDivForItemName(rowId, itemName);
        CreateNameToggle(rowId, itemName);
        CreateDivForQuantityPopover(neededQuantity);
        CreateDivForQuantityPopover(luggageQuantity);
        CreateDivForQuantityPopover(wearingQuantity);
        CreateDivForQuantityPopover(backpackQuantity);
        CreateSettingsView(rowId, itemName);
        //Elements.wrapper.appendChild(Elements.settingsWrapper);
    }
    
    function CreateNameToggle(rowId, itemName)
    {
        Elements.nameToggle = CreateToggleForCollapsibleView('editRow-'.concat(rowId), 'btn buttonItemName', itemName);

        Elements.nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], Elements.nameToggle);

        Elements.wrapper.appendChild(Elements.nameWrapper);
    }

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

    function CreateSettingsView(rowId, itemName)
    {
        //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed
        
        /* Create Text Area */
        Elements.editNameTextarea = CreateNewElement('textarea', [ ['class',''] ]);
        Elements.editNameTextarea.textContent = Elements.nameToggle.textContent; 

        /* Create Delete Row Button */
        var buttonDeleteRow = CreateButtonWithIcon('deleteRow-'.concat(rowId), 'btn settings-button', 'fa fa-trash'); //TODO id isn't really necessary
        buttonDeleteRow.addEventListener('click', function()
        {
            GridManager.RemoveRow(Elements.wrapper);
        });

        /* Create Element Wrappers */
        var divTextareaName = CreateNewElement('div', [ ['class','col-5 divEditName'] ], Elements.editNameTextarea);
        var divButtonDeleteRow = CreateNewElement('div', [ ['class','col-2'] ], buttonDeleteRow);
        //TODO could consider only having to pass custom classes (i.e. the helper function would create element with default classes, and then add on any custom ones passed to it).
        Elements.settingsWrapper  = CreateCollapsibleView('editRow-'.concat(rowId), 'collapse container-fluid divSettingsWrapper', [divTextareaName, divButtonDeleteRow]);

        /* Setup Listeners */
        $(Elements.settingsWrapper).on('show.bs.collapse', function() 
        {
            GridManager.ToggleActiveSettingsView(Elements.settingsWrapper);
        });
  
        Elements.editNameTextarea.addEventListener("keypress", function(e) 
        {
            if(e.keyCode==13)
            {
                Elements.editNameTextarea.blur();
            }
        });

        Elements.editNameTextarea.addEventListener("change", function() 
        {
            Elements.nameToggle.textContent = Elements.editNameTextarea.value;
            GridManager.GridModified();
        });

        Elements.wrapper.appendChild(Elements.settingsWrapper);
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

    // function CreateCollapsibleDivForItemName(rowId, itemName)
    // {
    //     //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed
        
    //     Elements.editNameTextarea = CreateNewElement('textarea', [ ['class','rowName'] ]); //, [ ['class',''], ['id','nameRow-'.concat(rowId)] ]            
    //     var buttonDeleteRow = CreateButtonWithIcon('deleteRow-'.concat(rowId), 'btn settings-button', 'fa fa-trash');
    //     buttonDeleteRow.addEventListener('click', function()
    //     {
    //         GridManager.RemoveRow(Elements.wrapper);
    //     });

    //     var divTextareaName = CreateNewElement('div', [ ['class','col-5 divEditName'] ], Elements.editNameTextarea);
    //     var divButtonDeleteRow = CreateNewElement('div', [ ['class','col-2'] ], buttonDeleteRow);

    //     //TODO could consider only having to pass custom classes (i.e. the helper function would create element with default classes, and then add on any custom ones passed to it).
    //     var collapsibleElements = CreateCollapsibleElements('editRow-'.concat(rowId), 'btn buttonItemName', itemName, 'collapse container-fluid divSettingsWrapper', [divTextareaName, divButtonDeleteRow]);
    //     Elements.nameToggle = collapsibleElements[0];
    //     Elements.settingsWrapper = collapsibleElements[1];

    //     Elements.editNameTextarea.textContent = Elements.nameToggle.textContent;
    //     Elements.editNameTextarea.addEventListener("change", function() 
    //     {
    //         Elements.nameToggle.textContent = Elements.editNameTextarea.value;
    //         GridManager.GridModified();
    //     });
    //     Elements.editNameTextarea.addEventListener("keypress", function(e) 
    //     {
    //         if(e.keyCode==13)
    //         {
    //             Elements.editNameTextarea.blur();
    //         }
    //     });

    //     $(Elements.settingsWrapper).on('show.bs.collapse', function() 
    //     {
    //         GridManager.ToggleActiveSettingsView(Elements.settingsWrapper);
    //     });

    //     Elements.nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], Elements.nameToggle);

    //     Elements.wrapper.appendChild(Elements.nameWrapper);
    // }
    
    /** Public Functions **/

    return { 
        GetDiv : function()
        {
            return Elements.wrapper;
        },
        GetDataForStorage : function()
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

