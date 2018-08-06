window.View = (function() {

    var elements = {  
        listHeader : null,
        homeHeader : null,
        homeScreen : null,
        listsWrapper : null,
        listTitle : null,
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

    //TODO change this. It should be part of Render, if it is even necessary
    function addHeaderToDom(data)
    {
        elements.listHeader.appendChild(data.headerElement); //TODO This is weird. Also, these should be renamed because it isn't very clear. The headerElement is for the Quantity Header section
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
            // addNewListItem: function() 
            // {
                
            // }
            updateListItemColor: function() 
            {
                console.log("Request to update color of list item with id: " + parameter.listItemId);

                //TODO might be easier to just set the data-id to the same value for all elements that are part of a single List Item.. Hmm maybe not because then you'd have to figure out which of those elements you're looking for
                var listItemWrapper = document.getElementById(parameter.listItemId);

                if (listItemWrapper != null)
                {
                    var listNameWrapper = listItemWrapper.firstChild;
                    
                    if (listNameWrapper != null)
                    {
                        var listNameButton = listNameWrapper.firstChild;
    
                        if (listNameButton != null)
                        {
                            //TODO is there a cleaner way to keep track of this? (e.g. any time a modifier is adjusted, update a counter, then compare the 'needed' counter with the 'packed' counter)
                            if (parameter.quantityBalance != 0)
                            {
                                listNameButton.style.borderColor = 'peru'; //lightsalmon is also good
                                //TODO The View shouldn't be telling the Model to update a color...
                                //model.GetData().name.SetColor('peru'); //lightsalmon is also good
                            }
                            else if (parameter.quantityNeeded != 0)
                            {
                                listNameButton.style.borderColor = 'mediumseagreen';
                                // model.GetData().name.SetColor('mediumseagreen');
                            }
                            else 
                            {
                                listNameButton.style.borderColor = 'rgb(77, 77, 77)'; //"darkgrey";
                                //model.GetData().name.SetColor('rgb(77, 77, 77)'); //"darkgrey";
                            }     
                        }
                        else 
                        {
                            console.log("ERROR: Could not find List Name button element which should be a grandchild of List Item wrapper element with ID: " + parameter.listItemId);
                        }
                    }
                    else 
                    {
                        console.log("ERROR: Could not find List Name wrapper element which should be a child of List Item wrapper element with ID: " + parameter.listItemId);
                    }
                }
                else 
                {
                    console.log("ERROR: Could not find List Item wrapper element with ID: " + parameter.listItemId);
                }
            }
        };

        viewCommands[command]();
    }

    return {
        Init : init,
        AddHeaderToDom : addHeaderToDom,
        Bind: bind,
        Render: render
    };
})();