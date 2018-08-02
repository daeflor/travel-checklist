window.GridManager = function()
{
    //Initiate Setup once the DOM content has loaded
    document.addEventListener('DOMContentLoaded', Setup);

    var activePopover = null; //TODO should there be a separate popover manager? 
    var activeSettingsView = null;
    var lists = [];
    var activeList;
    var rowCounter = 0;
    var listCounter = -1; //TODO this is super hacky and TEMP

    //TODO idea for IDs: List0Item0, List1Item4, List2Item12, etc.

    /** List & Button Setup **/

    function Setup()
    {            
        //Once the DOM content has loaded and Setup initiated, remove the event listener
        document.removeEventListener('DOMContentLoaded', Setup);

        SetupListHeader();

        LoadDataFromStorage();

        SetupInteractibles();
    }

    function SetupInteractibles()
    {
        document.getElementById('buttonAddList').onclick = AddNewList;
        document.getElementById('buttonAddRow').onclick = AddNewRow;
        document.getElementById('buttonHome').onclick = NavigateHome;
    }

    function SetupListHeader()
    {
        var header = new Header(ListType.Travel);
        document.getElementById('divListHeader').appendChild(header.GetElement());
    }

    /** Storage Management **/

    //TODO should probably have a separate Storage Manager file

    function LoadDataFromStorage()
    {
        var storageData = LoadValueFromLocalStorage('gridData');
    
        if (storageData != null)
        {
            console.log("Loaded from Local Storage: " + storageData);
            ReloadListDataFromStorage(JSON.parse(storageData));        
        }    
        else
        {
            console.log("Could not find any list data saved in local storage.");
        }
    }

    function ReloadListDataFromStorage(storageData)
    {
        var storedFormatVersion = storageData[0];
        var storedFormat;

        console.log("The parsed Format Version from storage data is: " + storedFormatVersion + ". The current Format Version is: " + CurrentStorageDataFormat.Version);        

        if (storedFormatVersion == CurrentStorageDataFormat.Version)
        {
            storedFormat = CurrentStorageDataFormat;
            console.log("The data in storage is in the current format.");            
        }
        else
        {
            storedFormat = PreviousStorageDataFormat;
            console.log("The data in storage is in an old format. Parsing it using legacy code.")            
        }

        console.log("There are " + ((storageData.length) - storedFormat.FirstListIndex) + " lists saved in local storage.");
        
        //Traverse the data for all of the lists saved in local storage
        for (var i = storedFormat.FirstListIndex; i < storageData.length; i++) 
        {
            var list = new List({name:storageData[i][storedFormat.ListNameIndex], type:storageData[i][storedFormat.ListTypeIndex], id:GetNextListId()});
            AddListElementsToDOM(list.GetElement(), list.GetToggle().GetElement());

            console.log("Regenerating List. Index: " + (i-storedFormat.FirstListIndex) + " Name: " + list.GetName() + " Type: " + list.GetType() + " ----------");
            
            //Traverse all the rows belonging to the current list, in local storage
            for (var j = storedFormat.FirstRowIndex; j < storageData[i].length; j++) 
            {
                if (list.GetType() == ListType.Travel)
                {
                    console.log("List: " + (i-storedFormat.FirstListIndex) + ". Row: " + (j-storedFormat.FirstRowIndex) + ". Item: " + storageData[i][j][0]);
                    list.AddRow(storageData[i][j][0], storageData[i][j][1], storageData[i][j][2], storageData[i][j][3], storageData[i][j][4]);
                }
                else if (list.GetType() == ListType.Checklist)
                {
                    //TODO
                } 
            }

            lists.push(list);
        }
    }

    function SaveDataToStorage()
    {
        SaveNameValuePairToLocalStorage('gridData', JSON.stringify(GetDataForStorage()));
    }

    function GetDataForStorage()
    {
        var data = [];

        console.log("Current Format Version is: " + CurrentStorageDataFormat.Version);
        data.push(CurrentStorageDataFormat.Version);

        for (var i = 0; i < lists.length; i++)
        {
            data.push(lists[i].GetDataForStorage());
        }

        return data;
    }

    /** List Management **/

    function GetNextListId()
    {
        listCounter++;
        return listCounter;
    }

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
        var list = new List({name:'', type:ListType.Travel, id:GetNextListId()});
        
        lists.push(list);
        
        AddListElementsToDOM(list.GetElement(), list.GetToggle().GetElement());

        list.GetToggle().ExpandSettings();

        SaveDataToStorage(); 
    }

    function AddListElementsToDOM(elementList, elementListToggle)
    {
        //Add the list to the DOM
        document.getElementById('lists').appendChild(elementList);
        
        //Add the list toggle to the DOM
        document.getElementById('listOfLists').insertBefore(elementListToggle, document.getElementById('newListRow'));
    }

    function NavigateToList(indexToDisplay)
    {   
        console.log("Request received to switch lists to grid index: " + indexToDisplay);
        
        if (indexToDisplay < lists.length)
        {
            var listToDisplay = lists[indexToDisplay];

            if (listToDisplay.GetType() != null)
            {
                activeList = listToDisplay;
                activeList.ToggleElementVisibility();  
                UpdateListTitle(activeList.GetName());
            }
            else
            {
                console.log("ERROR: Tried to switch to a list which has a ListType of null");
            }
        }
        else
        {
            console.log("ERROR: Tried to switch to a grid which doesn't exist");
        }
    }

    function CloseListOfLists()
    {
        //If there is any active settings view, close it
        GridManager.ToggleActiveSettingsView(null);

        //TODO should have a separate section that abstracts away the element IDs and has a getter with a check that they are valid (error handling). That way if the IDs change, this section does not have to be updated. 

        //Hide the Home header when an individual List is displayed
        document.getElementById('divHomeHeader').hidden = true;

        //Hide the List of Lists when an individual List is displayed
        document.getElementById('listOfLists').hidden = true;
        
        //Show the List header when an individual List is displayed
        document.getElementById('divListHeader').hidden = false;

        SetVisibilityOfNewItemRow(true); //TODO this is super hacky. Make it better.
    }

    function NavigateHome()
    {
        //If there is any active settings view, close it
        GridManager.ToggleActiveSettingsView(null);

        console.log("Opening the List of Lists");

        //TODO should have a separate section that abstracts away the element IDs and has a getter with a check that they are valid (error handling). That way if the IDs change, this section does not have to be updated. 

        //Hide the List header when the Home screen (List of Lists) is displayed
        document.getElementById('divListHeader').hidden = true;

        //Show the Home header when the Home screen (List of Lists) is displayed
        document.getElementById('divHomeHeader').hidden = false;

        //Show the List of Lists when the Home screen is displayed
        document.getElementById('listOfLists').hidden = false;

        HideActiveList();
    
        SetVisibilityOfNewItemRow(false); //TODO this is super hacky. Make it better.
    }

    function HideActiveList()
    {
        if (activeList != null)
        {
            if (activeList.GetType() != null)
            {   
                activeList.ToggleElementVisibility();
                activeList = null;

                console.log("The Active list was hidden");
            }
            else
            {
                console.log("ERROR: Tried to hide a list which has a ListType of null");
            }
        }
        else
            {
                console.log("Tried to hide the Active List but there was none");
            }
    }

    /** Experimental & In Progress **/

    //TODO (maybe) split actual data (e.g. the 'name' string) from elements (e.g. the 'name' child element / object)
        //It might not be necessary in this particular case because the name should already be stored in the ListItem itself. In this case ALL we're doing here is updating the UI
    function UpdateListTitle(name)
    {
        document.getElementById('headerCurrentListName').textContent = name;
    }

    function SetVisibilityOfNewItemRow(enabled)
    {
        document.getElementById('newItemRow').hidden = !enabled;
    }

    /** Public Functions **/

    return { //TODO maybe only calls should be made here (e.g. getters/setters), not actual changes
        RemoveRow : function(rowElementToRemove)
        {        
            activeList.RemoveRow(rowElementToRemove);
            SaveDataToStorage();
        },
        RemoveList : function(listElementToRemove)
        {        
            var index = $(listElementToRemove).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary

            console.log("Index of list to be removed: " + index + ". Class name of list to be removed: " + listElementToRemove.className);  
            
            if(index > -1) 
            {
                document.getElementById('lists').removeChild(lists[index].GetElement());
                document.getElementById('listOfLists').removeChild(listElementToRemove);
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
                document.removeEventListener('click', GridManager.HideActiveQuantityPopover);
                $(activePopover).popover('hide');
                console.log("The active popover was told to hide");
            }
        },
        ToggleActiveSettingsView : function(newSettingsView)
        {     
            //If there is a Settings View currently active, hide it
            if (activeSettingsView != null)
            {
                $(activeSettingsView).collapse('hide');
            }

            //If the new Settings View is defined (e.g. could be an actual Settings view or deliberately null), set it as the Active Settings View
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
        ClearButtonPressed : function(columnIndex)
        {
            console.log("Button pressed to clear column " + columnIndex + " for grid " + activeList);
            activeList.ClearQuantityColumnValues(columnIndex);
            SaveDataToStorage();
        },
        ListSelected : function(elementListToggle)
        {   
            if (this == "undefined")
            {
                console.log("ERROR: no element selected");
            }
            else
            {
                var index = $(elementListToggle).index();
                
                console.log("List Toggle Element selected: " + elementListToggle + ". index: " + index + ". Index of current Active List is: " + lists.indexOf(activeList));
                
                if (typeof(index) == "undefined")
                {
                    console.log("ERROR: the index of the selected element is undefined");
                }
                else
                {
                    NavigateToList(index);
                    CloseListOfLists();
                }
            }
        }
    };
}();

//TODO Consider moving this to a separate file?
var QuantityType = {
    Needed: {
        index: 0,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-pie-chart fa-lg iconQuantityHeader'
    },
    Luggage: {
        index: 1,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-suitcase fa-lg iconQuantityHeader'
    },
    Wearing: {
        index: 2,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-male fa-lg iconQuantityHeader'
    },
    Backpack: {
        index: 3,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader toggleSmallIcon',
        iconClass: 'fa fa-briefcase iconQuantityHeader'
    },
};

var ListType = {
    Travel: 0,
    Checklist: 1,
};

var PreviousStorageDataFormat = {
    FirstListIndex: 1,
    ListNameIndex: 0,
    ListTypeIndex: 0,
    FirstRowIndex: 1,
};

var CurrentStorageDataFormat = {
    Version: 'fv1',
    FirstListIndex: 1,
    ListNameIndex: 0,
    ListTypeIndex: 1, //TODO this and above could be their own sub-object, contained within index 1
    FirstRowIndex: 2, //TODO this could then always be 1, even if new properties about the list need to be stored
};