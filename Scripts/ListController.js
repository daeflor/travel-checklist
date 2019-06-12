//'use strict';

const ChecklistEvents = {
    //App
    HashChanged: 'HashChanged', //Can result in up to three reactions. They are not mutually exclusive. 

    //Home Screen
    GoToListButtonPressed: 'GoToListButtonPressed',
    NewListButtonPressed: 'NewListButtonPressed',

    //List Screens
    NewListItemButtonPressed: 'NewListItemButtonPressed',

    //List Headers
    QuantityHeaderPopoverShown: 'QuantityHeaderPopoverShown',
    ClearButtonPressed: 'ClearButtonPressed',

    //Settings Views
    SettingsViewExpansionStarted: 'SettingsViewExpansionStarted',
    NameEdited: 'NameEdited',
    DeleteButtonPressed: 'DeleteButtonPressed', //TODO Can result in two separate actions. They are currently mutually exclusive. 
    MoveUpwardsButtonPressed: 'MoveUpwardsButtonPressed',
    MoveDownwardsButtonPressed: 'MoveDownwardsButtonPressed',

    //Quantity Toggles/Popovers
    QuantityToggleSelected: 'QuantityToggleSelected',
    QuantityPopoverShown: 'QuantityPopoverShown',
    DecrementQuantityButtonPressed: 'DecrementQuantityButtonPressed',
    IncrementQuantityButtonPressed: 'IncrementQuantityButtonPressed',
    ClickDetectedOutsidePopover: 'ClickDetectedOutsidePopover'
};

const ChecklistEventReactions = {
    //Home Screen
    DisplayList: 'DisplayList', 
    AddNewList: 'AddNewList',
    RemoveList: 'RemoveList',
    UpdateNameToggleColor: 'UpdateNameToggleColor',

    //List Screens
    AddNewListItem: 'AddNewListItem',
    RemoveListItem: 'RemoveListItem', //TODO is it possible to just have 'Remove' which works for both Lists and List Items?
    HideList: 'HideList',
    ShowHomeScreen: 'ShowHomeScreen',

    //List Headers
    SetupHeaderPopoverBinds: 'SetupHeaderPopoverBinds',
    ClearQuantityValues: 'ClearQuantityValues',

    //Settings Views
    HideActiveSettingsView: 'HideActiveSettingsView', //Can be caused by two separate triggers
    UpdateName: 'UpdateName',
    MoveUpwards: 'MoveUpwards',
    MoveDownwards: 'MoveDownwards', 

    //Quantity Toggles/Popovers
    ShowQuantityPopover: 'ShowQuantityPopover',
    SetupQuantityPopoverBinds: 'SetupQuantityPopoverBinds',
    DecrementQuantityValue: 'DecrementQuantityValue',
    IncrementQuantityValue: 'IncrementQuantityValue',
    HideActiveQuantityPopover: 'HideActiveQuantityPopover' //Can be caused by two separate triggers
};

window.ListController = (function()
{    
    let activeListId = null;

    //TODO what if, instead of having 3 different options properties, there is only one, and it gets replaced/updated at each interval as needed. 
        //i.e. options starts with bind options, then adds on (or is replaced with) any necessary model options, then adds on render options. 
        //This would probably only work if handleUpdatesFromView gets split into individual sections, which may be clearer anyway

    //TODO The binding reference could have actions and reactions
        //e.g. event -> action -> reaction (optional)
        //In most cases, reaction might be the same as action, but in other cases it might not be (e.g. DecrementQuantityValue/IncrementQuantityValue)
        //HandleEvent(), HandleAction(), HandleReaction()?

    //TODO could have a modelCommand and parameters (e.g. modelCommand=ModifyList/ModifyListItem/None, params=MoveUpwards)
        //Then the modelUpdateRequired field wouldn't be needed
        //Maybe rename/add as such:
            //bindingName = event
            //modelViewCommand = action
            //modificationType (AddList, ModifyList, and ModifyListItem being the options)
    //TODO remove the properties here that aren't being used, but document them elsewhere (e.g. in the Model's Modify methods or the View's Bind and Render methods) - i.e. be more dilligent about specifying expected parameters. Maybe could mix this with additional error handling in Model and View
    const bindReference = {
        /** MVC Bindings **/
        AddNewList: {
            event: 'NewListButtonPressed', 
            action: 'AddNewList',
            modelUpdateRequired: true,
            //bindOptions: [],
            //modelOptions: [],
            renderOptions: ['listId', 'listName', 'listType'] //or just checklistObject instead?
        },
        AddNewListItem: {
            event: 'NewListItemButtonPressed', 
            action: 'AddNewListItem',
            modelUpdateRequired: true,
            //bindOptions: [],
            //modelOptions: ['listId'],
            renderOptions: ['listId', 'checklistObject']
        },
        UpdateName: {
            //TODO would it be better to have a more generic optionsRequired array, and then check against all of those when setting up the binding?
            event: 'NameEdited', 
            action: 'UpdateName',
            modelUpdateRequired: true,
            //bindOptions: ['id'], 
            //modelOptions: ['listId', 'listItemId', 'updatedValue'],
            renderOptions: ['checklistObject']
        },
        MoveUpwards: {
            event: 'MoveUpwardsButtonPressed', 
            action: 'MoveUpwards',
            modelUpdateRequired: true,
            //bindOptions: ['id'],
            //modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject', 'swappedChecklistObjectId']
        },
        MoveDownwards: {
            event: 'MoveDownwardsButtonPressed', 
            action: 'MoveDownwards',
            modelUpdateRequired: true,
            //bindOptions: ['id'],
            //modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject', 'swappedChecklistObjectId']
        },
        DecrementQuantityValue: {
            event: 'DecrementQuantityButtonPressed', 
            action: 'DecrementQuantityValue',
            modelUpdateRequired: true,
            //bindOptions: [],
            //modelOptions: ['listId', 'listItemId', 'quantityType'],
            renderOptions: ['checklistObject', 'quantityType']
        },
        IncrementQuantityValue: {
            event: 'IncrementQuantityButtonPressed', 
            action: 'IncrementQuantityValue',
            modelUpdateRequired: true,
            //bindOptions: [],
            //modelOptions: ['listId', 'listItemId', 'quantityType'],
            renderOptions: ['checklistObject', 'quantityType']
        },
        RemoveList: {
            event: 'DeleteButtonPressed', 
            action: 'RemoveList',
            modelUpdateRequired: true,
            //bindOptions: ['id'],
            //modelOptions: ['listId'],
            renderOptions: ['checklistObject']
        },
        RemoveListItem: {
            event: 'DeleteButtonPressed', 
            action: 'RemoveListItem',
            modelUpdateRequired: true,
            //bindOptions: ['id'],
            //modelOptions: ['listId', 'listItemId'],
            renderOptions: ['checklistObject']
        },
        ClearQuantityValues: {
            event: 'ClearButtonPressed', 
            action: 'ClearQuantityValues',
            modelUpdateRequired: true,
            //bindOptions: [],
            //modelOptions: ['listId', 'quantityType'],
            renderOptions: ['quantityType']
        },
        /** VC Bindings **/
        HideActiveSettingsView: {
            event: 'SettingsViewExpansionStarted', 
            action: 'HideActiveSettingsView', //TODO should ALSO trigger on hashchange... right?
            modelUpdateRequired: false,
            //bindOptions: ['id'],
            //modelOptions: [],
            renderOptions: []
        },
        GoToList: {
            event: 'GoToListButtonPressed', 
            action: 'DisplayList',
            modelUpdateRequired: false,
            //bindOptions: ['id'],
            //modelOptions: [],
            renderOptions: ['checklistObject']
        },
        ShowQuantityPopover: {
            event: 'QuantityToggleSelected', 
            action: 'ShowQuantityPopover',
            modelUpdateRequired: false,
            bindOptions: ['id', 'quantityType'],
            //modelOptions: [],
            renderOptions: ['checklistObject', 'quantityType']
        },
        SetupQuantityPopoverBinds: {
            event: 'QuantityPopoverShown', 
            action: 'SetupQuantityPopoverBinds',
            modelUpdateRequired: false,
            bindOptions: ['id', 'quantityType'],
            //modelOptions: [],
            renderOptions: ['checklistObject', 'quantityType']
        },
        HideQuantityPopover: {
            event: 'ClickDetectedOutsidePopover', 
            action: 'HideActiveQuantityPopover',
            modelUpdateRequired: false,
            //bindOptions: [],
            //modelOptions: [],
            renderOptions: [] //['checklistObject', 'quantityType']
        },
        HideActivePopover: {
            event: 'HashChanged', 
            action: 'HideActiveQuantityPopover',
            modelUpdateRequired: false,
            //bindOptions: [],
            //modelOptions: [],
            renderOptions: []
        },
        SetupHeaderPopoverBinds: {
            event: 'QuantityHeaderPopoverShown', 
            action: 'SetupHeaderPopoverBinds',
            modelUpdateRequired: false,
            bindOptions: ['quantityType'],
            //modelOptions: [],
            renderOptions: ['listId', 'quantityType']
        }
        // UpdateListToggleColor: {
        //     event: 'HashChanged', 
        //     action: 'UpdateNameToggleColor',
        //     modelUpdateRequired: false,
        //     //bindOptions: [],
        //     //modelOptions: [],
        //     renderOptions: ['listId', 'balance']
        // }

        //TODO maybe we should get rid of this whole template/matrix above and just perform the right actions based on the triggered events as needed, below. 

        //TODO could have error checking on startup to ensure that these bidndings are all set correctly here (e.g. that an event and action is provided)
    };

    //TODO these helper methods below may not belong in Controller
    //Logic to determine URL details should probably be consolidated in a set of helper methods which are no part of the controller

    function isHomeScreen(urlString)
    {
        //If the url string matches the Home page for the Travel Checklist, return true, else return false
        return getFragmentIdentifierFromUrlString(urlString) === "/travel" ? true : false;
    }

    function isListScreen(urlString)
    {
        //TODO There is no validation here to ensure that this URL is within the 'Travel' app section

        //If the URL slug contains 13 characters, then assume that this is a List Screen and return true, else return false.
        return getUrlSlug(urlString).length == 13 ? true : false; //TODO this is pretty hacky
    }

    /** Private Methods To Handle Bind & Render Logic For New Or Updated Lists & List Items **/

    //TODO Might be best to keep renders, binds, and loads separate

    function renderAndBindQuantityHeader()
    {
        //TODO Adding the quantity header to the DOM (below) should be done in a separate method, depending on the checklist type
        //TODO right now this assumes the header to display is the Travel type
        window.View.Render('GenerateQuantityHeader'); 
        
        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' column button 
        for (let key in QuantityType)
        {
            const _options = {quantityType:key};
            setupBind(ChecklistEvents.QuantityHeaderPopoverShown, _options);
        }
    }

    //TODO why the name "loaded"? Seems unnecessary. And should rendering / adding the list to the DOM be done separately than creating the binds?
    /**
     * Sends to the View any data needed to render the specified List, and then sets up all applicable bindings
     * @param {object} list The object containing the data for the List to be rendered and bound
     */
    function renderAndBindLoadedList(list)
    {
        //Add the List elements to the DOM
        //window.View.Render('AddList', {listId:list.id, listName:list.name, listType:checklistType});
        window.View.Render('AddList', {list:list});

        fetchAndRenderListBalance(list.id);

            // var myObj = {myKey:"myVar", fruit:'banana'};
            // for (let key in myObj)
            // {
            //     if (myObj[key] == "myVar")
            //     { 
            //         console.log(key.toString());
            //     }
            //     else
            //     {
            //         console.log("Nope");
            //         console.log(myObj[key]);
            //     }
            // }

            //TODO I can't remember why I wanted property names, but it seems possible to get after all... ^ ^ ^
                //Oh one reason was because the bindReference has a lot of duplication between the reference name and the action
    
                //Would it help at all to send a string (e.g. 'HideSettingsView') as a param instead of the bindReference property object (e.g. bindReference.HideSettingsView)?
                    //Rename to bindActions, and each property has a sub property called event? And then that's all it has?
                    //bind.event would become bindActions[action].event
                    
                    //Actually I think I prefer reversing this so it's done based on event instead of action. Seems more readable that way, since the event is the first trigger in the chain of occurences

        //TODO continue to standardize ID parameter names as applicable

        //Setup the binds to update the list name, move it upwards or downwards, remove it from the list selection screen, navigate to it, or hide the Active Settings View when the animation to expand its Settings View starts
        const _options = {checklistObject:list};
        
        setupBind(ChecklistEvents.GoToListButtonPressed, _options);

        //Settings View Binds
        setupBind(ChecklistEvents.SettingsViewExpansionStarted, _options);
        setupBind(ChecklistEvents.NameEdited, _options);
        createBind(bindReference.MoveUpwards, _options);
        createBind(bindReference.MoveDownwards, _options);
        createBind(bindReference.RemoveList, _options); 
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
        window.View.Render('AddListItem', {listId:listId, listItem:listItem});  //TODO Should there be a View.Load method instead?                  
        window.View.Render('UpdateNameToggleColor', {id:listItem.id, balance:calculateListItemBalance(listItem.quantities)});

        //Bind user interaction with the quantity toggles to corresponding behavior
        for (let quantityType in listItem.quantities)
        {
            //Setup the binds to display the quantity popover, and create its own elements' binds once it has been added to the DOM
            const _options = {checklistObject:listItem, quantityType:quantityType};
            //createBind(bindReference.ShowQuantityPopover, _options);
            setupBind(ChecklistEvents.QuantityToggleSelected, _options);
            //createBind(bindReference.SetupQuantityPopoverBinds, _options);
            setupBind(ChecklistEvents.QuantityPopoverShown, _options);
        }

        //Setup the binds to update the list item name, move it upwards or downwards in the list, remove it from the list, or hide the Active Settings View when the animation to expand its Settings View starts
        const _options = {checklistObject:listItem}; //TODO if this is the only param needed, could _options = listItem? Not unless for List it also only needs the List object...
        
        //Settings View Binds
        setupBind(ChecklistEvents.SettingsViewExpansionStarted, _options);
        setupBind(ChecklistEvents.NameEdited, _options);
        createBind(bindReference.MoveUpwards, _options);
        createBind(bindReference.MoveDownwards, _options);
        createBind(bindReference.RemoveListItem, _options);
    }

    function renderUpdatesToListItemQuantity(listItem, quantityType)
    {
        window.View.Render('UpdateListItemQuantityText', {id:listItem.id, quantityType:quantityType, updatedValue:listItem.quantities[quantityType]});

        window.View.Render('UpdateNameToggleColor', {id:listItem.id, balance:calculateListItemBalance(listItem.quantities)});
    }
    
    /**
     * Calculates the balance of a List Item based on its different quantity values
     * @param {object} quantities The List Item's 'quantities' object
     * @returns The balance of the List Item, in the form of a ChecklistObjectBalance value
     */
    function calculateListItemBalance(quantities)
    {
        //Calculate the List Item's balance based on its different quantity values
        let _listItemBalance = quantities.needed - quantities.luggage - quantities.wearing - quantities.backpack;

        if (_listItemBalance !== 0) //If the balance is not equal to zero, return Unbalanced
        {
            return ChecklistObjectBalance.Unbalanced;
        } 
        else if (quantities.needed !== 0) //Else, if the 'needed' quantity is not equal to zero, return Balanced
        {
            return ChecklistObjectBalance.Balanced;
        }
        else //Else return None
        {
            return ChecklistObjectBalance.None;
        }
    }

    /**
     * Calculates the balance of a List based on the balance of its List Items
     * @param {array} listItems The array of List Items that the List comprises
     * @returns The balance of the List, in the form of a ChecklistObjectBalance value
     */
    function calculateListBalance(listItems)
    {
        //Set the List's balance as None by default
        let _listBalance = ChecklistObjectBalance.None;

        //For each List Item in the List...
        for (let i = 0; i < listItems.length; i++)
        {
            //Calculate the List Item's balance based on its different quantity values
            let _listItemBalance = calculateListItemBalance(listItems[i].quantities);

            //If the List Item is Unbalanced, then the List must also be, so set the List's balance as Unbalanced
            if (_listItemBalance === ChecklistObjectBalance.Unbalanced)
            {
                _listBalance = ChecklistObjectBalance.Unbalanced;
                break;
            } 
            //Else, if the List Item is Balanced, then set the List's balance as Balanced (as it can no longer be None, and has not yet been determined to be Unbalanced)
            else if (_listItemBalance === ChecklistObjectBalance.Balanced)
            {
                _listBalance = ChecklistObjectBalance.Balanced;
            }
        }

        return _listBalance;
    }

    function fetchAndRenderListBalance(listId) //TODO This name no longer makes much sense, since the balance isn't being fetched
    {
        //TODO This is the only Model call that returns instead of relying on callbacks. Is that ok?
        let _listBalance = window.Model.GetListBalance(listId, calculateListBalance);
        window.View.Render('UpdateNameToggleColor', {id:listId, balance:_listBalance});

        // let _calculateAndRenderListBalance = function(listItems)
        // {
        //     //Update the View, passing it the List's ID and calculated balance
        //     window.View.Render('UpdateNameToggleColor', {id:listId, balance:calculateListBalance(listItems)});
        // }

        // //TODO this completely breaks the existing pattern. 
        //     //This doesn't require updates to the model but it does access the model to get information. 
        //     //Calling this here is completely different to how the rest of the actions are performed
        // window.Model.AccessListItems(listId, _calculateAndRenderListBalance); 
    }

    /** Private Helper Methods To Setup Bindings For Lists & List Items **/

    //TODO options might not be the best name since in some cases the values provided are not optional
        //The 'correct' approach may be to split it into two functions, rather than having a parameter that is sometimes required and sometimes optional

    /**
     * Create a binding between the Model, View, and Controller, so that when the app receives user input which would modify the underlying data and UI of the checklist, the Model is updated accordingly, and then the View renders those updates.
     * @param {object} bind The bind object associated with the type of application interaction has been triggered (i.e. the action that has been initiated by the user or app, such as removing a List Item).
     * @param {object} [options] [Optional] An object containing any additional data needed to create the bind. The expected properties of this object are: TODO
     */
    function createBind(bind, options) 
    {
        //console.log(bind.toString());

        //If a bind with the expected properties was provided, setup the bind. Otherwise throw an error message.
        if (bind != null && bind.action != null && bind.event != null)
        {
            //If no options were provided, create an empty options object
            options = options || {}; 

            //Set up the callback method to execute for when the View recieves input from the user
            const _onUserInput = function(inputArgument) 
            {
                //console.log("The argument from the user input: ");
                //console.log(inputArgument);

                //Handle the updates/input received from the View
                handleUpdatesFromView(bind, options, inputArgument);
            };

            //Add an event listener to the specified element
            window.View.Bind(bind.event, _onUserInput, options);

            //TODO instead of trying to shoehorn everything to work in the same way, maybe it would actually be simpler (and more readable) to just split each case into it's own section.
                //For example, each bind would be split into its own section similar to handleUpdatesFromModel. 
                //This one-size-fits-all approach is nice in theory but doesn't scale well, and as it turns out causes more complication and reduces readability.
        }
        else
        {
            window.DebugController.LogError("ERROR: Invalid parameters provided when attempting to create a bind.");
        }
    }

    function setupBind(eventToBind, options)
    {
        //If a valid event was provided, setup the bind. Otherwise throw an error message.
        if (ChecklistEvents[eventToBind] != null)
        {
            //If no options were provided, create an empty options object
            options = options || {}; 

            //Set up the callback method to execute for when the View recieves input from the user
            const _onUserInput = function(inputArgument) 
            {
                //Handle the updates/input received from the View
                handleEvent(eventToBind, options, inputArgument);

                //TODO Note that the options object still exists from the previous time _onUerInput was called
                    //Should change how we do this. Although it doesn't actually cause any issues currently, it is not the expected or intended behavior for all cases, and should be re-written.
                    //For example, for a case like AddListItem, the options object should always start as empty, but it actually retains the value from the previous time the button was pressed, and then gets over-ridden. 
            };

            //Add an event listener to the specified element
            window.View.Bind(eventToBind, _onUserInput, options);

            //TODO instead of trying to shoehorn everything to work in the same way, maybe it would actually be simpler (and more readable) to just split each case into it's own section.
                //For example, each bind would be split into its own section similar to handleUpdatesFromModel. 
                //This one-size-fits-all approach is nice in theory but doesn't scale well, and as it turns out causes more complication and reduces readability.
        }
        else
        {
            window.DebugController.LogError("ERROR: Invalid event provided when attempting to setup a bind.");
        }
    }

    //handleEventWhichModifiesData, handleDataImpactingEvent, handleDataAlteringEvent - It's not JUST altering anymore though, also simply accessing
    //handleEventWithModelInteraction
    //Or just do it all in one event maybe
    //function handleModel

    // function updateView(renderAction, options, argument)
    // {
    //     //Merge any properties from the argument passed from the Model into the options object that gets passed to the View
    //     MergeObjects(options, argument);
    // }

    function handleEvent(triggeredEvent, options, inputArgument)
    {
        // console.log("HANDLE EVENT PARAMS - event: " + triggeredEvent + "; options: BELOW; Argument: " + inputArgument);
        // console.log(JSON.stringify(options));
        //TODO The options object still exists from the previous time a list was added.. It's blank the first time and then not after..
            //Should change how we do this. Although it doesn't actually cause any issues currently, it is not the expected or intended behavior and should be re-written.

        ////Merge any properties from the arguments passed from the View (from the user input) into the options object
        //MergeObjects(options, inputArgument); 

        if (triggeredEvent === ChecklistEvents.HashChanged)
        {
            window.View.Render('HideActiveSettingsView');
            window.View.Render('HideActiveQuantityPopover');

            //TODO Should add logic here to Hide the List Screen, if the previous page was a List Screen
            
            //If the new page is the Home Screen and the previous page was a List Screen...
            if (isHomeScreen(inputArgument.newURL) && activeListId != null)
            {
                //TODO It might make more sense to have a HideActiveList command in the View, instead of passing the activeListId as a parameter to DisplayList
                    //Although, if this is the only place the Active List is hidden, then maybe it's fine
                    //But then again, if there needs to be a special check for the activeListId not being null, then maybe it does make sense to have it be separate
                
                //Hide the List which was previously active, show the Home Screen, and calculate the update the List's balance
                window.View.Render('HideList', {id:activeListId});
                window.View.Render('ShowHomeScreen');
                fetchAndRenderListBalance(getUrlSlug(inputArgument.oldURL)); //TODO this is inconsistent with the approach taken for other mvc interactions, and should be re-considered.

                activeListId = null;
            }
        }
        // else if (triggeredEvent === ChecklistEvents.NewListButtonPressed)
        // {
        //     //triggerEventReaction
        //     //triggerModelInteration
        //     //triggerViewInteraction
        //     //triggerModelAction
        //     //triggerViewAction
        //     //initiate... ^ ^ ^

        //     // e.g. 
        //     //     triggerViewInteraction(ChecklistEventReactions.HideActiveSettingsView);
        //     //     triggerViewInteraction(ChecklistEventReactions.HideActiveQuantityPopover);
        //     //     triggerViewInteractions(ChecklistEventReactions.HideActiveSettingsView, ChecklistEventReactions.HideActiveQuantityPopover);
                
        //     //     triggerModelInteraction(getList); //bad exxample. Other cases might work
        //     // ---
            
        //     //Merge any properties from the arguments passed from the View (from the user input) into the options object that gets passed to the Model
        //     MergeObjects(options, inputArgument); 

        //     //TODO This section (below) could be in updateModel, but not sure it makes much difference

        //     //Set up the callback method to execute once the Model has been updated. 
        //     //TODO the param name 'inputArgument' doesn't make sense coming from the Model, but would like something clearer than just 'argument'
        //     const _modelUpdated = function(argument) 
        //     {    
        //         //Merge any properties from the argument passed from the Model into the options object that gets passed to the View
        //         MergeObjects(options, argument);
                
        //         ////Process the updates from the Model as needed, and then update the View, passing along any options  as applicable
        //         //handleUpdatesFromModel(bind.action, options);

        //         //Render the new List and setup its bindings
        //         renderAndBindLoadedList(options.list);

        //         //Once the new List has been added to the DOM, expand its Settings View
        //         window.View.Render('ExpandSettingsView', {id:options.list.id});
        //     };
            
        //     //updateModel(bind.action, _modelUpdated, options);
        //     window.Model.AddNewList(_modelUpdated);
        // }
        else if (triggeredEvent === ChecklistEvents.GoToListButtonPressed) //TODO is this necessary or can hashchage just be used?
        {
            //TODO It would be possible to get the List ID from the URL instead. That doesn't seem like the safest approach though..
            //Display the specified List
            window.View.Render('DisplayList', {id:options.checklistObject.id});
            //TODO Not all of the Render Commands are captured in the ChecklistEventsReaction enum, because that's not how this worked before...
                //Perhaps the Render commands could be made to be consistent with the Reaction command names, or vice versa

            //Set the newly selected List as the Active List
            activeListId = options.checklistObject.id;
        }
        else if (triggeredEvent === ChecklistEvents.QuantityHeaderPopoverShown)
        {
            //Setup the bind to clear the quantity values for the List Item, for the given quantity type
            //createBind(bindReference.ClearQuantityValues, options);
            setupBind(ChecklistEvents.ClearButtonPressed, options);
        }
        else if (triggeredEvent === ChecklistEvents.SettingsViewExpansionStarted)
        {
            window.View.Render('HideActiveSettingsView');
        }
        else if (triggeredEvent === ChecklistEvents.QuantityToggleSelected)
        {
            if (window.View.IsSettingsViewActive() === false && window.View.IsQuantityPopoverActive() === false)
            {
                //window.DebugController.Print("A Quantity Popover will be shown, and events will be prevented from bubbling up.");

                inputArgument.stopPropagation();

                window.View.Render('ShowQuantityPopover', {id:options.checklistObject.id, quantityType:options.quantityType});   
            }
        }
        else if (triggeredEvent === ChecklistEvents.QuantityPopoverShown)
        {   
            //TODO There might be a better way to do this, where these BINDs can be done when the +/- buttons are created and not when the popover is shown.

            //Setup the binds to increment or decrement the quantity value for the List Item, and to Hide it
            createBind(bindReference.DecrementQuantityValue, options);
            createBind(bindReference.IncrementQuantityValue, options);
            
            setupBind(ChecklistEvents.ClickDetectedOutsidePopover, options);
        }
        else if (triggeredEvent === ChecklistEvents.ClickDetectedOutsidePopover)
        {
            window.View.Render('HideActiveQuantityPopover');
        }
        else if (triggeredEvent === ChecklistEvents.NewListButtonPressed)
        {
                    // //Merge any properties from the arguments passed from the View (from the user input) into the options object that gets passed to the Model
                    // MergeObjects(options, inputArgument); 

                    // //TODO This section (below) could be in updateModel, but not sure it makes much difference

                    // //Set up the callback method to execute once the Model has been updated. 
                    // //TODO the param name 'inputArgument' doesn't make sense coming from the Model, but would like something clearer than just 'argument'
                    // const _modelUpdated = function(argument) 
                    // {    
                    //     //Merge any properties from the argument passed from the Model into the options object that gets passed to the View
                    //     MergeObjects(options, argument);
                        
                    //     //Process the updates from the Model as needed, and then update the View, passing along any options  as applicable
                    //     handleUpdatesFromModel('AddNewList', options);
                    // };

            //var _updateView = handleModelInteraction.bind(null, 'AddNewList', options);

            //TODO Why pass options when we know it's empty?
            let _updateView = handleModelInteraction.bind(options, 'AddNewList');
            window.Model.AddNewList(_updateView);
        }
        else if (triggeredEvent === ChecklistEvents.NewListItemButtonPressed)
        {
            //TODO Why pass options when we know it's empty?
            let _updateView = handleModelInteraction.bind(options, 'AddNewListItem');    
            window.Model.ModifyList('AddNewListItem', activeListId, _updateView);
        }
        else if (triggeredEvent === ChecklistEvents.ClearButtonPressed)
        {
            let _updateView = handleModelInteraction.bind(options, 'ClearQuantityValues'); 
            window.Model.ModifyList('ClearQuantityValues', activeListId, _updateView, options);
        }
        else if (triggeredEvent ===  ChecklistEvents.NameEdited)
        {
            //TODO This is going to get ugly.

            //Merge any properties from the arguments passed from the View (from the user input) into the options object that gets passed to the Model
            MergeObjects(options, inputArgument); 
            //TODO should validate that the inputArgument object contains an 'updatedValue' key, and extract it
                //Or, just extract it, instead of doing a merge
                //For example:
                    //let _updatedName = inputArgument.updatedValue;
                    //if (_updatedName != undefined) ... pass it as a param to the model, else throw an error

            let _updateView = handleModelInteraction.bind(options, 'UpdateName'); 

            if (options.checklistObject.hasOwnProperty('listItems') == true)
            {
                window.Model.ModifyList('UpdateName', options.checklistObject.id, _updateView, {updatedValue:inputArgument.updatedValue});
            }
            else if (options.checklistObject.hasOwnProperty('quantities') == true)
            {
                //TODO using options twice (or thrice!) within the params here seems silly
                    //Could have a singular point of entry in the Model instead of determining between ModifyList and ModifyListItem here
                    //maybe set _id at the top of the parent else if clause, with error handling (since ID is required, not optional)
                    //Maybe have a ValidateParameters utility function
                window.Model.ModifyListItem('UpdateName', activeListId, options.checklistObject.id, _updateView, {updatedValue:inputArgument.updatedValue});                
            }
        }
    }

    //TODO Temporary name probably
    function handleModelInteraction(action, argument)
    {       
        //Merge any properties from the argument passed from the Model into the options object
        //console.log("THIS then ARGUMENT then THIS merged with ARGUMENT");
        //console.log(JSON.stringify(this));
        //console.log(JSON.stringify(argument));
        MergeObjects(this, argument);
        //console.log(JSON.stringify(this));

        switch(action) 
        {
            case 'AddNewList':
                //Render the new List and setup its bindings
                renderAndBindLoadedList(this.list);
            
                //Once the new List has been added to the DOM, expand its Settings View
                window.View.Render('ExpandSettingsView', {id:this.list.id});
                break;
            case 'AddNewListItem':
                //Render the new List Item and setup its bindings
                renderAndBindLoadedListItem(activeListId, this.listItem);
                
                //Once the new List Item has been added to the DOM, expand its Settings View
                window.View.Render('ExpandSettingsView', {id:this.listItem.id});
                break;
            case 'ClearQuantityValues':
                //For each modified List Item, update its displayed quantity value for the given type, and then update its name's color
                for (let i = 0; i < this.modifiedListItems.length; i++)
                {
                    renderUpdatesToListItemQuantity(this.modifiedListItems[i], this.quantityType);
                } 
                break;
            case 'UpdateName':
                window.View.Render('UpdateName', {id:this.checklistObject.id, updatedValue:this.checklistObject.name});
                break;
            default:
                window.DebugController.LogError("ERROR: Tried to handle updates received from the Model, but no valid action was provided.");
        }

        //TODO would it be better if View commands always received consistent paramters (e.g. a list or list item object)?
        // //TODO Could use a switch/case here instead
        // const actions = 
        // {
        //     AddNewList : function()
        //     {
        //         //Render the new List and setup its bindings
        //         renderAndBindLoadedList(this.list);
            
        //         //Once the new List has been added to the DOM, expand its Settings View
        //         window.View.Render('ExpandSettingsView', {id:this.list.id});
        //     }
        // };

        // //If an action is provided, execute the corresponding method
        // action != null ? actions[action]() : window.DebugController.LogError("ERROR: Tried to handle updates received from the Model, but no action was provided.");
    }

    /**
     * Handle any input or updates to the checklist, received from the View. These updates may be passed along to the Model or directly back to the View to be rendered as needed.
     * @param {object} bind The bind object associated with the type of application interaction that has been triggered (i.e. the action that has been initiated by the user or app, such as removing a List Item).
     * @param {object} [options] [Optional] An object containing any additional data needed to handle the updates. The expected properties of this object are: bindOptions, modelOptions, renderOptions.
     * @param {*} [inputArgument] [Optional] An additional argument passed from the View as a result of the user interaction (e.g. the Mouse Event when a quantity popover is shown, or the updated name when a List or List Item is renamed)
     */
    function handleUpdatesFromView(bind, options, inputArgument)
    {    
        //If the triggered event requires the Model to be updated
        if (bind.modelUpdateRequired == true)
        {
            //Merge any properties from the arguments passed from the View (from the user input) into the options object that gets passed to the Model
            MergeObjects(options, inputArgument); 

            //TODO This section (below) could be in updateModel, but not sure it makes much difference

            //Set up the callback method to execute once the Model has been updated. 
            //TODO the param name 'inputArgument' doesn't make sense coming from the Model, but would like something clearer than just 'argument'
            const _modelUpdated = function(argument) 
            {    
                //Merge any properties from the argument passed from the Model into the options object that gets passed to the View
                MergeObjects(options, argument);
                
                //Process the updates from the Model as needed, and then update the View, passing along any options  as applicable
                handleUpdatesFromModel(bind.action, options);
            };
            
            updateModel(bind.action, _modelUpdated, options);
        }
        else //Else, if the triggered event does not require the Model to be updated
        {
            //TODO all the below should probably be split into an updateView or updateController method for better readability
                //hmm maybe not... might get confusing between that and handleUpdatesFromModel
                //maybe think about actions and reactions
        }
    }

    /**
     * Pass along to the Model any modifications or updates which need to be made to the checklist data
     * @param {string} action The action that has been initiated by the user or application (e.g. removing a List Item)
     * @param {Function} callback The method to call once the Model has been successfully updated
     * @param {object} [options] [Optional] An optional object to pass containing any data needed to pass along updates to the Model
     */
    function updateModel(action, callback, options)
    {
        //window["Model"][binding.modificationType](binding.action, checklistData.listId, checklistData.listItem.id, callback, options);

        // if (action === 'AddNewListItem')
        // {
        //     window.Model.ModifyList(action, activeListId, callback);
        // }
        // else if (action === 'AddNewList')
        // {
        //     window.Model.AddNewList(callback);
        // }
        // if (action === 'ClearQuantityValues')
        // {
        //     //TODO would it be possible to use a js bind to merge ModifyList and ModifyListItem and pass different modify commands?
        //         //e.g. var modifyList = window.Model.Modify.bind(null, 'List');
        //         //     var modifyListItem = window.Model.Modify.bind(null, 'ListItem');
        //         //Nah, seems unhelpful
        //     window.Model.ModifyList(action, activeListId, callback, options);
        // }
        if (options != null && options.hasOwnProperty('checklistObject') == true)
        {
            if (options.checklistObject.hasOwnProperty('listItems') == true)
            {
                window.Model.ModifyList(action, options.checklistObject.id, callback, options);
            }
            else if (options.checklistObject.hasOwnProperty('quantities') == true)
            {
                //TODO using options twice (or thrice!) within the params here seems silly
                    //Could have a singular point of entry in the Model instead of determining between ModifyList and ModifyListItem here
                    //maybe set _id at the top of the parent else if clause, with error handling (since ID is required, not optional)
                    //Maybe have a ValidateParameters utility function
                window.Model.ModifyListItem(action, activeListId, options.checklistObject.id, callback, options);
                
                window.DebugController.Print("Active List ID: " + activeListId);
            }

            //TODO 5 meh ideas to make this work
                // 1) Change it back to how it was, using listId and listItemId
                // 2) Pass activeListId in the options in such a way that it references its most up to date value
                // 3) Pass listId in the options for any List Item modifications - (Likely best short term solution)
                // 4) Add some sort of singular entrypoint method in the Model that determines if it needs to modify a List or List Item - (This would likely run into the same problem)
                // 5) Change List Item IDs to be prefixed by the listId, and then do #4 above. - (More of a long term solution)
        }
        else
        {
            window.DebugController.LogError("ERROR: Unable to handle updates received from the View. Action: " + action);
        }
    }

    /**
     * Handle any modifications or updates to checklist data received from the Model
     * @param {string} action The action that has been initiated by the user or application (e.g. removing a List Item)
     * @param {object} [options] [Optional] An optional object to pass containing any additional data needed to render updates. 
     * Possible properties: quantityType, swappedChecklistObjectId. //TODO!
     */
    function handleUpdatesFromModel(action, options)
    {       
        //TODO would it be better if View commands always received consistent paramters (e.g. a list or list item object)?
        //TODO Could use a switch/case here instead
        const actions = 
        {
            // AddNewList : function()
            // {
            //     //Render the new List and setup its bindings
            //     renderAndBindLoadedList(options.list);
            
            //     //Once the new List has been added to the DOM, expand its Settings View
            //     window.View.Render('ExpandSettingsView', {id:options.list.id});
            // },
            // AddNewListItem : function()
            // {
            //     //Render the new List Item and setup its bindings
            //     renderAndBindLoadedListItem(activeListId, options.listItem);
                
            //     //Once the new List Item has been added to the DOM, expand its Settings View
            //     window.View.Render('ExpandSettingsView', {id:options.listItem.id});
            // },
            // UpdateName : function()
            // {
            //     window.View.Render('UpdateName', {id:options.checklistObject.id, updatedValue:options.checklistObject.name});
            // },
            MoveUpwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:options.checklistObject.id, moveDownwardsId:options.swappedChecklistObjectId});
            },
            MoveDownwards : function()
            {
                window.View.Render('SwapListObjects', {moveUpwardsId:options.swappedChecklistObjectId, moveDownwardsId:options.checklistObject.id});
            },
            DecrementQuantityValue : function()
            {
                renderUpdatesToListItemQuantity(options.checklistObject, options.quantityType);
            },
            IncrementQuantityValue : function()
            {
                renderUpdatesToListItemQuantity(options.checklistObject, options.quantityType);
            },
            RemoveList : function()
            {
                //If the Active List ID is null, remove the List, else throw an error.
                activeListId == null    ? window.View.Render('RemoveList', {id:options.checklistObject.id}) 
                                        : window.DebugController.LogError("Expected Active List ID to be null when trying to remove a List, but it wasn't.");
            },
            RemoveListItem : function()
            {
                window.View.Render('RemoveListItem', {id:options.checklistObject.id}); 
            }
            // ClearQuantityValues : function()
            // {
            //     //For each modified List Item...
            //     for (let i = 0; i < options.modifiedListItems.length; i++)
            //     {
            //         //Update the List Item's displayed quantity value for the given type, and then update the List Item name's color
            //         renderUpdatesToListItemQuantity(options.modifiedListItems[i], options.quantityType);
            //     }                
            // }
        };

        //If an action is provided, execute the corresponding method
        action != null ? actions[action]() : window.DebugController.LogError("ERROR: Tried to handle updates received from the Model, but no action was provided.");
    }

    /** Publicly Exposed Methods To Setup UI & Load List Data **/

    function init()
    {     
        //Set the checklist type
        //checklistType = checklistType;

        //Setup the binds for interactions with the quantity header row
        renderAndBindQuantityHeader();

        //Set up the binds for the buttons to add a new List or List Item
        
        //createBind(bindReference.AddNewList);
        setupBind(ChecklistEvents.NewListButtonPressed);
        
        //createBind(bindReference.AddNewListItem);
        setupBind(ChecklistEvents.NewListItemButtonPressed);
        
        //Load the list data from storage and pass it along to the View
        window.Model.RetrieveChecklistData(loadChecklistDataIntoView);

        setupBind(ChecklistEvents.HashChanged);
    }

    function loadChecklistDataIntoView(loadedListData)
    {
        window.DebugController.Print("Number of Lists retrieved from Model: " + loadedListData.length);

        //For each List loaded from Storage...
        for (let i = 0; i < loadedListData.length; i++) 
        {
            //Add the List elements to the DOM and set up the binds for interactions with them
            renderAndBindLoadedList(loadedListData[i])
            
            //For each List Item in the List...
            for (let j = 0; j < loadedListData[i].listItems.length; j++) 
            {
                //Add the List Item's elements to the DOM and set up the binds for interactions with them
                renderAndBindLoadedListItem(loadedListData[i].id, loadedListData[i].listItems[j]);
            }
        }
    }

    /** Experimental & In Progress **/

    /** Publicly Exposed Methods **/

    return {
        Init : init
        //LoadChecklistDataIntoView : loadChecklistDataIntoView
    };
})();

const ListType = {
    Travel: 'travel',
    Checklist: 'shopping'
};

//TODO Consider moving this to a separate file?
const QuantityType = {
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