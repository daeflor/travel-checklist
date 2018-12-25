window.ListController = (function()
{    
    var quantityPopoverActive = false;

    /** List & Button Setup **/

    function init()
    {            
        //TODO would like all binds to be one-liners. (For-loops can be done in the methods instead of here). 
        window.View.Bind('NewListItemButtonPressed', addNewListItem);
        //TODO note that this Bind calls ModifyList, not ModifyListItem
        //setupBinding(bindingReference.AddListItem, ListSelectionController.GetActiveListId());

        //TODO Adding the quantity header to the DOM (below) should be done in a separate method, depending on the checklist type

        window.View.Render('GenerateQuantityHeader'); //TODO right now this assumes the header to display is the Travel type

        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' column button 
        for (var key in QuantityType)
        {
            bindQuantityHeaderToggleEvents(key);
        }
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

                        window.Model.ModifyList('ClearQuantityValues', ListSelectionController.GetActiveListId(), modelUpdated, {quantityType:quantityType});
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
            //TODO THESE WON'T WORK RIGHT NOW

            //Update the List Item's quantity value for the given type
            updateListItemQuantityText(listItems[i], quantityType);
            
            //Update the List Item name's color
            updateListItemNameColor(listItems[i]);
        }
    }

    /** List Management **/

    function addNewListItem()
    {
        window.Model.ModifyList(
            'AddListItem', 
            ListSelectionController.GetActiveListId(),
            function(newListItem) 
            {
                addListItemToView(ListSelectionController.GetActiveListId(), newListItem);

                //After a 'new' List Item is added to the DOM, expand its Settings View
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
        // window.View.Render(
        //     'AddListItem', 
        //     { 
        //         listItemId: listItem.id, 
        //         listItemName: listItem.name,
        //         quantityValues: listItem.quantities,
        //         listId: listId, 
        //     }
        // );

        //TODO The above could probably be separated from all the below. (and then go back to passing ListItemId as a parameter?)

        //updateListItemNameColor(listItem);

        //updateView(bindingReference.AddListItem, listItem, {listId:listId});
        window.View.Render('AddListItem', {listItemId:listItem.id, listItemName:listItem.name, quantityValues:listItem.quantities, listId:listId});                    
        window.View.Render('UpdateListItemNameColor', {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});

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
                    
                    setupBinding(bindingReference.DecrementQuantityValue, listId, listItem, {quantityType:lockedKey});
                    //window.View.Bind('DecrementQuantityButtonPressed', _decrementListItemQuantityValue);
                    
                    setupBinding(bindingReference.IncrementQuantityValue, listId, listItem, {quantityType:lockedKey});
                    //window.View.Bind('IncrementQuantityButtonPressed', _incrementListItemQuantityValue);
                };
    
                //setupBinding(bindingReference.DecrementQuantityValue, listId, listItem, lockedKey);
                // var _decrementListItemQuantityValue = function() {   
                //     updateListItemQuantityValue(listId, listItem.id, lockedKey, 'decrement');
                // };
    
                //setupBinding(bindingReference.IncrementQuantityValue, listId, listItem, lockedKey);
                // var _incrementListItemQuantityValue = function() {
                //     updateListItemQuantityValue(listId, listItem.id, lockedKey, 'increment');
                // };
                
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

        setupBinding(bindingReference.EditName, listId, listItem);
        setupBinding(bindingReference.Remove, listId, listItem);
        setupBinding(bindingReference.MoveUpwards, listId, listItem);
        setupBinding(bindingReference.MoveDownwards, listId, listItem);
    }

            // //TODO Don't really like this (for example, usage of assignmentType)
            // function updateListItemQuantityValue(listId, listItemId, quantityType, assignmentType)
            // {
            //     //TODO it seems it isn't necessary to pass the updated list item, assuming there is already a reference to the original one
            //     var modelUpdated = function(updatedListItem)
            //     {
            //         //console.log(listItem);
            //         //console.log(updatedListItem);
            //         updateListItemQuantityText(updatedListItem, quantityType);
            //         updateListItemNameColor(updatedListItem);
            //     };

            //     if (assignmentType == 'decrement')
            //     {
            //         window.Model.ModifyListItem('DecrementQuantityValue', listId, listItemId, modelUpdated, {quantityType:quantityType});
            //     }
            //     else if(assignmentType == 'increment')
            //     {
            //         window.Model.ModifyListItem('IncrementQuantityValue', listId, listItemId, modelUpdated, {quantityType:quantityType});
            //     }
            // }

            // //TODO would it be better if View commands always received consistent paramters (e.g. a list object)

            // function updateListItemQuantityText(listItem, quantityType)
            // {
            //     window.View.Render('UpdateListItemQuantityText', {
            //         listItemId:listItem.id, 
            //         quantityType:quantityType, 
            //         updatedValue:listItem.quantities[quantityType]
            //     });
            // }

            // function updateListItemNameColor(listItem)
            // {
            //     window.View.Render('UpdateListItemNameColor', {
            //         listItemId:listItem.id, 
            //         quantityNeeded:listItem.quantities.needed, 
            //         quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)
            //     });
            // }

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

    /**
     * Create a binding between the Model, View, and Controller, so that when the app receives user input which would modify a List Item, the Model is updated accordingly, and then the View renders those updates.
     * @param {object} binding The binding type that has been triggered (i.e. the action that has been initiated by the user, such as removing a List Item).
     * @param {string} listId The unique identifier of the List that the modified List Item belongs to.
     * @param {object} listItem The List Item that has been modified.
     * @param {object} [options] [Optional] An optional object to pass containing any additional data needed to create the bind. Possible properties: quantityType.
     */
    function setupBinding(binding, listId, listItem, options)
    {
        //Set up the callback method to execute for when the View recieves input from the user
        var _onUserInput = function(args) 
        {
            //If there are any arguments passed in from the View
            if (args !== undefined)
            {
                //If the options parameter is undefined (i.e. none provided), assign an empty object to it
                if (options === undefined)
                {
                    options = {};
                }

                //Merge any properties from the arguments passed from the View (from the user input) into the options object that gets passed to the Model
                Object.assign(options, args);
            }

            //Set up the callback method to execute once the Model has been updated. 
            var _modelUpdated = function(options) 
            {    
                updateView(binding, listItem, options);            
                //window.View.Render(data.viewCommand, {moveUpwardsId:data.moveUpwardsId, moveDownwardsId:data.moveDownwardsId});
                //TODO Maybe just the Render part of the Bind Setup could be in a separate (UpdateView?) method, since the rest is pretty boilerplate?
            };

            //Update the Model
            window.Model.ModifyListItem(binding.modelCommand, listId, listItem.id, _modelUpdated, options);
        };

        //Add an event listener to the specified element
        window.View.Bind(binding.bindingName, _onUserInput, {id:listItem.id});
    }

    /**
     * Pass along to the View any modifications made to List Items which need to be rendered
     * @param {object} binding The binding type that triggered the modification to the List Item (i.e. the action that has been initiated by the user, such as removing a List Item)
     * @param {object} listItem The List Item that has been modified
     * @param {object} [options] [Optional] An optional object to pass containing any additional data needed to render the updates. Possible properties: quantityType, swappedListItemId.
     */
    function updateView(binding, listItem, options) //TODO should this use ViewCommand instead of binding?
    {       
        //TODO Could use a switch/case here instead
        var commands = 
        {
            EditName : function()
            {
                window.View.Render(binding.viewCommand, {id:listItem.id, updatedValue:listItem.name});
            },
            Remove : function()
            {
                window.View.Render(binding.viewCommand, {listItemId:listItem.id}); 
            },
            MoveUpwards : function()
            {
                window.View.Render(binding.viewCommand, {moveUpwardsId:listItem.id, moveDownwardsId:options.swappedListItemId});
            },
            MoveDownwards : function()
            {
                window.View.Render(binding.viewCommand, {moveUpwardsId:options.swappedListItemId, moveDownwardsId:listItem.id});
            },
            DecrementQuantityValue : function()
            {
                window.View.Render(binding.viewCommands[0], {listItemId:listItem.id, quantityType:options.quantityType, updatedValue:listItem.quantities[options.quantityType]});
                window.View.Render(binding.viewCommands[1], {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
            },
            IncrementQuantityValue : function()
            {
                window.View.Render(binding.viewCommands[0], {listItemId:listItem.id, quantityType:options.quantityType, updatedValue:listItem.quantities[options.quantityType]});
                window.View.Render(binding.viewCommands[1], {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
            },
            AddListItem : function()
            {
                window.View.Render(binding.viewCommands[0], {listItemId:listItem.id, listItemName:listItem.name, quantityValues:listItem.quantities, listId:options.listId});                    
                window.View.Render(binding.viewCommands[1], {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
            }
        };

        //If a command is provided, execute the corresponding method
        if (binding.modelCommand != null)
        {
            commands[binding.modelCommand]();
        }

        //TODO this ended up being less helpful than not having it. Needs more investigation to make try/catch useful.
        //Try to execute the method matching the given command
        // try 
        // {
        //     commands[binding.modelCommand]();
        // }
        // catch(err) 
        // {
        //     window.DebugController.LogError("ERROR encountered when trying to execute command. Model Command: " + binding.modelCommand + ". Error message: " + err.message);
        // }
    }

    var bindingReference = {
        EditName: {
            bindingName: 'NameEdited', 
            modelCommand: 'EditName',
            viewCommand: 'UpdateName'
        },
        Remove: {
            bindingName: 'DeleteButtonPressed', 
            modelCommand: 'Remove',
            viewCommand: 'RemoveListItem'
        },
        MoveUpwards: {
            bindingName: 'MoveUpwardsButtonPressed', 
            modelCommand: 'MoveUpwards',
            viewCommand: 'SwapListObjects'
        },
        MoveDownwards: {
            bindingName: 'MoveDownwardsButtonPressed', 
            modelCommand: 'MoveDownwards',
            viewCommand: 'SwapListObjects'
        },
        DecrementQuantityValue: {
            bindingName: 'DecrementQuantityButtonPressed', 
            modelCommand: 'DecrementQuantityValue',
            viewCommands: ['UpdateListItemQuantityText','UpdateListItemNameColor']
        },
        IncrementQuantityValue: {
            bindingName: 'IncrementQuantityButtonPressed', 
            modelCommand: 'IncrementQuantityValue',
            viewCommands: ['UpdateListItemQuantityText','UpdateListItemNameColor']
        },
        AddListItem: { //TODO Not sure this should be in the ListController...
            viewCommands: ['AddListItem','UpdateListItemNameColor']
        }

        //TODO It's super jank that some of the properties above are viewCommand and some are viewCommands

        //TODO would it make sense to separate ViewCommands from RenderCommands, so that a single ViewCommand can be re-used by multiple bindings? e.g.
            // DecrementQuantityValue: {
                // bindingName: 'DecrementQuantityButtonPressed', 
                // modelCommand: 'DecrementQuantityValue',
                // viewCommand:  {
                //     cmd: 'UpdateListItemQuantityTextAndNameColor'
                //     renderCmds: ['UpdateListItemQuantityText','UpdateListItemNameColor']
                // }
            // }
        //Might not be worth it...
    };

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