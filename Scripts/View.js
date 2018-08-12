window.View = (function() 
{
    var elements = {  
        homeHeader : null,
        homeScreen : null,
        homeScreenListElements : null,
        listHeader : null,
        listTitle : null,
        listScreen : null,
        listScreenListElements : null
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

    //TODO change this. Maybe it should be part of Render, if it is even necessary
    function addHeaderToDom(data)
    {
        elements.listHeader.appendChild(data.headerElement); //TODO This is weird. Also, these should be renamed because it isn't very clear. The headerElement is for the Quantity Header section
    }

    function getListItemNameButton(listItemId)
    {
        console.log("Request to get name button of List Item with id: " + listItemId);

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
            else { console.log("ERROR: Could not find List Name wrapper element which should be a child of List Item wrapper element with ID: " + listItemId); }
        }
        else { console.log("ERROR: Could not find List Item wrapper element with ID: " + listItemId); }
    }

    //TODO How can you have the parameters param before the callback param but still have the former be optional?
    //TODO There are still a lot more things in GridManager that can be bound here
    //TODO standardize between parameters, parameters, options, data, etc.
    /**
     * 
     * @param {string} event The name used to identify the event being bound
     * @param {*} callback The function to call when the corresponding event has been triggered 
     * @param {object} parameters An optional object to pass containing any additional data needed to perform the bind. Possible parameters: id.
     */
    function bind(event, callback, parameters)
    {
        if (event === 'navigateHome') 
        {
            //Set the behavior for when the Home button is pressed
            document.getElementById('buttonHome').addEventListener('click', callback);         
        }
        else if (event === 'addList') 
        {
            //Set the behavior for when the Add List button is pressed
            document.getElementById('buttonAddList').addEventListener('click', callback);         
        }
        else if (event === 'addListItem') //TODO Bind and Render events should probably have distinct names
        {
            //Set the behavior for when the Add List Item button is pressed
            document.getElementById('buttonAddRow').addEventListener('click', callback);         
        }
        else if (event === 'deleteButtonPressed') 
        {
            //Set the behavior for when the Delete button is pressed in a List Item's Settings View

            var buttonDelete = document.getElementById('Delete-'.concat(parameters.listItemId));

            if (buttonDelete != null)
            {
                buttonDelete.addEventListener('click', callback);         
            }
            else
            {
                console.log("ERROR: Tried to add an event listener to a Delete button that couldn't be found. Delete button ID expected: " + 'Delete-'.concat(parameters.listItemId));
            }
        }
        else if (event === 'showPopover') 
        {
            console.log("Attempting to binding popover toggle of type: " + parameters.quantityType + ", and listItemId: " + parameters.listItemId);

            //TODO doesn't work because the element hasn't been added to DOM yet

            //Get the popover toggle element based on the given quantity type and List Item ID
            var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));


            //Set the behavior for when the popover is made visible
            $(toggle).on('shown.bs.popover', function() 
            {
                console.log("A Popover was shown");
                callback(toggle, parameters.quantityType); //TODO should not pass back an element
            });    
        }
        else if (event === 'decrementQuantity') 
        {
            document.getElementById('buttonMinus').addEventListener('click', function() 
            {
                callback(false);
            });         
        }
        else if (event === 'incrementQuantity') 
        {
            document.getElementById('buttonPlus').addEventListener('click', function() 
            {
                callback(true);
            });      
        }
    }

    function render(command, parameters)
    {
        // var self = this;

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
            showListScreen: function() 
            {
                //Hide the Home Header when an individual List is displayed
                elements.homeHeader.hidden = true;

                //Hide the Home Screen when an individual List is displayed
                elements.homeScreen.hidden = true;

                //Set the List title
                elements.listTitle.textContent = parameters.listName;
                
                //Show the List Header when an individual List is displayed
                elements.listHeader.hidden = false;

                //Show the List Screen when an individual List is displayed
                elements.listScreen.hidden = false;
            },
            addList: function() 
            {
                //Add the List Toggle element to the DOM, under the Home Screen List Elements div
                elements.homeScreenListElements.appendChild(parameters.listToggleElement);
                
                //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                //Add the List element to the DOM, under the List Screen List Elements div
                elements.listScreenListElements.appendChild(parameters.listElement);
            },
            removeList: function() 
            {
                //Remove the List element from the Lists wrapper
                elements.listScreenListElements.removeChild(parameters.listElement);

                //Remove the List Toggle element from the Lists of Lists wrapper
                elements.homeScreenListElements.removeChild(parameters.listToggleElement);
            },
            addListItem: function() //TODO New vs Existing? Should they be distinguished? Probably not...
            {
                //TODO this is a temporary hack to add the List Item as a child of the List in the DOM
                document.getElementById(parameters.listId).appendChild(window.TemplateManager.CreateListItemFromTemplate(parameters));
            
                console.log("Added a List Item to the DOM. ListItem ID: " + parameters.listItemId);
            },
            removeListItem: function() 
            {
                document.getElementById(parameters.listItemId).remove();
            },
            updateModifierValue: function() //Expected parameters: listItemId, quantityType, updatedValue
            {
                console.log("Request to update quantity value. ListItem ID: " + parameters.listItemId + ". Quantity type: " + parameters.quantityType + ". New value: " + parameters.updatedValue);

                //TODO can we save references to the list item quantity modifiers to not always have to search for them
                //TODO Would it help to use data-id instead of element ID?

                //Get the popover toggle element based on the given quantity type and List Item ID
                var toggle = document.getElementById(parameters.quantityType.concat('QuantityToggle-').concat(parameters.listItemId));

                //Update the text content of the quanity toggle to the new value
                if (toggle != null)
                {
                    toggle.text = parameters.updatedValue;
                }
                else
                {
                    console.log("ERROR: Tried to update the value of a quantity toggle that could not be found");
                }
            },
            updateListItemNameColor: function() //Expected parameters: listItemId, quantityNeeded, quantityBalance
            {
                console.log("Request to update color of list item with id: " + parameters.listItemId);

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
                    console.log("ERROR: Could not find List Name button element which should be a grandchild of List Item wrapper element with ID: " + parameters.listItemId); 
                }  
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
        AddHeaderToDom : addHeaderToDom,
        Bind: bind,
        Render: render,
        GetListItemNameButton : getListItemNameButton //TODO this should not be exposed publicly. Done Temporarily as a hack
    };
})();