function ListItemData()
{
    this.modifiers = [];
    this.settings = { //TODO this should not be in the Model
         wrapper: null, 
         editNameTextarea: null,
         buttonDelete: null,
    };
}

//TODO would prefer to take a data object as a parameter
function ListItem(listItemId, listItemName, quantities, listId) //TODO passing listId should be temporary for a hack
{
    //TODO split actual data (e.g. the 'name' string) from elements (e.g. the 'name' child element / object)
    var model = {
        data: new ListItemData(), //TODO would it be better if this were just null?
        GetData : function()
        {
            return this.data;
        },
        GetModifiers : function()
        {
            return this.data.modifiers;
        },
        GetSettings : function()
        {
            return this.data.settings;
        },
        SetData : function(d)
        {
            this.data.modifiers = d.modifiers;
            this.data.settings = d.settings;
        },
        AddModifier : function(modifier)
        {
            this.data.modifiers.push(modifier); 
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

    SetupElements();

    /** Private Functions **/

    function SetupElements()
    {
        //TODO Is it good to edit properties of the model data directly?
        //Create the modifier elements for the List Item
        //TODO should be less hard coded (e.g. loop instead) and include the type of modifier (e.g. quantity/travel vs checkbox) (KVPs)
        //TODO why pass an initial value as a parameter if we can use SetValue instead?
        //TODO could some sort of binding be done here instead of passing the ModifierValueChanged function?
        model.AddModifier(new ListItemModifier(ModifierValueChanged, quantities.needed));
        model.AddModifier(new ListItemModifier(ModifierValueChanged, quantities.luggage));
        model.AddModifier(new ListItemModifier(ModifierValueChanged, quantities.wearing));
        model.AddModifier(new ListItemModifier(ModifierValueChanged, quantities.backpack));



        window.View.Render(
            'addListItem', {
                listItemId: listItemId, 
                listItemName: listItemName,
                settings: model.GetSettings(), //TODO This is weird and should be temp
                modifiers: model.GetModifiers(), //TODO This is weird and should be temp
                listId: listId, //TODO This is weird and should be temp
            });
    }

    function ModifierValueChanged()
    {
        console.log("A modifier value was changed");
        
        window.View.Render(
            'updateListItemColor', {
                listItemId: listItemId, 
                quantityBalance: model.GetQuantityBalance(), 
                quantityNeeded: model.GetQuantityNeeded()
            });

        window.GridManager.GridModified();
    }

    /** Experimental & In Progress **/
  
    /** Public Functions **/

    return { 
        GetId : function()
        {
            return listItemId;
        },
        GetDataForStorage : function()
        {
            return new ListItemStorageData({
                id: listItemId, 
                name: window.View.GetListItemNameButton(listItemId).textContent, //TODO this is a bad hack
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

