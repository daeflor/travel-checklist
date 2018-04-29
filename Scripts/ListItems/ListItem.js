function ListItemModel()
{
    var data = {
        name: null,
        modifiers: [],
        Settings : {
                    wrapper: null,
                    editNameTextarea: null,
                    buttonDelete: null,
                },
    };


    // var name;
    // var modifiers;
    // var Settings = {
    //     wrapper: null, 
    //     editNameTextarea: null,
    //     buttonDelete: null,
    // }

    var quantityNeeded;
    var quantityAccountedFor;
    //var color;

    return { 
        GetData : function()
        {
            return data;
        }
    };
}

function ListItemViewController(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    var color;
    var wrapper;

    var model = new ListItemModel();

    function SetupElements()
    {
        //Create the List Item Name elements
        model.GetData().name = new ListItemName(rowId, itemName) //TODO is it necessary to pass rowId as a parameter?
        
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
    
        CreateRowSettingsView(rowId, Elements.Settings, Elements.name.GetToggle());

        Elements.Settings.buttonDelete.addEventListener('click', function()
        {   
            GridManager.RemoveRow(Elements.wrapper);
        });

        Elements.wrapper.appendChild(Elements.Settings.wrapper);
    }

    function SetItemColumnColor()
    {
        if (model.GetData().modifiers[QuantityType.Needed].GetValue() == 0)
        {
            model.GetData().name.SetColor('rgb(77, 77, 77)'); //"darkgrey";
        }
        else if (model.GetData().modifiers[QuantityType.Needed].GetValue() == (parseInt(model.GetData().modifiers[QuantityType.Luggage].GetValue()) + parseInt(model.GetData().modifiers[QuantityType.Wearing].GetValue()) + parseInt(model.GetData().modifiers[QuantityType.Backpack].GetValue())))
        { //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare then compare the 'needed' counter with the 'packed' counter)
            model.GetData().name.SetColor('mediumseagreen');
        }
        else
        {
            model.GetData().name.SetColor('peru'); //lightsalmon is also good
        }
    }

    function ModifierValueChanged()
    {
        console.log("A modifier value was changed");
        SetItemColumnColor();
        GridManager.GridModified();
    }
}

/******/

function ListItem(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    var Elements = {
        wrapper: CreateNewElement('div', [ ['class','row divItemRow'] ]),
        name: null,
        modifiers: [],
        Settings : {
                    wrapper: null,
                    editNameTextarea: null,
                    buttonDelete: null,
                },
    };

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
    
        CreateRowSettingsView(rowId, Elements.Settings, Elements.name.GetToggle());

        Elements.Settings.buttonDelete.addEventListener('click', function()
        {   
            GridManager.RemoveRow(Elements.wrapper);
        });

        Elements.wrapper.appendChild(Elements.Settings.wrapper);
    }

    function SetItemColumnColor()
    {
        if (Elements.modifiers[QuantityType.Needed].GetValue() == 0)
        {
            Elements.name.SetColor('rgb(77, 77, 77)'); //"darkgrey";
        }
        else if (Elements.modifiers[QuantityType.Needed].GetValue() == (parseInt(Elements.modifiers[QuantityType.Luggage].GetValue()) + parseInt(Elements.modifiers[QuantityType.Wearing].GetValue()) + parseInt(Elements.modifiers[QuantityType.Backpack].GetValue())))
        { //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare then compare the 'needed' counter with the 'packed' counter)
            Elements.name.SetColor('mediumseagreen');
        }
        else
        {
            Elements.name.SetColor('peru'); //lightsalmon is also good
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

