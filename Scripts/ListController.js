window.ListController = (function()
{    
    var self = this, //TODO Is this really necessary?
        activeListId = "",
        checklistType = "",
        quantityPopoverActive = false;

    //TODO what if, instead of having 3 different options properties, there is only one, and it gets replaced/updated at each interval as needed. 
        //i.e. options starts with bind options, then adds on (or is replaced with) any necessary model options, then adds on render options. 
        //This would probably only work if handleUpdatesFromView gets split into individual sections, which may be clearer anyway

    //TODO could have a modelCommand and parameters (e.g. modelCommand=ModifyList, params=MoveUpwards)
        //Maybe rename/add as such:
            //bindingName = event
            //modelViewCommand = action
            //modificationType (AddList, ModifyList, and ModifyListItem being the options)
    //TODO remove the properties here that aren't being used
    var bindingReference = {
        /** MVC Bindings **/
        AddNewList: {
            event: 'NewListButtonPressed', 
            action: 'AddNewList',
            bindOptions: [],
            modelOptions: [],
            renderOptions: ['listId', 'listName', 'listType'] //or just checklistObject instead?
        },
        AddNewListItem: {
            event: 'NewListItemButtonPressed', 
            action: 'AddNewListItem',
            bindOptions: [],
            modelOptions: ['listId'],
            renderOptions: ['listId', 'checklistObject']
        },
        UpdateName: {
            event: 'NameEdited', 
            action: 'UpdateName',
            bindOptions: ['id'], //TODO would it be better to have a more generic optionsRequired array, and then check against all of those when setting up the binding?
            modelOptions: ['listId', 'listItemId', 'updatedValue'],
            renderOptions: ['checklistObject']
        },
        MoveUpwards: {
            event: 'MoveUpwardsButtonPressed', 
            action: 'MoveUpwards',
            bindOptions: ['id'],
            modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject', 'swappedListItemId']
        },
        MoveDownwards: {
            event: 'MoveDownwardsButtonPressed', 
            action: 'MoveDownwards',
            bindOptions: ['id'],
            modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject', 'swappedListItemId']
        },
        DecrementQuantityValue: {
            event: 'DecrementQuantityButtonPressed', 
            action: 'DecrementQuantityValue',
            bindOptions: [],
            modelOptions: ['listId', 'listItemId', 'quantityType'],
            renderOptions: ['checklistObject', 'quantityType']
        },
        IncrementQuantityValue: {
            event: 'IncrementQuantityButtonPressed', 
            action: 'IncrementQuantityValue',
            bindOptions: [],
            modelOptions: ['listId', 'listItemId', 'quantityType'],
            renderOptions: ['checklistObject', 'quantityType']
        },
        RemoveListItem: {
            event: 'DeleteButtonPressed', 
            action: 'RemoveListItem',
            bindOptions: ['id'],
            modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject']
        },
        ClearQuantityValues: {
            event: 'ClearButtonPressed', 
            action: 'ClearQuantityValues',
            bindOptions: [],
            modelOptions: ['listId', 'quantityType'],
            renderOptions: ['checklistObject', 'quantityType']
        },
        /** VC Bindings **/
        HideActiveSettingsView: {
            event: 'SettingsViewExpansionStarted', 
            action: 'HideActiveSettingsView',
            bindOptions: ['id'],
            modelOptions: ['N/A TODO'],
            renderOptions: []
        },
        TODO: {
            event: 'QuantityHeaderPopoverShown', 
            action: '??',
            bindOptions: ['quantityType'],
            modelOptions: [],
            renderOptions: []
        }
    };

    function renderAndBindLoadedList(list)
    {
        window.View.Render('AddList', {listId:list.id, listName:list.name, listType:self.checklistType});
    }

    //TODO Maybe split this up into things that need to be rendered, and things that need to be bound
    function renderAndBindLoadedListItem(listId, listItem)
    {
        //TODO would it be better to just pass a ListItem object and let the View parse it, rather than splitting up the params here?... Unsure...
        window.View.Render('AddListItem', {listItemId:listItem.id, listItemName:listItem.name, quantityValues:listItem.quantities, listId:listId});                    
        window.View.Render('UpdateListItemNameColor', {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
        
        //Bind user interaction with the quantity toggles to corresponding behavior
        for (var key in listItem.quantities)
        {
            setupPopoverBindings(listItem, key);
        }

        //When the animation to expand the Settings View starts, inform the View to hide the Active Settings View
        setupVcBinding(bindingReference.HideActiveSettingsView, listItem);

        var bindParams= {};
        bindParams.bindOptions = {id:listItem.id};
        bindParams.modelOptions = {listItemId:listItem.id};
        bindParams.renderOptions = {checklistObject:listItem};

        //Setup the binds to update the list item name, move it upwards or downwards in the list, and remove it from the list
        setupMvcBinding(bindingReference.UpdateName, bindParams);
        setupMvcBinding(bindingReference.MoveUpwards, bindParams);
        setupMvcBinding(bindingReference.MoveDownwards, bindParams);
        setupMvcBinding(bindingReference.RemoveListItem, bindParams);
    }

    function renderUpdatesToListItemQuantity(listItem, quantityType)
    {
        window.View.Render('UpdateListItemQuantityText', {listItemId:listItem.id, quantityType:quantityType, updatedValue:listItem.quantities[quantityType]});
        window.View.Render('UpdateListItemNameColor', {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
    }

    //TODO this is hard to read
    function bindQuantityHeaderToggleEvents(quantityType)
    {
        //TODO This is probably a case of setupVcBinding (if that still ends up being a separate function)
        window.View.Bind(
            'QuantityHeaderPopoverShown', 
            function() {

                var bindParams= {};
                bindParams.modelOptions = {listId:self.activeListId, quantityType:quantityType};
                bindParams.renderOptions = {quantityType:quantityType};
                setupMvcBinding(bindingReference.ClearQuantityValues, bindParams);
            },
            {quantityType:quantityType}
        );
    }

    /** Private Methods To Setup MVC Bindings For A New List Item **/

    /**
     * Create a binding between the Model, View, and Controller, so that when the app receives user input which would modify the underlying data and UI of the checklist, the Model is updated accordingly, and then the View renders those updates.
     * @param {object} binding The binding type that has been triggered (i.e. the action that has been initiated by the user, such as removing a List Item).
     * @param {object} [parameters] [Optional] An object containing any additional data needed to create the bind. The expected properties of this object are: bindOptions, modelOptions, renderOptions.
     */
    function setupMvcBinding(binding, parameters) //TODO having a parameter called "parameters" is confusing
    {
        //If a binding with the expected properties was provided, setup the binding. Otherwise throw an error message.
        if (binding != null && binding.action != null && binding.event != null)
        {
            //If no parameters were provided, create an empty parameters object
            var parameters = parameters || {};

            //Set up the callback method to execute for when the View recieves input from the user
            var _onUserInput = function(args) 
            {
                //If there are any arguments passed in from the View
                if (args !== undefined)
                {
                    //If the modelOptions parameter is undefined (i.e. none provided), assign an empty object to it
                    if (parameters.modelOptions === undefined)
                    {
                        parameters.modelOptions = {};
                    }

                    //Merge any properties from the arguments passed from the View (from the user input) into the modelOptions object that gets passed to the Model
                    Object.assign(parameters.modelOptions, args);
                }


                //TODO perhaps move this small section out of here. (And then should only need ONE setupBinding method)
                    //Also rewrite these comments
                //Set up the callback method to execute once the Model has been updated. 
                var _modelUpdated = function(args) 
                {    
                    //If there are any arguments passed in from the Model
                    if (args !== undefined)
                    {
                        //If the renderOptions parameter is undefined (i.e. none provided), assign an empty object to it
                        if (parameters.renderOptions === undefined)
                        {
                            parameters.renderOptions = {};
                        }

                        //Merge any properties from the arguments passed from the Model into the renderOptions object that gets passed to the View
                        Object.assign(parameters.renderOptions, args); //TODO might want a helper method to assign all arguments to an object

                        window.DebugController.Print("Added the following arguments as properties of the renderOptions object: ");
                        window.DebugController.Print(args);
                    }
                   
                    //Update the View, passing along the updated listItem and any optional parameters as applicable
                    handleUpdatesFromModel(binding.action, parameters.renderOptions);
                };

                //Update the Model
                handleUpdatesFromView(binding.action, parameters.modelOptions, _modelUpdated);
            };

            //Add an event listener to the specified element
            window.View.Bind(binding.event, _onUserInput, parameters.bindOptions);
        }
        else
        {
            window.DebugController.LogError("ERROR: Invalid parameters provided when attempting to setup an MVC binding.");
        }
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
                handleUpdatesFromView(binding.action);
                //updateView(binding.action, checklistObject); //TODO checklistObject isn't actually being used right now
            }
        };

        //Add an event listener to the specified element
        window.View.Bind(binding.event, _onUserInput, {id:checklistObject.id});
    }

    //TODO Could possibly introduce a section for Controller logic to the setupBinding methods, to rid the need of having this separate method
    function setupPopoverBindings(listItem, quantityType)
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
            window.View.Bind('ClickDetectedOutsidePopover', _hideQuantityPopover);   
            window.addEventListener("hashchange", _hideQuantityPopover, {once:true}); //If the hash location changes (e.g. the Back button is pressed), the popover should be hidden.
            
            var bindParams= {};
            bindParams.modelOptions = {listItemId:listItem.id, quantityType:quantityType};
            bindParams.renderOptions = {checklistObject:listItem, quantityType:quantityType};

            setupMvcBinding(bindingReference.DecrementQuantityValue, bindParams);
            setupMvcBinding(bindingReference.IncrementQuantityValue, bindParams);
        };
        
        var _hideQuantityPopover = function() {
            window.DebugController.Print("A Quantity Popover will be hidden.");

            window.View.Render('HideQuantityPopover', {listItemId:listItem.id, quantityType:quantityType} );
            quantityPopoverActive = false;
        };

        window.View.Bind('QuantityToggleSelected', _showQuantityPopover, {id:listItem.id, quantityType:quantityType});
        window.View.Bind('QuantityPopoverShown', _quantityPopoverShown, {id:listItem.id, quantityType:quantityType});
    }

    /**
     * Handle any user-initiated updates to the checklist, received from the View. These updates may be passed along to the Model or directly back to the View to be rendered.
     * @param {string} action The action that has been initiated by the user or application
     * @param {object} [modelOptions] [Optional] An optional object to pass containing any data needed to pass along updates to the Model
     * @param {Function} [callback] [Optional] The method to call once the Model has been successfully updated
     */
    function handleUpdatesFromView(action, modelOptions, callback)
    {       
        //TODO should these use events instead of actions?
        if (action === 'HideActiveSettingsView')
        {
            window.View.Render('HideActiveSettingsView');
        }
        else if (action === 'AddNewListItem')
        {
            window.Model.ModifyList(action, self.activeListId, callback);
        }
        else if (action === 'AddNewList')
        {
            window.Model.AddList(callback);
        }
        else if (modelOptions != null)
        {
            if (modelOptions.listItemId != null)
            {
                window.Model.ModifyListItem(action, self.activeListId, modelOptions.listItemId, callback, modelOptions);
            }
            else if (modelOptions.listId != null)
            {
                window.Model.ModifyList(action, modelOptions.listId, callback, modelOptions);
            }
        }
        else
        {
            window.DebugController.LogError("ERROR: Unable to handle updates received from the View. Action: " + action + "; Model Options: " + modelOptions);
        }
    }
    //TODO still would prefer having a separate updateModel method. In the one above, handle cases where the Model doesn't need to be updated, and otherwise determine if it will modify a list or list item. Then call updateModel.
    //TODO might be better if instead each case is handled individually here, like in handleUpdatesFromModel
    //TODO This method above can handle Controller logic

    /**
     * Handle any modifications or updates to checklist data received from the Model
     * @param {string} action The action that has been initiated by the user or application (e.g. removing a List Item)
     * @param {object} [renderOptions] [Optional] An optional object to pass containing any additional data needed to render updates. Possible properties: quantityType, swappedListItemId.
     */
    function handleUpdatesFromModel(action, renderOptions)
    {       
        //TODO would it be better if View commands always received consistent paramters (e.g. a list or list item object)?
        //TODO Could use a switch/case here instead
        var actions = 
        {
            AddList : function()
            {
                //Render the new List and setup its bindings
                renderAndBindLoadedList(checklistObject);
                //window.View.Render('AddList', {listId:renderOptions.checklistObject.id, listName:renderOptions.checklistObject.name, listType:self.checklistType});
            
                //Once the new List has been added to the DOM, expand its Settings View
                window.View.Render('ExpandSettingsView', {id:renderOptions.checklistObject.id});
            },
            AddNewListItem : function()
            {
                //Render the new List Item and setup its bindings
                renderAndBindLoadedListItem(self.activeListId, renderOptions.checklistObject);
                
                //Once the new List Item has been added to the DOM, expand its Settings View
                window.View.Render('ExpandSettingsView', {id:renderOptions.checklistObject.id});
            },
            UpdateName : function()
            {
                window.View.Render('UpdateName', {id:renderOptions.checklistObject.id, updatedValue:renderOptions.checklistObject.name});
            },
            MoveUpwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:renderOptions.checklistObject.id, moveDownwardsId:renderOptions.swappedListItemId});
            },
            MoveDownwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:renderOptions.swappedListItemId, moveDownwardsId:renderOptions.checklistObject.id});
            },
            DecrementQuantityValue : function()
            {
                renderUpdatesToListItemQuantity(renderOptions.checklistObject, renderOptions.quantityType);
            },
            IncrementQuantityValue : function()
            {
                renderUpdatesToListItemQuantity(renderOptions.checklistObject, renderOptions.quantityType);
            },
            RemoveListItem : function()
            {
                window.View.Render('RemoveListItem', {listItemId:renderOptions.checklistObject.id}); 
            },
            ClearQuantityValues : function()
            {
                //For each modified List Item...
                for (var i = 0; i < renderOptions.modifiedListItems.length; i++)
                {
                    //Update the List Item's displayed quantity value for the given type, and then update the List Item name's color
                    renderUpdatesToListItemQuantity(renderOptions.modifiedListItems[i], renderOptions.quantityType);
                }                
            }
        };

        //If an action is provided, execute the corresponding method
        action != null ? actions[action]() : window.DebugController.LogError("ERROR: Tried to handle updates received from the Model, but no action was provided.");
    }

    /** Publicly Exposed Methods To Setup UI & Load List Data **/

    function init(checklistType)
    {            
        self.checklistType = checklistType;
        
        //TODO THIS NEEDS TO BE UNCOMMENTED EVENTUALLY
        //setupNewListBinding();

        /****/

        setupMvcBinding(bindingReference.AddNewList);
        setupMvcBinding(bindingReference.AddNewListItem);
        
        //TODO would like all binds to be one-liners. (For-loops can be done in the methods instead of here). 

        //TODO Adding the quantity header to the DOM (below) should be done in a separate method, depending on the checklist type
        window.View.Render('GenerateQuantityHeader'); //TODO right now this assumes the header to display is the Travel type

        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' column button 
        for (var key in QuantityType)
        {
            bindQuantityHeaderToggleEvents(key);
        }
    }

    function loadChecklistDataIntoView(loadedListData)
    {
        window.DebugController.Print("Number of Lists retrieved from Model: " + loadedListData.length);

        for (var i = 0; i < loadedListData.length; i++) 
        {
            renderAndBindLoadedList(loadedListData[i])
            
            for (var j = 0; j < loadedListData[i].listItems.length; j++) 
            {
                renderAndBindLoadedListItem(loadedListData[i].id, loadedListData[i].listItems[j]);
            }
        }
    }

    /** Experimental & In Progress **/

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
            var _updateView = function()
            {
                window.View.Render('UpdateName', {id:data.id, updatedValue:updatedValue}); 
            };

            //TODO updatedName/Value should be consistent

            //Update the Model
            window.Model.ModifyList('EditName', data.id, _updateView, {updatedName:updatedValue});
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

    //TODO Could this be in handleUpdatesFromView?
    //TODO not sure I like this passive naming convention
    function listSelected(listId)
    {   
        //If there is any active settings view, close it
        window.View.Render('HideActiveSettingsView');

        //TODO It might make more sense to have a HideActiveList command in the View, instead of passing the activeListId as a parameter to DisplayList
            //Although, if this is the only place the Active List is hidden, then maybe it's fine
            //But then again, if there needs to be a special check for the activeListId not being null, then maybe it does make sense to have it be separate
        //Display the specified List Screen (and hide the Active List Screen, if applicable)
        window.View.Render('DisplayList', {listId:listId, activeListId:self.activeListId});

        //Set the newly selected List as the Active List
        self.activeListId = listId;
    }

    /** Publicly Exposed Methods **/

    return {
        Init : init,
        LoadChecklistDataIntoView : loadChecklistDataIntoView,
        //LoadListsIntoView : loadListsIntoView
        ListSelected : listSelected
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