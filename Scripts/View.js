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

        //TODO this is temp
        document.getElementById('versionNumber').innerText = VERSION;
    }

    //TODO is this still necessary now that new ID naming convention is used (i.e. ElementType-ID)
    function getListItemNameButton(listItemId)
    {
        Print("Request to get name button of List Item with id: " + listItemId);

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
            else { LogError("ERROR: Could not find List Name wrapper element which should be a child of List Item wrapper element with ID: " + listItemId); }
        }
        else { LogError("ERROR: Could not find List Item wrapper element with ID: " + listItemId); }
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
     * 
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
                LogError("ERROR: Tried to add an event listener to a Delete button that couldn't be found. Delete button ID expected: " + 'Delete-'.concat(parameters.id));
            }
        }
        // else if (event === 'PopoverShown') 
        // {
        //     var toggle;

        //     //TODO it's kind of weird assuming that the Header was being bound simply because ID wasn't defined. That could also mean an error occurred. 
        //     if (parameters.id == null)
        //     {
        //         //If no ID was given, then find the Quantity Header Toggle for the given type
        //         toggle = document.getElementById(parameters.quantityType.concat('QuantityHeaderToggle'));
        //     }
        //     else 
        //     {
        //         //Else, find the popover toggle element based on the given quantity type and List Item ID
        //         console.log("Attempting to binding popover toggle of type: " + parameters.quantityType + ", and listItemId: " + parameters.listItemId);
        //         toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));
        //     }

        //     //Set the behavior for when the popover is made visible
        //     $(toggle).on('shown.bs.popover', function() 
        //     {
        //         console.log("A Popover was shown");
        //         callback(toggle, parameters.quantityType); //TODO should not pass back an element
        //     });    
        // }
        else if (event === 'QuantityPopoverShown') 
        {
            //Find the popover toggle element based on the given quantity type and List Item ID
            Print("Attempting to binding popover toggle of type: " + parameters.quantityType + ", and listItemId: " + parameters.listItemId);
            var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));

            //Set the behavior for when the popover is made visible
            $(toggle).on('shown.bs.popover', function() 
            {
                Print("A Popover was shown");
                callback(toggle, parameters.quantityType); //TODO should not pass back an element
            });    
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
                LogError("ERROR: Tried to add an event listener to an Edit Name Text Area that couldn't be found. Text Area ID expected: " + 'EditName-'.concat(parameters.id));
            }  
        }
        else if (event === 'ClickDetected')
        {
            document.addEventListener('click', callback);
            Print("An onclick listener was added to the whole document");
        }
    }

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
                Print("Request received to create and render List Toggle & Wrapper for List ID: " + parameters.listId);

                //Add the List Toggle element to the DOM, under the Home Screen List Elements div
                elements.homeScreenListElements.appendChild(window.CustomTemplates.CreateListToggleFromTemplate(parameters));
                //elements.homeScreenListElements.appendChild(parameters.listToggleElement);
                
                //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                //Add the List element to the DOM, under the List Screen List Elements div
                elements.listScreenListElements.appendChild(window.CustomTemplates.CreateListWrapperFromTemplate(parameters.listId));

            },
            removeList: function() //Expected parameters: listId
            {
                //Remove the List element from the Lists wrapper
                document.getElementById(parameters.listId).remove();
                //elements.listScreenListElements.removeChild(parameters.listElement);

                //Remove the List Toggle element from the Lists of Lists wrapper
                document.getElementById('ListToggle-'.concat(parameters.listId)).remove();
                //elements.homeScreenListElements.removeChild(parameters.listToggleElement);
            },
            AddListItem: function() 
            {
                var listWrapper = document.getElementById(parameters.listId);
                
                if (listWrapper != null)
                {
                    listWrapper.appendChild(window.CustomTemplates.CreateListItemFromTemplate(parameters));
                    Print("Added a List Item to the DOM. ListItem ID: " + parameters.listItemId);
                }
                else
                {
                    LogError("ERROR: Tried to add a List Item, but the parent List could not be found. List ID expected: " + parameters.listId);
                }      
            },
            removeListItem: function() 
            {
                document.getElementById(parameters.listItemId).remove();
            },
            updateListItemQuantityText: function() //Expected parameters: listItemId, quantityType, updatedValue
            {
                Print("Request to update quantity value. ListItem ID: " + parameters.listItemId + ". Quantity type: " + parameters.quantityType + ". New value: " + parameters.updatedValue);

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
                    LogError("ERROR: Tried to update the value of a quantity toggle that could not be found");
                }
            },
            updateListItemNameColor: function() //Expected parameters: listItemId, quantityNeeded, quantityBalance
            {
                Print("Request to update color of list item with id: " + parameters.listItemId);

                var listNameButton = getListItemNameButton(parameters.listItemId);

                if (listNameButton != null)
                {
                    //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare the 'needed' counter with the 'packed' counter)
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
                    LogError("ERROR: Could not find List Name button element which should be a grandchild of List Item wrapper element with ID: " + parameters.listItemId); 
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
            }         
            // updateListItemQuantityValue: function() 
            // {
            //     //TODO it would be nice to somehow distinguish between a quantity value being changed by the user, and the initial setting of all the quantity values when loaded from storage. For the latter, the color doesn't need to get updated until all the values are set for a particular ListItem

            //     console.log("Request to update color of list item with id: " + parameters.listItemId);

            //     //TODO can/should we save references to the list item quantity modifiers to not always have to search for them
            //     //Get the popover toggle element based on the given quantity type and List Item ID
            //     var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));

            //     toggle.text = parameters.updatedValue;

            //     //TODO might be easier to just set the data-id to the same value for all elements that are part of a single List Item.. Hmm maybe not because then you'd have to figure out which of those elements you're looking for
            //         //TODO maybe could just set custom IDs to particular elements (e.g. 'listItemName-745382490375' )
                
            //     var listNameButton = getListItemNameButton(parameters.listItemId);

            //     if (listNameButton != null)
            //     {
            //         //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare the 'needed' counter with the 'packed' counter)
            //         if (parameters.quantityBalance != 0)
            //         {
            //             listNameButton.style.borderColor = 'peru'; //lightsalmon is also good
            //         }
            //         else if (parameters.quantityNeeded != 0)
            //         {
            //             listNameButton.style.borderColor = 'mediumseagreen';
            //         }
            //         else 
            //         {
            //             listNameButton.style.borderColor = 'rgb(77, 77, 77)'; //"darkgrey";
            //         }  
            //     }
            //     else 
            //     { 
            //         console.log("ERROR: Could not find List Name button element which should be a grandchild of List Item wrapper element with ID: " + parameters.listItemId); 
            //     } 
            // }
        };

        viewCommands[command]();
    }

    return {
        Init : init,
        Bind: bind,
        Render: render,
    };
})();