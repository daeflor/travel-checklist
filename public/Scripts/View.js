'use strict';
window.View = (function() 
{
    //TODO The Bind and Render calls could all use error handling

    //let activeSettingsView = null;

    let activeSettingsView = {
        element: null
    };

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
        
        FindElement(elementId, callback);
    }

    /**
     * Returns an element in the DOM based on its ID and, optionally, some other parameters
     * @param {string} id - The identifier of the element to search for
     * @param {string} [elementType] - An optional string specifying the type of checklist element to search for
     * @param {string} [quantityType] - An optional string specifyin the quantity type of the checklist element to search for, if applicable
     * @returns {Element} The element matching the given parameters
     */
    function getChecklistElement(id, elementType, quantityType)
    {
        let elementId = (elementType == null)  ? id
                      : (quantityType == null) ? elementType.concat('-').concat(id)
                                               : quantityType.concat(elementType).concat('-').concat(id);

        return GetElement(elementId);
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

    // function HideActiveSettingsView() 
    // {
    //     if (elements.activeSettingsView != null)
    //     {
    //         $(elements.activeSettingsView).collapse('hide');
    //         elements.activeSettingsView = null;
    //     }
    // }

    //TODO Would it be possible to have all 'addListenerToChecklistElement' calls go through this function?
    /**
     * Creates a bind for an element belonging to a Checklist Object (List Toggle or List Item)
     * @param {string} prefix - The prefix denoting the type of checklist element being bound
     * @param {string} eventType - The type of event listener to add to the element
     * @param {function} callback - The callback to execute when the event listener is triggered
     * @param {object} parameters - An object containing additional parameters necessary to identify and locate the element being bound
     */
    function bindChecklistObjectElement(prefix, eventType, callback, id)
    {
        if (id != null)
        {
            //Set the behavior for when one of the Checklist Object's buttons is pressed
            addListenerToChecklistElement({prefix:prefix, id:id}, eventType, callback);
        }
        else { DebugController.LogError("A 'checklistObject' option with an 'id' key was expected but not provided. Bind could not be created."); }
    }

    //TODO Bind and Render events should probably have distinct names. 
        //e.g. Binds could be in the past tense (e.g. SettingsViewExpanded, ButtonPressed), and Render could be commands (e.g. ExpandSettingsView, ShowHomeScreen)
        //Update all Bind and Render casing (e.g. upper vs lower) and naming convention to be consistent

    //TODO Maybe put error handling in the functions below to ensure the expected parameters have been passed.
        //For example: if (validateObjectContainsValidKVPs(options, ['quantityType']) == true) ~OR~ validateObjectContainsKVPs(options, [key1, key2, etc]) == true ? doAction() : logError();

    //TODO standardize between parameter, parameters, options, data, etc.
    /**
     * @param {string} event The name used to identify the event being bound
     * @param {*} callback The function to call when the corresponding event has been triggered 
     * @param {object} [parameters] An optional object to pass containing any additional data needed to perform the bind. Possible parameters: id, quantityType.
     */
    function bind(event, callback, parameters)
    {
        //TODO could use: validateObjectContainsKVPs(parameters, [key1, key2, etc]) == true ? doAction() : logError();

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
        else if (event === 'GoToListButtonPressed') //Expected parameters: id
        {
            //Set the behavior for when a Go To List button is pressed
            bindChecklistObjectElement('GoToList', 'click', callback, parameters.id);
        }
        else if (event === 'NewListItemButtonPressed') 
        {
            //Set the behavior for when the Add List Item button is pressed
            addListenerToChecklistElement({id:'buttonAddRow'}, 'click', callback);                
        }
        else if (event === 'SettingsViewExpansionStarted') //Expected parameters: id
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
                activeSettingsView.element = event.target;
                // callback(newSettingsView); 
                
                //HideActiveSettingsView();
                //elements.activeSettingsView = event.target;
            }

            bindChecklistObjectElement('SettingsView', 'show.bs.collapse', eventTriggeredCallback, parameters.id);            
        }
        else if (event === 'NameEdited') //Expected parameters: id
        {
            let eventTriggeredCallback = function(event)
            {
                callback(event.target.value);
            }
            
            bindChecklistObjectElement('EditName', 'change', eventTriggeredCallback, parameters.id);
        }
        else if (event === 'DeleteButtonPressed') //Expected parameters: id
        {
            //Set the behavior for when the Delete button is pressed in a List Item's Settings View
            bindChecklistObjectElement('Delete', 'click', callback, parameters.id);
        }
        else if (event === 'MoveUpwardsButtonPressed') //Expected parameters: id
        {
            //Set the behavior for when the Move Upwards button is pressed in a List Item's Settings View
            bindChecklistObjectElement('MoveUpwards', 'click', callback, parameters.id);
        }
        else if (event === 'MoveDownwardsButtonPressed') //Expected parameters: id
        {
            //Set the behavior for when the Move Downwards button is pressed in a List Item's Settings View
            bindChecklistObjectElement('MoveDownwards', 'click', callback, parameters.id);
        }
        else if (event === 'DecrementQuantityButtonPressed') 
        {
            addListenerToChecklistElement({id:'buttonMinus'}, 'click', callback);
        }
        else if (event === 'IncrementQuantityButtonPressed')
        {
            addListenerToChecklistElement({id:'buttonPlus'}, 'click', callback);
        }
        else if (event === 'QuantityToggleSelected') //Expected parameters: id, quantityType
        {
            //TODO modify bindChecklistObjectElement so that it can support multiple parameters, incl. quantityType
                //Or maybe don't use such a generic abstracted helper function...

            addListenerToChecklistElement({prefix:parameters.quantityType.concat('QuantityToggle'), id:parameters.id}, 'click', callback);
        }
        else if (event === 'QuantityPopoverShown') //Expected parameters: id, quantityType
        {
            //Set the behavior for when the Quantity popover for the given quantity type is made visible
            addListenerToChecklistElement({prefix:parameters.quantityType.concat('QuantityToggle'), id:parameters.id}, 'shown.bs.popover', callback);

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
        else if (event === 'ClickDetectedOutsidePopover')
        {
            //If a click is detected anywhere in the body but outside the popover, execute the callback method
            addListenerToChecklistElement({id:'divChecklistBody'}, 'click', callback, {once:true});

            //window.DebugController.Print("A onetime onclick listener was added to the checklist body");
        }
    }

    //TODO Re-order all these functions so they are better organized

    //TODO clean up this section, with regards to how this file and the ViewRenderer communicate

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

    function getActiveSettingsView()
    {
        return activeSettingsView;
    }

    return {
        FindChecklistElement: findChecklistElement,
        GetChecklistElement: getChecklistElement,
        Bind: bind,
        IsSettingsViewActive: isSettingsViewActive,
        GetActiveQuantityPopover: getActiveQuantityPopover,
        IsQuantityPopoverActive: isQuantityPopoverActive,
        GetActiveSettingsView: getActiveSettingsView
    };
})();