function ListItemData()
{
    // this.modifiers = {
    //     needed: null,
    //     luggage: null,
    //     wearing: null,
    //     backpack: null
    // };
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
        GetSettings : function()
        {
            return this.data.settings;
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
        // model.GetModifiers().needed = new ListItemModifier(ModifierValueChanged, quantities.needed, 'needed', listItemId);
        // model.GetModifiers().luggage = new ListItemModifier(ModifierValueChanged, quantities.luggage, 'luggage', listItemId);
        // model.GetModifiers().wearing = new ListItemModifier(ModifierValueChanged, quantities.wearing, 'wearing', listItemId);
        // model.GetModifiers().backpack = new ListItemModifier(ModifierValueChanged, quantities.backpack, 'backpack', listItemId);

        window.View.Render('addListItem', {
            listItemId: listItemId, 
            listItemName: listItemName,
            quantityValues: quantities,
            settings: model.GetSettings(), //TODO This is weird and should be temp
            //modifiers: model.GetModifiers(), //TODO This is weird and should be temp
            listId: listId, //TODO This is weird and should be temp
        });

        UpdateListItemNameColor(quantities);

        for (var key in quantities)
        {
            window.View.Bind('showPopover', 
                function(popoverToggle, quantityType)
                {
                    window.GridManager.SetActivePopover(popoverToggle);
        
                    window.View.Bind('decrementQuantity', function(increase)
                    {   
                        //model.GetModifiers()[quantityType].DecrementValue();
                        //ModifierValueChanged(quantityType, model.GetModifiers()[quantityType].GetValue());
                        DecrementQuantityValue(quantityType);
                    });
        
                    window.View.Bind('incrementQuantity', function(increase)
                    {
                        //model.GetModifiers()[quantityType].IncrementValue();
                        //ModifierValueChanged(quantityType, model.GetModifiers()[quantityType].GetValue());
                        IncrementQuantityValue(quantityType);
                    });
        
                    //TODO could move this to a Bind as well, assuming this all even works
                    document.addEventListener('click', window.GridManager.HideActiveQuantityPopover);
                    console.log("An onclick listener was added to the whole document");
                },
                {listItemId:listItemId, quantityType:key}
            );
        }
    }

    function UpdateListItemQuantityValue(updatedQuantities, type)
    {
        //console.log("Updated Quantities: " + updatedQuantities);
        window.View.Render('updateModifierValue', {
            listItemId:listItemId, 
            quantityType:type, 
            updatedValue:updatedQuantities[type]
        });
    }

    function UpdateListItemNameColor(updatedQuantities)
    {
        window.View.Render('updateListItemNameColor', {
            listItemId:listItemId, 
            quantityNeeded:updatedQuantities.needed, 
            quantityBalance:(updatedQuantities.needed - updatedQuantities.luggage - updatedQuantities.wearing - updatedQuantities.backpack)
        });
    }

    function SetQuantityValue(type, newValue)
    {
        //TODO Using the same 'quantities' variable name seems prone to error and confusion
        Model.EditListItemQuantity(listId, listItemId, type, {type:'set', value:newValue}, function(updatedQuantities) {
            // if (dataModified == true)
            // {
                UpdateListItemQuantityValue(updatedQuantities, type);
                // window.View.Render('updateModifierValue', {
                //     listItemId:listItemId, 
                //     quantityType:type, 
                //     updatedValue:quantities[type]
                // });
                UpdateListItemNameColor(updatedQuantities);
                // window.View.Render('updateListItemNameColor', {
                //     listItemId:listItemId, 
                //     quantityNeeded:quantities.needed, 
                //     quantityBalance:(quantities.needed-quantities.luggage-quantities.wearing-quantities.backpack)
                // });
            //}
        });
    }

    function DecrementQuantityValue(type)
    {
        Model.EditListItemQuantity(listId, listItemId, type, {type:'decrement'}, function(updatedQuantities) {
            // if (dataModified == true)
            // {
                UpdateListItemQuantityValue(updatedQuantities, type);
                // window.View.Render('updateModifierValue', {
                //     listItemId:listItemId, 
                //     quantityType:type, 
                //     updatedValue:quantities[type]
                // });
                UpdateListItemNameColor(updatedQuantities);
                // window.View.Render('updateListItemNameColor', {
                //     listItemId:listItemId, 
                //     quantityNeeded:quantities.needed, 
                //     quantityBalance:(quantities.needed-quantities.luggage-quantities.wearing-quantities.backpack)
                // });
            //}
        });
    }

    function IncrementQuantityValue(type)
    {
        Model.EditListItemQuantity(listId, listItemId, type, {type:'increment'}, function(updatedQuantities) {
            // if (dataModified == true)
            // {
                    UpdateListItemQuantityValue(updatedQuantities, type);
                // window.View.Render('updateModifierValue', {
                //     listItemId:listItemId, 
                //     quantityType:type, 
                //     updatedValue:quantities[type]
                // });
                UpdateListItemNameColor(updatedQuantities);
                // window.View.Render('updateListItemNameColor', {
                //     listItemId:listItemId, 
                //     quantityNeeded:quantities.needed, 
                //     quantityBalance:(quantities.needed-quantities.luggage-quantities.wearing-quantities.backpack)
                // });
            // }
        });
    }

    // function ModifierValueChanged(type, updatedValue)
    // {
    //     //console.log("A modifier value was changed");

    //     Model.EditListItemQuantity(listId, listItemId, type, updatedValue, function(quantities) {
    //         window.View.Render('updateModifierValue', {
    //             listItemId:listItemId, 
    //             quantityType:type, 
    //             updatedValue:updatedValue
    //         });
    //         window.View.Render('updateListItemNameColor', {
    //             listItemId:listItemId, 
    //             quantityNeeded:quantities.needed, 
    //             quantityBalance:(quantities.needed-quantities.luggage-quantities.wearing-quantities.backpack)
    //         });
    //     });

    //     //////

    //     // Model.EditListItemQuantity(listId, listItemId, type, updatedValue);

    //     // window.View.Render(
    //     //     'updateListItemQuantityValue', 
    //     //     {
    //     //         listItemId: listItemId, 
    //     //         quantityBalance: model.GetQuantityBalance(), 
    //     //         quantityNeeded: model.GetQuantityNeeded(),
    //     //         updatedValue: updatedValue,
    //     //         quantityType: type
    //     //     }
    //     // );
    // }

    /** Experimental & In Progress **/

    // function Init(expandSettings)
    // {
    //     if (expandSettings == true)
    //     {
    //         //Manually trigger the Settings View to begin expanding
    //         $(model.GetData().settings.wrapper).collapse('show');

    //         //Bring focus to the Text Area to edit the List Item name
    //         model.GetData().settings.editNameTextarea.focus();     
    //     }
    // }
  
    /** Public Functions **/

    return { 
        GetId : function()
        {
            return listItemId;
        },
        GetDataForStorage : function()
        {
            //TODO Getting info from the DOM is all a TEMP hack while the storage refactor is in progress
            return new ListItemStorageData({
                id: listItemId, 
                name: window.View.GetListItemNameButton(listItemId).textContent, 
                quantityNeeded: parseInt(document.getElementById('neededQuantityToggle-'.concat(listItemId)).text), 
                quantityLuggage: parseInt(document.getElementById('neededQuantityToggle-'.concat(listItemId)).text), 
                quantityWearing: parseInt(document.getElementById('neededQuantityToggle-'.concat(listItemId)).text), 
                quantityBackpack: parseInt(document.getElementById('neededQuantityToggle-'.concat(listItemId)).text)
            });
        },
        ClearQuantityValue : function(quantityType)
        {
            SetQuantityValue(quantityType, 0);

            //model.GetData().modifiers[quantityType].SetValue(0);

            //ModifierValueChanged();
        },
        ExpandSettings : function() //TODO this only is used when a new row is added, which isn't very obvious. Could it take a param about whether or not it should focus, and this this could be used in all cases?
        {
            //Manually trigger the Settings View to begin expanding
            $(model.GetSettings().wrapper).collapse('show');

            //Bring focus to the Text Area to edit the List Item name
            model.GetSettings().editNameTextarea.focus();         
        }
        // UpdateColor : function()
        // {
        //     window.View.Render('updateListItemColor', {listItemId:listItemId, quantityBalance:model.GetQuantityBalance(), quantityNeeded:model.GetQuantityNeeded()});
        // },
        //Init : init
    };
}

