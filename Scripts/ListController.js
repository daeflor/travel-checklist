'use strict';
window.ListController = (function()
{    
    //Assign a variable to track the ID of the active List
    let activeListId = null;

    //Private Helper Function To Render Updates To Lists & List Items
    //#region ================================================================================

    /**
     * 
     * @param {string} quantityType The type of quantity that has been modified for the List Item
     * @param {string} listItemId The unique identfier for the List Item which had one of its quantities modified
     * @param {*} updatedValue The updated value of the quantity which was modified
     * @param {*} balance The updated balance of the List Item calculated after one of its quantity values was modified
     */
    function renderListItemQuantityAndBalance(quantityType, listItemId, updatedValue, balance)
    {
        //Update the text value of the quantity toggle for the List Item quantity type that was modified
        window.View.Render('UpdateListItemQuantityText', {id:listItemId, quantityType:quantityType, updatedValue:updatedValue});

        //Update the List Item's name toggle color based on its updated balance
        window.View.Render('UpdateNameToggleColor', {id:listItemId, balance:balance});
    }
    //#endregion

    //Private Functions To Setup Collections Of Listeners
    //#region ================================================================================
    /**
     * Sets up any ongoing listeners for the app which are not dependent on specific Lists or List Items
     */
    function setupListeners_Ongoing()
    {
        //Whenever the screen changes, hide the Active Settings View and Quantity Popover
        listenForEvent_ScreenChanged();

        //When the user navigates home, hide the List Screen and show the Home Screen. (Works using either the Home button or 'back' browser command).
        listenForEvent_NavigatedHome();

        //When the New List button is pressed, add a new List to the checklist data and the DOM
        listenForEvent_NewListButtonPressed();

        //When the New List Item button is pressed, add a new List Item to the checklist data and the DOM
        listenForEvent_NewListItemButtonPressed();

        //For each quantity type supported by the checklist...
        for (const key in QuantityTypes)
        {
            //When that quantity's Header Popover is shown, add an event listener to the 'Clear' button to clear that quantity's column
            listenForEvent_QuantityHeaderPopoverShown(key);
        }
    }

    /**
     * Sends to the View any data needed to render the specified List, and then sets up all applicable listeners
     * @param {string} listId The unique identfier for the List being set up
     * @param {string} listName The name of the List being set up
     * @param {string} listType The type of List being set up
     * @param {string} [listBalance] [Optional] The initial List balance string value, based on its List Items' quantity values
     */
    function setupListenersAndUI_List(isLoadedFromStorage, listId, listName, listType, listBalance)
    {
        //Pass along to the View all the List data provided in order to generate its UI and add it to the DOM
        window.View.Render('AddList', {listId:listId, listName:listName, listType:listType, listBalance:listBalance});
        
        //When the Go To List button is pressed, display the list
        listenForEvent_GoToListButtonPressed(listId); 

        //Setup listeners related to the List's Settings View
        setupListeners_SettingsView(listId); 

        //If the List was not loaded from Storage (i.e. was newly created through the checklist's UI)...
        if (isLoadedFromStorage == false)
        {
            //Expand the List's Settings View
            window.View.Render('ExpandSettingsView', {id:listId}); 
        }
    }

    //TODO Maybe split this up into things that need to be rendered, and things that need to be bound
    //TODO Could extract the List ID from the List Item ID instead of passing it as a param, although that wouldn't be any easier
    //TODO listItemQuantities & listItemBalance could be optional or could be required. Either way can be done. Currently they are optional.   
    /**
     * Sends to the View any data needed to render the specified List Item, and then sets up all applicable listeners
     * @param {string} listId The unique identfier for the List to which the specified List Item belongs
     * @param {string} listItemId The unique identfier for the List Item being set up
     * @param {string} listItemName The name of the List Item
     * @param {object} [listItemQuantities] [Optional] An object containing the initial quantity values to display for the List Item
     * @param {string} [listItemBalance] [Optional] The initial List Item balance string value, based on its quantity values
     */
    function setupListenersAndUI_ListItem(isLoadedFromStorage, listId, listItemId, listItemName, listItemQuantities, listItemBalance)
    {   
        //Pass along to the View all the List Item data provided in order to generate its UI and add it to the DOM
        window.View.Render('AddListItem', {listId:listId, listItemId:listItemId, listItemName:listItemName, listItemQuantities:listItemQuantities, listItemBalance:listItemBalance});

        //TODO Does this 'for' need to be here or can it be done in the listen function
            //If it's done in the listen functions then, in this case, it will be done twice instead of once...
        //For each quantity type supported by the checklist...
        for (const key in QuantityTypes)
        {
            //When the Quantity Toggle is selected, show the Quantity Popover for that toggle
            listenForEvent_QuantityToggleSelected(listItemId, key);

            //When the Quantity Popover is added to the DOM and shown, set up the listeners for its children elements
            listenForEvent_QuantityPopoverShown(listItemId, key);            
        }

        // //When a Quantity Toggle is selected, show the Quantity Popover for that toggle
        // listenForEvent_QuantityToggleSelected(listItemId);

        // //When a Quantity Popover is added to the DOM and shown, set up the listeners for its children elements
        // listenForEvent_QuantityPopoverShown(listItemId);


        //Setup listeners related to the List Item's Settings View
        setupListeners_SettingsView(listItemId); 

        //If the List Item was not loaded from Storage (i.e. was newly created through the checklist's UI)...
        if (isLoadedFromStorage == false)
        {
            //Expand the List Item's Settings View
            window.View.Render('ExpandSettingsView', {id:listItemId}); 
        }
    }

    /**
     * Sets up the listener for the various user interactions related to a List or List Item's Settings View
     * @param {string} id The ID of the List or List Item
     */
    function setupListeners_SettingsView(id)
    {
        //When the animation to expand the Settings View starts, hide the Active Settings View
        listenForEvent_SettingsViewExpansionStarted(id);

        //When the edit name text field is modified, update the name of the checklist object
        listenForEvent_NameEdited(id);

        //When the delete button is pressed, remove the checklist object
        listenForEvent_DeleteButtonPressed(id);

        //When the Move Upwards button is pressed, move the checklist object up by one position
        listenForEvent_MoveUpwardsButtonPressed(id);

        //When the Move Downwards button is pressed, move the checklist object down by one position
        listenForEvent_MoveDownwardsButtonPressed(id);
    } 
    //#endregion

    //Private Functions To Setup Listeners For Individual Lists & List Items
    //#region ================================================================================

    //TODO Maybe put error handling in the functions below to ensure the expected parameters have been passed.
        //For example: if (validateObjectContainsValidKVPs(options, ['quantityType']) == true) ~OR~ validateObjectContainsKVPs(options, [key1, key2, etc]) == true ? doAction() : logError();
        //TODO Maybe document the required properties elsewhere as well? (e.g. in the Model's Modify methods or the View's Bind and Render methods)
            //i.e. be more dilligent about specifying expected parameters. Maybe could mix this with additional error handling in Model and View

    //TODO these functions may be more readable if more whitespace is included, with comments above instead of to the right. 
        //Re-assess once the whole listenForEvent transition is complete.

    //TODO Document these methods with JSDOC

    //App Navigation
    //#region ==============================

    /**
     * Informs the AppNavigationController to listen for an event indicating the screen has changed
     */
    function listenForEvent_ScreenChanged()
    {
        window.AppNavigationController.ListenForEvent('ScreenChanged', reactToEvent_ScreenChanged);
    }

    function reactToEvent_ScreenChanged()
    {
        //Inform the View to hide the Active Settings View
        window.View.Render('HideActiveSettingsView');

        //Inform the View to hide the Active Quantity Popover
        window.View.Render('HideActiveQuantityPopover');
    }

    /**
     * Informs the AppNavigationController to listen for an event indicating the user has navigated to the Home Screen
     */
    function listenForEvent_NavigatedHome() 
    {
        window.AppNavigationController.ListenForEvent('NavigatedHome', reactToEvent_NavigatedHome);
    }

    function reactToEvent_NavigatedHome()
    {
        //Inform the View to hide the List which was previously active
        window.View.Render('HideList', {id:activeListId});

        //Inform the View to display the Home Screen
        window.View.Render('ShowHomeScreen');

        //TODO This is the only Model call that returns instead of relying on callbacks, and which doesn't require updates to the model but does access it get information. Is that ok?
        //Calculate the balance of the List which was previously active, and inform the View to update the color of List's name toggle accordingly
        window.View.Render('UpdateNameToggleColor', {id:activeListId, balance:window.Model.GetListBalance(activeListId)});

        //Set the Active List ID to null, now that there is no active List
        activeListId = null;
    }
    //#endregion

    //Home Screen
    //#region ==============================

    /**
     * Informs the View to listen for an event indicating a 'Go To List' button has been pressed
     * @param {string} listId The unique identfier for the List which was selected to be displayed
     */
    function listenForEvent_GoToListButtonPressed(listId) //TODO is this necessary or can HashChanged just be used?
    {
        window.View.Bind('GoToListButtonPressed', reactToEvent_GoToListButtonPressed.bind(null, listId), {id:listId});
    }

    /**
     * Displays the specified List and sets it as the Active List
     * @param {string} listId The unique identfier for the List to be displayed
     */
    function reactToEvent_GoToListButtonPressed(listId)
    {
        //TODO It would be possible to get the List ID from the URL instead. That doesn't seem like the safest approach though.. Would be fine but doesn't really offer any benefit
        //Inform the View to display the specified List
        window.View.Render('DisplayList', {id:listId});

        //Set the newly selected List as the Active List
        activeListId = listId;
    }

    /**
     * Informs the View to listen for an event indicating the 'New List' button has been pressed
     */
    function listenForEvent_NewListButtonPressed()
    {
        window.View.Bind('NewListButtonPressed', reactToEvent_NewListButtonPressed);
    }

    function reactToEvent_NewListButtonPressed()
    {
        //TODO it's confusing using bind and Bind

        //Once the Model has created a new List object, pass any necessary data to the View to set up the listeners and UI for it
        const _viewReaction = setupListenersAndUI_List.bind(null, false); 

        //Inform the Model to create a new List data object and then execute the passed callback function
        window.Model.AddNewList(_viewReaction);
    }
    //#endregion

    //List Screen Headers & Footers
    //#region ==============================

    /**
     * Informs the View to listen for an event indicating the 'New List Item' button has been pressed
     */
    function listenForEvent_NewListItemButtonPressed()
    {
        window.View.Bind('NewListItemButtonPressed', reactToEvent_NewListItemButtonPressed);
    }

    function reactToEvent_NewListItemButtonPressed()
    {
        //Once the Model has created a new List Item object, pass any necessary data to the View to set up the listeners and UI for it
        const _viewReaction = setupListenersAndUI_ListItem.bind(null, false, activeListId);

        //Inform the Model to create a new List Item data object and then execute the passed callback function
        window.Model.AddNewListItem(activeListId, _viewReaction);
    }

    /**
     * Informs the View to listen for an event indicating that a Quantity Header Popover has been shown
     * @param {string} quantityType The quantity type of the header popover that will be shown
     */
    function listenForEvent_QuantityHeaderPopoverShown(quantityType)
    {
        window.View.Bind('QuantityHeaderPopoverShown', reactToEvent_QuantityHeaderPopoverShown.bind(null, quantityType), {quantityType:quantityType});
    }

    /**
     * Sets up a listener for when a 'Clear' button is pressed, which can only happen when the Quantity Header Popover is shown
     * @param {string} quantityType The quantity type of the header popover that was shown
     */
    function reactToEvent_QuantityHeaderPopoverShown(quantityType)
    {
        listenForEvent_ClearButtonPressed(quantityType);
    }

    /**
     * Informs the View to listen for an event indicating a 'Clear' button has been pressed
     * @param {string} quantityType The quantity type associated with clear button
     */
    function listenForEvent_ClearButtonPressed(quantityType)
    {
        window.View.Bind('ClearButtonPressed', reactToEvent_ClearButtonPressed.bind(null, quantityType));
    }

    /**
     * Clears the quantity value for all List Items of the given quantity type in the Active List, and updates the checklist's data and UI accordingly
     * @param {string} quantityType The quantity type associated with the clear button that was pressed
     */
    function reactToEvent_ClearButtonPressed(quantityType)
    {
        //Once the Model has modified the quantity value for a List Item, pass any necessary data to the View to update its UI
        const _viewReaction = renderListItemQuantityAndBalance.bind(null, quantityType);

        //Inform the Model to modify the specified quantity for the all List Items in the active List, and execute the passed callback function for each modified List Item
        window.Model.ModifyQuantity(activeListId, _viewReaction, 'Clear', quantityType); 
    }
    //#endregion

    //Settings Views
    //#region ==============================

    /**
     * Informs the View to listen for an event indicating a Settings View has begun expansion
     * @param {string} id The unique identfier for the List or List Item which has had its Settings View begin to expand
     */
    function listenForEvent_SettingsViewExpansionStarted(id)
    {
        window.View.Bind('SettingsViewExpansionStarted', reactToEvent_SettingsViewExpansionStarted, {id:id});
    }

    function reactToEvent_SettingsViewExpansionStarted()
    {
        //Inform the View to hide the Active Settings View
        window.View.Render('HideActiveSettingsView');
    }

    /**
     * Informs the View to listen for an event indicating a List or List Item's 'Edit Name' text field has been modified
     * @param {string} id The unique identfier for the List or List Item which has had its name edited
     */
    function listenForEvent_NameEdited(id)
    {
        window.View.Bind('NameEdited', reactToEvent_NameEdited.bind(null, id), {id:id});
    }

    /**
     * Updates the name of a given List or List Item, both in the checklist's underlying data and UI
     * @param {string} id The unique identfier for the List or List Item which has had its name edited
     * @param {string} updatedValue The updated name value of the List or List Item, received from user input to the checklist
     */
    function reactToEvent_NameEdited(id, updatedValue)
    {
        //TODO Would be able to use the updated name from the Model here if eventually the Render commands in the View are also split up to be handled individually
        //Once the Model has modified the List or List Item name, pass any necessary data to the View to update its name toggle
        const _viewReaction = window.View.Render.bind(null, 'UpdateName', {id:id, updatedValue:updatedValue});
        
        //Inform the Model to modify the specified List or List Item's name, and then execute the passed callback function
        window.Model.ModifyName(id, _viewReaction, updatedValue);
    }

    /**
     * Informs the View to listen for an event indicating a List or List Item's 'Delete' button has been pressed
     * @param {string} id The unique identfier for the List or List Item which has been selected to be deleted
     */
    function listenForEvent_DeleteButtonPressed(id)
    {
        window.View.Bind('DeleteButtonPressed', reactToEvent_DeleteButtonPressed.bind(null, id), {id:id});
    }

    /**
     * Removes the given List or List Item from both the checklist's underlying data and UI
     * @param {string} id The unique identfier for the List or List Item to be deleted
     */
    function reactToEvent_DeleteButtonPressed(id)
    {
        //TODO DeleteButtonPressed event could be split into RemoveListButtonPressed and RemoveListItemButtonPressed, but it would actually require more code
        //Once the Model has removed the List or List Item, pass any necessary data to the View to remove it from the UI
        const _viewReaction = (activeListId == null) ? window.View.Render.bind(null, 'RemoveList', {id:id}) : window.View.Render.bind(null, 'RemoveListItem', {id:id});

        //Inform the Model to remove the specified List or List Item, and then execute the passed callback function
        window.Model.Remove(id, _viewReaction);
    }

    /**
     * Informs the View to listen for an event indicating a List or List Item's 'Move Upwards' button has been pressed
     * @param {string} id The unique identfier for the List or List Item selected to be moved upwards
     */
    function listenForEvent_MoveUpwardsButtonPressed(id)
    {
        window.View.Bind('MoveUpwardsButtonPressed', reactToEvent_MoveUpwardsButtonPressed.bind(null, id), {id:id});
    }

    /**
     * Moves the given List or List Item upwards in its parent list/array, both in the checklist's underlying data and UI
     * @param {string} id The unique identfier for the List or List Item to move upwards
     */
    function reactToEvent_MoveUpwardsButtonPressed(id)
    {
        //TODO Would be able to just use a one-line bind call here if eventually the Render commands in the View are also split up to be handled individually
        //Once the Model has moved the List or List Item upwards in the checklist data, pass any necessary data to the View to do the same in the UI
        const _viewReaction = function(swappedChecklistObjectId) {
            //Inform the View to swap the UI for the specified List or List Item and the one above it in its parent list
            window.View.Render('SwapListObjects', {moveUpwardsId:id, moveDownwardsId:swappedChecklistObjectId});
        };
        
        //Inform the Model to move the specified List or List Item upwards, and then execute the passed callback function
        window.Model.ModifyPosition(id, _viewReaction, 'Upwards');
    }

    /**
     * Informs the View to listen for an event indicating a List or List Item's 'Move Downwards' button has been pressed
     * @param {string} id The unique identfier for the List or List Item selected to be moved downwards
     */
    function listenForEvent_MoveDownwardsButtonPressed(id)
    {
        window.View.Bind('MoveDownwardsButtonPressed', reactToEvent_MoveDownwardsButtonPressed.bind(null, id), {id:id});
    }

    /**
     * Moves the given List or List Item downwards in its parent list/array, both in the checklist's underlying data and UI
     * @param {string} id The unique identfier for the List or List Item to move downwards
     */
    function reactToEvent_MoveDownwardsButtonPressed(id)
    {
        //TODO Would be able to just use a one-line bind call here if eventually the Render commands in the View are also split up to be handled individually
        //Once the Model has moved the List or List Item downwards in the checklist data, pass any necessary data to the View to do the same in the UI
        const _viewReaction = function(swappedChecklistObjectId) {
            //Inform the View to swap the UI for the specified List or List Item and the one below it in its parent list
            window.View.Render('SwapListObjects', {moveUpwardsId:swappedChecklistObjectId, moveDownwardsId:id});
        };
        
        //Inform the Model to move the specified List or List Item downwards, and then execute the passed callback function
        window.Model.ModifyPosition(id, _viewReaction, 'Downwards');
    }
    //#endregion

    //Quantity Modifier Toggles & Popovers
    //#region ==============================

    function listenForEvent_QuantityToggleSelected(listItemId, quantityType)
    {
        //Define how the UI should react when the user selects a List Item's quantity toggle
        const _viewReaction = function(clickEvent) {
            if (window.View.IsSettingsViewActive() === false && window.View.IsQuantityPopoverActive() === false)
            {
                //Prevent the event from bubbling up to other elements in the checklist (which would in turn trigger the 'ClickDetectedOutsidePopover' event and hide the popover)
                clickEvent.stopPropagation();

                //Inform the View to display the popover associated with the selected quantity toggle
                window.View.Render('ShowQuantityPopover', {id:listItemId, quantityType:quantityType});   
            }
        };

        //Inform the View to listen for an event indicating a List Item's quantity toggle has been selected
        window.View.Bind('QuantityToggleSelected', _viewReaction, {id:listItemId, quantityType:quantityType});
    }

    function listenForEvent_QuantityPopoverShown(id, quantityType)
    {
        const _controllerReaction = function() {
            //Listen for the event to decrement a List Item's quantity value
            listenForEvent_DecrementQuantityButtonPressed(id, quantityType);

            //Listen for the event to increment a List Item's quantity value
            listenForEvent_IncrementQuantityButtonPressed(id, quantityType);

            //Listen for the event to hide the active Quantity Popover
            listenForEvent_ClickDetectedOutsidePopover();
        };

        //Inform the View to listen for an event indicating a List Item's quantty popover has been added to the DOM and shown
        window.View.Bind('QuantityPopoverShown', _controllerReaction, {id:id, quantityType:quantityType});
    }

    function listenForEvent_DecrementQuantityButtonPressed(id, quantityType)
    {
        const _viewReaction = renderListItemQuantityAndBalance.bind(null, quantityType);
        const _modelReaction = window.Model.ModifyQuantity.bind(null, id, _viewReaction, 'Decrement', quantityType);

        //Inform the View to listen for an event indicating a List Item's 'Decrement quantity' button has been pressed
        window.View.Bind('DecrementQuantityButtonPressed', _modelReaction);
    }

    function listenForEvent_IncrementQuantityButtonPressed(id, quantityType)
    {
        const _viewReaction = renderListItemQuantityAndBalance.bind(null, quantityType);
        const _modelReaction = window.Model.ModifyQuantity.bind(null, id, _viewReaction, 'Increment', quantityType);

        //Inform the View to listen for an event indicating a List Item's 'Increment quantity' button has been pressed
        window.View.Bind('IncrementQuantityButtonPressed', _modelReaction);
    }

    function listenForEvent_ClickDetectedOutsidePopover()
    {
        const _viewReaction = window.View.Render.bind(null, 'HideActiveQuantityPopover');

        //Inform the View to listen for an event indicating a click has been detected outside of a popover
        window.View.Bind('ClickDetectedOutsidePopover', _viewReaction);
    }
    //#endregion
    //#endregion

    //Publicly Exposed Method to Setup UI & Load List Data
    //#region ================================================================================

    function init()
    {     
        //Set up ongoing listeners for the app which are not dependent on specific Lists or List Items
        setupListeners_Ongoing();

        //Load the checklist data from storage and then set up UI and listeners for the loaded Lists and List Items
        window.Model.LoadChecklistData(setupListenersAndUI_List.bind(null, true), setupListenersAndUI_ListItem.bind(null, true));
    }
    //#endregion

    return {
        Init : init
    };
})();