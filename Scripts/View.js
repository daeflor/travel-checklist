'use strict';
window.View = (function() 
{
    //var self = this;

    //TODO The Bind and Render calls could all use error handling
    //TODO Shouldn't be passing element data to the View. The View should take care of that using IDs
        //I don't think this is a problem anymore

    var elements = {  
        homeHeader : null,
        homeScreen : null,
        homeScreenListElements : null,
        listHeader : null,
        listTitle : null,
        listScreen : null,
        listScreenListElements : null,
        activeSettingsView : null,
        activeListId : null //TODO I don't think it's ideal having to keep track of this (in the View or anywhere else really)
    };

    function init()
    {
        //TODO Several of these (both variable name and element ID) could probably be renamed for clarity
            
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

    //TODO is this still necessary now that new ID naming convention is used (i.e. ElementType-ID)
    function getListItemNameButton(listItemId)
    {
        window.DebugController.Print("Request to get name button of List Item with id: " + listItemId);

        //TODO might be easier to just set the data-id to the same value for all elements that are part of a single List Item.. Hmm maybe not because then you'd have to figure out which of those elements you're looking for
            //TODO maybe could just set custom IDs to particular elements (e.g. 'listItemNameButton-745382490375' )
        var listItemWrapper = document.getElementById(listItemId);

        if (listItemWrapper != null)
        {
            var listNameWrapper = listItemWrapper.firstChild;
            
            if (listNameWrapper != null)
            {
                return listNameWrapper.firstChild;

                // var listNameButton = listNameWrapper.firstChild;

                // if (listNameButton != null)
                // {
                //     return listNameButton; 
                // }
                // else { console.log("ERROR: Could not find List Name button element which should be a grandchild of List Item wrapper element with ID: " + parameters.listItemId); }
            }
            else { window.DebugController.LogError("ERROR: Could not find List Name wrapper element which should be a child of List Item wrapper element with ID: " + listItemId); }
        }
        else { window.DebugController.LogError("ERROR: Could not find List Item wrapper element with ID: " + listItemId); }
    }

    // function getChecklistElement(prefix, id, callback)
    // {
    //     var id = prefix.concat('-').concat(id);
        
    //     GetElement(id, callback);
    // }

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
            //Else, if the event type is of any other type
            else
            {
                //Use vanilla JS to add the event listener
                element.addEventListener(eventType, listener, options);
            }            
        };

        //elementOptions.prefix == null ? (GetElement(elementOptions.id, elementFoundCallback)) : (getChecklistElement(elementOptions.prefix, elementOptions.id, elementFoundCallback));

        //TODO I don't like this elementOptions system. Might be better to use getChecklistElementId, or some other solution
        //TODO Also, this isn't readable enough
        var id = (elementOptions.prefix != null) ? (elementOptions.prefix.concat('-').concat(elementOptions.id)) : elementOptions.id;

        GetElement(id, elementFoundCallback);
    }

    //TODO Bind and Render events should probably have distinct names
    //TODO maybe Binds should be in the past tense (e.g. SettingsViewExpanded, ButtonPressed),
        //and Render should be commands (e.g. ExpandSettingsView, ShowHomeScreen)
        //Update all Bind and Render casing (e.g. upper vs lower) and naming convention to be consistent

    //TODO How can you have the parameters param before the callback param but still have the former be optional?
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
            document.getElementById('buttonHome').addEventListener('click', callback);         
        }
        else if (event === 'NewListButtonPressed') 
        {
            //Set the behavior for when the Add List button is pressed
            document.getElementById('buttonAddList').addEventListener('click', callback);         
        }
        else if (event === 'GoToListButtonPressed') //Expected parameters: listId
        {
            //Set the behavior for when a Go To List button is pressed

            // var elementFoundCallback = function(element)
            // {
            //     element.addEventListener('click', callback);
            // }

            // getChecklistElement('GoToList', parameters.listId, elementFoundCallback);


            //addListener({prefix:'GoToList', id:parameters.listId}, 'click', {method:callback});
            addListenerToChecklistElement({prefix:'GoToList', id:parameters.listId}, 'click', callback);
        }
        else if (event === 'NewListItemButtonPressed') 
        {
            //Set the behavior for when the Add List Item button is pressed

            var eventTriggeredCallback = function()
            {
                callback(elements.activeListId);
            }

            addListenerToChecklistElement({id:'buttonAddRow'}, 'click', eventTriggeredCallback);      
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
            var eventTriggeredCallback = function()
            {
                callback(elements.activeListId);
            }

            addListenerToChecklistElement({id:'buttonClear'}, 'click', eventTriggeredCallback);
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
                //Hide the List Header
                elements.listHeader.hidden = true;

                //Hide the List Screen
                elements.listScreen.hidden = true;

                //Show the Home Header
                elements.homeHeader.hidden = false;

                //Show the Home Screen
                elements.homeScreen.hidden = false;
            },
            DisplayList: function() //Expected parameters: listId
            {
                //Hide the Home Header when an individual List is displayed
                elements.homeHeader.hidden = true;

                //Hide the Home Screen when an individual List is displayed
                elements.homeScreen.hidden = true;

                //Set the List title
                elements.listTitle.textContent = document.getElementById('NameButton-'.concat(parameters.listId)).textContent;

                //Traverse all the List elements
                for (var i = 0; i < elements.listScreenListElements.children.length; i++)
                {
                    //If the List element's ID contains the given List ID...
                    if (elements.listScreenListElements.children[i].id.includes(parameters.listId))
                    {
                        //Display that element
                        elements.listScreenListElements.children[i].hidden = false;

                        //Set the Active List ID
                        elements.activeListId = parameters.listId;
                    } 
                    else if (elements.listScreenListElements.children[i].hidden == false)
                    {
                        //Else, for any other element, if it is currently displayed, hide it 
                        elements.listScreenListElements.children[i].hidden = true;
                    }
                }
                
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

                //If the new List is the first one in the Lists array, set both reorder buttons to be gray
                if (lastListElement == null)
                {
                    document.getElementById('MoveUpwards-'.concat(parameters.listId)).firstChild.style.color = '#606060';
                    document.getElementById('MoveDownwards-'.concat(parameters.listId)).firstChild.style.color = '#606060';
                }
                //Else, if the new List is not the first one in the List array...
                else
                {
                    //TODO what a horrible name
                    var lastListElementMoveDownwardsButton = document.getElementById('MoveDownwards-'.concat(lastListElement.id));

                    window.DebugController.Print("Move Downwards button ID: " + lastListElementMoveDownwardsButton.id);

                    if (lastListElementMoveDownwardsButton != null)
                    {
                        //Set the previous List's 'Move Downwards' button to be black
                        lastListElementMoveDownwardsButton.firstChild.style.color = 'black';
                    }
                    else
                    {
                        window.DebugController.LogError("ERROR: Tried to set the color of the last List's Move Downwards button, but the List could not be found. List ID expected: " + parameters.listId);
                    }

                    //Set the new List's 'Move Upwards' button to be black
                    document.getElementById('MoveUpwards-'.concat(parameters.listId)).firstChild.style.color = 'black';

                    //Set the new List's 'Move Downwards' button to be gray
                    document.getElementById('MoveDownwards-'.concat(parameters.listId)).firstChild.style.color = '#606060';
                }
           
            },
            RemoveList: function() //Expected parameters: listId
            {
                //Remove the List element from the Lists wrapper
                document.getElementById('ListWrapper-'.concat(parameters.listId)).remove();

                //Remove the List Toggle element from the Lists of Lists wrapper
                document.getElementById(parameters.listId).remove();
            },
            AddListItem: function() 
            {
                var listWrapper = document.getElementById('ListWrapper-'.concat(parameters.listId));
                
                if (listWrapper != null)
                {
                    //var listItemElement = window.CustomTemplates.CreateListItemFromTemplate(parameters);
                    var lastListItemElement = listWrapper.lastChild;

                    listWrapper.appendChild(window.CustomTemplates.CreateListItemFromTemplate(parameters));

                    //TODO Should the things below be done in a separate method? (And consolidated with the similar logic in AddListElements)

                    //If the new List Item is the first one in the List, set both reorder buttons to be gray
                    if (lastListItemElement == null)
                    {
                        document.getElementById('MoveUpwards-'.concat(parameters.listItemId)).firstChild.style.color = '#606060';
                        document.getElementById('MoveDownwards-'.concat(parameters.listItemId)).firstChild.style.color = '#606060';
                    }
                    //Else, if the new List Item is not the first one in the List...
                    else
                    {
                        //Set the previous List Item's 'Move Downwards' button to be black
                        document.getElementById('MoveDownwards-'.concat(lastListItemElement.id)).firstChild.style.color = 'black';

                        //Set the new List Item's 'Move Upwards' button to be black
                        document.getElementById('MoveUpwards-'.concat(parameters.listItemId)).firstChild.style.color = 'black';

                        //Set the new List Item's 'Move Downwards' button to be gray
                        document.getElementById('MoveDownwards-'.concat(parameters.listItemId)).firstChild.style.color = '#606060';
                    }

                    window.DebugController.Print("Added a List Item to the DOM. ListItem ID: " + parameters.listItemId);
                }
                else
                {
                    window.DebugController.LogError("ERROR: Tried to add a List Item, but the parent List could not be found. List ID expected: " + parameters.listId);
                }    
            },
            RemoveListItem: function() 
            {
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

                var listNameButton = getListItemNameButton(parameters.listItemId);

                if (listNameButton != null)
                {
                    if (parameters.quantityBalance != 0)
                    {
                        listNameButton.style.borderColor = 'peru'; //lightsalmon is also good
                    }
                    else if (parameters.quantityNeeded != 0)
                    {
                        listNameButton.style.borderColor = 'mediumseagreen';
                    }
                    else 
                    {
                        listNameButton.style.borderColor = 'rgb(77, 77, 77)'; //"darkgrey";
                    }  
                }
                else 
                { 
                    window.DebugController.LogError("ERROR: Could not find List Name button element which should be a grandchild of List Item wrapper element with ID: " + parameters.listItemId); 
                }  
            },
            ExpandSettingsView: function() 
            {
                //TODO could use error handling

                var settingsView = document.getElementById('SettingsView-'.concat(parameters.id));

                $(settingsView).collapse('show');

                var editNameTextarea = document.getElementById('EditName-'.concat(parameters.id));
                
                editNameTextarea.focus(); 
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