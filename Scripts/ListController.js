window.ListController = (function()
{    
    var self = this; //TODO Is this really necessary?
    var activeListId;
    var checklistType;
    var quantityPopoverActive = false;

    //TODO could have a modelCommand and parameters (e.g. modelCommand=ModifyList, params=MoveUpwards)
        //Maybe rename/add as such:
            //bindingName = event
            //modelViewCommand = action
            //modificationType (AddList, ModifyList, and ModifyListItem being the options)
    var bindingReference = {
        /** MVC Bindings **/
        UpdateName: {
            event: 'NameEdited', 
            action: 'UpdateName'
        },
        RemoveListItem: {
            event: 'DeleteButtonPressed', 
            action: 'RemoveListItem'
        },
        MoveUpwards: {
            event: 'MoveUpwardsButtonPressed', 
            action: 'MoveUpwards'
        },
        MoveDownwards: {
            event: 'MoveDownwardsButtonPressed', 
            action: 'MoveDownwards'
        },
        DecrementQuantityValue: {
            event: 'DecrementQuantityButtonPressed', 
            action: 'DecrementQuantityValue'
        },
        IncrementQuantityValue: {
            event: 'IncrementQuantityButtonPressed', 
            action: 'IncrementQuantityValue'
        },
        ClearQuantityValues: {
            event: 'ClearButtonPressed', 
            action: 'ClearQuantityValues'
        },
        AddList: {
            event: 'ClearButtonPressed', 
            action: 'ClearQuantityValues'
        },
        /** VC Bindings **/
        HideActiveSettingsView: {
            event: 'SettingsViewExpansionStarted', 
            action: 'HideActiveSettingsView'
        }
        // AddListItem: { //TODO Not sure this should be in the ListController...
        //     //viewCommands: ['AddListItem','UpdateListItemNameColor']
        //     //modelViewCommand: 'AddListItem',
        // }
    };

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

                //setupBinding(bindingReference.ClearQuantityValues, listId, listItem);

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

    /** Private Methods To Setup MVC Bindings For A New List Item **/

    //TODO this should be renamed
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
        //setupBinding(bindingReference.HideActiveSettingsView, listId, listItem);
        setupVcBinding(bindingReference.HideActiveSettingsView, listItem);

        setupMvcBinding(bindingReference.UpdateName, listId, listItem);
        setupMvcBinding(bindingReference.RemoveListItem, listId, listItem);
        setupMvcBinding(bindingReference.MoveUpwards, listId, listItem);
        setupMvcBinding(bindingReference.MoveDownwards, listId, listItem);
    }

    //TODO maybe need setupMvcBinding and setupVcBinding methods

    //TODO Instead of the existing method below, setupBinding could take the following params
    //function setupBinding(binding, checklistData, options)
    //Where checklistData could have either:
        //Just a List object
        //OR a ListItem object AND a listID (or maybe a List object instead of just ID, for simplicity...)

    /**
     * Create a binding between the Model, View, and Controller, so that when the app receives user input which would modify the underlying data and UI of the checklist, the Model is updated accordingly, and then the View renders those updates.
     * @param {object} binding The binding type that has been triggered (i.e. the action that has been initiated by the user, such as removing a List Item).
     * @param {string} listId The unique identifier of the List that the modified List Item belongs to.
     * @param {object} listItem The List Item that has been modified.
     * @param {object} [options] [Optional] An optional object to pass containing any additional data needed to create the bind. Possible properties: quantityType.
     */
    function setupMvcBinding(binding, listId, listItem, options)
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

            //If an action was provided
            if (binding.action != null)
            {
                //Set up the callback method to execute once the Model has been updated. 
                var _modelUpdated = function(options) 
                {    
                    //Update the View, passing along the updated listItem and any optional parameters as applicable
                    updateView(binding.action, listItem, options);
                };

                //Update the Model
                updateModel(binding.action, listId, listItem.id, _modelUpdated, options);
            }
            else
            {
                window.DebugController.LogError("ERROR: No action provided when attempting to setup an MVC binding.");
            }
        };

        //Add an event listener to the specified element
        window.View.Bind(binding.event, _onUserInput, {id:listItem.id});
    }

    /**
     * Create a binding between the View and Controller, so that when the app receives user input which would modify the UI of the checklist, the View renders those updates.
     * @param {object} binding The binding type that has been triggered (i.e. the action that has been initiated by the user or application).
     * @param {object} checklistObject The checklist object that is associated with the bind.
     */
    function setupVcBinding(binding, checklistObject)
    {
        //Set up the callback method to execute for when the View recieves input from the user
        var _onUserInput = function() 
        {
            //If an action was provided that can be sent to the View, update the View accordingly...
            if (binding.action != null) 
            {
                updateView(binding.action, checklistObject);
            }
        };

        //Add an event listener to the specified element
        window.View.Bind(binding.event, _onUserInput, {id:checklistObject.id});
    }

    //TODO Could possibly introduce a section for Controller logic to the setupBinding methods, to rid the need of having this separate method
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
            
            setupMvcBinding(bindingReference.DecrementQuantityValue, listId, listItem, {quantityType:quantityType});
            setupMvcBinding(bindingReference.IncrementQuantityValue, listId, listItem, {quantityType:quantityType});
        };
        
        var _hideQuantityPopover = function() {
            window.DebugController.Print("A Quantity Popover will be hidden.");

            window.View.Render('HideQuantityPopover', {listItemId:listItem.id, quantityType:quantityType} );
            quantityPopoverActive = false;
        };

        window.View.Bind('QuantityToggleSelected', _showQuantityPopover, {listItemId:listItem.id, quantityType:quantityType});
        window.View.Bind('QuantityPopoverShown', _quantityPopoverShown, {listItemId:listItem.id, quantityType:quantityType});
    }

    /**
     * Pass along to the View any modifications or updates throughout the app which need to be rendered
     * @param {string} action The action that has been initiated by the user or application (e.g. removing a List Item)
     * @param {object} [checklistObject] [Optional] The List or List Item object to be rendered, if applicable
     * @param {object} [options] [Optional] An optional object to pass containing any additional data needed to render the updates. Possible properties: quantityType, swappedListItemId.
     */
    function updateView(action, checklistObject, options)
    {       
        //TODO would it be better if View commands always received consistent paramters (e.g. a list or list item object)?
        //TODO Could use a switch/case here instead
        var actions = 
        {
            AddList : function()
            {
                window.View.Render('AddList', {listId:checklistObject.id, listName:checklistObject.name, listType:self.checklistType});
            },
            AddListItem : function()
            {
                window.View.Render('AddListItem', {listItemId:checklistObject.id, listItemName:checklistObject.name, quantityValues:checklistObject.quantities, listId:options.listId});                    
                window.View.Render('UpdateListItemNameColor', {listItemId:checklistObject.id, quantityNeeded:checklistObject.quantities.needed, quantityBalance:(checklistObject.quantities.needed - checklistObject.quantities.luggage - checklistObject.quantities.wearing - checklistObject.quantities.backpack)});
            },
            UpdateName : function()
            {
                window.View.Render('UpdateName', {id:checklistObject.id, updatedValue:checklistObject.name});
            },
            RemoveListItem : function()
            {
                window.View.Render('RemoveListItem', {listItemId:checklistObject.id}); 
            },
            MoveUpwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:checklistObject.id, moveDownwardsId:options.swappedListItemId});
            },
            MoveDownwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:options.swappedListItemId, moveDownwardsId:checklistObject.id});
            },
            DecrementQuantityValue : function()
            {
                window.View.Render('UpdateListItemQuantityText', {listItemId:checklistObject.id, quantityType:options.quantityType, updatedValue:checklistObject.quantities[options.quantityType]});
                window.View.Render('UpdateListItemNameColor', {listItemId:checklistObject.id, quantityNeeded:checklistObject.quantities.needed, quantityBalance:(checklistObject.quantities.needed - checklistObject.quantities.luggage - checklistObject.quantities.wearing - checklistObject.quantities.backpack)});
            },
            IncrementQuantityValue : function()
            {
                window.View.Render('UpdateListItemQuantityText', {listItemId:checklistObject.id, quantityType:options.quantityType, updatedValue:checklistObject.quantities[options.quantityType]});
                window.View.Render('UpdateListItemNameColor', {listItemId:checklistObject.id, quantityNeeded:checklistObject.quantities.needed, quantityBalance:(checklistObject.quantities.needed - checklistObject.quantities.luggage - checklistObject.quantities.wearing - checklistObject.quantities.backpack)});
            },
            HideActiveSettingsView : function()
            {
                window.View.Render('HideActiveSettingsView');
            }
        };

        //If an action is provided, execute the corresponding method
        if (action != null)
        {
            actions[action]();
        }
        else
        {
            window.DebugController.LogError("ERROR: Tried to update the View, but no action was provided.");
        }
    }

    /**
     * Pass along to the Model any modifications or updates which need to be made to the checklist data
     * @param {string} action The action that has been initiated by the user or application (e.g. removing a List Item)
     * @param {*} listId TODO complete
     * @param {*} listItem TODO complete
     * @param {Function} callback The method to call once the Model has been successfully updated
     * @param {object} [options] [Optional] An optional object to pass containing any additional data needed to make the requested modification. 
     */
    function updateModel(action, listId, listItemId, callback, options)
    {
        //TODO actually probably better to pass the full binding

        //Update the Model
        window.Model.ModifyListItem(action, listId, listItemId, callback, options);

        //TODO MAKE THIS WORK
        //window["Model"][binding.modificationType](binding.action, checklistData.listId, checklistData.listItem.id, callback, options);
    }

    /** Publicly Exposed Methods To Setup UI & Load List Data **/

    function init(checklistType)
    {            
        self.checklistType = checklistType;
        
        //TODO THIS NEEDS TO BE UNCOMMENTED EVENTUALLY
        //setupNewListBinding();

        /****/
        
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

    function loadListsIntoView(loadedListData)
    {
        window.DebugController.Print("Number of Lists retrieved from Model: " + loadedListData.length);

        for (var i = 0; i < loadedListData.length; i++) 
        {
            addListToView(loadedListData[i]);

            for (var j = 0; j < loadedListData[i].listItems.length; j++) 
            {
                addListItemToView(loadedListData[i].id, loadedListData[i].listItems[j]);
            }
        }
    }

    function setupNewListBinding()
    {
        var _onUserInput = function()
        {
            //If a command was provided that can be sent to both the Model and the View...
            if (binding.action != null)
            {
                //Set up the callback method to execute once the Model has been updated. 
                var _modelUpdated = function(newList) 
                {    
                    addListToView(newList);

                    //After the List is added to the DOM, expand its Settings View
                    window.View.Render('ExpandSettingsView', {id:newList.id});

                    /***/

                    // //Update the View, passing along the updated listItem and any optional parameters as applicable
                    // updateView(binding.modelViewCommand, listItem, options);
                };

                //Update the Model
                window.Model.AddList(_modelUpdated);
            }
            else if (binding.viewCommand != null) //Else, if a command was provided that can be sent to only to the View...
            {
                //Update the View, passing along the updated listItem and any optional parameters as applicable
                updateView(binding.viewCommand, listItem, options);
            }
        }

        window.View.Bind('NewListButtonPressed', _onUserInput);
    }

    //TODO WORK ON THIS
    function addListToView(list) //TODO rename this?
    {
        updateView('AddList', list);
        
        //TODO MAKE THIS WORK. SetupBinding only supports list items at the moment
        //setupBinding(bindingReference.HideActiveSettingsView, listId, listItem);

        //TODO this method could possibly be standardized and re-used for list item
        //When the animation to expand the Settings View starts, change the Active Settings View
        //bindSettingsViewExpansion(data.id);
        window.View.Bind(
            'SettingsViewExpansionStarted', 
            function() 
            {
                window.View.Render('HideActiveSettingsView'); 
            },
            {id:data.id}
        );

        //TODO can this be merged with the corresponding method for List Item?
        var _updateName = function(updatedValue) 
        {
            //Set up the callback method to execute once the Model has been updated
            var updateView = function()
            {
                window.View.Render('UpdateName', {id:data.id, updatedValue:updatedValue}); 
            };

            //TODO updatedName/Value should be consistent

            //Update the Model
            window.Model.ModifyList('EditName', data.id, updateView, {updatedName:updatedValue});
        };

        //TODO wouldn't it be simpler to just always pass the full object (list or list item) and then from that you can get the most up to date name, ID, etc.
        //Add an event listener for when the Text Area to edit the List Item name is modified
        window.View.Bind('NameEdited', _updateName, {id:data.id});

        // //When the Text Area to edit a list name gets modified, update the text in the List name toggle
        // window.View.Bind(
        //     'NameEdited', 
        //     function(updatedValue) 
        //     {
        //         window.Model.EditListName(data.id, updatedValue);
        //         window.View.Render('UpdateName', {id:data.id, updatedValue:updatedValue}); 
        //     },
        //     {id:data.id}
        // );

        //TODO standardize ID parameter names
        //TODO it might be possible to merge this with the method to remove a ListItem at some point, once the middleman data (lists, rows, etc.) is cut out
        var _removeList = function() 
        {
            //Set up the callback method to execute once the Model has been updated
            var _modelUpdated = function()
            {
                //If the List that was removed was the most recently Active List, set the Active List ID to null
                if (activeListId == data.id)
                {
                    activeListId = null;
                }

                window.View.Render('RemoveList', {listId:data.id}); 
            };

            //Update the Model
            window.Model.ModifyList('Remove', data.id, _modelUpdated);
        };

        //Add an event listener for when the button to delete a List is pressed
        window.View.Bind('DeleteButtonPressed', _removeList, {id:data.id});


        //When the Go To List button is selected, navigate to that list
        // window.View.Bind(
        //     'GoToListButtonPressed', 
        //     function() 
        //     {
        //         navigateToList(data.id);
        //     },
        //     {listId:data.id}
        // );

        //Add an event listener to the Move Upwards Button to move the List upwards by one position in the Lists array
        window.View.Bind(
            'MoveUpwardsButtonPressed', 
            function() 
            {
                //TODO could probably just return the swapped list instead of specifically it's ID
                window.Model.ModifyList('MoveUpwards', data.id, function(swappedList) {
                    window.View.Render('SwapListObjects', {moveUpwardsId:data.id, moveDownwardsId:swappedList.id});
                });
            }, 
            {id:data.id}
        );

        //Add an event listener to the Move Downwards Button to move the List downwards by one position in the Lists array
        window.View.Bind(
            'MoveDownwardsButtonPressed', 
            function() 
            {
                //TODO could probably just return the swapped list instead of specifically it's ID
                window.Model.ModifyList('MoveDownwards', data.id, function(swappedList) {
                    window.View.Render('SwapListObjects', {moveUpwardsId:swappedList.id, moveDownwardsId:data.id});
                });
            }, 
            {id:data.id}
        );
    }

    /** Publicly Exposed Methods **/

    return {
        Init : init,
        LoadListItemsIntoView : loadListItemsIntoView
        //LoadListsIntoView : loadListsIntoView
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