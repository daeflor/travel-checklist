'use strict';
window.ViewRenderer = (function() 
{
    //TODO The Bind and Render calls could all use error handling

    //TODO Several of these (both variable name and element ID) could probably be renamed for clarity

    let elements = {  
        loadingScreen : null,
        authScreen : null,
        homeScreen : null,
        homeScreenListElements : null,
        listHeader : null,
        listTitle : null,
        listScreen : null,
        listScreenListElements : null,
    };

    let elementIds = {  
        loadingScreen : 'divLoadingScreen',
        authScreen : 'divAuthScreen',
        homeScreen : 'divHomeScreen',
        homeScreenListElements : 'divHomeScreenListElements',
        listHeader : 'divListHeader',
        listTitle : 'headerCurrentListName',
        listScreen : 'divListScreen',
        listScreenListElements : 'divListScreenListElements',
    };

    function init()
    {
        //Assign the elements based on their specified IDs
        for (let key in elements)
        {
            elements[key] = document.getElementById(elementIds[key]);

            //TODO since it doesn't really make sense to use GetElement here (because of the callback), could maybe have a ReturnElement util function with a try catch instead of callbacks...
        }

        //TODO Right now this assumes the header to display is the Travel type. Eventually this should be done in a separate method, depending on the checklist type.
        elements.listHeader.appendChild(window.CustomTemplates.CreateTravelHeaderFromTemplate()); 
    }

    //TODO Maybe it *is* worth having a more general checklist data blob for these, and then they all follow the same standard format
    
    //TODO make other methods throughout View match the format used here
    /**
     * Updates a given checklist element as specified
     * @param {string} action - The type of action to perform on the checklist element
     * @param {object} elementData An object containing parameters necessary to identify and locate the element being updated
     * @param {string} [updatedValue] - [Optional] The updated value of the checklist element, if applicable
     */
    function updateChecklistElement(action, elementData, updatedValue)
    {
        //Set up the callback method to execute when the element matching the given ID is found
        let elementFoundCallback = function(element)
        {          
            //TODO consider using Switch or a lookup table for this (probably Switch)

            //Update the element based on the action and options provided       
            action == 'Hide'          ? element.hidden = true : 
            action == 'Show'          ? element.hidden = false :
            action == 'SetText'       ? element.textContent = updatedValue : 
            action == 'Remove'        ? element.remove() :
            action == 'SetIconColor'  ? element.firstChild.style.color = updatedValue :
            action == 'Focus'         ? element.focus() :
            action == 'Expand'        ? $(element).collapse('show') :
            action == 'ShowPopover'   ? $(element).popover('show') :
            //action == 'HidePopover'   ? $(element).popover('hide') :
            window.DebugController.LogError("Tried to perform an invalid update action on a checklist element");
        };

        //Find the element matching the given ID, and then update as specified
        window.View.FindChecklistElement(elementData.id, elementFoundCallback, elementData.type, elementData.quantityType);
    }

    /**
     * Updates the 'Reorder' buttons for all the checklist objects (List Toggles or List Items) to match their current location in their parent list 
     * @param {element} wrapper - The parent DOM element of the checklist objects which need to be updated
     */
    function updateReorderButtons(wrapper)
    {
        //Traverse the array of List toggle or List Item elements
        for (let i = 0; i < wrapper.children.length; i++) 
        {
            let id = wrapper.children[i].id;
            let color;
            
            //If the element is first one in the array, set the Move Upwards button to be gray, otherwise set it to be black
            color = (i == 0) ? '#606060' : 'black';
            updateChecklistElement('SetIconColor', {type:'MoveUpwards', id:id}, color); 

            //If the element is last one in the array, set the Move Downwards button to be gray, otherwise set it to be black
            color = (i == wrapper.children.length-1) ? '#606060' : 'black';
            updateChecklistElement('SetIconColor', {type:'MoveDownwards', id:id}, color);
        }
    }
    
    //TODO It probably makes sense to split the Rendering of checklist object element from other elements
        //That way the parameters can be more consistent. All checklist object element render calls could take a checklist object as a parameter, for example, instead of using options.

    //TODO why is the format in bind and render different? Seems like it could be the same

    //TODO maybe split this between View.HomeScreen and View.ListScreen? 
        //Maybe the parent View could redirect to the correct subView so that it is abstracted from the Controller?
     //TODO I think I'd prefer splitting this into ViewListenerController and ViewRendererController, if anything

    //TODO could split out rendering things (showing/hiding) from adding them to the view/DOM (regardless of whether they are actually visible yet/currently)
    function render(command, parameters)
    {
        let viewCommands = 
        {
            ShowLoadingScreen: function() 
            {
                //Show the Loading Screen
                elements.loadingScreen.hidden = false;
            },
            HideLoadingScreen: function() 
            {
                //Hide the Loading Screen
                elements.loadingScreen.hidden = true;
            },
            ShowAuthScreen: function() 
            {
                //Show the Auth Screen
                elements.authScreen.hidden = false;
            },
            HideAuthScreen: function() 
            {
                //Hide the Auth Screen
                elements.authScreen.hidden = true;
            },
            ShowHomeScreen: function() 
            {
                //TODO this can probably all be put into a Toggle helper method.
                    //But first should probably move the headers into their respective screens

                //Hide the List Header
                elements.listHeader.hidden = true;

                //Hide the List Screen
                elements.listScreen.hidden = true;

                //Show the Home Screen
                elements.homeScreen.hidden = false;

                //Allow browser refresh when scrolling to the top of the Home Screen
                document.body.classList.remove("disallowBrowserRefresh");
            },
            HideHomeScreen: function()
            {
                //Hide the Home Screen
                elements.homeScreen.hidden = true;
            },
            DisplayList: function() //Expected parameters: id
            {
                //Set up the callback method to execute when a name button matching the given ID is found
                const _updateListTitle = function(element)
                {                    
                    //Set the List title to match the text content of the name button element
                    elements.listTitle.textContent = element.textContent;
                };

                //Find the name button element for the List matching the given ID, and then update the List title to match it
                window.View.FindChecklistElement(parameters.id, _updateListTitle, 'NameButton');

                //Show the wrapper element for the List matching the given ID
                updateChecklistElement('Show', {type:'ListWrapper', id:parameters.id});
                
                //Show the List Header when an individual List is displayed
                elements.listHeader.hidden = false;

                //Show the List Screen when an individual List is displayed
                elements.listScreen.hidden = false;

                //Disallow browser refresh when scrolling to the top of the List Screen
                document.body.classList.add("disallowBrowserRefresh");
            },
            HideList: function() //Expected parameters: id
            {
                //If a non-null List ID was provided, hide the wrapper element for the matching List
                if (parameters.id != null)
                {
                    updateChecklistElement('Hide', {type:'ListWrapper', id:parameters.id});
                }
                else 
                {
                    window.DebugController.LogError("Tried to hide a List but a valid List ID was not provided.");
                }
            }, 
            AddList: function() //Expected parameters: listId, listName, listType, listBalance (optional)
            {                
                //Assign a border color for the List's name toggle based on the provided balance
                const _borderColor = window.ChecklistBalanceUtilities.GetBorderColorFromBalance(parameters.listBalance);

                //Create a new List toggle element from the template, and append it to the Home Screen List Elements div
                elements.homeScreenListElements.appendChild(window.CustomTemplates.CreateListToggleFromTemplate(parameters.listId, parameters.listName, parameters.listType, _borderColor));
                
                //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                //Create a new List wrapper element from the template, and append it to the List Screen List Elements div
                elements.listScreenListElements.appendChild(window.CustomTemplates.CreateListWrapperFromTemplate(parameters.listId));

                //Update the reorder buttons for all the List toggles in the Home Screen
                updateReorderButtons(elements.homeScreenListElements);
            },
            RemoveList: function() //Expected parameters: id
            {
                //Remove the List wrapper element which matches the given ID
                updateChecklistElement('Remove', {type:'ListWrapper', id:parameters.id});

                //Set up the callback method to execute when the List toggle element is found which matches the given ID
                const elementFoundCallback = function(element)
                {                    
                    //Remove the List toggle element
                    element.remove();

                    //Update the reorder buttons for all the List toggles in the Home Screen
                    updateReorderButtons(elements.homeScreenListElements);

                    //TODO Seems that this could easily use the same command logic as RemoveListItem. 
                        //This command just needs to reference the parent element instead of homeScreenListElements
                        //Actually, removing the List Wrapper makes this a bit more complicated
                };

                //Find the List toggle element which matches the given ID, and then remove it
                window.View.FindChecklistElement(parameters.id, elementFoundCallback)
            },
            AddListItem: function() //Expected parameters: listId, listItemId, listItemName, listItemBalance (optional)
            {
                //Set up the callback method to execute when the List wrapper element is found which matches the given ID
                const elementFoundCallback = function(element)
                {          
                    //Assign a border color for the List Item's name toggle based on the provided balance
                    const _borderColor = window.ChecklistBalanceUtilities.GetBorderColorFromBalance(parameters.listItemBalance);

                    //Create a new List Item element from the template, and append it to the List wrapper matching   
                    element.appendChild(window.CustomTemplates.CreateListItemFromTemplate(parameters.listItemId, parameters.listItemName, parameters.listItemQuantities, _borderColor));

                    //Update the reorder buttons for all the List Items in the added element's parent List
                    updateReorderButtons(element);
                };

                //Find the List wrapper element which matches the given ID, and then add a new List Item to it
                window.View.FindChecklistElement(parameters.listId, elementFoundCallback, 'ListWrapper');
            },
            RemoveListItem: function() //Expected parameters: id
            {
                //Set up the callback method to execute when the List Item element is found which matches the given ID
                const elementFoundCallback = function(element)
                {     
                    //Store a reference to the List Item's parent List wrapper element
                    let listWrapper = element.parentElement;     

                    //Remove the List Item element
                    element.remove();

                    //Update the reorder buttons for all the List Items in the removed element's parent List
                    updateReorderButtons(listWrapper);
                };

                //Find the List Item element which matches the given ID, and then remove it
                window.View.FindChecklistElement(parameters.id, elementFoundCallback);
            },
            UpdateNameToggleColor: function() //Expected parameters: id, balance
            {
                const elementFoundCallback = function(element)
                {      
                    element.style.borderColor = window.ChecklistBalanceUtilities.GetBorderColorFromBalance(parameters.balance);
                };

                window.View.FindChecklistElement(parameters.id, elementFoundCallback, 'NameButton');
            },
            UpdateListItemQuantityText: function() //Expected parameters: id, quantityType, updatedValue
            {
                window.DebugController.Print("Request to update quantity value. ListItem ID: " + parameters.id + ". Quantity type: " + parameters.quantityType + ". New value: " + parameters.updatedValue);

                //TODO can/should we save references to the list item quantity modifiers to not always have to search for them
                
                //TODO could we not just update everything related to a list item in one go? Or does that not make this any easier?

                const elementData = {type:'QuantityToggle', id:parameters.id, quantityType:parameters.quantityType};

                //Update the text value of the quantity toggle for the List Item which matches the given ID
                updateChecklistElement('SetText', elementData, parameters.updatedValue);
            },
            ExpandSettingsView: function() 
            {
                //Expand the collapsible element which matches the given ID
                updateChecklistElement('Expand', {type:'SettingsView', id:parameters.id});
                
                //Set focus to the edit name text area element which matches the given ID
                updateChecklistElement('Focus', {type:'EditName', id:parameters.id});
            },
            HideActiveSettingsView: function() //TODO consider having this be its own private method in the View, instead of accessible through Render
            {
                let activeSettingsViewContainer = window.View.GetActiveSettingsView();

                if (activeSettingsViewContainer.element != null)
                {
                    $(activeSettingsViewContainer.element).collapse('hide');
                    activeSettingsViewContainer.element = null;
                }
            },
            UpdateName: function() //Expected parameters: id, updatedValue
            {
                //Update the text value of the name toggle/button element which matches the given ID
                updateChecklistElement('SetText', {type:'NameButton', id:parameters.id}, parameters.updatedValue);
            },
            ShowQuantityPopover: function() //Expected parameters: id, quantityType
            {
                //Show the popover element which matches the given ID and quantity type
                const elementData = {type:'QuantityToggle', id:parameters.id, quantityType:parameters.quantityType};
                updateChecklistElement('ShowPopover', elementData);
            },
            HideActiveQuantityPopover: function()
            {
                const activePopover = window.View.GetActiveQuantityPopover();

                if (activePopover != null)
                {
                    window.DebugController.Print("Hiding the active quantity popover");
                    $(activePopover).popover('hide');
                }
            },
            SwapListObjects: function()
            {
                //TODO Should this use findChecklistElement or other helpers with error handling?

                const elementToMoveUpwards = document.getElementById(parameters.moveUpwardsId);
                const elementToMoveDownwards = document.getElementById(parameters.moveDownwardsId);

                if (elementToMoveUpwards != null && elementToMoveDownwards != null)
                {
                    const wrapper = elementToMoveUpwards.parentElement;

                    wrapper.insertBefore(elementToMoveUpwards, elementToMoveDownwards);
    
                    updateReorderButtons(wrapper);
                }
                else
                {
                    window.DebugController.LogError("ERROR: One or both of the list object elements to swap is null. ID of element to move Upwards: " + parameters.moveUpwardsId + ", Downwards: " + parameters.moveDownwardsId);
                }
            }
        };

        //If a command is provided, execute the corresponding method
        if (command != null)
        {
            //window.DebugController.Print("Executing View Command: " + command);
            viewCommands[command]();
        }
        else
        {
            window.DebugController.LogError("ERROR: Tried to render updates in the View, but no action was provided.");
        }
    }

    return {
        Init: init,
        Render: render
    };
})();