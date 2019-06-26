'use strict';

const ChecklistEvents = {
    //App
    HashChanged: 'HashChanged', //Can result in up to three reactions. They are not mutually exclusive. 

    //Home Screen
    GoToListButtonPressed: 'GoToListButtonPressed',
    NewListButtonPressed: 'NewListButtonPressed',

    //List Screen Headers & Footers
    NewListItemButtonPressed: 'NewListItemButtonPressed',
    QuantityHeaderPopoverShown: 'QuantityHeaderPopoverShown',
    ClearButtonPressed: 'ClearButtonPressed',

    //Settings Views
    SettingsViewExpansionStarted: 'SettingsViewExpansionStarted',
    NameEdited: 'NameEdited',
    DeleteButtonPressed: 'DeleteButtonPressed', //TODO Can result in two separate actions. They are currently mutually exclusive. 
    MoveUpwardsButtonPressed: 'MoveUpwardsButtonPressed',
    MoveDownwardsButtonPressed: 'MoveDownwardsButtonPressed',

    //Quantity Toggles & Popovers
    QuantityToggleSelected: 'QuantityToggleSelected',
    QuantityPopoverShown: 'QuantityPopoverShown',
    DecrementQuantityButtonPressed: 'DecrementQuantityButtonPressed',
    IncrementQuantityButtonPressed: 'IncrementQuantityButtonPressed',
    ClickDetectedOutsidePopover: 'ClickDetectedOutsidePopover'
};

window.ListController = (function()
{    
    let activeListId = null;

    function init()
    {     
        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' button to clear that quantity column
        for (let key in QuantityType)
        {
            listenForEvent_QuantityHeaderPopoverShown(key);
        }

        listenForEvent_HashChanged(); //When the URL Hash changes, hide the Active Settings View and Quantity Popover
        listenForEvent_NavigatedHome(); //When the user navigates home, hide the List Screen and show the Home Screen. (Works using either the Home button or 'back' browser command).
        listenForEvent_NewListButtonPressed(); //When the New List button is pressed, add a new List to the checklist data and the Dom
        listenForEvent_NewListItemButtonPressed(); //When the New List Item button is pressed, add a new List Item to the checklist data and the Dom

        //Load the list data from storage and pass it along to the View
        window.Model.RetrieveChecklistData(loadChecklistDataIntoView);
    }

    /** Private Methods To Handle Bind & Render Logic For New Or Updated Lists & List Items **/ 
    //TODO ^ This description is no longer accurate

    //TODO What if the model does some work here and sends back more specific info... (which can't be tampered with maybe)
        //Hmm doesn't really seem feasible... Actually...
        //ExtractListData, ExtractListItemData
        //Each of those has a callback which does a thing, rather than using a for loop here in the controller
        //Similar to the new ModifyQuantity function
        //Then, theoretically, the actual data object never leaves the Model
    function loadChecklistDataIntoView(loadedListData)
    {
        window.DebugController.Print("Number of Lists retrieved from Model: " + loadedListData.length);

        //For each List loaded from Storage...
        for (let i = 0; i < loadedListData.length; i++) 
        {
            //Add the List elements to the DOM and set up the binds for interactions with them
            renderAndBindLoadedList(loadedListData[i]);
            
            //For each List Item in the List...
            for (let j = 0; j < loadedListData[i].listItems.length; j++) 
            {
                //Add the List Item's elements to the DOM and set up the binds for interactions with them
                renderAndBindLoadedListItem(loadedListData[i].id, loadedListData[i].listItems[j]);
            }
        }
    }

    //TODO why the name "loaded"? Seems unnecessary. And should rendering / adding the list to the DOM be done separately than creating the binds?
    /**
     * Sends to the View any data needed to render the specified List, and then sets up all applicable bindings
     * @param {object} list The object containing the data for the List to be rendered and bound
     */
    function renderAndBindLoadedList(list)
    {
        //TODO Might be best to keep renders, binds, and loads separate

        //TODO. View needs ID, name, and type (currently) 
        //window.View.Render('AddList', {listId:list.id, listName:list.name, listType:checklistType}); 
        window.View.Render('AddList', {list:list}); //Add the List elements to the DOM

        //TODO this doesn't need to be done in the case of new lists, only loaded ones
            //Assuming the stylesheet has a default color
        renderListBalance(list.id); //TODO this part may be doable in the Model with the upcoming refactor (i.e. Controller may no longer have to call Model.GetListBalance() here). However, it still needs to be done when navigating home

        //TODO setupListeners_List
        
        listenForEvent_GoToListButtonPressed(list.id); //When the Go To List button is pressed, display the list

        setupListeners_SettingsView(list.id); //Setup listeners related to the List's Settings View
    }

    //TODO Maybe split this up into things that need to be rendered, and things that need to be bound
        //For example: setupListItemListeners or setupListeners_ListItem
    /**
     * Sends to the View any data needed to render the specified List Item, and then sets up all applicable bindings
     * @param {string} listId The unique identfier for the List to which the specified List Item belongs
     * @param {object} listItem The object containing the data for the List Item to be rendered and bound
     */
    function renderAndBindLoadedListItem(listId, listItem)
    {                  
        window.View.Render('AddListItem', {listId:listId, listItemId:listItem.id, listItemName:listItem.name}); //TODO. View needs ID, name, and quantities (currently)       
        
        //TODO this doesn't need to be done in the case of new list items, only loaded ones
            //Assuming the stylesheet has a default color
        window.View.Render('UpdateNameToggleColor', {id:listItem.id, balance:window.ChecklistUtilities.CalculateListItemBalance(listItem.quantities)});

        setupListeners_SettingsView(listItem.id); //Setup listeners related to the List Item's Settings View

        for (const key in QuantityType) //For each quantity type...
        {
            listenForEvent_QuantityToggleSelected(listItem.id, key); //When the Quantity Toggle is selected, show the Quantity Popover for that toggle
            listenForEvent_QuantityPopoverShown(listItem.id, key); //When the Quantity Popover is shown (and added to the DOM), set up the listeners for its sub-elements
        
            window.View.Render('UpdateListItemQuantityText', {id:listItem.id, quantityType:key, updatedValue:listItem.quantities[key]});
        }        
    } 

    //setupListenersAndUI_List
    //function addListItemListenersAndUI(listId, listItemId, listItemName)
    function setupListenersAndUI_ListItem(listId, listItemId, listItemName)
    {
        window.View.Render('AddListItem', {listId:listId, listItemId:listItemId, listItemName:listItemName});

        setupListeners_SettingsView(listItemId); //Setup listeners related to the List Item's Settings View

        for (const key in QuantityType) //For each quantity type...
        {
            listenForEvent_QuantityToggleSelected(listItemId, key); //When the Quantity Toggle is selected, show the Quantity Popover for that toggle
            listenForEvent_QuantityPopoverShown(listItemId, key); //When the Quantity Popover is shown (and added to the DOM), set up the listeners for its sub-elements
        }   
    }

    /**
     * Sets up the listener for the various user interactions related to a List or List Item's Settings View
     * @param {string} id The ID of the List or List Item
     */
    function setupListeners_SettingsView(id)
    {
        listenForEvent_SettingsViewExpansionStarted(id); //When the animation to expand the Settings View starts, hide the Active Settings View
        listenForEvent_NameEdited(id); //When the name text field is modified, update the name of the checklist object
        listenForEvent_DeleteButtonPressed(id); //When the delete button is pressed, remove the checklist object
        listenForEvent_MoveUpwardsButtonPressed(id); //When the Move Upwards button is pressed, move the checklist object up by one position
        listenForEvent_MoveDownwardsButtonPressed(id); //When the Move Downwards button is pressed, move the checklist object down by one position
    }

    function renderListBalance(listId)
    {
        //TODO This is the only Model call that returns instead of relying on callbacks. Is that ok?
            //This is also the only Model call that doesn't require updates to the model but does access it get information.
        let _listBalance = window.Model.GetListBalance(listId);
        window.View.Render('UpdateNameToggleColor', {id:listId, balance:_listBalance});
    }

    function renderListItemQuantityAndBalance(quantityType, id, updatedValue, balance)
    {
        window.View.Render('UpdateListItemQuantityText', {id:id, quantityType:quantityType, updatedValue:updatedValue});
        window.View.Render('UpdateNameToggleColor', {id:id, balance:balance});
    }

    /** Private Helper Methods To Setup Listeners For Lists & List Items **/

    //TODO Maybe put error handling in the functions below to ensure the expected parameters have been passed.
        //For example: if (validateObjectContainsValidKVPs(options, ['quantityType']) == true) ~OR~ validateObjectContainsKVPs(options, [key1, key2, etc]) == true ? doAction() : logError();
        //TODO Maybe document the required properties elsewhere as well? (e.g. in the Model's Modify methods or the View's Bind and Render methods)
            //i.e. be more dilligent about specifying expected parameters. Maybe could mix this with additional error handling in Model and View

    //TODO these functions may be more readable if more whitespace is included, with comments above instead of to the right. 
        //Re-assess once the whole listenForEvent transition is complete.

    //--- App Navigation ---//

    function listenForEvent_HashChanged() //TODO maybe rename this to ScreenChanged?
    {
        const _viewReaction = function() {
            window.View.Render('HideActiveSettingsView'); //Hide the Active Settings View
            window.View.Render('HideActiveQuantityPopover'); //Hide the Active Quantity Popover
        };
        window.AppNavigationController.ListenForEvent('HashChanged', _viewReaction);
    }

    function listenForEvent_NavigatedHome() 
    {
        const _viewReaction = function() {
            window.View.Render('HideList', {id:activeListId}); //Hide the List which was previously active
            window.View.Render('ShowHomeScreen'); //Display the Home Screen
            renderListBalance(activeListId); //Calculate the balance of the List which was previously active
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
        const _viewReaction = function(newList) {
            renderAndBindLoadedList(newList); //Add the new List to the DOM and setup listeners for its elements
            window.View.Render('ExpandSettingsView', {id:newList.id}); //Once the new List has been added to the DOM, expand its Settings View
        };
        const _modelReaction = window.Model.AddNewList.bind(null, _viewReaction); //TODO it's confusing using bind and Bind
        window.View.Bind('NewListButtonPressed', _modelReaction);
    }
    //TODO Maybe these event/action combo functions could be split into two small functions. 
        //For example: listenForEvent_NewListButtonPressed, listenForEvent_AddListItem
        //Basically just some way to not have too many levels of nested callbacks in one function, to increase readability
        //Re-assess once the whole listenForEvent transition is complete.
        
    //--- List Screen Headers & Footers ---//

    function listenForEvent_NewListItemButtonPressed()
    {
        //TODO had to do this to get accurate activeListID. Is there a better way? Maybe from URL?... 
            //Or maybe use an object to contain the activeListId, though it would be weird to pass that around to other files
        const _eventTriggered = function() { 
            const _viewReaction = function(newListItem) {
                setupListenersAndUI_ListItem(activeListId, newListItem.id, newListItem.name);//Add the new List Item to the DOM and setup listeners for its elements
                window.View.Render('ExpandSettingsView', {id:newListItem.id}); //Once the new List Item has been added to the DOM, expand its Settings View
            };
            window.Model.AddNewListItem(activeListId, _viewReaction);
        };
        window.View.Bind('NewListItemButtonPressed', _eventTriggered);
    }

    function listenForEvent_QuantityHeaderPopoverShown(quantityType)
    {
        //Set up the listener so that When the Clear button is pressed, the quantity values for the List Item are cleared, for the given quantity type
        const _controllerReaction = listenForEvent_ClearButtonPressed.bind(null, quantityType);
        window.View.Bind('QuantityHeaderPopoverShown', _controllerReaction, {quantityType:quantityType});
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
            // const _renderAction = (activeListId == null) ? 'RemoveList' : 'RemoveListItem';
            // window.View.Render(_renderAction, {id:id});
            (activeListId == null) ? window.View.Render('RemoveList', {id:id}) : window.View.Render('RemoveListItem', {id:id});
            //TODO- DeleteButtonPressed event could be split into RemoveListButtonPressed and RemoveListItemButtonPressed, but it would actually require more code
        };
        const _modelReaction = window.Model.Remove.bind(null, id, _viewReaction);
        window.View.Bind('DeleteButtonPressed', _modelReaction, {id:id});
    }

    function listenForEvent_MoveUpwardsButtonPressed(id)
    {
        // const _viewReaction = handleModelInteraction.bind({moveUpwardsId:id}, 'MoveUpwards'); 
        // const _modelReaction = window.Model.ModifyPosition.bind(null, id, _viewReaction, 'Upwards');
        // window.View.Bind('MoveUpwardsButtonPressed', _modelReaction, {id:id});

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

    /** Publicly Exposed Methods To Setup UI & Load List Data **/

    /** Experimental & In Progress **/

    /** Publicly Exposed Methods **/

    return {
        Init : init
    };
})();

const ListType = {
    Travel: 'travel',
    Checklist: 'shopping'
};

//TODO Consider moving this to a separate file. Should this be in ChecklistUtilities instead?
const QuantityType = {
    needed: {
        type: 'needed', //TODO this should be temp. Can the same be accomplished using 'key'?
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-pie-chart fa-lg iconHeader'
    },
    luggage: {
        type: 'luggage',
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-suitcase fa-lg iconHeader'
    },
    wearing: {
        type: 'wearing',
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-male fa-lg iconHeader'
    },
    backpack: {
        type: 'backpack',
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader toggleSmallIcon',
        iconClass: 'fa fa-briefcase iconHeader'
    },
};