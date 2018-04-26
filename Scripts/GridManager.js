window.GridManager = function()
{
    document.addEventListener('DOMContentLoaded', Setup);    

    var activePopover = null; //TODO should there be a separate popover manager? 
    var activeSettingsView = null;
    var activeListSettingsView = null;    
    var headers = [];
    var grids = [];
    var activeGrid;
    var rowCounter = 0;
    var listCounter = -1; //TODO this is super hacky and TEMP

    /** Grid & Button Setup **/

    function Setup()
    {            
        SetupHeaders();

        LoadDataFromStorage();

        SwitchLists(2); //TODO This is hard-coded for test purposes. Will need a proper solution eventually to determine what grid should be active by default

        SetupInteractibles();
    }

    function SetupInteractibles()
    {
        document.getElementById('buttonAddList').onclick = AddNewList;
        document.getElementById('buttonAddRow').onclick = AddNewRow;
        document.getElementById('buttonSwitchLists').onclick = ToggleListOfLists;

        document.getElementById('buttonAddChecklistItem').onclick = AddNewChecklistItem;
    }

    function SetupHeaders()
    {
        var header = new Header(ListType.Travel);
        headers.push(header);
        document.getElementById('headerRow').appendChild(header.GetElement());

        header = new Header(ListType.Checklist);
        headers.push(header);
        document.getElementById('headerRow').appendChild(header.GetElement());
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
            var list = new Grid(storageData[i][storedFormat.ListNameIndex], storageData[i][storedFormat.ListTypeIndex], GetNextListId());
            AddListElementsToDOM(list.GetElement(), list.GetToggle().GetElement());

            //TODO the console logs have the wrong indeces
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

            grids.push(list);
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

        for (var i = 0; i < grids.length; i++)
        {
            data.push(grids[i].GetDataForStorage());
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
        if (activeGrid != null)
        {
            activeGrid.AddNewRow();
            SaveDataToStorage(); 
        }
        else
        {
            console.log("ERROR: Tried to add a row to the Active List, which doesn't exist");
        }
    }

    function AddNewChecklistItem()
    {
        if (activeGrid != null)
        {
            activeGrid.AddNewChecklistItem();
            //SaveDataToStorage(); 
        }
        else
        {
            console.log("ERROR: Tried to add a row to the Active List, which doesn't exist");
        }
    }

    function AddNewList()
    {
        var list = new Grid("New List", ListType.Travel, GetNextListId());
        grids.push(list);
        AddListElementsToDOM(list.GetElement(), list.GetToggle().GetElement());
        //SwitchLists((grids.length-1), list.GetName());            
        SaveDataToStorage(); 
    }

    function AddListElementsToDOM(elementList, elementListToggle)
    {
        //Add the list 
        document.getElementById('lists').appendChild(elementList);
        
        //Add the list toggle
        document.getElementById('listOfLists').insertBefore(elementListToggle, document.getElementById('newListRow'));
    }

    function SwitchLists(indexToDisplay)
    {   
        console.log("Request received to switch grids to grid index: " + indexToDisplay);
        
        if (indexToDisplay < grids.length)
        {
            var listToDisplay = grids[indexToDisplay];

            if (listToDisplay.GetType() != null)
            {
                var headerToDisplay = headers[listToDisplay.GetType()];
                
                if (headerToDisplay != null)
                {
                    HideActiveGrid();

                    activeGrid = listToDisplay;
                    activeGrid.ToggleElementVisibility();  
                    headerToDisplay.ToggleElementVisibility();
                    document.getElementById('headerCurrentListName').textContent = activeGrid.GetName();
                }
                else
                {
                    console.log("ERROR: Tried to display a header which doesn't exist");
                }
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

    /** Experimental & In Progress **/

    function HideActiveGrid()
    {
        if (activeGrid != null)
        {
            if (activeGrid.GetType() != null)
            {   
                var activeHeader = headers[activeGrid.GetType()];

                if (activeHeader != null)
                {
                    activeGrid.ToggleElementVisibility();
                    activeGrid = null;
                    activeHeader.ToggleElementVisibility(); //TODO this could be more efficient
                    GridManager.ToggleActiveSettingsView(null); //If there is any active row settings view, close it
                    document.getElementById('headerCurrentListName').textContent = '';
                }
                else
                {
                    console.log("ERROR: Tried to hide a header which doesn't exist");
                }
            }
            else
            {
                console.log("ERROR: Tried to hide a list which has a ListType of null");
            }
        }
    }

    function ToggleListOfLists()
    {
        if (this.classList.contains('collapsed')) //If the List of Lists is currently closed, open it
        {
            console.log("Opening the List of Lists");
            OpenListOfLists();
        }
    }

    function OpenListOfLists()
    {
        //CloseActiveSettingsViews();
        HideActiveGrid();

        document.getElementById('headerCurrentListName').textContent = 'All Lists';

        document.getElementById('newItemRow').hidden = true; //TODO this is super hacky. Make this better
    }

    function CloseListOfLists()
    {
        GridManager.ToggleActiveListSettingsView(null); //If there is any active list settings view, close it
        $('#listOfLists').collapse('hide');

        if (activeGrid != null)
        {
            document.getElementById('headerCurrentListName').textContent = activeGrid.GetName();   
            
            document.getElementById('newItemRow').hidden = false; //TODO this is super hacky. Make this better
        }
    }

    // function CloseActiveSettingsViews()
    // {
    //     GridManager.ToggleActiveSettingsView(null); //If there is any active row settings view, close it
    //     //GridManager.ToggleActiveListSettingsView(null); //If there is any active list settings view, close it
    // }

    // function AddNewList()
    // {
    //     AddList("New List", ListType.Travel, GetNextListId());
    // }

    // function AddList(name, type, id)
    // {
    //     var list = new Grid(name, type, id);
    //     AddListElementsToDOM(list.GetElement(), list.GetToggle().GetElement());
    //     grids.push(list);

    //     SwitchLists((grids.length-1), list.GetName());            

    //     SaveDataToStorage(); 
    // }

            // var pressTimer;
        // list.GetDropdownToggleButton().addEventListener
        // (
        //     'mousedown', 
        //     function()
        //     {
        //         console.log("Mouse Down");
        //         pressTimer = window.setTimeout(function(){ EditListName(this)},1000);
        //         return false; 
        //     }
        // ); 

        // list.GetDropdownToggleButton().addEventListener
        // (
        //     'mouseup', 
        //     function()
        //     {
        //         console.log("Mouse Up");     
        //         if (activeListSettingsView == null)
        //         {
        //             CategorySelected(this);
        //         }   
        //         else
        //         {
        //             console.log("Longpress detected");
        //         }                

        //         clearTimeout(pressTimer);
        //         activeListSettingsView = null;
        //         return false;
        //     }
        // ); 

    /** Public Functions **/

    return { //TODO maybe only calls should be made here (e.g. getters/setters), not actual changes
        RemoveRow : function(rowElementToRemove)
        {        
            activeGrid.RemoveRow(rowElementToRemove);
            SaveDataToStorage();
        },
        RemoveList : function(listElementToRemove)
        {        
            var index = $(listElementToRemove).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary

            console.log("Index of list to be removed: " + index + ". Class name of list to be removed: " + listElementToRemove.className);  
            
            if(index > -1) 
            {
                document.getElementById('lists').removeChild(grids[index].GetElement());
                document.getElementById('listOfLists').removeChild(listElementToRemove);
                grids.splice(index, 1);
                
                console.log("Removed list at index " + index + ". Number of Lists is now: " + grids.length);
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

            //If a new Settings View has been selected, set it as Active
                //Else, if no new view is selected, just clear the Active view
            if (newSettingsView != null)
            {
                activeSettingsView = newSettingsView;
            }
            else
            {
                activeSettingsView = null;
            }
        },
        ToggleActiveListSettingsView : function(newSettingsView) //TODO these two methods could be private and also merged as one, and pass which view to toggle as param. Can track these in their own object
        {     
            //If there is a Settings View currently active, hide it
            if (activeListSettingsView != null)
            {
                $(activeListSettingsView).collapse('hide');
            }

            //If a new Settings View has been selected, set it as Active
                //Else, if no new view is selected, just clear the Active view
            if (newSettingsView != null)
            {
                activeListSettingsView = newSettingsView;
            }
            else
            {
                activeListSettingsView = null;
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
            console.log("Button pressed to clear column " + columnIndex + " for grid " + activeGrid);
            activeGrid.ClearQuantityColumnValues(columnIndex);
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
                
                console.log("List Toggle Element selected: " + elementListToggle + ". index: " + index);
                
                if (typeof(index) == "undefined")
                {
                    console.log("ERROR: the index of the selected element is undefined");
                }
                else
                {
                    if (index != grids.indexOf(activeGrid)) //If the list toggle selected is different from the one currently active, switch lists to the selected one
                    {
                        SwitchLists(index);
                    }
    
                    CloseListOfLists();
                }
            }
        }
    };
}();

//TODO expand this to also contain class data for the headers
var QuantityType = {
    Needed: 0,
    Luggage: 1,
    Wearing: 2,
    Backpack: 3,
};

var ChecklistColumns = {
    Needed: 0,
    Cart: 1,
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