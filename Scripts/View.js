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
                // else { console.log("ERROR: Could not find List Name button element which should be a grandchild of List Item wrapper element with ID: " + parameter.listItemId); }
            }
            else { console.log("ERROR: Could not find List Name wrapper element which should be a child of List Item wrapper element with ID: " + parameter.listItemId); }
        }
        else { console.log("ERROR: Could not find List Item wrapper element with ID: " + parameter.listItemId); }
    }

    //TODO There are still a lot more things in GridManager that can be bound here
    function bind(event, callback)
    {
        // var self = this;

        if (event === 'NavigateHome') 
        {
            //Set the behavior for when the Home button is pressed
            document.getElementById('buttonHome').addEventListener('click', callback);         
        }
        else if (event === 'AddList') 
        {
            //Set the behavior for when the Add List button is pressed
            document.getElementById('buttonAddList').addEventListener('click', callback);         
        }
        else if (event === 'AddListItem') 
        {
            //Set the behavior for when the Add Row button is pressed
            document.getElementById('buttonAddRow').addEventListener('click', callback);         
        }
    }

    function render(command, parameter)
    {
        // var self = this;

        var viewCommands = {
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
                elements.listTitle.textContent = parameter.listName;
                
                //Show the List Header when an individual List is displayed
                elements.listHeader.hidden = false;

                //Show the List Screen when an individual List is displayed
                elements.listScreen.hidden = false;
            },
            addList: function() 
            {
                //Add the List Toggle element to the DOM, under the Home Screen List Elements div
                elements.homeScreenListElements.appendChild(parameter.listToggleElement);
                
                //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                //Add the List element to the DOM, under the List Screen List Elements div
                elements.listScreenListElements.appendChild(parameter.listElement);
            },
            removeList: function() 
            {
                //Remove the List element from the Lists wrapper
                elements.listScreenListElements.removeChild(parameter.listElement);

                //Remove the List Toggle element from the Lists of Lists wrapper
                elements.homeScreenListElements.removeChild(parameter.listToggleElement);
            },
            addListItem: function() //TODO New vs Existing? Should they be distinguished? Probably not...
            {
                // //TODO Could all these calls below be moved to a Template file, this being the new List Item template?

                // //Create the div wrapper for the entire List Item
                // var wrapper = CreateNewElement('div', [ ['id',parameter.listItemId], ['class','row divItemRow'] ]);

                // //Create the name toggle that can be selected to open or close the Settings View for the List Item
                // var nameToggle = CreateToggleForCollapsibleView('edit-row-'.concat(parameter.listItemId), 'buttonListItem buttonListItemName', parameter.listItemName);
                
                // //Create the div wrapper for the List Item Name, with the name toggle as a child 
                // var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], nameToggle);

                // //Add the List Item Name to the DOM as a child of the List Item div wrapper
                // wrapper.appendChild(nameWrapper);

                // //Add the Modifier elements to the DOM as children of the List Item div wrapper
                // for (var i = 0; i < parameter.modifiers.length; i++)
                // {
                //     console.log("Added a modifier with index " + i + " to ListItem with ID: " + parameter.listItemId);
                //     wrapper.appendChild(parameter.modifiers[i].GetWrapper()); //TODO see if this is really necessary or if it can be done a better way
                // }  

                // //Create the Settings View for the List Item
                // CreateRowSettingsView(parameter.listItemId, parameter.settings, nameToggle, function() {
                //     wrapper.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
                // });

                // //TODO After the list item gets created, the controller should call to bind the new buttons to events

                // //Add the Settings View to the DOM as a child of the List Item div wrapper
                // wrapper.appendChild(parameter.settings.wrapper);   

                // //TODO a BIND call should be used for this instead
                // //Add an event listener to the Delete Button to remove the List Item
                // parameter.settings.buttonDelete.addEventListener('click', function() {   
                //     window.GridManager.RemoveRow(wrapper);
                // });

                //TODO this is a temporary hack to add the List Item as a child of the List in the DOM
                document.getElementById(parameter.listId).appendChild(window.TemplateManager.CreateListItemFromTemplate(parameter));
            },
            updateListItemColor: function() 
            {
                console.log("Request to update color of list item with id: " + parameter.listItemId);

                //TODO might be easier to just set the data-id to the same value for all elements that are part of a single List Item.. Hmm maybe not because then you'd have to figure out which of those elements you're looking for
                    //TODO maybe could just set custom IDs to particular elements (e.g. 'listItemName-745382490375' )
                
                var listNameButton = getListItemNameButton(parameter.listItemId);

                if (listNameButton != null)
                {
                    //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare the 'needed' counter with the 'packed' counter)
                    if (parameter.quantityBalance != 0)
                    {
                        listNameButton.style.borderColor = 'peru'; //lightsalmon is also good
                    }
                    else if (parameter.quantityNeeded != 0)
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
                    console.log("ERROR: Could not find List Name button element which should be a grandchild of List Item wrapper element with ID: " + parameter.listItemId); 
                }  
            }
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