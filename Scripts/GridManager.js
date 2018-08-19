window.GridManager = (function()
{
    //Initiate Setup once the DOM content has loaded
    document.addEventListener('DOMContentLoaded', Setup);

    var activePopover = null; //TODO should there be a separate popover manager? 
    //var activeSettingsView = null; //TODO could this be moved into the View? 
    var lists = [];
    //var activeList;

    /** List & Button Setup **/

    function Setup()
    {            
        //Once the DOM content has loaded and Setup initiated, remove the event listener
        document.removeEventListener('DOMContentLoaded', Setup);

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
        window.View.Bind('navigateHome', NavigateHome);
        window.View.Bind('NewListButtonPressed', AddNewList);
        window.View.Bind('NewListItemButtonPressed', AddNewListItem);

        //TODO It's weird to be loading All List data but pasing a callback to Add one List. 
        window.Model.LoadListData(function(list) {
            // window.View.Render('AddList', {listId:list.GetId(), listName:list.GetName()});
            lists.push(list);
        });


        //document.body.style.backgroundColor = 'pink';
    }

    /** List Management **/

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
                        Print("Clear button was clicked for quantity type: " + quantityType);

                        //if (activeList != null)
                        //{
                        //    Print("Button pressed to clear " + quantityType + " column for grid " + activeList);
                            //TODO temporarily commented out
                            //activeList.ClearQuantityColumnValues(quantityType);
                            window.Model.ClearListQuantityColumn(listId, quantityType, function(modifiedListItems) {
                                //Traverse the array of all List Items that had a quantity value cleared 
                                for (var i = 0; i < modifiedListItems.length; i++)
                                {
                                    //Update the List Item's quantity value for the given type
                                    updateListItemQuantityText(modifiedListItems[i].id, quantityType, modifiedListItems[i].quantities);
                                    
                                    //Update the List Item name's color
                                    updateListItemNameColor(modifiedListItems[i].id, modifiedListItems[i].quantities);
                                }
                            });
                        // }
                        // else
                        // {
                        //     console.log("ERROR: Tried to clear a column in the Active List, which doesn't exist");
                        // }
                    }
                );
            },
            {quantityType:quantityType}
        );
    }

    function loadListItem(listId, listItemId, listItemName, quantities)
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
                    window.GridManager.SetActivePopover(popoverToggle);

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
        
                    window.View.Bind('ClickDetected', window.GridManager.HideActiveQuantityPopover);
                },
                {listItemId:listItemId, quantityType:key}
            );
        }

        //When the animation to expand the Settings View starts, inform the View to hide the Active Settings View
        window.View.Bind(
            'SettingsViewExpansionStarted', 
            function(element) {
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

        window.View.Render(
            'ExpandSettingsView', 
            {id:listItemId}
        );
    }

    function updateListItemQuantityValue(listId, listItemId, quantityType, assignmentType)
    {
        Model.EditListItemQuantity(listId, listItemId, quantityType, assignmentType, function(updatedQuantities) {
            updateListItemQuantityText(listItemId, quantityType, updatedQuantities);
            updateListItemNameColor(listItemId, updatedQuantities);
        });
    }

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


    //

    function AddNewList()
    {
        window.Model.CreateList(
            function(newList) {
                lists.push(new List(newList));
                window.View.Render('ExpandSettingsView', {id:newList.id});
            }
        );
    }

    function AddNewListItem(listId)
    {
        window.Model.CreateListItem(
            listId,
            function(newListItem) 
            {
                loadListItem(listId, newListItem.id, newListItem.name, newListItem.quantities);

                // window.View.Render(
                //     'ExpandSettingsView', 
                //     {id:newListItem.id}
                // );
            }
        );

        // //TODO is there a better mechanism for doing error handling?
        // if (activeList != null)
        // {
        //     activeList.AddNewListItem(); 
        // }
        // else
        // {
        //     console.log("ERROR: Tried to add a new List Item to the Active List, which doesn't exist");
        // }
    }

    //TODO Eventually use ID instead of index and get rid of the concept of Active List?
    //function NavigateToList(indexToDisplay)
    function NavigateToList(listId)
    {   
        window.View.Render('HideActiveSettingsView');
        window.View.Render('DisplayList', {listId:listId});

        //Print("Request received to switch lists to grid index: " + indexToDisplay);
        
        // if (indexToDisplay < lists.length)
        // {
        //     var listToDisplay = lists[indexToDisplay];

        //     //TODO move some (much) of this to the View

        //     if (listToDisplay != activeList)
        //     {
        //         //Set the selected List as Active
        //         activeList = listToDisplay;
        //     }
        //     else
        //     {
        //         Print("Navigating to the list which was already Active");
        //     }

        //     //If there is any active settings view, close it
        //     window.View.Render('HideActiveSettingsView');

        //     //Display the List Screen
        //     if (activeList != null)
        //     {
        //         //Show the List Screen and udate the List Title text
        //         //window.View.Render('DisplayList', {listId:activeList.GetId()});
        //         window.View.Render('DisplayList', {listId:listId});
        //     }
        //     else
        //     {
        //         console.log("ERROR: Tried to display the Active List but it's null");
        //     }
        // }
        // else
        // {
        //     console.log("ERROR: Tried to switch to a list which doesn't exist");
        // }
    }

    function NavigateHome()
    {
        //If there is any active settings view, close it
        window.View.Render('HideActiveSettingsView');

        //Display the Home Screen
        window.View.Render('showHomeScreen'); 

        //TODO can hiding the Active settings view be part of showing the home screen?
    }

    /** Experimental & In Progress **/

    function getListIndex(listId)
    {
        for (var i = lists.length-1; i >= 0; i--)
        {
            if (lists[i].GetId() == listId)
            {
                return i;
            }
        } 

        console.log("ERROR: Tried to return the index of a List that could not be found.");
    }

    /** Public Functions **/

    return { //TODO This should just expose private methods publicly, there shouldn't actually be logic here.
        RemoveList : function(listId) //TODO it might be possible to merge this with the method to remove a ListItem at some point, once the middleman data (lists, rows, etc.) is cut out
        {
            lists.splice(getListIndex(listId), 1);
    
            Model.RemoveList(listId);
            window.View.Render('removeList', {listId:listId});
        },
        GetActivePopover : function() //TODO Maybe should have an Interaction Manager (or popover manager) for these
        {
            return activePopover;
        },
        SetActivePopover : function(popover)
        {
            activePopover = popover;
            Print("The Active Popover changed");
        },
        HideActiveQuantityPopover : function(e) //TODO this no longer needs to be public
        {     
            //TODO this is very hacky, and relies not only on my own class names but Bootstrap's too.
                //Does a quantity group function (object) make sense? (and maybe a list?) To have this more controlled
            if (!e.target.className.includes('popover')) //ignore any clicks on any elements within a popover
            {
                document.removeEventListener('click', window.GridManager.HideActiveQuantityPopover);
                $(activePopover).popover('hide');
                Print("The active popover was told to hide");
            }
        },
        ListSelected : NavigateToList
        // ListSelected : function(listId)
        // {   
        //     if (this == "undefined")
        //     {
        //         console.log("ERROR: no element selected");
        //     }
        //     else
        //     {
        //         var index = $(elementListToggle).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary
                
        //         Print("List Toggle Element selected: " + elementListToggle + ". index: " + index);
                
        //         if (typeof(index) == "undefined")
        //         {
        //             console.log("ERROR: the index of the selected element is undefined");
        //         }
        //         else
        //         {
        //             NavigateToList(index);
        //         }
        //     }
        // },
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