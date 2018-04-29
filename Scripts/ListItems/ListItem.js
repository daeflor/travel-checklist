function ListItem(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    var Elements = {
        wrapper: CreateNewElement('div', [ ['class','row divItemRow'] ]),
        name: null,
        modifiers: [],
        //settings : null,
        //listQuantityPopovers: [],
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
        //Create the List Item Name elements
        Elements.name = new ListItemName(rowId, itemName) //TODO is it necessary to pass rowId as a parameter?
        
        //Add the List Item Name to the DOM
        Elements.wrapper.appendChild(Elements.name.GetWrapper()); //TODO see if this is really necessary or if it can be done a better way

        //Create the modifier elements for the List Item
        //TODO should be less hard coded (e.g. loop instead) and include the type of modifier (e.g. quantity/travel vs checkbox) (KVPs)
        //TODO why pass an initial value as a parameter if we can use SetValue instead?
        Elements.modifiers.push(new ListItemModifier(ModifierValueChanged, neededQuantity));
        Elements.modifiers.push(new ListItemModifier(ModifierValueChanged, luggageQuantity));
        Elements.modifiers.push(new ListItemModifier(ModifierValueChanged, wearingQuantity));
        Elements.modifiers.push(new ListItemModifier(ModifierValueChanged, backpackQuantity));

        //Add the Modifier elements to the DOM
        for (var i = 0; i < Elements.modifiers.length; i++)
        {
            Elements.wrapper.appendChild(Elements.modifiers[i].GetWrapper()); //TODO see if this is really necessary or if it can be done a better way
        }

        // CreateDivForQuantityPopover(neededQuantity);
        // CreateDivForQuantityPopover(luggageQuantity);
        // CreateDivForQuantityPopover(wearingQuantity);
        // CreateDivForQuantityPopover(backpackQuantity);

    
        CreateRowSettingsView(rowId, Elements.Settings, Elements.name.GetToggle());

        Elements.Settings.buttonDelete.addEventListener('click', function()
        {   
            GridManager.RemoveRow(Elements.wrapper);
        });

        Elements.wrapper.appendChild(Elements.Settings.wrapper);
    }

    // function CreateDivForQuantityPopover(quantity)
    // {
    //     /* Create Popover Elements */
    //     var buttonMinus = CreateButtonWithIcon('buttonMinus', 'btn', 'fa fa-minus-circle fa-lg');
    //     var buttonPlus = CreateButtonWithIcon('buttonPlus', 'btn', 'fa fa-plus-circle fa-lg');
    
    //     var popoverToggle = CreatePopoverToggle('btn btn-sm buttonQuantity', quantity, [buttonMinus, buttonPlus], 'manual');
    
    //     popoverToggle.addEventListener('click', function(e) 
    //     {
    //         console.log("A Popover toggle was pressed");

    //         //If there is no popover currently active, show the popover for the selected toggle
    //         if(GridManager.GetActivePopover() == null)
    //         {
    //             //When there is no active popover and a toggle is selected, prevent further click events from closing the popover immediately
    //             if(e.target == popoverToggle)
    //             {
    //                 console.log("Prevented click event from bubbling up");
    //                 e.stopPropagation();
    //             }

    //             $(popoverToggle).popover('show');
    //         }
    //     });
    
    //     $(popoverToggle).on('shown.bs.popover', function() 
    //     {
    //         console.log("A Popover was shown");
    //         GridManager.SetActivePopover(popoverToggle);
    
    //         document.getElementById('buttonMinus').addEventListener('click', function() 
    //         {
    //             ModifyQuantityValue(popoverToggle, false);
    //         });         
    //         document.getElementById('buttonPlus').addEventListener('click', function() 
    //         {
    //             ModifyQuantityValue(popoverToggle, true);
    //         }); 
    
    //         document.addEventListener('click', GridManager.HideActiveQuantityPopover);
    //         console.log("An onclick listener was added to the whole document");
    //     });
    
    //     $(popoverToggle).on('hidden.bs.popover', function()
    //     {
    //         console.log("A Popover was hidden");
    //         GridManager.SetActivePopover(null);
    //     });

    //     Elements.listQuantityPopovers.push(popoverToggle);
    
    //     Elements.wrapper.appendChild(CreateNewElement('div', [ ['class','col'] ], popoverToggle));
    // }

    // function ModifyQuantityValue(quantityElement, increase)
    // {
    //     console.log("Request called to modify a quantity value.");

    //     if (increase == true)
    //     {
    //         quantityElement.text = parseInt(quantityElement.text) + 1;
    //         SetItemColumnColor();
    //         GridManager.GridModified();
    //     }
    //     else if (parseInt(quantityElement.text) > 0)
    //     {
    //         quantityElement.text = parseInt(quantityElement.text) - 1;
    //         SetItemColumnColor();
    //         GridManager.GridModified();
    //     }
    // }

    function SetItemColumnColor()
    {
        if (Elements.modifiers[QuantityType.Needed].GetValue() == 0)
        {
            Elements.name.SetColor('rgb(77, 77, 77)'); //"darkgrey";
            //Elements.nameToggle.style.borderColor = 'rgb(77, 77, 77)';
            //Elements.nameToggle.style.backgroundColor = 'rgba(169, 169, 169, 0.6)';
        }
        else if (Elements.modifiers[QuantityType.Needed].GetValue() == (parseInt(Elements.modifiers[QuantityType.Luggage].GetValue()) + parseInt(Elements.modifiers[QuantityType.Wearing].GetValue()) + parseInt(Elements.modifiers[QuantityType.Backpack].GetValue())))
        { //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare then compare the 'needed' counter with the 'packed' counter)
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

    function ModifierValueChanged()
    {
        console.log("A modifier value was changed");
        SetItemColumnColor();
        GridManager.GridModified();
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
                Elements.name.GetValue(), 
                Elements.modifiers[QuantityType.Needed].GetValue(), 
                Elements.modifiers[QuantityType.Luggage].GetValue(), 
                Elements.modifiers[QuantityType.Wearing].GetValue(), 
                Elements.modifiers[QuantityType.Backpack].GetValue()
            ];
        },
        ClearQuantityValue : function(quantityIndex)
        {
            Elements.modifiers[quantityIndex].SetValue(0);
            SetItemColumnColor();
        },
        ExpandSettings : function()
        {
            $(Elements.Settings.wrapper).collapse('show');
            Elements.Settings.editNameTextarea.focus();
        }
    };
}

