window.ListController = (function()
{
    var activePopover = null; //TODO should there be a separate popover manager? 

    //Initiate setup once the DOM content has loaded
    document.addEventListener('DOMContentLoaded', setup);

    /** List & Button Setup **/

    function setup()
    {            
        //Once the DOM content has loaded and Setup initiated, remove the event listener
        document.removeEventListener('DOMContentLoaded', setup);

        //var header = new Header(ListType.Travel);
        window.View.Init();
        //window.View.AddHeaderToDom({headerElement: header.GetElement()});
        window.View.Render('ShowQuantityHeader'); //TODO right now this assumes the header to display is the Travel type

        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' column button 
        for (var key in QuantityType)
        {
            bindQuantityHeaderToggleEvents(key);
        }

        //TODO would like all binds to be one-liners. (For-loops can be done in the methods instead of here).
        window.View.Bind('HomeButtonPressed', NavigateHome);
        window.View.Bind('NewListButtonPressed', AddNewList);
        window.View.Bind('NewListItemButtonPressed', AddNewListItem);

        //TODO It's weird to be loading All List data but pasing a callback to Add one List. 
        window.Model.LoadData(function(lists) 
        {
            window.DebugController.Print("Number of Lists retrieved from Storage: " + lists.length);

            for (var i = 0; i < lists.length; i++) 
            {
                addListToView(lists[i]);

                for (var j = 0; j < lists[i].listItems.length; j++) 
                {
                    addListItemToView(lists[i].id, lists[i].listItems[j].id, lists[i].listItems[j].name, lists[i].listItems[j].quantities);
                }
            }
        });


        //TODO could add a small element to the UI that randomizes the color everytime the page loads
            //^ That won't actually help with anything 
        //document.body.style.backgroundColor = 'pink';
    }

    //TODO this is hard to read
    function bindQuantityHeaderToggleEvents(quantityType)
    {
        window.View.Bind(
            'QuantityHeaderPopoverShown', 
            function() {
                window.View.Bind(
                    'ClearButtonPressed', 
                    function(listId)
                    {
                        window.DebugController.Print("Clear button was clicked for quantity type: " + quantityType);

                        window.Model.ClearListQuantityColumn(listId, quantityType, function(modifiedListItems) 
                        {
                            //Traverse the array of all List Items that had a quantity value cleared 
                            for (var i = 0; i < modifiedListItems.length; i++)
                            {
                                //Update the List Item's quantity value for the given type
                                updateListItemQuantityText(modifiedListItems[i].id, quantityType, modifiedListItems[i].quantities);
                                
                                //Update the List Item name's color
                                updateListItemNameColor(modifiedListItems[i].id, modifiedListItems[i].quantities);
                            }
                        });
                    }
                );
            },
            {quantityType:quantityType}
        );
    }

    /** List Management **/

    function AddNewList()
    {
        //TODO should there be error checking to ensure all the data needed is actually provided when the List is created?

        window.Model.CreateList(function(data)
        {
            addListToView(data);

            //After the List is added to the DOM, expand its Settings View
            window.View.Render('ExpandSettingsView', {id:data.id});
            //expandSettingsView(data.id);
        });
    }

    function addListToView(data) //TODO don't really like using 'data' here
    {
        window.View.Render(
            'AddListElements', 
            {listId:data.id, listName:data.name}
        );

        //TODO this method can be standardized and re-used for list item
        //When the animation to expand the Settings View starts, change the Active Settings View
        //bindSettingsViewExpansion(data.id);
        window.View.Bind(
            'SettingsViewExpansionStarted', 
            function() 
            {
                window.View.Render('HideActiveSettingsView'); 
            },
            {id:data.id}
        );
    
        //When the Text Area to edit a list name gets modified, update the text in the List name toggle
        window.View.Bind(
            'NameEdited', 
            function(updatedValue) 
            {
                window.Model.EditListName(data.id, updatedValue);
                window.View.Render('UpdateName', {id:data.id, updatedValue:updatedValue}); 
            },
            {id:data.id}
        );
    
        //Add an event listener to the Delete Button to remove the List Item
        window.View.Bind(
            'DeleteButtonPressed', 
            function() 
            {
                //TODO it might be possible to merge this with the method to remove a ListItem at some point, once the middleman data (lists, rows, etc.) is cut out

                window.Model.RemoveList(data.id);
                window.View.Render('removeList', {listId:data.id});
            }, 
            {id:data.id}
        );

        //When the Go To List button is selected, navigate to that list
        window.View.Bind(
            'GoToListButtonPressed', 
            function() 
            {
                navigateToList(data.id);
            },
            {listId:data.id}
        );
    }

    function navigateToList(listId)
    {   
        //If there is any active settings view, close it
        window.View.Render('HideActiveSettingsView');

        //Display the specified List Screen
        window.View.Render('DisplayList', {listId:listId});
    }

    function NavigateHome()
    {
        //If there is any active settings view, close it
        window.View.Render('HideActiveSettingsView'); //TODO can hiding the Active settings view be part of showing the home screen?

        //Display the Home Screen
        window.View.Render('showHomeScreen'); 
    }

    function AddNewListItem(listId)
    {
        window.Model.CreateListItem(
            listId,
            function(newListItem) 
            {
                addListItemToView(listId, newListItem.id, newListItem.name, newListItem.quantities);
                
                //After the List Item is added to the DOM, expand its Settings View
                window.View.Render('ExpandSettingsView', {id:newListItem.id});
                //expandSettingsView(newListItem.id);
            }
        );
    }

    function addListItemToView(listId, listItemId, listItemName, quantities)
    {
        //TODO Maybe split this up into things that need to be rendered, and things that need to be bound

        window.View.Render(
            'AddListItem', 
            { //TODO would it be better to just pass a ListItem object and let the View parse it, rather than splitting up the params here?
                listItemId: listItemId, 
                listItemName: listItemName,
                quantityValues: quantities,
                listId: listId, //TODO Don't really like calling this data.id... If List always requires exact params, maybe should just have them explicitly stated
            }
        );

        updateListItemNameColor(listItemId, quantities);

        //Bind user interaction with the quantity toggles to corresponding behavior
        for (var key in quantities)
        {
            window.View.Bind(
                'QuantityPopoverShown', 
                function(popoverToggle, quantityType) 
                {
                    //TODO BAD
                    window.ListController.SetActivePopover(popoverToggle);

                    //TODO There might be a better way to do this, where the BIND can be done when the +/- buttons are created and not when the popover is shown.

                    window.View.Bind(
                        'DecrementQuantityButtonPressed', 
                        function()
                        {   
                            updateListItemQuantityValue(listId, listItemId, quantityType, 'decrement');
                        }
                    );
        
                    window.View.Bind(
                        'IncrementQuantityButtonPressed', 
                        function()
                        {
                            updateListItemQuantityValue(listId, listItemId, quantityType, 'increment');
                        }
                    );
        
                    window.View.Bind('ClickDetected', hideActiveQuantityPopover);
                },
                {listItemId:listItemId, quantityType:key}
            );
        }

        //When the animation to expand the Settings View starts, inform the View to hide the Active Settings View
        //bindSettingsViewExpansion(listItemId);
        window.View.Bind(
            'SettingsViewExpansionStarted', 
            function() {
                window.View.Render('HideActiveSettingsView'); 
            },
            {id:listItemId}
        );

        //TODO might be nice to move the anonymous functions within the bindings above and below into named functions that are just reference by the bind, for potentially better readability
            //yeah it would be good to make this section smaller and more readable

        //Add an event listener for when the Text Area to edit the List Item name is modified
        window.View.Bind(
            'NameEdited', 
            function(updatedValue) {
                window.Model.EditListItemName(listId, listItemId, updatedValue);
                window.View.Render('UpdateName', {id:listItemId, updatedValue:updatedValue}); 
            },
            {id:listItemId}
        ); 

        //Add an event listener to the Delete Button to remove the List Item
        window.View.Bind(
            'DeleteButtonPressed', 
            function() {
                removeListItem(listId, listItemId);
            }, 
            {id:listItemId}
        );
    }

    //TODO I think there can probably be a ListController and a ListItemController. Except then it might not be possible to share functions across both in a logical way...

    function updateListItemQuantityValue(listId, listItemId, quantityType, assignmentType)
    {
        Model.EditListItemQuantity(listId, listItemId, quantityType, assignmentType, function(updatedQuantities) {
            updateListItemQuantityText(listItemId, quantityType, updatedQuantities);
            updateListItemNameColor(listItemId, updatedQuantities);
        });
    }

    //TODO would it be better if View commands always received consistent paramters (e.g. a list object)

    function updateListItemQuantityText(listItemId, quantityType, updatedQuantities)
    {
        window.View.Render('updateListItemQuantityText', {
            listItemId:listItemId, 
            quantityType:quantityType, 
            updatedValue:updatedQuantities[quantityType]
        });
    }

    function updateListItemNameColor(listItemId, updatedQuantities)
    {
        window.View.Render('updateListItemNameColor', {
            listItemId:listItemId, 
            quantityNeeded:updatedQuantities.needed, 
            quantityBalance:(updatedQuantities.needed - updatedQuantities.luggage - updatedQuantities.wearing - updatedQuantities.backpack)
        });
    }

    function removeListItem(listId, listItemId)
    {
        Model.RemoveListItem(listId, listItemId);
        window.View.Render('removeListItem', {listItemId:listItemId});
    }

    /** Experimental & In Progress **/
    
    function hideActiveQuantityPopover(e) 
    {     
        //TODO this is very hacky, and relies not only on my own class names but Bootstrap's too.
            //Does a quantity group function (object) make sense? (and maybe a list?) To have this more controlled
        if (!e.target.className.includes('popover')) //ignore any clicks on any elements within a popover
        {
            document.removeEventListener('click', hideActiveQuantityPopover);
            $(activePopover).popover('hide');
            window.DebugController.Print("The active popover was told to hide");
        }
    }

    // function expandSettingsView(id)
    // {
    //     window.View.Render('ExpandSettingsView', {id:id});
    // }

    // function bindSettingsViewExpansion(id)
    // {
    //     //When the animation to expand a Settings View starts, hide the previously Active Settings View
    //     window.View.Bind(
    //         'SettingsViewExpansionStarted', 
    //         function() 
    //         {
    //             window.View.Render('HideActiveSettingsView'); 
    //         },
    //         {id:id}
    //     );
    // }

    /** Public Functions **/

    return { //TODO This should just expose private methods publicly, there shouldn't actually be logic here.
        GetActivePopover : function() //TODO Maybe should have an Interaction Manager (or popover manager) for these
        {
            return activePopover;
        },
        SetActivePopover : function(popover)
        {
            activePopover = popover;
            window.DebugController.Print("The Active Popover changed");
        }
    };
})();

//TODO Consider moving this to a separate file?
var QuantityType = {
    needed: {
        type: 'needed', //TODO this should be temp. Can the same be accomplished using 'key'?
        //index: 0,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-pie-chart fa-lg iconHeader'
    },
    luggage: {
        type: 'luggage',
        //index: 1,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-suitcase fa-lg iconHeader'
    },
    wearing: {
        type: 'wearing',
        //index: 2,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-male fa-lg iconHeader'
    },
    backpack: {
        type: 'backpack',
        //index: 3,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader toggleSmallIcon',
        iconClass: 'fa fa-briefcase iconHeader'
    },
};

var ListType = {
    Travel: 0,
    Checklist: 1,
};