'use strict';
window.View = (function() 
{
    //TODO The Bind and Render calls could all use error handling

    //TODO maybe each of these should track both the element and the ID of the element. (like in QuantityType)
    var elements = {  
        homeHeader : null,
        homeScreen : null,
        homeScreenListElements : null,
        listHeader : null,
        listTitle : null,
        listScreen : null,
        listScreenListElements : null,
        activeSettingsView : null
    };

    function init()
    {
        //TODO Several of these (both variable name and element ID) could probably be renamed for clarity

        //TODO should be possible to use this if the element names get standardized
        // var elementFoundCallback;

        // for (var key in elements)
        // {
        //     elementFoundCallback = function(element)
        //     {
        //         elements[key] = element;
        //     };
 
        //     GetElement(key, elementFoundCallback);
        // }

        //TODO Could have a ReturnElement util function with a try catch maybe? Instead of callbacks...

        //Assign the Home Screen elements
        elements.homeHeader = document.getElementById('divHomeHeader');
        elements.homeScreen = document.getElementById('divHomeScreen'); 
        elements.homeScreenListElements = document.getElementById('divHomeScreenListElements'); 

        //Assign the List Screen elements
        elements.listHeader = document.getElementById('divListHeader');
        elements.listTitle = document.getElementById('headerCurrentListName');
        elements.listScreen = document.getElementById('divListScreen'); 
        elements.listScreenListElements = document.getElementById('divListScreenListElements');
    }

    //TODO There could even be an optional options param that takes a quantity type
    /**
     * Finds an element in the DOM based on its ID and, optionally, some other parameters, and then executes the specified callback method
     * @param {string} id - The identifier of the element to search for
     * @param {function} callback - The method to call if and when the element is found
     * @param {string} [elementType] - [Optional] The type of checklist element to search for
     * @param {string} [quantityType] - [Optional] The quantity type of the checklist element to search for
     */
    function findChecklistElement(id, callback, elementType, quantityType)
    {
        let elementId = (elementType == null)  ? id
                      : (quantityType == null) ? elementType.concat('-').concat(id)
                                               : quantityType.concat(elementType).concat('-').concat(id);
        
        GetElement(elementId, callback);
    }

    //TODO Should there be some sort of template "checklist element". You provide a method with the id, elementType, and quantityType, and it returns a data object in a standard format that is used consistently throughout the View...?
        //Or is that too much overhead?
    function addListenerToChecklistElement(elementOptions, eventType, listener, options)
    {        
        let elementFoundCallback = function(element)
        {
            //If the event type is one of the used Bootstrap events...
            if (eventType.includes('collapse') || eventType.includes('popover'))
            {
                //Use JQuery to add the event listener
                $(element).on(eventType, listener); 
            }
            else //Else, if the event type is of any other type
            {
                //Use vanilla JS to add the event listener
                element.addEventListener(eventType, listener, options);
            }            
        };

        //TODO I don't like this elementOptions system. Might be better to use getChecklistElementId, or some other solution
        findChecklistElement(elementOptions.id, elementFoundCallback, elementOptions.prefix);
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

    // function HideActiveSettingsView() 
    // {
    //     if (elements.activeSettingsView != null)
    //     {
    //         $(elements.activeSettingsView).collapse('hide');
    //         elements.activeSettingsView = null;
    //     }
    // }

    //TODO Maybe it *is* worth having a more general checklist data blob for these, and then they all follow the same standard format
    
    //TODO make other methods above match the format used here
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
        findChecklistElement(elementData.id, elementFoundCallback, elementData.type, elementData.quantityType);
    }

    //TODO Would it be possible to have all 'addListenerToChecklistElement' calls go through this function?
    /**
     * Creates a bind for an element belonging to a Checklist Object (List Toggle or List Item)
     * @param {string} prefix - The prefix denoting the type of checklist element being bound
     * @param {string} eventType - The type of event listener to add to the element
     * @param {function} callback - The callback to execute when the event listener is triggered
     * @param {object} parameters - An object containing additional parameters necessary to identify and locate the element being bound
     */
    function bindChecklistObjectElement(prefix, eventType, callback, parameters)
    {
        let listObject = parameters.checklistObject;

        if (listObject != null && listObject.id != null)
        {
            //Set the behavior for when one of the Checklist Object's buttons is pressed
            addListenerToChecklistElement({prefix:prefix, id:listObject.id}, eventType, callback);
        }
        else { DebugController.LogError("A 'checklistObject' option with an 'id' key was expected but not provided. Bind could not be created."); }
    }

    //TODO Bind and Render events should probably have distinct names. 
        //e.g. Binds could be in the past tense (e.g. SettingsViewExpanded, ButtonPressed), and Render could be commands (e.g. ExpandSettingsView, ShowHomeScreen)
        //Update all Bind and Render casing (e.g. upper vs lower) and naming convention to be consistent

    //TODO standardize between parameter, parameters, options, data, etc.
    /**
     * @param {string} event The name used to identify the event being bound
     * @param {*} callback The function to call when the corresponding event has been triggered 
     * @param {object} [parameters] An optional object to pass containing any additional data needed to perform the bind. Possible parameters: id, quantityType.
     */
    function bind(event, callback, parameters)
    {
        // if (event === 'HomeButtonPressed') 
        // {
        //     //Set the behavior for when the Home button is pressed
        //     addListenerToChecklistElement({id:'buttonHome'}, 'click', callback);
        // }
        if (event === 'NewListButtonPressed') 
        {
            //Set the behavior for when the Add List button is pressed
            addListenerToChecklistElement({id:'buttonAddList'}, 'click', callback);
        }
        else if (event === 'GoToListButtonPressed') //Expected parameters: checklistObject
        {
            //Set the behavior for when a Go To List button is pressed
            bindChecklistObjectElement('GoToList', 'click', callback, parameters);
        }
        else if (event === 'NewListItemButtonPressed') 
        {
            //Set the behavior for when the Add List Item button is pressed
            addListenerToChecklistElement({id:'buttonAddRow'}, 'click', callback);                
        }
        else if (event === 'NameEdited') //Expected parameters: checklistObject
        {
            let eventTriggeredCallback = function(event)
            {
                callback({updatedValue:event.target.value});
            }
            
            bindChecklistObjectElement('EditName', 'change', eventTriggeredCallback, parameters);
        }
        else if (event === 'MoveUpwardsButtonPressed') //Expected parameters: checklistObject
        {
            //Set the behavior for when the Move Upwards button is pressed in a List Item's Settings View
            bindChecklistObjectElement('MoveUpwards', 'click', callback, parameters);
        }
        else if (event === 'MoveDownwardsButtonPressed') //Expected parameters: checklistObject
        {
            //Set the behavior for when the Move Downwards button is pressed in a List Item's Settings View
            bindChecklistObjectElement('MoveDownwards', 'click', callback, parameters);
        }
        else if (event === 'DecrementQuantityButtonPressed') 
        {
            addListenerToChecklistElement({id:'buttonMinus'}, 'click', callback);
        }
        else if (event === 'IncrementQuantityButtonPressed')
        {
            addListenerToChecklistElement({id:'buttonPlus'}, 'click', callback);
        }
        else if (event === 'DeleteButtonPressed') //Expected parameters: checklistObject
        {
            //Set the behavior for when the Delete button is pressed in a List Item's Settings View
            bindChecklistObjectElement('Delete', 'click', callback, parameters);
        }
        else if (event === 'QuantityToggleSelected') //Expected parameters: checklistObject, quantityType
        {
            //TODO modify bindChecklistObjectElement so that it can support multiple parameters, incl. quantityType

            addListenerToChecklistElement({prefix:parameters.quantityType.concat('QuantityToggle'), id:parameters.checklistObject.id}, 'click', callback);
        }
        else if (event === 'QuantityPopoverShown') //Expected parameters: checklistObject, quantityType
        {
            //Set the behavior for when the Quantity popover for the given quantity type is made visible
            addListenerToChecklistElement({prefix:parameters.quantityType.concat('QuantityToggle'), id:parameters.checklistObject.id}, 'shown.bs.popover', callback);

            //window.DebugController.Print("Set binding for popover toggle of type: " + parameters.quantityType + ", and list Item Id: " + parameters.id);
        }
        else if (event === 'QuantityHeaderPopoverShown') //Expected parameters: quantityType
        {
            //Set the behavior for when the Quantity Header popover for the given quantity type is made visible
            addListenerToChecklistElement({id:parameters.quantityType.concat('QuantityHeaderToggle')}, 'shown.bs.popover', callback);
        }
        else if (event === 'ClearButtonPressed') 
        {
            //Set the behavior for when a Clear button in the Header is pressed
            addListenerToChecklistElement({id:'buttonClear'}, 'click', callback);
        }
        else if (event === 'SettingsViewExpansionStarted') //Expected parameters: checklistObject
        {
            let eventTriggeredCallback = function(event)
            {
                //TODO If there is no callback (i.e. nothing for the Controller to do because activeSettingsView is now tracked in View),
                    //then maybe this doesn't make sense for a BIND...?
                    //But it kind of needs to be a Bind because it needs to be done for *each* Settings View
                    //TODO perhaps this can be moved to be included in the logic of adding a List or List Item
                        //but then this would be mixing with render logic which is also not right

                //self.render('HideActiveSettingsView');
                callback(); //TODO don't really like the idea of having a callback and THEN still doing something... It implies the View does actually have knowledge of what is going on, and doesn't really seem correct
                elements.activeSettingsView = event.target;
                // callback(newSettingsView); 
                
                //HideActiveSettingsView();
                //elements.activeSettingsView = event.target;
            }

            bindChecklistObjectElement('SettingsView', 'show.bs.collapse', eventTriggeredCallback, parameters);            
        }
        else if (event === 'ClickDetectedOutsidePopover')
        {
            //If a click is detected anywhere in the body but outside the popover, execute the callback method
            addListenerToChecklistElement({id:'divChecklistBody'}, 'click', callback, {once:true});

            //window.DebugController.Print("A onetime onclick listener was added to the checklist body");
        }
        else if (event === 'HashChanged')
        {
            window.addEventListener("hashchange", callback, {once:false});
        }
    }


    //TODO It probably makes sense to split the Rendering of checklist object element from other elements
        //That way the parameters can be more consistent. All checklist object element render calls could take a checklist object as a parameter, for example, instead of using options.

    //TODO why is the format in bind and render different? Seems like it could be the same

    //TODO maybe split this between View.HomeScreen and View.ListScreen? 
        //Maybe the parent View could redirect to the correct subView so that it is abstracted from the Controller?

    //TODO could split out rendering things (showing/hiding) from adding them to the view/DOM (regardless of whether they are actually visible yet/currently)
    function render(command, parameters)
    {
        let viewCommands = 
        {
            ShowHomeScreen: function() 
            {
                //TODO this can probably all be put into a Toggle helper method.
                    //But first should probably move the headers into their respective screens

                //Hide the List Header
                elements.listHeader.hidden = true;

                //Hide the List Screen
                elements.listScreen.hidden = true;

                //Show the Home Header
                elements.homeHeader.hidden = false;

                //Show the Home Screen
                elements.homeScreen.hidden = false;

                //Allow browser refresh when scrolling to the top of the Home Screen
                document.body.classList.remove("disallowBrowserRefresh");
            },
            DisplayList: function() //Expected parameters: id
            {
                //Hide the Home Header when an individual List is displayed
                elements.homeHeader.hidden = true;

                //Hide the Home Screen when an individual List is displayed
                elements.homeScreen.hidden = true;

                //Set up the callback method to execute when a name button matching the given ID is found
                let _updateListTitle = function(element)
                {                    
                    //Set the List title to match the text content of the name button element
                    elements.listTitle.textContent = element.textContent;
                };

                //Find the name button element for the List matching the given ID, and then update the List title to match it
                findChecklistElement(parameters.id, _updateListTitle, 'NameButton');

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
            AddList: function() //Expected parameters: list
            {
                //window.DebugController.Print("Request received to create and render List Toggle & Wrapper for List ID: " + parameters.listId);
                
                //Create a new List toggle element from the template, and append it to the Home Screen List Elements div
                elements.homeScreenListElements.appendChild(window.CustomTemplates.CreateListToggleFromTemplate(parameters.list));
                
                //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                //Create a new List wrapper element from the template, and append it to the List Screen List Elements div
                elements.listScreenListElements.appendChild(window.CustomTemplates.CreateListWrapperFromTemplate(parameters.list.id));

                //Update the reorder buttons for all the List toggles in the Home Screen
                updateReorderButtons(elements.homeScreenListElements);
            },
            RemoveList: function() //Expected parameters: id
            {
                //Remove the List wrapper element which matches the given ID
                updateChecklistElement('Remove', {type:'ListWrapper', id:parameters.id});

                //Set up the callback method to execute when the List toggle element is found which matches the given ID
                let elementFoundCallback = function(element)
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
                findChecklistElement(parameters.id, elementFoundCallback)
            },
            AddListItem: function() //Expected parameters: listId, listItem
            {
                //Set up the callback method to execute when the List wrapper element is found which matches the given ID
                let elementFoundCallback = function(element)
                {          
                    //Create a new List Item element from the template, and append it to the List wrapper matching   
                    element.appendChild(window.CustomTemplates.CreateListItemFromTemplate(parameters.listItem));

                    //Update the reorder buttons for all the List Items in the added element's parent List
                    updateReorderButtons(element);
                };

                //Find the List wrapper element which matches the given ID, and then add a new List Item to it
                findChecklistElement(parameters.listId, elementFoundCallback, 'ListWrapper');
            },
            RemoveListItem: function() //Expected parameters: id
            {
                //Set up the callback method to execute when the List Item element is found which matches the given ID
                let elementFoundCallback = function(element)
                {     
                    //Store a reference to the List Item's parent List wrapper element
                    let listWrapper = element.parentElement;     

                    //Remove the List Item element
                    element.remove();

                    //Update the reorder buttons for all the List Items in the removed element's parent List
                    updateReorderButtons(listWrapper);
                };

                //Find the List Item element which matches the given ID, and then remove it
                findChecklistElement(parameters.id, elementFoundCallback);
            },
            UpdateNameToggleColor: function() //Expected parameters: id, balance
            {
                let elementFoundCallback = function(element)
                {                    
                    //TODO might be better to change the class, and in css assign the colors to different classes for each balance
                    element.style.borderColor = (parameters.balance === ChecklistObjectBalance.Unbalanced) ? 'peru' //lightsalmon is also good
                                              : (parameters.balance === ChecklistObjectBalance.Balanced)  ? 'mediumseagreen'
                                              :                                     'rgb(77, 77, 77)'; //"darkgrey";
                };

                findChecklistElement(parameters.id, elementFoundCallback, 'NameButton');
            },
            UpdateListItemQuantityText: function() //Expected parameters: id, quantityType, updatedValue
            {
                window.DebugController.Print("Request to update quantity value. ListItem ID: " + parameters.id + ". Quantity type: " + parameters.quantityType + ". New value: " + parameters.updatedValue);

                //TODO can/should we save references to the list item quantity modifiers to not always have to search for them
                
                //TODO could we not just update everything related to a list item in one go? Or does that not make this any easier?

                let elementData = {type:'QuantityToggle', id:parameters.id, quantityType:parameters.quantityType};

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
                if (elements.activeSettingsView != null)
                {
                    $(elements.activeSettingsView).collapse('hide');
                    elements.activeSettingsView = null;
                }
            },
            UpdateName: function() //Expected parameters: id, updatedValue
            {
                //Update the text value of the name toggle/button element which matches the given ID
                updateChecklistElement('SetText', {type:'NameButton', id:parameters.id}, parameters.updatedValue);
            },
            GenerateQuantityHeader: function() //TODO not a consistent naming convention for creating/adding elements to the DOM
            {
                //TODO might be worth having a helper method specifically dedicated to updating / working with Bootstrap elements

                elements.listHeader.appendChild(window.CustomTemplates.CreateTravelHeaderFromTemplate()); 
            },
            ShowQuantityPopover: function() //Expected parameters: id, quantityType
            {
                //Show the popover element which matches the given ID and quantity type
                let elementData = {type:'QuantityToggle', id:parameters.id, quantityType:parameters.quantityType};
                updateChecklistElement('ShowPopover', elementData);
            },
            HideActiveQuantityPopover: function()
            {
                let activePopover = getActiveQuantityPopover();

                if (activePopover != null)
                {
                    window.DebugController.Print("Hiding the active quantity popover");
                    $(activePopover).popover('hide');
                }
            },
            SwapListObjects: function()
            {
                //TODO Should this use findChecklistElement or other helpers with error handling?

                let elementToMoveUpwards = document.getElementById(parameters.moveUpwardsId);
                let elementToMoveDownwards = document.getElementById(parameters.moveDownwardsId);

                if (elementToMoveUpwards != null && elementToMoveDownwards != null)
                {
                    let wrapper = elementToMoveUpwards.parentElement;

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

    //TODO Re-order all these functions so they are better organized

    function getActiveQuantityPopover()
    {        
        return document.querySelector("a.buttonQuantity[aria-describedby]");
    }

    function isSettingsViewActive()
    {        
        return document.getElementsByClassName("collapse show").length > 0 ? true : false;
    }

    function isQuantityPopoverActive()
    {        
        return getActiveQuantityPopover() != null ? true : false;
    }

    return {
        Init : init,
        Bind: bind,
        Render: render,
        IsSettingsViewActive: isSettingsViewActive,
        IsQuantityPopoverActive: isQuantityPopoverActive
    };
})();