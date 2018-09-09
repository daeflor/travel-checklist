'use strict';
window.View = (function() 
{
    //var self = this;

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

    //TODO move prefix to be the last param and make it optional. And use JSDOCS to document this method
        //There could even be an optional options param that takes a quantity type
    //TODO eventually this isn't going to work with prefix and ID separated like this
    function findChecklistElement(prefix, idNumber, callback)
    {
        var id = prefix.concat('-').concat(idNumber);
        
        GetElement(id, callback);
    }

    // function getChecklistElementId(prefix, suffix)
    // {
    //     return (prefix.concat('-').concat(suffix));
    // }

    function addListenerToChecklistElement(elementOptions, eventType, listener, options)
    {        
        var elementFoundCallback = function(element)
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

        //elementOptions.prefix == null ? (GetElement(elementOptions.id, elementFoundCallback)) : (findChecklistElement(elementOptions.prefix, elementOptions.id, elementFoundCallback));

        //TODO I don't like this elementOptions system. Might be better to use getChecklistElementId, or some other solution
        //TODO Also, this isn't readable enough
        var id = (elementOptions.prefix != null) ? (elementOptions.prefix.concat('-').concat(elementOptions.id)) : elementOptions.id;

        GetElement(id, elementFoundCallback);
    }

    function setReorderButtonColor(prefix, idNumber, color)
    {
        //Set up the callback method to execute when the element is found which matches the given prefix and ID number
        var elementFoundCallback = function(element)
        {                    
            //Set the button icon (the button's first child) to be the given color
            element.firstChild.style.color = color;
        };

        //Find the button which matches the given prefix and ID number, and then update the button icon's color
        findChecklistElement(prefix, idNumber, elementFoundCallback);
    }

    //TODO Bind and Render events should probably have distinct names. 
        //e.g. Binds could be in the past tense (e.g. SettingsViewExpanded, ButtonPressed), and Render could be commands (e.g. ExpandSettingsView, ShowHomeScreen)
        //Update all Bind and Render casing (e.g. upper vs lower) and naming convention to be consistent

    //TODO standardize between parameter, parameters, options, data, etc.
    /**
     * @param {string} event The name used to identify the event being bound
     * @param {*} callback The function to call when the corresponding event has been triggered 
     * @param {object} parameters An optional object to pass containing any additional data needed to perform the bind. Possible parameters: id.
     */
    function bind(event, callback, parameters)
    {
        if (event === 'HomeButtonPressed') 
        {
            //Set the behavior for when the Home button is pressed
            addListenerToChecklistElement({id:'buttonHome'}, 'click', callback);
        }
        else if (event === 'NewListButtonPressed') 
        {
            //Set the behavior for when the Add List button is pressed
            addListenerToChecklistElement({id:'buttonAddList'}, 'click', callback);
        }
        else if (event === 'GoToListButtonPressed') //Expected parameters: listId
        {
            //Set the behavior for when a Go To List button is pressed
            addListenerToChecklistElement({prefix:'GoToList', id:parameters.listId}, 'click', callback);
        }
        else if (event === 'NewListItemButtonPressed') 
        {
            //Set the behavior for when the Add List Item button is pressed
            addListenerToChecklistElement({id:'buttonAddRow'}, 'click', callback);      
        }
        else if (event === 'DeleteButtonPressed') 
        {
            //Set the behavior for when the Delete button is pressed in a List Item's Settings View
            addListenerToChecklistElement({prefix:'Delete', id:parameters.id}, 'click', callback);
        }
        else if (event === 'MoveUpwardsButtonPressed') 
        {
            //Set the behavior for when the Move Upwards button is pressed in a List Item's Settings View
            addListenerToChecklistElement({prefix:'MoveUpwards', id:parameters.id}, 'click', callback);
        }
        //TODO Look into merging the two clauses above and below
        else if (event === 'MoveDownwardsButtonPressed') 
        {
            //Set the behavior for when the Move Downwards button is pressed in a List Item's Settings View
            addListenerToChecklistElement({prefix:'MoveDownwards', id:parameters.id}, 'click', callback);
        }
        else if (event === 'QuantityPopoverShown') 
        {
            //Set the behavior for when the Quantity popover for the given quantity type is made visible
            addListenerToChecklistElement({prefix:parameters.quantityType.concat('QuantityToggle'), id:parameters.listItemId}, 'shown.bs.popover', callback);

            window.DebugController.Print("Set binding for popover toggle of type: " + parameters.quantityType + ", and listItemId: " + parameters.listItemId);
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
        else if (event === 'DecrementQuantityButtonPressed') 
        {
            addListenerToChecklistElement({id:'buttonMinus'}, 'click', callback);
        }
        else if (event === 'IncrementQuantityButtonPressed')
        {
            addListenerToChecklistElement({id:'buttonPlus'}, 'click', callback);
        }
        else if (event === 'SettingsViewExpansionStarted') //Expected parameters: id
        {
            var eventTriggeredCallback = function(event)
            {
                //TODO If there is no callback (i.e. nothing for the Controller to do because activeSettingsView is now tracked in View),
                    //then maybe this doesn't make sense for a BIND...?
                //self.render('HideActiveSettingsView');
                callback(); //TODO don't really like the idea of having a callback and THEN still doing something... It implies the View does actually have knowledge of what is going on, and doesn't really seem correct
                elements.activeSettingsView = event.target;
                // callback(newSettingsView); 
            }
            
            addListenerToChecklistElement({prefix:'SettingsView', id:parameters.id}, 'show.bs.collapse', eventTriggeredCallback); 
        }
        else if (event === 'NameEdited') //Expected parameters: id
        {
            var eventTriggeredCallback = function(event)
            {
                callback(event.target.value);
            }
            
            addListenerToChecklistElement({prefix:'EditName', id:parameters.id}, 'change', eventTriggeredCallback);            
        }
        else if (event === 'ClickDetectedOutsidePopover')
        {
            addListenerToChecklistElement({id:'divChecklistBody'}, 'click', callback, {once:true});

            window.DebugController.Print("A onetime onclick listener was added to the checklist body");
        }
        else if (event === 'QuantityToggleSelected')
        {
            addListenerToChecklistElement({prefix:parameters.quantityType.concat('QuantityToggle'), id:parameters.listItemId}, 'click', callback);
        }
    }

    //TODO why is the format in bind and render different? Seems like it could be the same

    function render(command, parameters)
    {
        var viewCommands = 
        {
            showHomeScreen: function() 
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
            },
            DisplayList: function() //Expected parameters: listId, activeListId
            {
                //Hide the Home Header when an individual List is displayed
                elements.homeHeader.hidden = true;

                //Hide the Home Screen when an individual List is displayed
                elements.homeScreen.hidden = true;

                //TODO might be worth renaming the callback function variables below to improve readability

                //Set up the callback method to execute when a name button matching the given ID is found
                var elementFoundCallback = function(element)
                {                    
                    //Set the List title to match the text content of the name button element
                    elements.listTitle.textContent = element.textContent;
                };

                //Find the name button element for the List matching the given ID, and then update the List title to match it
                findChecklistElement('NameButton', parameters.listId, elementFoundCallback);

                //If a valid Active List ID was provided...
                if (parameters.activeListId != null)
                {
                    //Set up the callback method to execute when the List wrapper element for the Active List is found
                    elementFoundCallback = function(element)
                    {                    
                        //Hide the List wrapper element
                        element.hidden = true;
                    };

                    //Find the wrapper element for the Active List, and then hide the element
                    findChecklistElement('ListWrapper', parameters.activeListId, elementFoundCallback);
                }

                //Set up the callback method to execute when a List wrapper element matching the given ID is found
                elementFoundCallback = function(element)
                {                    
                    //Display the List wrapper element
                    element.hidden = false;
                };

                //Find the wrapper element for the List matching the given ID, and then display the element
                findChecklistElement('ListWrapper', parameters.listId, elementFoundCallback);
                
                //Show the List Header when an individual List is displayed
                elements.listHeader.hidden = false;

                //Show the List Screen when an individual List is displayed
                elements.listScreen.hidden = false;
            },
            AddListElements: function() //Expected parameters: listId, listName
            {
                window.DebugController.Print("Request received to create and render List Toggle & Wrapper for List ID: " + parameters.listId);

                var lastListElement = elements.homeScreenListElements.lastChild;
                
                //Add the List Toggle element to the DOM, under the Home Screen List Elements div
                elements.homeScreenListElements.appendChild(window.CustomTemplates.CreateListToggleFromTemplate(parameters));
                
                //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                //Add the List element to the DOM, under the List Screen List Elements div
                elements.listScreenListElements.appendChild(window.CustomTemplates.CreateListWrapperFromTemplate(parameters.listId));

                //If the new List is the first one in the Lists array...
                if (lastListElement == null)
                {
                    //Set the new List's 'Move Upwards' button to be gray
                    setReorderButtonColor('MoveUpwards', parameters.listId, '#606060');

                    //Set the new List's 'Move Downwards' button to be gray
                    setReorderButtonColor('MoveDownwards', parameters.listId, '#606060');
                }
                //Else, if the new List is not the first one in the List array...
                else
                {
                    //Set the previous List's 'Move Downwards' button to be black
                    setReorderButtonColor('MoveDownwards', lastListElement.id, 'black');

                    //Set the new List's 'Move Upwards' button to be black
                    setReorderButtonColor('MoveUpwards', parameters.listId, 'black');

                    //Set the new List's 'Move Downwards' button to be gray
                    setReorderButtonColor('MoveDownwards', parameters.listId, '#606060');
                }
            },
            RemoveList: function() //Expected parameters: listId
            {
                //Set up the callback method to execute when the List wrapper element is found which matches the given ID
                var elementFoundCallback = function(element)
                {                    
                    //Remove the List wrapper element
                    element.remove();
                };

                //Find the List wrapper element which matches the given ID, and then remove it
                findChecklistElement('ListWrapper', parameters.listId, elementFoundCallback);

                //Set up the callback method to execute when the List toggle element is found which matches the given ID
                elementFoundCallback = function(element)
                {                    
                    //Remove the List toggle element
                    element.remove();
                };

                //Find the List toggle element which matches the given ID, and then remove it
                GetElement(parameters.listId, elementFoundCallback);
            },
            AddListItem: function() //Expected parameters: listId, listItemId
            {
                //Set up the callback method to execute when the List wrapper element is found which matches the given ID
                var elementFoundCallback = function(element)
                {             
                    var lastListItemElement = element.lastChild;

                    element.appendChild(window.CustomTemplates.CreateListItemFromTemplate(parameters));

                    //TODO Should the things below be done in a separate method? (And consolidated with the similar logic in AddListElements)

                    //If the new List Item is the first one in the List, set both reorder buttons to be gray
                    if (lastListItemElement == null)
                    {
                        setReorderButtonColor('MoveUpwards', parameters.listItemId, '#606060');
                        setReorderButtonColor('MoveDownwards', parameters.listItemId, '#606060');
                    }
                    else //Else, if the new List Item is not the first one in the List...
                    {
                        //Set the previous List Item's 'Move Downwards' button to be black
                        setReorderButtonColor('MoveDownwards', lastListItemElement.id, 'black');

                        //Set the new List Item's 'Move Upwards' button to be black
                        setReorderButtonColor('MoveUpwards', parameters.listItemId, 'black');

                        //Set the new List Item's 'Move Downwards' button to be gray
                        setReorderButtonColor('MoveDownwards', parameters.listItemId, '#606060');
                    }
                };

                //Find the List wrapper element which matches the given ID, and then set the color of the reorder buttons for the List Item matching the given ID
                findChecklistElement('ListWrapper', parameters.listId, elementFoundCallback);
            },
            RemoveListItem: function() //Expected parameters: listItemId
            {
                // //Set up the callback method to execute when the List Item element is found which matches the given ID
                // var elementFoundCallback = function(element)
                // {                    
                //     //Remove the List Item element
                //     element.remove();
                // };

                // //Find the List Item element which matches the given ID, and then remove it
                // findChecklistElement('', parameters.listItemId, elementFoundCallback);
                
                var listItem = document.getElementById(parameters.listItemId);

                //If the quantity toggle element was found, update the text content of the toggle to the new value
                if (listItem != null)
                {
                    listItem.remove();
                }
                else
                {
                    window.DebugController.LogError("ERROR: Tried to remove a List Item from the View but it could not be found. List Item ID: " + parameters.listItemId);
                }
            },
            updateListItemQuantityText: function() //Expected parameters: listItemId, quantityType, updatedValue
            {
                window.DebugController.Print("Request to update quantity value. ListItem ID: " + parameters.listItemId + ". Quantity type: " + parameters.quantityType + ". New value: " + parameters.updatedValue);

                //TODO can we save references to the list item quantity modifiers to not always have to search for them

                //Get the popover toggle element based on the given quantity type and List Item ID
                var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));

                //If the quantity toggle element was found, update the text content of the toggle to the new value
                if (toggle != null)
                {
                    toggle.text = parameters.updatedValue;
                }
                else
                {
                    window.DebugController.LogError("ERROR: Tried to update the value of a quantity toggle that could not be found");
                }
            },
            updateListItemNameColor: function() //Expected parameters: listItemId, quantityBalance, quantityNeeded
            {
                window.DebugController.Print("Request to update color of list item with id: " + parameters.listItemId);

                var elementFoundCallback = function(element)
                {                    
                    element.style.borderColor = (parameters.quantityBalance != 0) ? 'peru' //lightsalmon is also good
                                              : (parameters.quantityNeeded != 0)  ? 'mediumseagreen'
                                              :                                     'rgb(77, 77, 77)'; //"darkgrey";
                };

                findChecklistElement('NameButton', parameters.listItemId, elementFoundCallback);
            },
            ExpandSettingsView: function() 
            {
                var elementFoundCallback = function(element)
                {                    
                    $(element).collapse('show');
                };

                findChecklistElement('SettingsView', parameters.id, elementFoundCallback);   
                
                elementFoundCallback = function(element)
                {                    
                    $(element).focus();
                };

                findChecklistElement('EditName', parameters.id, elementFoundCallback);   

            },
            HideActiveSettingsView: function() //TODO consider having this be its own private method in the View, instead of accessible through Render
            {
                if (elements.activeSettingsView != null)
                {
                    $(elements.activeSettingsView).collapse('hide');
                    elements.activeSettingsView = null;
                }
            },
            UpdateName: function() 
            {
                var nameButton = document.getElementById('NameButton-'.concat(parameters.id));
                
                nameButton.textContent = parameters.updatedValue;
            },
            ShowQuantityHeader: function() 
            {
                //TODO might be worth having a helper method specifically dedicated to updating / working with Bootstrap elements

                elements.listHeader.appendChild(window.CustomTemplates.CreateTravelHeaderFromTemplate()); 
            },
            ShowQuantityPopover: function() 
            {
                var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));
                $(toggle).popover('show');
            },
            HideQuantityPopover: function() 
            {
                //TODO can/should we save references to the list item quantity modifiers to not always have to search for them
                    //TODO Could at least create a helper method to find and return the toggle element
                var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));
                $(toggle).popover('hide');
            },
            SwapListObjects: function()
            {
                var elementToMoveUpwards = document.getElementById(parameters.moveUpwardsId);
                var elementToMoveDownwards = document.getElementById(parameters.moveDownwardsId);
                elementToMoveUpwards.parentElement.insertBefore(elementToMoveUpwards, elementToMoveDownwards);

                var buttonMoveUpwards = document.getElementById('MoveUpwards-'.concat(elementToMoveUpwards.id));
                var buttonMoveDownwards = document.getElementById('MoveDownwards-'.concat(elementToMoveUpwards.id));
                
                if (elementToMoveUpwards.previousElementSibling == null)
                {
                    buttonMoveUpwards.firstChild.style.color = '#606060';
                }
                else
                {
                    buttonMoveUpwards.firstChild.style.color = 'black';
                }

                buttonMoveDownwards.firstChild.style.color = 'black';

                buttonMoveUpwards = document.getElementById('MoveUpwards-'.concat(elementToMoveDownwards.id));
                buttonMoveDownwards = document.getElementById('MoveDownwards-'.concat(elementToMoveDownwards.id));
                
                if (elementToMoveDownwards.nextElementSibling == null)
                {
                    buttonMoveDownwards.firstChild.style.color = '#606060';
                }
                else
                {
                    buttonMoveDownwards.firstChild.style.color = 'black';
                }

                buttonMoveUpwards.firstChild.style.color = 'black';
            },
        };

        viewCommands[command]();
    }

    return {
        Init : init,
        Bind: bind,
        Render: render
    };
})();