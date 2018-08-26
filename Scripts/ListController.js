window.ListController = (function()
{
    var quantityPopoverActive = false;

    //Initiate setup once the DOM content has loaded, and then remove this event listener after a single firing
    document.addEventListener('DOMContentLoaded', setup, {once:true});

    /** List & Button Setup **/

    function setup()
    {            
        window.View.Init();
        window.View.Render('ShowQuantityHeader'); //TODO right now this assumes the header to display is the Travel type

        //When a Quantity Header Popover is shown, add an event listener to the 'Clear' column button 
        for (var key in QuantityType)
        {
            bindQuantityHeaderToggleEvents(key);
        }

        //TODO would like all binds to be one-liners. (For-loops can be done in the methods instead of here). ^
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
                    addListItemToView(lists[i].id, lists[i].listItems[j])
                    //addListItemToView(lists[i].id, lists[i].listItems[j].id, lists[i].listItems[j].name, lists[i].listItems[j].quantities);
                }
            }
        });
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
                                updateListItemQuantityText(modifiedListItems[i], quantityType);
                                
                                //Update the List Item name's color
                                updateListItemNameColor(modifiedListItems[i]);
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

        //TODO this method could possibly be standardized and re-used for list item
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
                addListItemToView(listId, newListItem);
                //addListItemToView(listId, newListItem.id, newListItem.name, newListItem.quantities);
                
                //After the List Item is added to the DOM, expand its Settings View
                window.View.Render('ExpandSettingsView', {id:newListItem.id});
                //expandSettingsView(newListItem.id);
            }
        );
    }

    function addListItemToView(listId, listItem)
    //function addListItemToView(listId, listItemId, listItemName, quantities)
    {
        //TODO Maybe split this up into things that need to be rendered, and things that need to be bound

        //TODO would it be better to just pass a ListItem object and let the View parse it, rather than splitting up the params here?... Unsure...
        window.View.Render(
            'AddListItem', 
            { 
                listItemId: listItem.id, 
                listItemName: listItem.name,
                quantityValues: listItem.quantities,
                listId: listId, 
            }
        );

        //TODO The above could probably be separated from all the below. (and then go back to passing ListItemId as a parameter?)

        updateListItemNameColor(listItem);

        //Bind user interaction with the quantity toggles to corresponding behavior
        for (var key in listItem.quantities)
        {
            (function(lockedKey) //TODO is there a simpler way to do this?
            {
                var _showQuantityPopover = function(event) {
                    if (quantityPopoverActive == false)
                    {
                        window.DebugController.Print("A Quantity Popover will be shown, and events will be prevented from bubbling up.");

                        event.stopPropagation();
                        window.View.Render('ShowQuantityPopover', {listItemId:listItem.id, quantityType:lockedKey});   
                        quantityPopoverActive = true;
                    }
                };
    
                var _quantityPopoverShown = function() {
                    window.DebugController.Print("A Quantity Popover was shown.");

                    //TODO There might be a better way to do this, where these BINDs can be done when the +/- buttons are created and not when the popover is shown.
                    window.View.Bind('ClickDetectedOutsidePopover', _hideQuantityPopover, {listItemId:listItem.id, quantityType:lockedKey});   
                    window.View.Bind('DecrementQuantityButtonPressed', _decrementListItemQuantityValue);
                    window.View.Bind('IncrementQuantityButtonPressed', _incrementListItemQuantityValue);
                };
    
                var _decrementListItemQuantityValue = function() {   
                    updateListItemQuantityValue(listId, listItem.id, lockedKey, 'decrement');
                };
    
                var _incrementListItemQuantityValue = function() {
                    updateListItemQuantityValue(listId, listItem.id, lockedKey, 'increment');
                };
                
                var _hideQuantityPopover = function() {
                    window.DebugController.Print("A Quantity Popover will be hidden.");

                    window.View.Render('HideQuantityPopover', {listItemId:listItem.id, quantityType:lockedKey} );
                    quantityPopoverActive = false;
                };
    
                window.View.Bind('QuantityToggleSelected', _showQuantityPopover, {listItemId:listItem.id, quantityType:lockedKey});
    
                window.View.Bind('QuantityPopoverShown', _quantityPopoverShown, {listItemId:listItem.id, quantityType:lockedKey});    
            })(key);
        }

        //When the animation to expand the Settings View starts, inform the View to hide the Active Settings View
        //bindSettingsViewExpansion(listItemId);
        window.View.Bind(
            'SettingsViewExpansionStarted', 
            function() 
            {
                window.View.Render('HideActiveSettingsView'); 
            },
            {id:listItem.id}
        );

        //TODO might be nice to move the anonymous functions within the bindings above and below into named functions that are just reference by the bind, for potentially better readability
            //yeah it would be good to make this section smaller and more readable
            //TODO could have a completely separate method like editListItemNameInModelAndView 

        var updateName = function(updatedValue) 
        {
            //Set up the callback method to execute once the Model has been updated
            var updateView = function()
            {
                window.View.Render('UpdateName', {id:listItem.id, updatedValue:updatedValue}); 
            };

            //Update the Model
            window.Model.EditListItemName(listId, listItem.id, updateView, updatedValue);

        };

        //Add an event listener for when the Text Area to edit the List Item name is modified
        window.View.Bind('NameEdited', updateName, {id:listItem.id});

        // //Add an event listener for when the Text Area to edit the List Item name is modified
        // window.View.Bind(
        //     'NameEdited', 
        //     function(updatedValue) 
        //     {
        //         window.Model.EditListItemName(listId, listItem.id, updatedValue);
        //         window.View.Render('UpdateName', {id:listItem.id, updatedValue:updatedValue}); 
        //     },
        //     {id:listItem.id}
        // ); 

        //Add an event listener to the Delete Button to remove the List Item
        window.View.Bind(
            'DeleteButtonPressed', 
            function() 
            {
                removeListItem(listId, listItem.id);
            }, 
            {id:listItem.id}
        );

        //TODO would rather move the two calls below into one method that takes a direction (up or down)

        //Add an event listener to the Move Upwards Button to move the List Item upwards by one position in the List
        window.View.Bind(
            'MoveUpwardsButtonPressed', 
            function() 
            {
                window.Model.MoveListItemUpwards(listId, listItem.id, function(swapId) {
                    window.View.Render('SwapListObjects', {moveUpwardsId:listItem.id, moveDownwardsId:swapId});
                });
            }, 
            {id:listItem.id}
        );

        //Add an event listener to the Move Downwards Button to move the List Item downwards by one position in the List
        window.View.Bind(
            'MoveDownwardsButtonPressed', 
            function() 
            {
                window.DebugController.Print("Button pressed to swap List Item positions");

                window.Model.MoveListItemDownwards(listId, listItem.id, function(swapId) {
                    window.View.Render('SwapListObjects', {moveUpwardsId:swapId, moveDownwardsId:listItem.id});
                });
            }, 
            {id:listItem.id}
        );
    }

    //TODO I think there can probably be a ListController and a ListItemController. Except then it might not be possible to share functions across both in a logical way...

    function updateListItemQuantityValue(listId, listItemId, quantityType, assignmentType)
    {
        Model.EditListItemQuantity(listId, listItemId, quantityType, assignmentType, function(updatedListItem) {
            updateListItemQuantityText(updatedListItem, quantityType);
            updateListItemNameColor(updatedListItem);
        });
    }

    //TODO would it be better if View commands always received consistent paramters (e.g. a list object)

    function updateListItemQuantityText(listItem, quantityType)
    {
        window.View.Render('updateListItemQuantityText', {
            listItemId:listItem.id, 
            quantityType:quantityType, 
            updatedValue:listItem.quantities[quantityType]
        });
    }

    function updateListItemNameColor(listItem)
    {
        window.View.Render('updateListItemNameColor', {
            listItemId:listItem.id, 
            quantityNeeded:listItem.quantities.needed, 
            quantityBalance:(listItem.quantities.needed - listItem.quantities.luggage - listItem.quantities.wearing - listItem.quantities.backpack)
        });
    }

    function removeListItem(listId, listItemId)
    {
        Model.RemoveListItem(listId, listItemId);
        window.View.Render('removeListItem', {listItemId:listItemId});
    }

    /** Experimental & In Progress **/

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