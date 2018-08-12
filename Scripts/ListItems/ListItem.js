// function ListItemData()
// {
//     this.settings = { //TODO this should not be in the Model
//          wrapper: null, 
//          editNameTextarea: null,
//          buttonDelete: null,
//     };
// }

//TODO would prefer to take a data object as a parameter
function ListItem(listItemId, listItemName, quantities, listId) //TODO passing listId should be temporary for a hack
{
    //TODO split actual data (e.g. the 'name' string) from elements (e.g. the 'name' child element / object)
    // var model = {
    //     data: new ListItemData(), //TODO would it be better if this were just null?
    //     GetSettings : function()
    //     {
    //         return this.data.settings;
    //     },
    // };

    SetupElements();

    /** Private Functions **/

    function SetupElements()
    {
        //TODO Is it good to edit properties of the model data directly?

        //TODO why pass initial quantity values as parameters if we can use SetValue instead? Well why not?

        window.View.Render('addListItem', {
            listItemId: listItemId, 
            listItemName: listItemName,
            quantityValues: quantities,
            //settings: model.GetSettings(), //TODO This is weird and should be temp
            listId: listId, //TODO This is weird and should be temp
        });

        UpdateListItemNameColor(quantities);

        //Bind user interaction with the quantity toggles to corresponding behavior
        for (var key in quantities)
        {
            window.View.Bind('showPopover', 
                function(popoverToggle, quantityType)
                {
                    window.GridManager.SetActivePopover(popoverToggle);
        
                    window.View.Bind('decrementQuantity', function(increase)
                    {   
                        DecrementQuantityValue(quantityType);
                    });
        
                    window.View.Bind('incrementQuantity', function(increase)
                    {
                        IncrementQuantityValue(quantityType);
                    });
        
                    //TODO could/should move this to a Bind as well, assuming this all even works / is needed
                    document.addEventListener('click', window.GridManager.HideActiveQuantityPopover);
                    console.log("An onclick listener was added to the whole document");
                },
                {listItemId:listItemId, quantityType:key}
            );
        }

        //When the animation to expand the Settings View starts, inform the GridManager to change the Active Settings View
        window.View.Bind('SettingsViewExpansionStarted', function(element) {
            window.GridManager.ToggleActiveSettingsView(element);},
            {id:listItemId}
        );

        // //When the animation to expand the Settings View ends, scroll the Settings View into view
        // window.View.Bind('SettingsViewExpansionEnded', function() {
        //     window.GridManager.ToggleActiveSettingsView();},
        //     {id:listItemId}
        // );
    }

    function UpdateListItemQuantityValue(updatedQuantities, type)
    {
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
        Model.EditListItemQuantity(listId, listItemId, type, {type:'set', value:newValue}, function(updatedQuantities) {
            UpdateListItemQuantityValue(updatedQuantities, type);
            UpdateListItemNameColor(updatedQuantities);
        });
    }

    function DecrementQuantityValue(type)
    {
        Model.EditListItemQuantity(listId, listItemId, type, {type:'decrement'}, function(updatedQuantities) {
            UpdateListItemQuantityValue(updatedQuantities, type);
            UpdateListItemNameColor(updatedQuantities);
        });
    }

    function IncrementQuantityValue(type)
    {
        Model.EditListItemQuantity(listId, listItemId, type, {type:'increment'}, function(updatedQuantities) {
            UpdateListItemQuantityValue(updatedQuantities, type);
            UpdateListItemNameColor(updatedQuantities);
        });
    }

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
        },
        ExpandSettings : function() //TODO this only is used when a new row is added, which isn't very obvious. Could it take a param about whether or not it should focus, and this this could be used in all cases?
        {
            window.View.Render('ExpandSettingsView', {id:listItemId});

            // //Manually trigger the Settings View to begin expanding
            // $(model.GetSettings().wrapper).collapse('show');

            // //Bring focus to the Text Area to edit the List Item name
            // model.GetSettings().editNameTextarea.focus();         
        }
        //Init : init
    };
}

