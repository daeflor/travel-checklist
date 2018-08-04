function ListItemData()
{
    this.name = null;
    this.modifiers = [];
    this.settings = { //TODO this should not be in the Model
         wrapper: null, 
         editNameTextarea: null,
         buttonDelete: null,
    };
}

function ListItem(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    //TODO split actual data (e.g. the 'name' string) from elements (e.g. the 'name' child element / object)
    var model = {
        data: new ListItemData(), //TODO would it be better if this were just null?
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
        GetQuantityNeeded : function()
        {
            console.log("ListItem requesting Quantity Needed value from ListItemModifier. Value returned: " + this.data.modifiers[QuantityType.Needed.index].GetValue());
            return this.data.modifiers[QuantityType.Needed.index].GetValue();
        },
        GetQuantityBalance : function()
        {
            return (this.data.modifiers[QuantityType.Needed.index].GetValue() - this.data.modifiers[QuantityType.Luggage.index].GetValue() - this.data.modifiers[QuantityType.Wearing.index].GetValue() - this.data.modifiers[QuantityType.Backpack.index].GetValue());
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
        Update : function(model) //TODO update this to use the Render method used by ListItemModifier, and pass the specific data values needed
        {
            //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare the 'needed' counter with the 'packed' counter)
            if (model.GetQuantityBalance() != 0)
            {
                //TODO The View shouldn't be telling the Model to update a color...
                model.GetData().name.SetColor('peru'); //lightsalmon is also good
            }
            else if (model.GetQuantityNeeded() != 0)
            {
                model.GetData().name.SetColor('mediumseagreen');
            }
            else 
            {
                model.GetData().name.SetColor('rgb(77, 77, 77)'); //"darkgrey";
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
        //TODO could some sort of binding be done here instead of passing the ModifierValueChanged function?
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, neededQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, luggageQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, wearingQuantity));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, backpackQuantity));
    
        CreateRowSettingsView(rowId, data.settings, data.name.GetToggle(), SettingsViewExpanded);

        data.settings.buttonDelete.addEventListener('click', function()
        {   
            GridManager.RemoveRow(view.GetWrapper());
        });

        model.SetData(data);
        //console.log(model.GetData().name.GetValue());
        view.AddElementsToDom(model);
        view.Update(model); //TODO maybe don't force call this here. The modifiers could call it
    }

    function ModifierValueChanged()
    {
        console.log("A modifier value was changed");
        view.Update(model);
        GridManager.GridModified();
    }

    function SettingsViewExpanded()
    {
        console.log("A Settings View has been expanded.");
        view.GetWrapper().scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
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
                model.GetData().modifiers[QuantityType.Needed.index].GetValue(), 
                model.GetData().modifiers[QuantityType.Luggage.index].GetValue(), 
                model.GetData().modifiers[QuantityType.Wearing.index].GetValue(), 
                model.GetData().modifiers[QuantityType.Backpack.index].GetValue()
            ];
        },
        ClearQuantityValue : function(quantityIndex)
        {
            model.GetData().modifiers[quantityIndex].SetValue(0);
            view.Update(model);
        },
        ExpandSettings : function() //TODO this only is used when a new row is added, which isn't very obvious. Could it take a param about whether or not it should focus, and this this could be used in all cases?
        {
            //Manually trigger the Settings View to begin expanding
            $(model.GetData().settings.wrapper).collapse('show');

            //Bring focus to the Text Area to edit the List Item name
            model.GetData().settings.editNameTextarea.focus();         
        }
    };
}

