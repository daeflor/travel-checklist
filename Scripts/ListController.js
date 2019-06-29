'use strict';
window.ListController = (function()
{    
    //Assign a variable to track the ID of the active List
    let activeListId = null;

    /** Private Helper Function To Render Updates To Lists & List Items **/ 

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

    /** Private Functions To Setup Collections Of Listeners **/ 

    /**
     * Sets up any ongoing listeners for the app which are not dependent on specific Lists or List Items
     */
    function setupListeners_Ongoing()
    {
        //Whenever changes, hide the Active Settings View and Quantity Popover
        listenForEvent_ScreenChanged();

        //When the user navigates home, hide the List Screen and show the Home Screen. (Works using either the Home button or 'back' browser command).
        listenForEvent_NavigatedHome();

        //When the New List button is pressed, add a new List to the checklist data and the DOM
        listenForEvent_NewListButtonPressed();

        //When the New List Item button is pressed, add a new List Item to the checklist data and the DOM
        listenForEvent_NewListItemButtonPressed();

        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' button to clear that quantity column
        listenForEvent_QuantityHeaderPopoverShown();
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
        for (const key in QuantityTypes) //For each quantity type...
        {
            listenForEvent_QuantityToggleSelected(listItemId, key); //When the Quantity Toggle is selected, show the Quantity Popover for that toggle
            listenForEvent_QuantityPopoverShown(listItemId, key); //When the Quantity Popover is shown (and added to the DOM), set up the listeners for its sub-elements            
        }

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

    /** Private Functions To Setup Listeners For Individual Lists & List Items **/

    //TODO Maybe put error handling in the functions below to ensure the expected parameters have been passed.
        //For example: if (validateObjectContainsValidKVPs(options, ['quantityType']) == true) ~OR~ validateObjectContainsKVPs(options, [key1, key2, etc]) == true ? doAction() : logError();
        //TODO Maybe document the required properties elsewhere as well? (e.g. in the Model's Modify methods or the View's Bind and Render methods)
            //i.e. be more dilligent about specifying expected parameters. Maybe could mix this with additional error handling in Model and View

    //TODO these functions may be more readable if more whitespace is included, with comments above instead of to the right. 
        //Re-assess once the whole listenForEvent transition is complete.

    //TODO Document these methods with JSDOC

    //--- App Navigation ---//

    function listenForEvent_ScreenChanged()
    {
        const _viewReaction = function() {
            window.View.Render('HideActiveSettingsView'); //Hide the Active Settings View
            window.View.Render('HideActiveQuantityPopover'); //Hide the Active Quantity Popover
        };
        window.AppNavigationController.ListenForEvent('ScreenChanged', _viewReaction);
    }

    function listenForEvent_NavigatedHome() 
    {
        const _viewReaction = function() {
            window.View.Render('HideList', {id:activeListId}); //Hide the List which was previously active
            window.View.Render('ShowHomeScreen'); //Display the Home Screen
            //TODO This is the only Model call that returns instead of relying on callbacks, and which doesn't require updates to the model but does access it get information. Is that ok?
            window.View.Render('UpdateNameToggleColor', {id:activeListId, balance:window.Model.GetListBalance(activeListId)}); //Calculate and render the balance of the List which was previously active
            activeListId = null;
        };
        window.AppNavigationController.ListenForEvent('NavigatedHome', _viewReaction);
    }

    //--- Home Screen ---//

    function listenForEvent_GoToListButtonPressed(id) //TODO is this necessary or can HashChanged just be used?
    {
        //TODO It would be possible to get the List ID from the URL instead. That doesn't seem like the safest approach though.. Would be fine but doesn't really offer any benefit
        const _viewReaction = function() {
            window.View.Render('DisplayList', {id:id}); //Display the specified List
            activeListId = id; //Set the newly selected List as the Active List
        };
        window.View.Bind('GoToListButtonPressed', _viewReaction, {id:id});
    }

    function listenForEvent_NewListButtonPressed()
    {
        const _viewReaction = setupListenersAndUI_List.bind(null, false); 
        const _modelReaction = window.Model.AddNewList.bind(null, _viewReaction); //TODO it's confusing using bind and Bind
        window.View.Bind('NewListButtonPressed', _modelReaction);
    }
    //TODO Maybe these event/action combo functions could be split into two small functions. 
        //For example: listenForEvent_NewListButtonPressed (after user interaction), listenForEvent_AddListItem (after model update)
        //Basically just some way to not have too many levels of nested callbacks in one function, to increase readability. Re-assess once the whole listenForEvent transition is complete.
        
    //--- List Screen Headers & Footers ---//

    function listenForEvent_NewListItemButtonPressed()
    {
        //TODO had to do this to get accurate activeListID. Is there a better way? Maybe from URL?... 
            //Or maybe use an object to contain the activeListId, though it would be weird to pass that around to other files
        const _eventTriggered = function() { 
            const _viewReaction = setupListenersAndUI_ListItem.bind(null, false, activeListId); 
            window.Model.AddNewListItem(activeListId, _viewReaction);
        };
        window.View.Bind('NewListItemButtonPressed', _eventTriggered);
    }

    function listenForEvent_QuantityHeaderPopoverShown()
    {
        //Set up the listener so that When the Clear button is pressed, the quantity values for the List Item are cleared, for the given quantity type
        //const _controllerReaction = listenForEvent_ClearButtonPressed.bind(null, quantityType);
        //window.View.Bind('QuantityHeaderPopoverShown', _controllerReaction, {quantityType:quantityType});

        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' button to clear that quantity column
        for (const key in QuantityTypes)
        {
            const _controllerReaction = listenForEvent_ClearButtonPressed.bind(null, key);
            window.View.Bind('QuantityHeaderPopoverShown', _controllerReaction, {quantityType:key});
        }
    }

    function listenForEvent_ClearButtonPressed(quantityType)
    {
        const _eventTriggered = function() { //TODO had to do this to get accurate activeListID. Is there a better way? Maybe from URL?...
            const _viewReaction = renderListItemQuantityAndBalance.bind(null, quantityType);
            window.Model.ModifyQuantity(activeListId, _viewReaction, 'Clear', quantityType); 
        };
        window.View.Bind('ClearButtonPressed', _eventTriggered);
    }

    //--- Settings Views ---//

    function listenForEvent_SettingsViewExpansionStarted(id)
    {
        const _viewReaction = window.View.Render.bind(null, 'HideActiveSettingsView');
        window.View.Bind('SettingsViewExpansionStarted', _viewReaction, {id:id});
    }

    function listenForEvent_NameEdited(id)
    {
        //TODO Would be able to just use a one-line bind call here if eventually the Render commands in the View are also split up to be handled individually
        const _viewReaction = function(updatedValue) {
            window.View.Render('UpdateName', {id:id, updatedValue:updatedValue});
        };
        const _modelReaction = window.Model.ModifyName.bind(null, id, _viewReaction);
        window.View.Bind('NameEdited', _modelReaction, {id:id});

        // const _eventTriggered = function(updatedValue) {
        //     const _viewReaction = window.View.Render.bind(null, 'UpdateName', {id:id, updatedValue:updatedValue});
        //     window.Model.ModifyName(id, _viewReaction, updatedValue);
        // };
        // window.View.Bind('NameEdited', _eventTriggered, {id:id});
    }

    function listenForEvent_DeleteButtonPressed(id)
    {
        const _viewReaction = function() {
            (activeListId == null) ? window.View.Render('RemoveList', {id:id}) : window.View.Render('RemoveListItem', {id:id});
            //TODO- DeleteButtonPressed event could be split into RemoveListButtonPressed and RemoveListItemButtonPressed, but it would actually require more code
        };
        const _modelReaction = window.Model.Remove.bind(null, id, _viewReaction);
        window.View.Bind('DeleteButtonPressed', _modelReaction, {id:id});
    }

    function listenForEvent_MoveUpwardsButtonPressed(id)
    {
        const _viewReaction = function(swappedChecklistObjectId) {
            window.View.Render('SwapListObjects', {moveUpwardsId:id, moveDownwardsId:swappedChecklistObjectId});
        };
        const _modelReaction = window.Model.ModifyPosition.bind(null, id, _viewReaction, 'Upwards');
        window.View.Bind('MoveUpwardsButtonPressed', _modelReaction, {id:id});
    }

    function listenForEvent_MoveDownwardsButtonPressed(id)
    {
        // const _viewReaction = handleModelInteraction.bind({moveDownwardsId:id}, 'MoveDownwards'); 
        // const _modelReaction = window.Model.ModifyPosition.bind(null, id, _viewReaction, 'Downwards');
        // window.View.Bind('MoveDownwardsButtonPressed', _modelReaction, {id:id});

        const _viewReaction = function(swappedChecklistObjectId) {
            window.View.Render('SwapListObjects', {moveUpwardsId:swappedChecklistObjectId, moveDownwardsId:id});
        };
        const _modelReaction = window.Model.ModifyPosition.bind(null, id, _viewReaction, 'Downwards');
        window.View.Bind('MoveDownwardsButtonPressed', _modelReaction, {id:id});
    }

    //--- Quantity Modifier Toggles & Popovers ---//

    function listenForEvent_QuantityToggleSelected(id, quantityType)
    {
        const _viewReaction = function(inputArgument) {
            if (window.View.IsSettingsViewActive() === false && window.View.IsQuantityPopoverActive() === false)
            {
                inputArgument.stopPropagation(); //Prevent events from bubbling up
                window.View.Render('ShowQuantityPopover', {id:id, quantityType:quantityType});   
            }
        };
        window.View.Bind('QuantityToggleSelected', _viewReaction, {id:id, quantityType:quantityType});
    }

    function listenForEvent_QuantityPopoverShown(id, quantityType)
    {
        const _controllerReaction = function() {
            listenForEvent_DecrementQuantityButtonPressed(id, quantityType); //Listen for the event to decrement a List Item's quantity value
            listenForEvent_IncrementQuantityButtonPressed(id, quantityType); //Listen for the event to increment a List Item's quantity value
            listenForEvent_ClickDetectedOutsidePopover(); //Listen for the event to hide the active Quantity Popover
        };
        window.View.Bind('QuantityPopoverShown', _controllerReaction, {id:id, quantityType:quantityType});
    }

    function listenForEvent_DecrementQuantityButtonPressed(id, quantityType)
    {
        const _viewReaction = renderListItemQuantityAndBalance.bind(null, quantityType);
        const _modelReaction = window.Model.ModifyQuantity.bind(null, id, _viewReaction, 'Decrement', quantityType);
        window.View.Bind('DecrementQuantityButtonPressed', _modelReaction);
    }

    function listenForEvent_IncrementQuantityButtonPressed(id, quantityType)
    {
        const _viewReaction = renderListItemQuantityAndBalance.bind(null, quantityType);
        const _modelReaction = window.Model.ModifyQuantity.bind(null, id, _viewReaction, 'Increment', quantityType);
        window.View.Bind('IncrementQuantityButtonPressed', _modelReaction);
    }

    function listenForEvent_ClickDetectedOutsidePopover()
    {
        const _viewReaction = window.View.Render.bind(null, 'HideActiveQuantityPopover');
        window.View.Bind('ClickDetectedOutsidePopover', _viewReaction);
    }

    /** Publicly Exposed Method to Setup UI & Load List Data **/

    function init()
    {     
        //Set up ongoing listeners for the app which are not dependent on specific Lists or List Items
        setupListeners_Ongoing();

        //Load the checklist data from storage and then set up UI and listeners for the loaded Lists and List Items
        window.Model.LoadChecklistData(setupListenersAndUI_List.bind(null, true), setupListenersAndUI_ListItem.bind(null, true));
    }

    return {
        Init : init
    };
})();