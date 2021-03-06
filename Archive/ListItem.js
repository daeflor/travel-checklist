//TODO might prefer to take a data object as a parameter
function ListItem(listItemId, listItemName, quantities, listId) //TODO passing listId should be temporary for a hack
{
    setupElements();

    /** Private Functions **/

    //TODO Maybe split this up into things that need to be rendered, and things that need to be bound
    function setupElements()
    {
        window.View.Render(
            'AddListItem', 
            {
                listItemId: listItemId, 
                listItemName: listItemName,
                quantityValues: quantities,
                listId: listId, //TODO This is weird and should be temp
            }
        );

        updateListItemNameColor(quantities);

        //Bind user interaction with the quantity toggles to corresponding behavior
        for (var key in quantities)
        {
            window.View.Bind(
                'QuantityPopoverShown', 
                function(popoverToggle, quantityType) {
                    window.GridManager.SetActivePopover(popoverToggle);

                    //TODO There might be a better way to do this, where the BIND can be done when the +/- buttons are created and not when the popover is shown.

                    window.View.Bind('DecrementQuantityButtonPressed', function()
                    {   
                        updateQuantityValue(quantityType, 'decrement');
                    });
        
                    window.View.Bind('IncrementQuantityButtonPressed', function()
                    {
                        updateQuantityValue(quantityType, 'increment');
                    });
        
                    window.View.Bind('ClickDetected', window.GridManager.HideActiveQuantityPopover);
                },
                {listItemId:listItemId, quantityType:key}
            );
        }

        //When the animation to expand the Settings View starts, inform the GridManager to change the Active Settings View
        window.View.Bind(
            'SettingsViewExpansionStarted', 
            function(element) {
                window.View.Render('HideActiveSettingsView'); 
            },
            {id:listItemId}
        );

        //TODO might be nice to move the anonymous functions within the bindings above and below into named functions that are just reference by the bind, for potentially better readability

        //Add an event listener for when the Text Area to edit the List Item name is modified
        window.View.Bind(
            'NameEdited', 
            function(updatedValue) {
                window.Model.EditListItemName(listId, listItemId, updatedValue);
                window.View.Render('UpdateName', {id:listItemId, updatedValue:updatedValue}); 
            },
            {id:listItemId}
        );  
    }

    function updateQuantityValue(quantityType, assignmentType)
    {
        Model.EditListItemQuantity(listId, listItemId, quantityType, assignmentType, function(updatedQuantities) {
            updateListItemQuantityText(updatedQuantities, quantityType);
            updateListItemNameColor(updatedQuantities);
        });
    }

    function updateListItemQuantityText(updatedQuantities, type)
    {
        window.View.Render('updateListItemQuantityText', {
            listItemId:listItemId, 
            quantityType:type, 
            updatedValue:updatedQuantities[type]
        });
    }

    function updateListItemNameColor(updatedQuantities)
    {
        window.View.Render('updateListItemNameColor', {
            listItemId:listItemId, 
            quantityNeeded:updatedQuantities.needed, 
            quantityBalance:(updatedQuantities.needed - updatedQuantities.luggage - updatedQuantities.wearing - updatedQuantities.backpack)
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
        ClearQuantityValue : function(quantityType)
        {
            updateQuantityValue(quantityType, 'clear');
        }
        // ExpandSettings : function() //TODO this only is used when a new row is added, which isn't very obvious. Could it take a param about whether or not it should focus, and this this could be used in all cases?
        // {
        //     //Manually trigger the Settings View to begin expanding and bring focus to the Text Area to edit the List Item name
        //     window.View.Render('ExpandSettingsView', {id:listItemId});       
        // }
        //Init : init
    };
}

