window.ListController = (function()
{    
    var quantityPopoverActive = false;

    //TODO this needs to be handled differently because it calls ModifyList
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

    /** Private Helper Methods To Setup Special Case Bindings **/

    function setupPopoverBindings(listId, listItem, quantityType)
    {
        var _showQuantityPopover = function(event) {
            if (quantityPopoverActive == false)
            {
                window.DebugController.Print("A Quantity Popover will be shown, and events will be prevented from bubbling up.");

                event.stopPropagation();
                window.View.Render('ShowQuantityPopover', {listItemId:listItem.id, quantityType:quantityType});   
                quantityPopoverActive = true;
            }
        };

        var _quantityPopoverShown = function() {
            window.DebugController.Print("A Quantity Popover was shown.");

            //TODO There might be a better way to do this, where these BINDs can be done when the +/- buttons are created and not when the popover is shown.
            window.View.Bind('ClickDetectedOutsidePopover', _hideQuantityPopover, {listItemId:listItem.id, quantityType:quantityType});   
            window.addEventListener("hashchange", _hideQuantityPopover, {once:true}); //If the hash location changes (e.g. the Back button is pressed), the popover should be hidden.
            
            setupBinding(bindingReference.DecrementQuantityValue, listId, listItem, {quantityType:quantityType});
            setupBinding(bindingReference.IncrementQuantityValue, listId, listItem, {quantityType:quantityType});
        };
        
        var _hideQuantityPopover = function() {
            window.DebugController.Print("A Quantity Popover will be hidden.");

            window.View.Render('HideQuantityPopover', {listItemId:listItem.id, quantityType:quantityType} );
            quantityPopoverActive = false;
        };

        window.View.Bind('QuantityToggleSelected', _showQuantityPopover, {listItemId:listItem.id, quantityType:quantityType});
        window.View.Bind('QuantityPopoverShown', _quantityPopoverShown, {listItemId:listItem.id, quantityType:quantityType});
    }

    function addListItemToView(listId, listItem)
    {
        //TODO Maybe split this up into things that need to be rendered, and things that need to be bound

        //TODO would it be better to just pass a ListItem object and let the View parse it, rather than splitting up the params here?... Unsure...
        updateView('AddListItem', listItem, {listId:listId});
        
        //Bind user interaction with the quantity toggles to corresponding behavior
        for (var key in listItem.quantities)
        {
            setupPopoverBindings(listId, listItem, key);
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

        setupBinding(bindingReference.UpdateName, listId, listItem);
        setupBinding(bindingReference.RemoveListItem, listId, listItem);
        setupBinding(bindingReference.MoveUpwards, listId, listItem);
        setupBinding(bindingReference.MoveDownwards, listId, listItem);
    }

    /** Private Methods To Setup Bindings Between The View & The Model **/

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
                updateView(binding.modelViewCommand, listItem, options);            
            };

            //Update the Model
            window.Model.ModifyListItem(binding.modelViewCommand, listId, listItem.id, _modelUpdated, options);
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
    function updateView(command, listItem, options)
    {       
        //TODO would it be better if View commands always received consistent paramters (e.g. a list or list item object)?
        //TODO Could use a switch/case here instead
        var commands = 
        {
            UpdateName : function()
            {
                window.View.Render('UpdateName', {id:listItem.id, updatedValue:listItem.name});
            },
            RemoveListItem : function()
            {
                window.View.Render('RemoveListItem', {listItemId:listItem.id}); 
            },
            MoveUpwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:listItem.id, moveDownwardsId:options.swappedListItemId});
            },
            MoveDownwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:options.swappedListItemId, moveDownwardsId:listItem.id});
            },
            DecrementQuantityValue : function()
            {
                window.View.Render('UpdateListItemQuantityText', {listItemId:listItem.id, quantityType:options.quantityType, updatedValue:listItem.quantities[options.quantityType]});
                window.View.Render('UpdateListItemNameColor', {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
            },
            IncrementQuantityValue : function()
            {
                window.View.Render('UpdateListItemQuantityText', {listItemId:listItem.id, quantityType:options.quantityType, updatedValue:listItem.quantities[options.quantityType]});
                window.View.Render('UpdateListItemNameColor', {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
            },
            AddListItem : function()
            {
                window.View.Render('AddListItem', {listItemId:listItem.id, listItemName:listItem.name, quantityValues:listItem.quantities, listId:options.listId});                    
                window.View.Render('UpdateListItemNameColor', {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
            }
        };

        //If a command is provided, execute the corresponding method
        if (command != null)
        {
            commands[command]();
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
        UpdateName: {
            bindingName: 'NameEdited', 
            modelViewCommand: 'UpdateName',
        },
        RemoveListItem: {
            bindingName: 'DeleteButtonPressed', 
            modelViewCommand: 'RemoveListItem',
        },
        MoveUpwards: {
            bindingName: 'MoveUpwardsButtonPressed', 
            modelViewCommand: 'MoveUpwards',
        },
        MoveDownwards: {
            bindingName: 'MoveDownwardsButtonPressed', 
            modelViewCommand: 'MoveDownwards',
        },
        DecrementQuantityValue: {
            bindingName: 'DecrementQuantityButtonPressed', 
            modelViewCommand: 'DecrementQuantityValue',
        },
        IncrementQuantityValue: {
            bindingName: 'IncrementQuantityButtonPressed', 
            modelViewCommand: 'IncrementQuantityValue',
        }
        // AddListItem: { //TODO Not sure this should be in the ListController...
        //     //viewCommands: ['AddListItem','UpdateListItemNameColor']
        //     //modelViewCommand: 'AddListItem',
        // }
    };

    /** Publicly Exposed Methods To Setup UI & Load List Data **/

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