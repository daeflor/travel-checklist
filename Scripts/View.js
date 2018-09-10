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
    function findChecklistElement(id, callback, elementType, quantityType)
    {
        var elementId = (elementType == null)  ? id
                      : (quantityType == null) ? elementType.concat('-').concat(id)
                                               : quantityType.concat(elementType).concat('-').concat(id);
        
        GetElement(elementId, callback);
    }

    // function getChecklistElementId(prefix, suffix)
    // {
    //     return (prefix.concat('-').concat(suffix));
    // }

    //TODO Should there be some sort of template "checklist element". You provide a method with the id, elementType, and quantityType, and it returns a data object in a standard format that is used consistently throughout the View...?
        //Or is that too much overhead?
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

        //TODO I don't like this elementOptions system. Might be better to use getChecklistElementId, or some other solution
        findChecklistElement(elementOptions.id, elementFoundCallback, elementOptions.prefix);
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
        findChecklistElement(idNumber, elementFoundCallback, prefix);
    }

    // function setupReorderButtons(newElementId, previousElementId)
    // {        
    //     //TODO an alternative option that might make sense is to:
    //         //Set the default color of the buttons to gray. Then,
    //         //1st: update the previous element, if it exists, so that the down color is black
    //         //2nd: update the new element's up color to be black
        
    //     //If there is no previous element...
    //     if (previousElementId == null)
    //     {
    //         //Set the new element's 'Move Upwards' button to be gray
    //         setReorderButtonColor('MoveUpwards', newElementId, '#606060');

    //         //Set the new element's 'Move Downwards' button to be gray
    //         setReorderButtonColor('MoveDownwards', newElementId, '#606060');
    //     }
    //     else //Else, if there is a previous element
    //     {
    //         //Set the previous element's 'Move Downwards' button to be black
    //         setReorderButtonColor('MoveDownwards', previousElementId, 'black');

    //         //Set the new element's 'Move Upwards' button to be black
    //         setReorderButtonColor('MoveUpwards', newElementId, 'black');

    //         //Set the new element's 'Move Downwards' button to be gray
    //         setReorderButtonColor('MoveDownwards', newElementId, '#606060');
    //     }
    // };

    //TODO maybe a simpler, albeit not very well optimized solution is to have a helper method that:
        //Loops through all the elements in the list (is this possible?) 
        //If it's the first child, Up is Gray, else Up is black
        //If it's the last child, Down is Gray, else Down is black
            //If looping isn't possible, could have a var to keep track of current first and last, but there should be a better way
            //It should be possible to loop through all the children elements, if the parent wrapper is available
    //TODO document this method, using the comments above as reference
    function updateReorderButtons(parentWrapper)
    {
        for (var i = 0; i < parentWrapper.children.length; i++) 
        {
            if (i == 0)
            {
                //TODO somehow parse the id number from the element, and then:

                setReorderButtonColor('MoveUpwards', parentWrapper.children[i].id, '#606060');
            }
            else
            {
                setReorderButtonColor('MoveUpwards', parentWrapper.children[i].id, 'black');
            }

            if (i == parentWrapper.children.length-1)
            {
                setReorderButtonColor('MoveDownwards', parentWrapper.children[i].id, '#606060');
            }
            else
            {
                setReorderButtonColor('MoveDownwards', parentWrapper.children[i].id, 'black');
            }
        }
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

    //TODO maybe split this between View.HomeScreen and View.ListScreen? 
        //Maybe the parent View could redirect to the correct subView so that it is abstracted from the Controller?

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
                findChecklistElement(parameters.listId, elementFoundCallback, 'NameButton');

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
                    findChecklistElement(parameters.activeListId, elementFoundCallback, 'ListWrapper');
                }

                //Set up the callback method to execute when a List wrapper element matching the given ID is found
                elementFoundCallback = function(element)
                {                    
                    //Display the List wrapper element
                    element.hidden = false;
                };

                //Find the wrapper element for the List matching the given ID, and then display the element
                findChecklistElement(parameters.listId, elementFoundCallback, 'ListWrapper');
                
                //Show the List Header when an individual List is displayed
                elements.listHeader.hidden = false;

                //Show the List Screen when an individual List is displayed
                elements.listScreen.hidden = false;
            },
            AddListElements: function() //Expected parameters: listId
            {
                window.DebugController.Print("Request received to create and render List Toggle & Wrapper for List ID: " + parameters.listId);

                //var lastListElement = elements.homeScreenListElements.lastChild;
                
                //Add the List Toggle element to the DOM, under the Home Screen List Elements div
                elements.homeScreenListElements.appendChild(window.CustomTemplates.CreateListToggleFromTemplate(parameters));
                
                //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                //Add the List element to the DOM, under the List Screen List Elements div
                elements.listScreenListElements.appendChild(window.CustomTemplates.CreateListWrapperFromTemplate(parameters.listId));

                //Update the reorder buttons for all the List toggles in the Home Screen
                updateReorderButtons(elements.homeScreenListElements);

                // lastListElement == null ? setupReorderButtons(parameters.listId) 
                //                         : setupReorderButtons(parameters.listId, lastListElement.id);
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
                findChecklistElement(parameters.listId, elementFoundCallback, 'ListWrapper');

                //Set up the callback method to execute when the List toggle element is found which matches the given ID
                elementFoundCallback = function(element)
                {                    
                    //Remove the List toggle element
                    element.remove();

                    //Update the reorder buttons for all the List toggles in the Home Screen
                    updateReorderButtons(elements.homeScreenListElements);
                };

                //Find the List toggle element which matches the given ID, and then remove it
                findChecklistElement(parameters.listId, elementFoundCallback)

                // //Find the List toggle element which matches the given ID, and then remove it
                // GetElement(parameters.listId, elementFoundCallback);
            },
            AddListItem: function() //Expected parameters: listId, listItemId
            {
                //Set up the callback method to execute when the List wrapper element is found which matches the given ID
                var elementFoundCallback = function(element)
                {             
                    //var lastListItemElement = element.lastChild;

                    element.appendChild(window.CustomTemplates.CreateListItemFromTemplate(parameters));

                    //Update the reorder buttons for all the List Items in the added element's parent List
                    updateReorderButtons(element);

                    // lastListItemElement == null ? setupReorderButtons(parameters.listItemId) 
                    //                             : setupReorderButtons(parameters.listItemId, lastListItemElement.id);
                };

                //Find the List wrapper element which matches the given ID, and then add a new List Item to it
                findChecklistElement(parameters.listId, elementFoundCallback, 'ListWrapper');
            },
            RemoveListItem: function() //Expected parameters: listItemId
            {
                //Set up the callback method to execute when the List Item element is found which matches the given ID
                var elementFoundCallback = function(element)
                {     
                    //Store a reference to the List Item's parent List wrapper element
                    var listWrapper = element.parentElement;     

                    //Remove the List Item element
                    element.remove();

                    //Update the reorder buttons for all the List Items in the removed element's parent List
                    updateReorderButtons(listWrapper);
                };

                //Find the List Item element which matches the given ID, and then remove it
                findChecklistElement(parameters.listItemId, elementFoundCallback);
            },
            updateListItemQuantityText: function() //Expected parameters: listItemId, quantityType, updatedValue
            {
                window.DebugController.Print("Request to update quantity value. ListItem ID: " + parameters.listItemId + ". Quantity type: " + parameters.quantityType + ". New value: " + parameters.updatedValue);

                //TODO can/should we save references to the list item quantity modifiers to not always have to search for them

                //Set up the callback method to execute when the quantity toggle element for the List Item which matches the given ID is found
                var elementFoundCallback = function(element)
                {                    
                    //Update the text value of the List Item's quantity toggle
                    element.text = parameters.updatedValue;
                };

                //Find the quantity toggle element for the List Item which matches the given ID, and then update its text value
                findChecklistElement(parameters.listItemId, elementFoundCallback, 'QuantityToggle', parameters.quantityType);
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

                findChecklistElement(parameters.listItemId, elementFoundCallback, 'NameButton');
            },
            ExpandSettingsView: function() 
            {
                var elementFoundCallback = function(element)
                {                    
                    $(element).collapse('show');
                };

                findChecklistElement(parameters.id, elementFoundCallback, 'SettingsView');   
                
                elementFoundCallback = function(element)
                {                    
                    $(element).focus();
                };

                findChecklistElement(parameters.id, elementFoundCallback, 'EditName');   

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
                //Set up the callback method to execute when the name toggle/button which matches the given ID is found
                var elementFoundCallback = function(element)
                {                    
                    //Update the text value of name button/toggle
                    element.textContent = parameters.updatedValue;
                };

                //Find the name toggle/button element which matches the given ID, and then update its text value
                findChecklistElement(parameters.id, elementFoundCallback, 'NameButton');
            },
            ShowQuantityHeader: function() 
            {
                //TODO might be worth having a helper method specifically dedicated to updating / working with Bootstrap elements

                elements.listHeader.appendChild(window.CustomTemplates.CreateTravelHeaderFromTemplate()); 
            },
            ShowQuantityPopover: function() 
            {
                var elementFoundCallback = function(element)
                {                    
                    $(element).popover('show');
                };

                findChecklistElement(parameters.listItemId, elementFoundCallback, 'QuantityToggle', parameters.quantityType); 
            },
            HideQuantityPopover: function() 
            {
                //TODO can/should we save references to the list item quantity modifiers to not always have to search for them
                
                var elementFoundCallback = function(element)
                {                    
                    $(element).popover('hide');
                };

                findChecklistElement(parameters.listItemId, elementFoundCallback, 'QuantityToggle', parameters.quantityType); 
            },
            SwapListObjects: function()
            {
                //TODO should this be cleaned up? Should it use findChecklistElement or other helpers?

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