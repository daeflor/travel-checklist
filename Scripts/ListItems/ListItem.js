function ListItem(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    var model = {
        data: {
            name : null,
            modifiers: [],
            Settings : {
                wrapper: null, 
                editNameTextarea: null,
                buttonDelete: null,
            },
        }, 
        GetData : function()
        {
            return this.data;
        },
        SetData : function(d)
        {
            this.data.name = d.name;
            this.data.modifiers = d.modifiers;
            this.data.Settings = d.Settings;
        },
    };

    var view = {
        elements: {
            wrapper : null,
        }, 
        GetWrapper : function()
        {
            return this.elements.wrapper;
        },
        AddElementsToDom : function(model)
        {
            //Create the wrapper for the entire List Item
            this.elements.wrapper = CreateNewElement('div', [ ['class','row divItemRow'] ]);

            //Add the List Item Name to the DOM
            this.elements.wrapper.appendChild(model.GetData().name.GetWrapper());

            //Add the Modifier elements to the DOM
            for (var i = 0; i < model.GetData().modifiers.length; i++)
            {
                this.elements.wrapper.appendChild(model.GetData().modifiers[i].GetWrapper()); //TODO see if this is really necessary or if it can be done a better way
            }

            //Add the Settings panel to the DOM
            this.elements.wrapper.appendChild(model.GetData().Settings.wrapper);
        },
        Update : function(model)
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
        },
        // GetElements : function()
        // {
        //     return elements;
        // },
    };

    // var Elements = {
    //     wrapper: CreateNewElement('div', [ ['class','row divItemRow'] ]),
    //     name: null,
    //     modifiers: [],
    //     Settings : {
    //                 wrapper: null, 
    //                 editNameTextarea: null,
    //                 buttonDelete: null,
    //             },
    // };

    SetupElements();
    //SetItemColumnColor();
    //view.SetItemStateColor();

    /** Private Functions **/

    function SetupElements()
    {
        //TODO this doesn't seem like the right thing to do
        var data = {
            name : null,
            modifiers: [],
            Settings : {
                wrapper: null, 
                editNameTextarea: null,
                buttonDelete: null,
            },
        };

        //Create the List Item Name elements
        data.name = new ListItemName(rowId, itemName) //TODO is it necessary to pass rowId as a parameter?
        
        //Add the List Item Name to the DOM
        //view.wrapper.appendChild(Elements.name.GetWrapper()); //TODO see if this is really necessary or if it can be done a better way

        //Create the modifier elements for the List Item
        //TODO should be less hard coded (e.g. loop instead) and include the type of modifier (e.g. quantity/travel vs checkbox) (KVPs)
        //TODO why pass an initial value as a parameter if we can use SetValue instead?
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, neededQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, luggageQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, wearingQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, backpackQuantity));

        //Add the Modifier elements to the DOM
        // for (var i = 0; i < Elements.modifiers.length; i++)
        // {
        //     Elements.wrapper.appendChild(Elements.modifiers[i].GetWrapper()); //TODO see if this is really necessary or if it can be done a better way
        // }
    
        CreateRowSettingsView(rowId, data.Settings, data.name.GetToggle());

        data.Settings.buttonDelete.addEventListener('click', function()
        {   
            GridManager.RemoveRow(view.GetWrapper());
        });

        //Elements.wrapper.appendChild(Elements.Settings.wrapper);

        ///

        model.SetData(data);
        console.log(model.GetData().name.GetValue());
        view.AddElementsToDom(model);
        view.Update(model);
    }

    // function SetItemColumnColor()
    // {
    //     if (Elements.modifiers[QuantityType.Needed].GetValue() == 0)
    //     {
    //         Elements.name.SetColor('rgb(77, 77, 77)'); //"darkgrey";
    //     }
    //     else if (Elements.modifiers[QuantityType.Needed].GetValue() == (parseInt(Elements.modifiers[QuantityType.Luggage].GetValue()) + parseInt(Elements.modifiers[QuantityType.Wearing].GetValue()) + parseInt(Elements.modifiers[QuantityType.Backpack].GetValue())))
    //     { //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare then compare the 'needed' counter with the 'packed' counter)
    //         Elements.name.SetColor('mediumseagreen');
    //     }
    //     else
    //     {
    //         Elements.name.SetColor('peru'); //lightsalmon is also good
    //     }
    // }

    function ModifierValueChanged()
    {
        console.log("A modifier value was changed");
        view.Update(model);
        GridManager.GridModified();
    }

    /** Experimental & In Progress **/
  
    /** Public Functions **/

    return { 
        GetWrapper : function()
        {
            return view.GetWrapper();
        },
        GetDataForStorage : function()
        {
            return [
                model.GetData().name.GetValue(), 
                model.GetData().modifiers[QuantityType.Needed].GetValue(), 
                model.GetData().modifiers[QuantityType.Luggage].GetValue(), 
                model.GetData().modifiers[QuantityType.Wearing].GetValue(), 
                model.GetData().modifiers[QuantityType.Backpack].GetValue()
            ];
        },
        ClearQuantityValue : function(quantityIndex)
        {
            model.GetData().modifiers[quantityIndex].SetValue(0);
            view.Update(model);
        },
        ExpandSettings : function()
        {
            $(model.GetData().Settings.wrapper).collapse('show');
            model.GetData().Settings.editNameTextarea.focus();
        }
    };
}

