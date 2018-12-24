window.ListController = (function()
{
    //var self = this;
    
    var activeListId;
    var quantityPopoverActive = false;

    /** List & Button Setup **/

    function init()
    {            
        //TODO would like all binds to be one-liners. (For-loops can be done in the methods instead of here). 
        window.View.Bind('NewListItemButtonPressed', AddNewListItem);

        //////

        //TODO Adding the quantity header to the DOM (below) should be done in a separate method, depending on the checklist type

        window.View.Render('GenerateQuantityHeader'); //TODO right now this assumes the header to display is the Travel type

        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' column button 
        for (var key in QuantityType)
        {
            bindQuantityHeaderToggleEvents(key);
        }

        //setView();
    }

    function loadListItemsIntoView(loadedListData)
    {
        window.DebugController.Print("Number of Lists retrieved from Model: " + loadedListData.length);

        for (var i = 0; i < loadedListData.length; i++) 
        {
            for (var j = 0; j < loadedListData[i].listItems.length; j++) 
            {
                addListItemToView(loadedListData[i].id, loadedListData[i].listItems[j]);
            }
        }
    }

    //TODO this is hard to read
    function bindQuantityHeaderToggleEvents(quantityType)
    {
        window.View.Bind(
            'QuantityHeaderPopoverShown', 
            function() {
                window.View.Bind(
                    'ClearButtonPressed', 
                    function()
                    {
                        window.DebugController.Print("Clear button was clicked for quantity type: " + quantityType);

                        //TODO this could be handled more efficiently 
                        var modelUpdated = function(modifiedListItems)
                        {
                            clearQuantitiesInView(modifiedListItems, quantityType);
                        };

                        window.Model.ModifyList('ClearQuantityValues', activeListId, modelUpdated, {quantityType:quantityType});
                    }
                );
            },
            {quantityType:quantityType}
        );
    }

    function clearQuantitiesInView(listItems, quantityType)
    {
        //Traverse the array of List Items
        for (var i = 0; i < listItems.length; i++)
        {
            //Update the List Item's quantity value for the given type
            updateListItemQuantityText(listItems[i], quantityType);
            
            //Update the List Item name's color
            updateListItemNameColor(listItems[i]);
        }
    }

    /** List Management **/

    function AddNewListItem()
    {
        window.Model.ModifyList(
            'AddListItem', 
            activeListId,
            function(newListItem) 
            {
                addListItemToView(activeListId, newListItem);
                
                //After the List Item is added to the DOM, expand its Settings View
                window.View.Render('ExpandSettingsView', {id:newListItem.id});
                //expandSettingsView(newListItem.id);
            }
        );
    }

    function addListItemToView(listId, listItem)
    //function addListItemToView(listId, listItemId, listItemName, quantities)
    {
        //TODO Maybe split this up into things that need to be rendered, and things that need to be bound

        //TODO would it be better to just pass a ListItem object and let the View parse it, rather than splitting up the params here?... Unsure...
        window.View.Render(
            'AddListItem', 
            { 
                listItemId: listItem.id, 
                listItemName: listItem.name,
                quantityValues: listItem.quantities,
                listId: listId, 
            }
        );

        //TODO The above could probably be separated from all the below. (and then go back to passing ListItemId as a parameter?)

        updateListItemNameColor(listItem);

        //Bind user interaction with the quantity toggles to corresponding behavior
        for (var key in listItem.quantities)
        {
            (function(lockedKey) //TODO is there a simpler way to do this?
            {
                var _showQuantityPopover = function(event) {
                    if (quantityPopoverActive == false)
                    {
                        window.DebugController.Print("A Quantity Popover will be shown, and events will be prevented from bubbling up.");

                        event.stopPropagation();
                        window.View.Render('ShowQuantityPopover', {listItemId:listItem.id, quantityType:lockedKey});   
                        quantityPopoverActive = true;
                    }
                };
    
                var _quantityPopoverShown = function() {
                    window.DebugController.Print("A Quantity Popover was shown.");

                    //TODO There might be a better way to do this, where these BINDs can be done when the +/- buttons are created and not when the popover is shown.
                    window.View.Bind('ClickDetectedOutsidePopover', _hideQuantityPopover, {listItemId:listItem.id, quantityType:lockedKey});   
                    window.addEventListener("hashchange", _hideQuantityPopover, {once:true}); //If the hash location changes (e.g. the Back button is pressed), the popover should be hidden.
                    window.View.Bind('DecrementQuantityButtonPressed', _decrementListItemQuantityValue);
                    window.View.Bind('IncrementQuantityButtonPressed', _incrementListItemQuantityValue);
                };
    
                var _decrementListItemQuantityValue = function() {   
                    updateListItemQuantityValue(listId, listItem.id, lockedKey, 'decrement');
                };
    
                var _incrementListItemQuantityValue = function() {
                    updateListItemQuantityValue(listId, listItem.id, lockedKey, 'increment');
                };
                
                var _hideQuantityPopover = function() {
                    window.DebugController.Print("A Quantity Popover will be hidden.");

                    window.View.Render('HideQuantityPopover', {listItemId:listItem.id, quantityType:lockedKey} );
                    quantityPopoverActive = false;
                };
    
                window.View.Bind('QuantityToggleSelected', _showQuantityPopover, {listItemId:listItem.id, quantityType:lockedKey});
    
                window.View.Bind('QuantityPopoverShown', _quantityPopoverShown, {listItemId:listItem.id, quantityType:lockedKey});    
            })(key);
        }

        //When the animation to expand the Settings View starts, inform the View to hide the Active Settings View
        //bindSettingsViewExpansion(listItemId);
        window.View.Bind(
            'SettingsViewExpansionStarted', 
            function() 
            {
                window.View.Render('HideActiveSettingsView'); 
            },
            {id:listItem.id}
        );

        //TODO might be nice to move the anonymous functions within the bindings above and below into named functions that are just reference by the bind, for potentially better readability
            //yeah it would be good to make this section smaller and more readable
            //TODO could have a completely separate method like editListItemNameInModelAndView 
                            
        setupBindings('EditName', listId, listItem);

        var removeListItem = function() 
        {
            //Set up the callback method to execute once the Model has been updated
            var updateView = function()
            {
                window.View.Render('RemoveListItem', {listItemId:listItem.id}); 
            };

            //Update the Model
            window.Model.ModifyListItem('Remove', listId, listItem.id, updateView);
        };

        //Add an event listener to the Delete Button to remove the List Item
        window.View.Bind('DeleteButtonPressed', removeListItem, {id:listItem.id});

        // //Add an event listener to the Delete Button to remove the List Item
        // window.View.Bind(
        //     'DeleteButtonPressed', 
        //     function() 
        //     {
        //         removeListItem(listId, listItem.id);
        //     }, 
        //     {id:listItem.id}
        // );

        //TODO would rather move the two calls below into one method that takes a direction (up or down)

        //Add an event listener to the Move Upwards Button to move the List Item upwards by one position in the List
        window.View.Bind(
            'MoveUpwardsButtonPressed', 
            function() 
            {
                window.Model.ModifyListItem('MoveUpwards', listId, listItem.id, function(swappedListItem) {
                    window.View.Render('SwapListObjects', {moveUpwardsId:listItem.id, moveDownwardsId:swappedListItem.id});
                });
            }, 
            {id:listItem.id}
        );

        //Add an event listener to the Move Downwards Button to move the List Item downwards by one position in the List
        window.View.Bind(
            'MoveDownwardsButtonPressed', 
            function() 
            {
                //window.DebugController.Print("Button pressed to swap List Item positions");

                window.Model.ModifyListItem('MoveDownwards', listId, listItem.id, function(swappedListItem) {
                    window.View.Render('SwapListObjects', {moveUpwardsId:swappedListItem.id, moveDownwardsId:listItem.id});
                });
            }, 
            {id:listItem.id}
        );
    }

    //TODO Don't really like this (for example, usage of assignmentType)
    function updateListItemQuantityValue(listId, listItemId, quantityType, assignmentType)
    {
        var modelUpdated = function(updatedListItem)
        {
            updateListItemQuantityText(updatedListItem, quantityType);
            updateListItemNameColor(updatedListItem);
        };

        if (assignmentType == 'decrement')
        {
            window.Model.ModifyListItem('DecrementQuantityValue', listId, listItemId, modelUpdated, {quantityType:quantityType});
        }
        else if(assignmentType == 'increment')
        {
            window.Model.ModifyListItem('IncrementQuantityValue', listId, listItemId, modelUpdated, {quantityType:quantityType});
        }
    }

    //TODO would it be better if View commands always received consistent paramters (e.g. a list object)

    function updateListItemQuantityText(listItem, quantityType)
    {
        window.View.Render('updateListItemQuantityText', {
            listItemId:listItem.id, 
            quantityType:quantityType, 
            updatedValue:listItem.quantities[quantityType]
        });
    }

    function updateListItemNameColor(listItem)
    {
        window.View.Render('updateListItemNameColor', {
            listItemId:listItem.id, 
            quantityNeeded:listItem.quantities.needed, 
            quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)
        });
    }

    // function removeListItem(listId, listItemId)
    // {
    //     Model.RemoveListItem(listId, listItemId);
    //     window.View.Render('removeListItem', {listItemId:listItemId});
    // }

    /** Experimental & In Progress **/

    // function expandSettingsView(id)
    // {
    //     window.View.Render('ExpandSettingsView', {id:id});
    // }

    // function bindSettingsViewExpansion(id)
    // {
    //     //When the animation to expand a Settings View starts, hide the previously Active Settings View
    //     window.View.Bind(
    //         'SettingsViewExpansionStarted', 
    //         function() 
    //         {
    //             window.View.Render('HideActiveSettingsView'); 
    //         },
    //         {id:id}
    //     );
    // }

    // function handleInput(command, listId, listItem, updatedValue)
    // {       
    //     var commands = 
    //     {
    //         EditName : function()
    //         {
    //             //Set up the callback method to execute once the Model has been updated
    //             var _modelUpdated = function(updatedValue)
    //             {
    //                 window.View.Render('UpdateName', {id:listItem.id, updatedValue:updatedValue}); 
    //             };

    //             //Update the Model
    //             window.Model.ModifyListItem('EditName', listId, listItem.id, _modelUpdated, {updatedName:updatedValue});
    //         }
    //     };

    //     //Execute the method matching the given command
    //     commands[command](listIndex, commandSucceededCallback);

    //     // //Set up the callback method to execute when a List matching the given ID is found
    //     // var runCommand = function(listIndex)
    //     // {
    //     //     //Set up the callback method to execute once the given command has been executed successfully 
    //     //     var commandSucceededCallback = function(args)
    //     //     {       
    //     //         //Store the updated checklist data
    //     //         storeChecklistData();

    //     //         //Execute the provided callback method, passing the returned arguments if not null
    //     //         args != null ? callback(args) : callback();

    //     //         //TODO it might be better to loop through the arguments array and then return all existing ones through the callback
    //     //     };

    //     //     //Execute the method matching the given command
    //     //     commands[command](listIndex, commandSucceededCallback);
    //     // }

    //     // //Search for the List and, if it's found, execute the method matching the given command
    //     // findList(listId, runCommand);
    // }

    function setupBindingsForEditName(listId, listItem)
    {
        //Set up the callback method to execute for when the View recieves input from the user
        var _onUserInput = function(updatedValue) 
        {
            //Set up the callback method to execute once the Model has been updated
            var _modelUpdated = function()
            {
                window.View.Render('UpdateName', {id:listItem.id, updatedValue:updatedValue}); 
            };

            //Update the Model
            window.Model.ModifyListItem('EditName', listId, listItem.id, _modelUpdated, {updatedName:updatedValue});
        };

        //TODO use command var instead of string to pass along command? (e.g. command instead of 'UpdateName' or 'EditName' or 'NameEdited')
            //EditName and NameEdited.. Why not make it the same? I t sort of makes sense that they are different, but maybe could be more efficient if made the same.

        //Add an event listener for when the Text Area to edit the List Item name is modified
        window.View.Bind('NameEdited', _onUserInput, {id:listItem.id});
    }

    function setupBindings(command, listId, listItem)
    {       
        var commands = 
        {
            EditName : function()
            {
                setupBindingsForEditName(listId, listItem)
            }
        };

        //Execute the method matching the given command
        commands[command]();
    }

    return {
        Init : init,
        LoadListItemsIntoView : loadListItemsIntoView
    };
})();

//TODO Consider moving this to a separate file?
var QuantityType = {
    needed: {
        type: 'needed', //TODO this should be temp. Can the same be accomplished using 'key'?
        //index: 0,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-pie-chart fa-lg iconHeader'
    },
    luggage: {
        type: 'luggage',
        //index: 1,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-suitcase fa-lg iconHeader'
    },
    wearing: {
        type: 'wearing',
        //index: 2,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-male fa-lg iconHeader'
    },
    backpack: {
        type: 'backpack',
        //index: 3,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader toggleSmallIcon',
        iconClass: 'fa fa-briefcase iconHeader'
    },
};