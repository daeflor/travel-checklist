window.GridManager = (function()
{
    //Initiate Setup once the DOM content has loaded
    document.addEventListener('DOMContentLoaded', Setup);

    var activePopover = null; //TODO should there be a separate popover manager? 
    var activeSettingsView = null; //TODO could this be moved into the View? 
    var lists = [];
    var activeList;
    // var rowCounter = -1;
    // var listCounter = -1; //TODO this is super hacky and TEMP. Is it really?... Other idea for IDs: List0Item0, List1Item4, List2Item12, etc. or instead could use GetDateTime().

    /** Storage - TEMP **/ //TODO This is temp

    // function SaveDataToStorage()
    // {
    //     //console.log("Current Format Version is: " + CurrentStorageDataFormat.Version);

    //     var listData = [];     

    //     for (var i = 0; i < lists.length; i++)
    //     {
    //         listData.push(lists[i].GetDataForStorage());
    //     }

    //     var storageData = {
	// 		//formatVersion : CurrentStorageDataFormat.Version,
    //         lists : listData
    //     };

    //     window.StorageManager.StoreListData(storageData);
    // }

    /** List & Button Setup **/

    function Setup()
    {            
        //Once the DOM content has loaded and Setup initiated, remove the event listener
        document.removeEventListener('DOMContentLoaded', Setup);

        var header = new Header(ListType.Travel);
        window.View.Init();
        window.View.AddHeaderToDom({headerElement: header.GetElement()})

        window.View.Bind('navigateHome', NavigateHome);
        window.View.Bind('NewListButtonPressed', AddNewList);
        window.View.Bind('NewListItemButtonPressed', AddNewListItem);

        //TODO It's weird to be loading All List data but pasing a callback to Add one List. 
            //TODO Also the elements shouldn't be passed here. Should use IDs
        window.Model.LoadListData(function(list) {
            // window.View.Render('AddList', {listId:list.GetId(), listName:list.GetName()});
            lists.push(list);
        });


        //document.body.style.backgroundColor = 'pink';
    }

    /** List Management **/

    function AddNewList()
    {
        window.Model.CreateList(
            function(newList) {
                lists.push(new List(newList));
                window.View.Render('ExpandSettingsView', {id:newList.id});
            }
        );

        // var list = new List({name:'', type:ListType.Travel, id:new Date().getTime()});
        
        // lists.push(list);

        // Model.AddList();

        // //window.View.Render('AddListElements', {listId:list.GetId(), listName:''});
        // //window.View.Render('AddList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});
        
        // window.View.Render('ExpandSettingsView', {id:list.GetId()});
        // //list.GetToggle().ExpandSettings(); 
  
        // //SaveDataToStorage(); 
    }

    function AddNewListItem()
    {
        //TODO is there a better mechanism for doing error handling?
        if (activeList != null)
        {
            activeList.AddNewListItem(); 
            
            //TODO It's not really necessary to save to storage when adding a new list item (row) because there is no data, but it does make it easier for testing.
            //window.Model.AddListItem(activeList.GetId());
            //SaveDataToStorage(); 

            //TODO need to update View somehow.. Use templates? Not sure...
            // View.Render('addNewListItem', );
        }
        else
        {
            console.log("ERROR: Tried to add a new List Item to the Active List, which doesn't exist");
        }
    }

    //TODO Eventually use ID instead of index and get rid of the concept of Active List?
    function NavigateToList(indexToDisplay)
    {   
        console.log("Request received to switch lists to grid index: " + indexToDisplay);
        
        if (indexToDisplay < lists.length)
        {
            var listToDisplay = lists[indexToDisplay];

            //TODO move some (much) of this to the View

            if (listToDisplay != activeList)
            {
                //If there was a previous Active List, hide it
                // if (activeList != null)
                // {
                //     activeList.ToggleElementVisibility();
                // }

                //Set the selected List as Active
                activeList = listToDisplay;

                //Display the selected List
                //activeList.ToggleElementVisibility();  
            }
            else
            {
                console.log("Navigating to the list which was already Active");
            }

            //If there is any active settings view, close it
            window.View.Render('HideActiveSettingsView');
            //window.GridManager.ToggleActiveSettingsView(null);

            //Display the List Screen
            if (activeList != null)
            {
                //Show the List Screen and udate the List Title text
                window.View.Render('DisplayList', {listId:activeList.GetId()});
            }
            else
            {
                console.log("ERROR: Tried to display the Active List but it's null");
            }
        }
        else
        {
            console.log("ERROR: Tried to switch to a list which doesn't exist");
        }
    }

    function NavigateHome()
    {
        //TODO move some of this to the View

        //If there is any active settings view, close it
        window.View.Render('HideActiveSettingsView');
        //window.GridManager.ToggleActiveSettingsView(null);

        //TODO Do something with the Model here (e.g. update it)
        window.View.Render('showHomeScreen'); 
        //TODO can hiding the Active settings view be part of showing the home screen?
    }

    /** Experimental & In Progress **/

    /** Public Functions **/

    return { //TODO maybe only calls should be made here (e.g. getters/setters), not actual changes
        // RemoveList : function(listElementToRemove) //TODO change this whole thing to use list IDs
        // {        
        //     var index = $(listElementToRemove).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary

        //     console.log("Index of list to be removed: " + index + ". Class name of list to be removed: " + listElementToRemove.className);  
            
        //     if(index > -1) 
        //     {
        //         //TODO Do something with the Model here, no?
        //         //TODO Should probably send IDs instead of actual elements
        //         window.View.Render('removeList', {listElement:lists[index].GetElement(), listToggleElement:listElementToRemove});

        //         lists.splice(index, 1);
                
        //         console.log("Removed list at index " + index + ". Number of Lists is now: " + lists.length);
        //     }
        //     else
        //     {
        //         console.log("Failed to remove list. List index returned invalid value.");
        //     }

        //     //Model.RemoveList(<list id>);
        //     SaveDataToStorage();
        // },
        RemoveList : function(listId) //TODO it might be possible to merge this with the method to remove a ListItem at some point, once the middleman data (lists, rows, etc.) is cut out
        {
            for (var i = lists.length-1; i >= 0; i--)
            {
                if (lists[i].GetId() == listId)
                {
                    console.log("(Temp) Removing list with ID: " + listId);
                    lists.splice(i, 1);
                    break;
                }
            } 
    
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
            console.log("The Active Popover changed");
        },
        HideActiveQuantityPopover : function(e)
        {     
            //TODO this is very hacky, and relies not only on my own class names but Bootstrap's too.
                //Does a quantity group function (object) make sense? (and maybe a list?) To have this more controlled
            if (!e.target.className.includes('popover')) //ignore any clicks on any elements within a popover
            {
                document.removeEventListener('click', window.GridManager.HideActiveQuantityPopover);
                $(activePopover).popover('hide');
                console.log("The active popover was told to hide");
            }
        },
        ToggleActiveSettingsView : function(newSettingsView) //TODO Part of this should be moved to View
        {     
            //If there is a Settings View currently active, hide it
            if (activeSettingsView != null)
            {
                $(activeSettingsView).collapse('hide');
            }

            //If the new Settings View is defined (e.g. could be an actual Settings View or deliberately null), set it as the Active Settings View
            if (newSettingsView !== undefined)
            {
                activeSettingsView = newSettingsView;
            }
        },
        // GridModified : function()
        // {
        //     SaveDataToStorage();
        // },
        ClearButtonPressed : function(quantityType)
        {
            if (activeList != null)
            {
                console.log("Button pressed to clear " + quantityType + " column for grid " + activeList);
                activeList.ClearQuantityColumnValues(quantityType);
            }
            else
            {
                console.log("ERROR: Tried to clear a column in the Active List, which doesn't exist");
            }
        },
        ListSelected : function(elementListToggle)
        {   
            if (this == "undefined")
            {
                console.log("ERROR: no element selected");
            }
            else
            {
                var index = $(elementListToggle).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary
                
                console.log("List Toggle Element selected: " + elementListToggle + ". index: " + index);
                
                if (typeof(index) == "undefined")
                {
                    console.log("ERROR: the index of the selected element is undefined");
                }
                else
                {
                    NavigateToList(index);
                }
            }
        },
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

