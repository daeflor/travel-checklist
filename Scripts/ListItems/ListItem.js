function ListItem(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    //TODO split actual data (e.g. the 'name' string) from elements (e.g. the 'name' child element / object)
    var model = {
        data: new ListItemData(),
        GetData : function()
        {
            return this.data;
        },
        SetData : function(d)
        {
            this.data.name = d.name;
            this.data.modifiers = d.modifiers;
            this.data.settings = d.settings;
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
            this.elements.wrapper.appendChild(model.GetData().settings.wrapper);
        },
        Update : function(model)
        {
            if (model.GetData().modifiers[QuantityType.Needed].GetValue() == 0)
            {
                model.GetData().name.SetColor('rgb(77, 77, 77)'); //"darkgrey";
            }
            else if (model.GetData().modifiers[QuantityType.Needed].GetValue() == (parseInt(model.GetData().modifiers[QuantityType.Luggage].GetValue()) + parseInt(model.GetData().modifiers[QuantityType.Wearing].GetValue()) + parseInt(model.GetData().modifiers[QuantityType.Backpack].GetValue())))
            { //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare the 'needed' counter with the 'packed' counter)
                model.GetData().name.SetColor('mediumseagreen');
            }
            else
            {
                model.GetData().name.SetColor('peru'); //lightsalmon is also good
            }
        },
    };

    SetupElements();

    /** Private Functions **/

    function SetupElements()
    {
        //TODO Is it better to edit properties of the model data directly?
         var data = new ListItemData();

        //Create the List Item Name elements
        data.name = new ListItemName(rowId, itemName) //TODO is it necessary to pass rowId as a parameter?
       
        //Create the modifier elements for the List Item
        //TODO should be less hard coded (e.g. loop instead) and include the type of modifier (e.g. quantity/travel vs checkbox) (KVPs)
        //TODO why pass an initial value as a parameter if we can use SetValue instead?
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, neededQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, luggageQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, wearingQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, backpackQuantity));
    
        CreateRowSettingsView(rowId, data.settings, data.name.GetToggle());

        data.settings.buttonDelete.addEventListener('click', function()
        {   
            GridManager.RemoveRow(view.GetWrapper());
        });

        model.SetData(data);
        //console.log(model.GetData().name.GetValue());
        view.AddElementsToDom(model);
        view.Update(model);
    }

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
            $(model.GetData().settings.wrapper).collapse('show');
            model.GetData().settings.editNameTextarea.focus();
        }
    };
}

function ListItemData()
{
    this.name = null;
    this.modifiers = [];
    this.settings = {
         wrapper: null, 
         editNameTextarea: null,
         buttonDelete: null,
    };
}

