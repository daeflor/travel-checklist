window.GridManager = (function()
{
    //Initiate Setup once the DOM content has loaded
    document.addEventListener('DOMContentLoaded', Setup);

    var activePopover = null; //TODO should there be a separate popover manager? 
    var activeSettingsView = null; //TODO could this be moved into the View? 
    var lists = [];
    var activeList;
    var rowCounter = 0;
    var listCounter = -1; //TODO this is super hacky and TEMP. Is it really?... Other idea for IDs: List0Item0, List1Item4, List2Item12, etc. or instead could use GetDateTime().

    /** Storage - TEMP **/ //TODO This is temp

    function SaveDataToStorage()
    {
        var data = [];

        console.log("Current Format Version is: " + CurrentStorageDataFormat.Version);
        data.push(CurrentStorageDataFormat.Version);

        for (var i = 0; i < lists.length; i++)
        {
            data.push(lists[i].GetDataForStorage());
        }

        window.StorageManager.SaveDataToStorage(data);
    }

    /** List & Button Setup **/

    function Setup()
    {            
        //Once the DOM content has loaded and Setup initiated, remove the event listener
        document.removeEventListener('DOMContentLoaded', Setup);

        var header = new Header(ListType.Travel);
        window.View.Init();
        window.View.AddHeaderToDom({headerElement: header.GetElement()})

        window.View.Bind('NavigateHome', NavigateHome);
        window.View.Bind('AddList', AddNewList);
        window.View.Bind('AddRow', AddNewRow);

        window.StorageManager.LoadDataFromStorage();
    }

    /** List Management **/

    // function GetNextListId()
    // {
    //     listCounter++;
    //     return listCounter;
    // }

    function AddNewRow()
    {
        if (activeList != null)
        {
            activeList.AddNewRow();
            SaveDataToStorage(); 
        }
        else
        {
            console.log("ERROR: Tried to add a row to the Active List, which doesn't exist");
        }
    }

    function AddNewList()
    {
        var list = new List({name:'', type:ListType.Travel, id:window.GridManager.GetNextListId()});
        
        lists.push(list);

        //TODO do something with the Model here, first
        window.View.Render('addList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});
        
        list.GetToggle().ExpandSettings(); 
  
        SaveDataToStorage(); 
    }

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
                if (activeList != null)
                {
                    activeList.ToggleElementVisibility();
                }

                //Set the selected List as Active
                activeList = listToDisplay;

                //Display the selected List
                activeList.ToggleElementVisibility();  

                //TODO do something with the Model here

                //Udate the List Title text
                window.View.Render('setListTitle', {listName:activeList.GetName()});
            }
            else
            {
                console.log("Navigating to the list which was already Active");
            }

            //If there is any active settings view, close it
            window.GridManager.ToggleActiveSettingsView(null);

            //Display the List Screen
            window.View.Render('showListScreen'); 
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
        window.GridManager.ToggleActiveSettingsView(null);

        //TODO Do something with the Model here (e.g. update it)
        window.View.Render('showHomeScreen'); 
        //TODO can hiding the Active settings view be part of showing the home screen?
    }

    /** Experimental & In Progress **/

    /** Public Functions **/

    return { //TODO maybe only calls should be made here (e.g. getters/setters), not actual changes
        RemoveRow : function(rowElementToRemove)
        {        
            if (activeList != null)
            {
                activeList.RemoveRow(rowElementToRemove);
                SaveDataToStorage(); 
            }
            else
            {
                console.log("ERROR: Tried to remove a row from the Active List, which doesn't exist");
            }
        },
        RemoveList : function(listElementToRemove)
        {        
            var index = $(listElementToRemove).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary

            console.log("Index of list to be removed: " + index + ". Class name of list to be removed: " + listElementToRemove.className);  
            
            if(index > -1) 
            {
                //TODO Do something with the Model here, no?
                window.View.Render('removeList', {listElement:lists[index].GetElement(), listToggleElement:listElementToRemove});

                lists.splice(index, 1);
                
                console.log("Removed list at index " + index + ". Number of Lists is now: " + lists.length);
            }
            else
            {
                console.log("Failed to remove list. List index returned invalid value.");
            }

            SaveDataToStorage();
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
        GridModified : function()
        {
            SaveDataToStorage();
        },
        GetNextRowId : function()
        {
            rowCounter++;
            return rowCounter;
        },
        GetNextListId : function()
        {
            listCounter++;
            return listCounter;
        },
        ClearButtonPressed : function(columnIndex)
        {
            if (activeList != null)
            {
                console.log("Button pressed to clear column " + columnIndex + " for grid " + activeList);
                activeList.ClearQuantityColumnValues(columnIndex);
                SaveDataToStorage();
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
                    //CloseHomeScreen();
                }
            }
        },
        AddListFromStorage : function(list) //TODO this one and the one below shoudl be temporary during storage refactor
        {
            lists.push(list);
        },
        GetListDataForStorage : function()
        {
            lists.push(list);
        }
    };
})();

//TODO Consider moving this to a separate file?
var QuantityType = {
    Needed: {
        index: 0,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-pie-chart fa-lg iconHeader'
    },
    Luggage: {
        index: 1,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-suitcase fa-lg iconHeader'
    },
    Wearing: {
        index: 2,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-male fa-lg iconHeader'
    },
    Backpack: {
        index: 3,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader toggleSmallIcon',
        iconClass: 'fa fa-briefcase iconHeader'
    },
};

var ListType = {
    Travel: 0,
    Checklist: 1,
};

