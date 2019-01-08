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
    //TODO remove the properties here that aren't being used, but document them elsewhere (e.g. in the Model's Modify methods or the View's Bind and Render methods) - i.e. be more dilligent about specifying expected parameters. Maybe could mix this with additional error handling in Model and View
    var bindingReference = {
        /** MVC Bindings **/
        AddNewList: {
            event: 'NewListButtonPressed', 
            action: 'AddNewList',
            modelUpdateRequired: true,
            bindOptions: [],
            modelOptions: [],
            renderOptions: ['listId', 'listName', 'listType'] //or just checklistObject instead?
        },
        AddNewListItem: {
            event: 'NewListItemButtonPressed', 
            action: 'AddNewListItem',
            modelUpdateRequired: true,
            bindOptions: [],
            modelOptions: ['listId'],
            renderOptions: ['listId', 'checklistObject']
        },
        UpdateName: {
            event: 'NameEdited', 
            action: 'UpdateName',
            modelUpdateRequired: true,
            bindOptions: ['id'], //TODO would it be better to have a more generic optionsRequired array, and then check against all of those when setting up the binding?
            modelOptions: ['listId', 'listItemId', 'updatedValue'],
            renderOptions: ['checklistObject']
        },
        MoveUpwards: {
            event: 'MoveUpwardsButtonPressed', 
            action: 'MoveUpwards',
            modelUpdateRequired: true,
            bindOptions: ['id'],
            modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject', 'swappedChecklistObjectId']
        },
        MoveDownwards: {
            event: 'MoveDownwardsButtonPressed', 
            action: 'MoveDownwards',
            modelUpdateRequired: true,
            bindOptions: ['id'],
            modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject', 'swappedChecklistObjectId']
        },
        DecrementQuantityValue: {
            event: 'DecrementQuantityButtonPressed', 
            action: 'DecrementQuantityValue',
            modelUpdateRequired: true,
            bindOptions: [],
            modelOptions: ['listId', 'listItemId', 'quantityType'],
            renderOptions: ['checklistObject', 'quantityType']
        },
        IncrementQuantityValue: {
            event: 'IncrementQuantityButtonPressed', 
            action: 'IncrementQuantityValue',
            modelUpdateRequired: true,
            bindOptions: [],
            modelOptions: ['listId', 'listItemId', 'quantityType'],
            renderOptions: ['checklistObject', 'quantityType']
        },
        RemoveList: {
            event: 'DeleteButtonPressed', 
            action: 'RemoveList',
            modelUpdateRequired: true,
            bindOptions: ['id'],
            modelOptions: ['listId'],
            renderOptions: ['checklistObject']
        },
        RemoveListItem: {
            event: 'DeleteButtonPressed', 
            action: 'RemoveListItem',
            modelUpdateRequired: true,
            bindOptions: ['id'],
            modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject']
        },
        ClearQuantityValues: {
            event: 'ClearButtonPressed', 
            action: 'ClearQuantityValues',
            modelUpdateRequired: true,
            bindOptions: [],
            modelOptions: ['listId', 'quantityType'],
            renderOptions: ['checklistObject', 'quantityType']
        },
        /** VC Bindings **/
        HideActiveSettingsView: {
            event: 'SettingsViewExpansionStarted', 
            action: 'HideActiveSettingsView',
            modelUpdateRequired: false,
            bindOptions: ['id'],
            modelOptions: [],
            renderOptions: []
        },
        GoToList: {
            event: 'GoToListButtonPressed', 
            action: 'GoToList',
            modelUpdateRequired: false,
            bindOptions: ['id'],
            modelOptions: [],
            renderOptions: ['checklistObject']
        },
        ShowQuantityPopover: {
            event: 'QuantityToggleSelected', 
            action: 'ShowQuantityPopover',
            modelUpdateRequired: false,
            bindOptions: ['id', 'quantityType'],
            modelOptions: [],
            renderOptions: ['checklistObject', 'quantityType']
        },
        SetupQuantityPopoverBindings: {
            event: 'QuantityPopoverShown', 
            action: 'SetupQuantityPopoverBindings',
            modelUpdateRequired: false,
            bindOptions: ['id', 'quantityType'],
            modelOptions: [],
            renderOptions: ['checklistObject', 'quantityType']
        },
        TODO: {
            event: 'QuantityHeaderPopoverShown', 
            action: '??',
            bindOptions: ['quantityType'],
            modelOptions: [],
            renderOptions: []
        }

        //TODO could have error checking on startup to ensure that these bidndings are all set correctly here (e.g. that an event and action is provided)
        
    };

    /** Private Methods To Handle Bind & Render Logic For New Or Updated Lists & List Items **/

    /**
     * Sends to the View any data needed to render the specified List, and then sets up all applicable bindings
     * @param {object} list The object containing the data for the List to be rendered and bound
     */
    function renderAndBindLoadedList(list)
    {
        //Add the List elements to the DOM
        window.View.Render('AddList', {listId:list.id, listName:list.name, listType:self.checklistType});

        //TODO maybe standardize ID parameter names
        //TODO wouldn't it be simpler to just always pass the full object (list or list item) and then from that you can get the most up to date name, ID, etc.
        var _bindParams= {};
        _bindParams.bindOptions = {id:list.id};
        _bindParams.modelOptions = {listId:list.id};
        _bindParams.renderOptions = {checklistObject:list};

        //Setup the binds to update the list name, move it upwards or downwards, remove it from the list selection screen, or hide the Active Settings View when the animation to expand its Settings View starts
        setupMvcBinding(bindingReference.HideActiveSettingsView, _bindParams);
        setupMvcBinding(bindingReference.GoToList, _bindParams);
        setupMvcBinding(bindingReference.UpdateName, _bindParams);
        setupMvcBinding(bindingReference.MoveUpwards, _bindParams);
        setupMvcBinding(bindingReference.MoveDownwards, _bindParams);
        setupMvcBinding(bindingReference.RemoveList, _bindParams); 
        //TODO would be nice if it were possible to just have Remove (instead of RemoveList and RemoveListItem)
            //Then much of this (most of the bind setup) could be reused, for both List and List Item
    }

    //TODO Maybe split this up into things that need to be rendered, and things that need to be bound
    /**
     * Sends to the View any data needed to render the specified List Item, and then sets up all applicable bindings
     * @param {string} listId The unique identfier for the List to which the specified List Item belongs
     * @param {object} listItem The object containing the data for the List Item to be rendered and bound
     */
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

        var _bindParams= {};
        _bindParams.bindOptions = {id:listItem.id};
        _bindParams.modelOptions = {listItemId:listItem.id};
        _bindParams.renderOptions = {checklistObject:listItem};

        //Setup the binds to update the list item name, move it upwards or downwards in the list, remove it from the list, or hide the Active Settings View when the animation to expand its Settings View starts
        setupMvcBinding(bindingReference.HideActiveSettingsView, _bindParams);
        setupMvcBinding(bindingReference.UpdateName, _bindParams);
        setupMvcBinding(bindingReference.MoveUpwards, _bindParams);
        setupMvcBinding(bindingReference.MoveDownwards, _bindParams);
        setupMvcBinding(bindingReference.RemoveListItem, _bindParams);
    }

    function renderUpdatesToListItemQuantity(listItem, quantityType)
    {
        window.View.Render('UpdateListItemQuantityText', {listItemId:listItem.id, quantityType:quantityType, updatedValue:listItem.quantities[quantityType]});
        window.View.Render('UpdateListItemNameColor', {listItemId:listItem.id, quantityNeeded:listItem.quantities.needed, quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)});
    }

    //TODO this is hard to read
    function bindQuantityHeaderToggleEvents(quantityType)
    {
        //TODO continue to clean this up
        // //When a Quantity Header Popover is shown, add an event listener to the 'Clear' column button 
        // for (var key in QuantityType)
        // {
        //     bindQuantityHeaderToggleEvents(key);
        // }

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

    //TODO Could possibly introduce a section for Controller logic to the setupBinding methods, to rid the need of having this separate method
    function setupPopoverBindings(listItem, quantityType)
    {
        var bindParams= {};
        bindParams.bindOptions = {id:listItem.id, quantityType:quantityType};
        bindParams.renderOptions = {checklistObject:listItem, quantityType:quantityType};
        setupMvcBinding(bindingReference.ShowQuantityPopover, bindParams);
        setupMvcBinding(bindingReference.SetupQuantityPopoverBindings, bindParams);
    }

    /** Private Helper Methods To Setup Bindings For Lists & List Items **/
    
    //TODO having a parameter called "parameters" is confusing
    //TODO maybe rename the method as well, possibly to createBind or something like that
    /**
     * Create a binding between the Model, View, and Controller, so that when the app receives user input which would modify the underlying data and UI of the checklist, the Model is updated accordingly, and then the View renders those updates.
     * @param {object} binding The binding type that has been triggered (i.e. the action that has been initiated by the user, such as removing a List Item).
     * @param {object} [parameters] [Optional] An object containing any additional data needed to create the bind. The expected properties of this object are: bindOptions, modelOptions, renderOptions.
     */
    function setupMvcBinding(binding, parameters) 
    {
        //If a binding with the expected properties was provided, setup the binding. Otherwise throw an error message.
        if (binding != null && binding.action != null && binding.event != null)
        {
            //If no parameters were provided, create an empty parameters object
            var parameters = parameters || {};

            //Set up the callback method to execute for when the View recieves input from the user
            var _onUserInput = function(inputArgument) 
            {
                console.log("The argument from the user input: ");
                console.log(inputArgument);

                //Handle the updates/input received from the View
                handleUpdatesFromView(binding, parameters, inputArgument);
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
     * Handle any input or updates to the checklist, received from the View. These updates may be passed along to the Model or directly back to the View to be rendered as needed.
     * @param {object} binding The binding type that has been triggered (i.e. the action that has been initiated by the user or app, such as removing a List Item).
     * @param {object} [parameters] [Optional] An object containing any additional data needed to handle the updates. The expected properties of this object are: bindOptions, modelOptions, renderOptions.
     * @param {*} [inputArgument] [Optional] An additional argument passed from the View as a result of the user interaction (e.g. the Mouse Event when a quantity popover is shown, or the updated name when a List or List Item is renamed)
     */
    function handleUpdatesFromView(binding, parameters, inputArgument)
    {    
        //If a valid binding was provided
        if (binding != null)
        {
            //If the triggered event requires the Model to be updated
            if (binding != null && binding.modelUpdateRequired == true)
            {

                //Merge any properties from the arguments passed from the View (from the user input) into the modelOptions object that gets passed to the Model
                parameters.modelOptions = MergeObjects(parameters.modelOptions, inputArgument);
    
                //TODO This section (below) could be in updateModel, but not sure it makes much difference

                //Set up the callback method to execute once the Model has been updated. 
                var _modelUpdated = function(inputArgument) 
                {    
                    //Merge any properties from the arguments passed from the Model into the renderOptions object that gets passed to the View
                    parameters.renderOptions = MergeObjects(parameters.renderOptions, inputArgument);
                    
                    //Update the View, passing along any optional parameters as applicable
                    handleUpdatesFromModel(binding.action, parameters.renderOptions);
                };
                
                updateModel(binding.action, _modelUpdated, parameters.modelOptions);
            }
            else //Else, if the triggered event does not require the Model to be updated
            {
                //TODO should these use events instead of actions?
                if (binding.action === 'HideActiveSettingsView')
                {
                    console.log(parameters);
                    window.View.Render(binding.action);
                }
                else if (binding.action === 'GoToList')
                {
                    //If there is any active settings view, close it
                    window.View.Render('HideActiveSettingsView');

                    //TODO It might make more sense to have a HideActiveList command in the View, instead of passing the activeListId as a parameter to DisplayList
                        //Although, if this is the only place the Active List is hidden, then maybe it's fine
                        //But then again, if there needs to be a special check for the activeListId not being null, then maybe it does make sense to have it be separate
                    //Display the specified List Screen (and hide the Active List Screen, if applicable)
                    window.View.Render('DisplayList', {listId:parameters.renderOptions.checklistObject.id, activeListId:self.activeListId});

                    //Set the newly selected List as the Active List
                    self.activeListId = parameters.renderOptions.checklistObject.id;
                }
                else if (binding.action == 'ShowQuantityPopover')
                {
                    if (quantityPopoverActive == false)
                    {
                        window.DebugController.Print("A Quantity Popover will be shown, and events will be prevented from bubbling up.");

                        inputArgument.stopPropagation();

                        window.View.Render(binding.action, {listItemId:parameters.renderOptions.checklistObject.id, quantityType:parameters.renderOptions.quantityType});   
                        quantityPopoverActive = true;
                    }
                }
                else if (binding.action == 'SetupQuantityPopoverBindings')
                {
                    var _hideQuantityPopover = function() {
                        window.DebugController.Print("A Quantity Popover will be hidden.");
            
                        window.View.Render('HideQuantityPopover', {listItemId:parameters.renderOptions.checklistObject.id, quantityType:parameters.renderOptions.quantityType} );
                        quantityPopoverActive = false;
                    };
                    
                    //TODO There might be a better way to do this, where these BINDs can be done when the +/- buttons are created and not when the popover is shown.
                    window.View.Bind('ClickDetectedOutsidePopover', _hideQuantityPopover);   
                    window.addEventListener("hashchange", _hideQuantityPopover, {once:true}); //If the hash location changes (e.g. the Back button is pressed), the popover should be hidden.
                    
                    var bindParams= {};
                    bindParams.modelOptions = {listItemId:parameters.renderOptions.checklistObject.id, quantityType:parameters.renderOptions.quantityType};
                    bindParams.renderOptions = {checklistObject:parameters.renderOptions.checklistObject, quantityType:parameters.renderOptions.quantityType};

                    setupMvcBinding(bindingReference.DecrementQuantityValue, bindParams);
                    setupMvcBinding(bindingReference.IncrementQuantityValue, bindParams);
                }
            }
        }
    }

    /**
     * Pass along to the Model any modifications or updates which need to be made to the checklist data
     * @param {string} action The action that has been initiated by the user or application (e.g. removing a List Item)
     * @param {Function} callback The method to call once the Model has been successfully updated
     * @param {object} [modelOptions] [Optional] An optional object to pass containing any data needed to pass along updates to the Model
     */
    function updateModel(action, callback, modelOptions)
    {
        //window["Model"][binding.modificationType](binding.action, checklistData.listId, checklistData.listItem.id, callback, options);

        if (action === 'AddNewListItem')
        {
            window.Model.ModifyList(action, self.activeListId, callback);
        }
        else if (action === 'AddNewList')
        {
            window.Model.AddNewList(callback);
        }
        else if (modelOptions != null)
        {
            if (modelOptions.listItemId != null)
            {
                //TODO using modelOptions twice within the params here seems silly
                window.Model.ModifyListItem(action, self.activeListId, modelOptions.listItemId, callback, modelOptions);
            }
            else if (modelOptions.listId != null)
            {
                window.Model.ModifyList(action, modelOptions.listId, callback, modelOptions);
            }
        }
        else
        {
            window.DebugController.LogError("ERROR: Unable to handle updates received from the View. Action: " + action);
        }
    }

    /**
     * Handle any modifications or updates to checklist data received from the Model
     * @param {string} action The action that has been initiated by the user or application (e.g. removing a List Item)
     * @param {object} [renderOptions] [Optional] An optional object to pass containing any additional data needed to render updates. Possible properties: quantityType, swappedChecklistObjectId.
     */
    function handleUpdatesFromModel(action, renderOptions)
    {       
        //TODO would it be better if View commands always received consistent paramters (e.g. a list or list item object)?
        //TODO Could use a switch/case here instead
        var actions = 
        {
            AddNewList : function()
            {
                //Render the new List and setup its bindings
                renderAndBindLoadedList(renderOptions.checklistObject);
            
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
                window.View.Render('SwapListObjects', {moveUpwardsId:renderOptions.checklistObject.id, moveDownwardsId:renderOptions.swappedChecklistObjectId});
            },
            MoveDownwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:renderOptions.swappedChecklistObjectId, moveDownwardsId:renderOptions.checklistObject.id});
            },
            DecrementQuantityValue : function()
            {
                renderUpdatesToListItemQuantity(renderOptions.checklistObject, renderOptions.quantityType);
            },
            IncrementQuantityValue : function()
            {
                renderUpdatesToListItemQuantity(renderOptions.checklistObject, renderOptions.quantityType);
            },
            RemoveList : function()
            {
                //If the List that was removed was the most recently Active List, set the Active List ID to null                
                if (self.activeListId == renderOptions.checklistObject.id)
                {
                    self.activeListId = null;
                }

                window.View.Render('RemoveList', {listId:renderOptions.checklistObject.id}); 
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

        setupMvcBinding(bindingReference.AddNewList);
        setupMvcBinding(bindingReference.AddNewListItem);
        
        //TODO Adding the quantity header to the DOM (below) should be done in a separate method, depending on the checklist type
        //TODO right now this assumes the header to display is the Travel type
        window.View.Render('GenerateQuantityHeader'); 

        //TODO would like all binds to be one-liners. (For-loops can be done in the methods instead of here). 
        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' column button 
        for (var key in QuantityType)
        {
            bindQuantityHeaderToggleEvents(key);
        }

        //Load the list data from storage and pass it along to the View
        window.Model.RetrieveChecklistData(loadChecklistDataIntoView);
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

    // function isValidBinding(binding)
    // {
    //     //if (binding != null && bindingReference.hasOwnProperty())
    // }

    /** Publicly Exposed Methods **/

    return {
        Init : init
        //LoadChecklistDataIntoView : loadChecklistDataIntoView
    };
})();

var ListType = {
    Travel: 0,
    Checklist: 1,
};

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