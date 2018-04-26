function ListItem(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    var Elements = {
        wrapper: CreateNewElement('div', [ ['class','row divItemRow'] ]),
        name: null,
        //modifiers: null,
        //settings : null,

        listQuantityPopovers: [],
        Settings : {
                    wrapper: null, 
                    editNameTextarea: null,
                    buttonDelete: null,
                },
    };

    // var Elements = {
    //     wrapper: CreateNewElement('div', [ ['class','row divItemRow'] ]),
    //     nameToggle: null,
    //     listQuantityPopovers: [],
    //     Settings : {
    //         wrapper: null, 
    //         editNameTextarea: null,
    //         buttonDelete: null,
    //     },
    // };

    SetupElements();
    SetItemColumnColor();

    /** Private Functions **/

    function SetupElements()
    {
        //CreateNameToggle(rowId, itemName); //TODO is it necessary to pass rowId as a parameter?
        Elements.name = new ListItemName(rowId, itemName) //TODO is it necessary to pass rowId as a parameter?
        Elements.wrapper.appendChild(Elements.name.GetWrapper());

        CreateDivForQuantityPopover(neededQuantity);
        CreateDivForQuantityPopover(luggageQuantity);
        CreateDivForQuantityPopover(wearingQuantity);
        CreateDivForQuantityPopover(backpackQuantity);
    
        CreateRowSettingsView(rowId, Elements.Settings, Elements.name.GetToggle());

        Elements.Settings.buttonDelete.addEventListener('click', function()
        {   
            GridManager.RemoveRow(Elements.wrapper);
        });

        Elements.wrapper.appendChild(Elements.Settings.wrapper);
    }
    
    // function CreateNameToggle(rowId, itemName)
    // {
    //     Elements.nameToggle = CreateToggleForCollapsibleView('edit-row-'.concat(rowId), 'btn buttonItemName', itemName);

    //     var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], Elements.nameToggle);

    //     Elements.wrapper.appendChild(nameWrapper);
    // }

    function CreateDivForQuantityPopover(quantity)
    {
        /* Create Popover Elements */
        var buttonMinus = CreateButtonWithIcon('buttonMinus', 'btn', 'fa fa-minus-circle fa-lg');
        var buttonPlus = CreateButtonWithIcon('buttonPlus', 'btn', 'fa fa-plus-circle fa-lg');
    
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
            Elements.name.SetColor('rgb(77, 77, 77)'); //"darkgrey";
            //Elements.nameToggle.style.borderColor = 'rgb(77, 77, 77)';
            //Elements.nameToggle.style.backgroundColor = 'rgba(169, 169, 169, 0.6)';
        }
        else if (Elements.listQuantityPopovers[QuantityType.Needed].text == (parseInt(Elements.listQuantityPopovers[QuantityType.Luggage].text) + parseInt(Elements.listQuantityPopovers[QuantityType.Wearing].text) + parseInt(Elements.listQuantityPopovers[QuantityType.Backpack].text)))
        {
            Elements.name.SetColor('mediumseagreen');
            //Elements.nameToggle.style.borderColor = "mediumseagreen";
            //Elements.nameToggle.style.backgroundColor = 'rgba(60, 179, 113, 0.6)';
        }
        else
        {
            Elements.name.SetColor('peru'); //lightsalmon is also good
            //Elements.nameToggle.style.borderColor = "peru"; //lightsalmon is also good
            //Elements.nameToggle.style.backgroundColor = 'rgba(255,160,122, 0.6)';
        }
    }

    /** Experimental & In Progress **/

    
    /** Public Functions **/

    return { 
        GetDiv : function()
        {
            return Elements.wrapper;
        },
        GetDataForStorage : function()
        {
            return [
                Elements.name.GetString(), 
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
            $(Elements.Settings.wrapper).collapse('show');
            Elements.Settings.editNameTextarea.focus();
        }
    };
}

