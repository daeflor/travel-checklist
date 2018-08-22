window.View = (function() 
{
    //var self = this;

    //TODO The Bind and Render calls could all use error handling
    //TODO Shouldn't be passing element data to the View. The View should take care of that using IDs

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

    //TODO do something with this or remove it
    // function hideActiveSettingsView()
    // {
        
    // }

    //TODO Bind and Render events should probably have distinct names
    //TODO maybe Binds should be in the past tense (e.g. SettingsViewExpanded, ButtonPressed),
        //and Render should be commands (e.g. ExpandSettingsView, ShowHomeScreen)
        //Update all Bind and Render casing (e.g. upper vs lower) and naming convention to be consistent

    //TODO How can you have the parameters param before the callback param but still have the former be optional?
    //TODO There are still some things that can be bound here. ALL event listeners should be bound here
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
            //Set the behavior for when the Add List button is pressed
            document.getElementById('GoToList-'.concat(parameters.listId)).addEventListener('click', callback);         
        }
        else if (event === 'NewListItemButtonPressed') 
        {
            //Set the behavior for when the Add List Item button is pressed
            document.getElementById('buttonAddRow').addEventListener(
                'click', 
                function()
                {
                    callback(activeListId);
                }  
            );         
        }
        else if (event === 'DeleteButtonPressed') 
        {
            //Set the behavior for when the Delete button is pressed in a List Item's Settings View

            var buttonDelete = document.getElementById('Delete-'.concat(parameters.id));

            if (buttonDelete != null)
            {
                buttonDelete.addEventListener('click', callback);         
            }
            else
            {
                window.DebugController.LogError("ERROR: Tried to add an event listener to a Delete button that couldn't be found. Delete button ID expected: " + 'Delete-'.concat(parameters.id));
            }
        }
        else if (event === 'QuantityPopoverShown') 
        {
            window.DebugController.Print("Attempting to binding popover toggle of type: " + parameters.quantityType + ", and listItemId: " + parameters.listItemId);
            
            //Find the popover toggle element based on the given quantity type and List Item ID
            var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));

            //Set the behavior for when the popover is made visible
            $(toggle).on('shown.bs.popover', callback); 
        }
        else if (event === 'QuantityPopoverHidden') 
        {            
            //Find the popover toggle element based on the given quantity type and List Item ID
            var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));

            //Set the behavior for when the popover is made visible
            $(toggle).on('hidden.bs.popover', callback);    
        }
        else if (event === 'QuantityHeaderPopoverShown') //Expected parameters: quantityType
        {
            //Find the Quantity Header Toggle based on the given quantity type
            var toggle = document.getElementById(parameters.quantityType.concat('QuantityHeaderToggle'));

            //Set the behavior for when the popover is made visible
            $(toggle).on('shown.bs.popover', callback);  
        }
        else if (event === 'ClearButtonPressed') 
        {
            document.getElementById('buttonClear').addEventListener(
                'click', 
                function()
                {
                    callback(activeListId);
                }  
            ); 
        }
        else if (event === 'DecrementQuantityButtonPressed') 
        {
            document.getElementById('buttonMinus').addEventListener('click', callback);         
        }
        else if (event === 'IncrementQuantityButtonPressed')
        {
            document.getElementById('buttonPlus').addEventListener('click', callback);      
        }
        else if (event === 'SettingsViewExpansionStarted') //Expected parameters: id
        {
            var newSettingsView = document.getElementById('SettingsView-'.concat(parameters.id));

            $(newSettingsView).on('show.bs.collapse', function() 
            {
                //TODO If there is no callback (i.e. nothing for the Controller to do because activeSettingsView is now tracked in View),
                    //then maybe this doesn't make sense for a BIND...?
                //self.render('HideActiveSettingsView');
                callback(); //TODO don't really like the idea of having a callback and THEN still doing something... It implies the View does actually have knowledge of what is going on, and doesn't really seem correct
                elements.activeSettingsView = newSettingsView;
                // callback(newSettingsView); 
            });  

            //TODO would it make sense to keep track of the Active Settings View here (in the View) and in this method handle toggling it as needed
        }
        else if (event === 'NameEdited') //Expected parameters: id
        {
            var editNameTextarea = document.getElementById('EditName-'.concat(parameters.id));

            if (editNameTextarea != null)
            {
                editNameTextarea.addEventListener(
                    'change', 
                    function() {
                        callback(editNameTextarea.value);
                    }
                ); 
            }
            else
            {
                window.DebugController.LogError("ERROR: Tried to add an event listener to an Edit Name Text Area that couldn't be found. Text Area ID expected: " + 'EditName-'.concat(parameters.id));
            }  
        }
        else if (event === 'ClickDetectedOutsidePopover')
        {
            if (parameters.bindEnabled == true)
            {
                var toggleId = parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId);
                var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));

                //TODO fix callback
                document.getElementById('divChecklistBody').addEventListener('click', function(e) {
                    window.DebugController.Print("Click detected in the checklist body. Selected Toggle ID: " + toggleId);

                    callback();
                });

                window.DebugController.Print("An onclick listener was added to the checklist body");
            }
            else if (parameters.bindEnabled == false) //TODO should this be in a separate 'unbind' method?
            {
                document.getElementById('divChecklistBody').removeEventListener('click', callback);
                
                window.DebugController.Print("An onclick listener was removed from the checklist body");
            }
        }
        else if (event === 'QuantityToggleSelected')
        {
            var toggleId = parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId);
            
            //TODO fix callback
            document.getElementById(toggleId).addEventListener('click', function(event) {
                callback(event);
            });
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
                    if (elements.listScreenListElements.children[i].id == parameters.listId)
                    {
                        //If the List element matches the given listId, display that element
                        elements.listScreenListElements.children[i].hidden = false;

                        //Set the Active List ID
                        activeListId = parameters.listId;
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

                //Add the List Toggle element to the DOM, under the Home Screen List Elements div
                elements.homeScreenListElements.appendChild(window.CustomTemplates.CreateListToggleFromTemplate(parameters));
                
                //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                //Add the List element to the DOM, under the List Screen List Elements div
                elements.listScreenListElements.appendChild(window.CustomTemplates.CreateListWrapperFromTemplate(parameters.listId));

            },
            removeList: function() //Expected parameters: listId
            {
                //Remove the List element from the Lists wrapper
                document.getElementById(parameters.listId).remove();

                //Remove the List Toggle element from the Lists of Lists wrapper
                document.getElementById('ListToggle-'.concat(parameters.listId)).remove();
            },
            AddListItem: function() 
            {
                var listWrapper = document.getElementById(parameters.listId);
                
                if (listWrapper != null)
                {
                    listWrapper.appendChild(window.CustomTemplates.CreateListItemFromTemplate(parameters));
                    window.DebugController.Print("Added a List Item to the DOM. ListItem ID: " + parameters.listItemId);
                }
                else
                {
                    window.DebugController.LogError("ERROR: Tried to add a List Item, but the parent List could not be found. List ID expected: " + parameters.listId);
                }      
            },
            removeListItem: function() 
            {
                document.getElementById(parameters.listItemId).remove();
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
            }         
        };

        viewCommands[command]();
    }

    return {
        Init : init,
        Bind: bind,
        Render: render
    };
})();