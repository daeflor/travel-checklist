function ListItemData()
{
    // this.name = null;
    this.modifiers = [];
    this.settings = { //TODO this should not be in the Model
         wrapper: null, 
         editNameTextarea: null,
         buttonDelete: null,
    };
}

//TODO would prefer to take a data object as a parameter
function ListItem(listItemId, itemName, quantities)
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
            // this.data.name = d.name;
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
            this.elements.wrapper = CreateNewElement('div', [ ['id',listItemId], ['class','row divItemRow'] ]);

            //Add the List Item Name to the DOM
            this.elements.wrapper.appendChild(nameWrapper);

            //Add the Modifier elements to the DOM
            for (var i = 0; i < model.GetData().modifiers.length; i++)
            {
                this.elements.wrapper.appendChild(model.GetData().modifiers[i].GetWrapper()); //TODO see if this is really necessary or if it can be done a better way
            }

            //Add the Settings panel to the DOM
            this.elements.wrapper.appendChild(model.GetData().settings.wrapper);
        }
    };

    SetupElements();

    //TODO these are temp
    var nameToggle;
    var nameWrapper;

    /** Private Functions **/

    function SetupElements()
    {
        //TODO Is it better to edit properties of the model data directly?
         var data = new ListItemData();

        //TODO is it necessary to pass listItemId as a parameter?
        //Create the name toggle that can be selected to open or close the settings view for the List Item
        nameToggle = CreateToggleForCollapsibleView('edit-row-'.concat(listItemId), 'buttonListItem buttonListItemName', itemName);
        
        //Create the div wrapper for the List Item Name 
        nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], nameToggle);
       
        //Create the modifier elements for the List Item
        //TODO should be less hard coded (e.g. loop instead) and include the type of modifier (e.g. quantity/travel vs checkbox) (KVPs)
        //TODO why pass an initial value as a parameter if we can use SetValue instead?
        //TODO could some sort of binding be done here instead of passing the ModifierValueChanged function?
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, quantities.needed));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, quantities.luggage));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, quantities.wearing));
        data.modifiers.push(new ListItemModifier(ModifierValueChanged, quantities.backpack));
    
        CreateRowSettingsView(listItemId, data.settings, nameToggle, SettingsViewExpanded);

        data.settings.buttonDelete.addEventListener('click', function()
        {   
            window.GridManager.RemoveRow(view.GetWrapper());
        });

        model.SetData(data);
        view.AddElementsToDom(model);
    }

    function ModifierValueChanged()
    {
        console.log("A modifier value was changed");
        
        window.View.Render('updateListItemColor', {listItemId:listItemId, quantityBalance:model.GetQuantityBalance(), quantityNeeded:model.GetQuantityNeeded()})
        //view.Update(model);

        window.GridManager.GridModified();
    }

    function SettingsViewExpanded()
    {
        console.log("A Settings View has been expanded.");

        view.GetWrapper().scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
    }

    /** Experimental & In Progress **/
  
    /** Public Functions **/

    return { 
        GetId : function()
        {
            return listItemId;
        },
        GetWrapper : function()
        {
            return view.GetWrapper();
        },
        GetDataForStorage : function()
        {
            return new ListItemStorageData({
                id: listItemId, 
                name: nameToggle.textContent,
                quantityNeeded: model.GetData().modifiers[QuantityType.Needed.index].GetValue(), 
                quantityLuggage: model.GetData().modifiers[QuantityType.Luggage.index].GetValue(), 
                quantityWearing: model.GetData().modifiers[QuantityType.Wearing.index].GetValue(), 
                quantityBackpack: model.GetData().modifiers[QuantityType.Backpack.index].GetValue()
            });
        },
        ClearQuantityValue : function(quantityIndex)
        {
            model.GetData().modifiers[quantityIndex].SetValue(0);

            ModifierValueChanged();
            //view.Update(model);
        },
        ExpandSettings : function() //TODO this only is used when a new row is added, which isn't very obvious. Could it take a param about whether or not it should focus, and this this could be used in all cases?
        {
            //Manually trigger the Settings View to begin expanding
            $(model.GetData().settings.wrapper).collapse('show');

            //Bring focus to the Text Area to edit the List Item name
            model.GetData().settings.editNameTextarea.focus();         
        },
        UpdateColor : function()
        {
            window.View.Render('updateListItemColor', {listItemId:listItemId, quantityBalance:model.GetQuantityBalance(), quantityNeeded:model.GetQuantityNeeded()});
        }
    };
}

