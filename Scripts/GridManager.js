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

    function Setup()
    {            
        SetupHeaders();

        LoadDataFromStorage();

        SwitchLists(2); //TODO This is hard-coded for test purposes. Will need a proper solution eventually to determine what grid should be active by default

        SetupInteractibles();
    }

    /** Grid & Button Setup **/

    function SetupInteractibles()
    {
        document.getElementById('buttonAddList').onclick = AddNewList;
        document.getElementById('buttonAddRow').onclick = AddNewRow;
        document.getElementById('buttonCurrentList').onclick = function () 
        {
            GridManager.ToggleActiveSettingsView(null); //TODO Make these functions private 
            GridManager.ToggleActiveListSettingsView(null);
        };
    }

    function SetupHeaders()
    {
        var header = new Header(ListType.Travel);
        headers.push(header);
        document.getElementById('headerRow').appendChild(header.GetElement());

        //TODO somehow need to have the concept of grid knowing its header:
        //ListManager (All Lists)
        //  Headers
        //  List
        //    -> Header
        //    Items
        //      "Columns"/QuantityTrackers/Checkbox  
        // ?
        // Should get away from concept of grid, rows, and columns, since they are not being used that way exactly

        header = new Header(ListType.Checklist);
        headers.push(header);
        document.getElementById('headerRow').appendChild(header.GetElement());
    }

    /** Storage Management **/

    //TODO should probably have a separate Storage Manager file

    function LoadDataFromStorage()
    {
        var gridData = LoadValueFromLocalStorage('gridData');
    
        if (gridData != null)
        {
            console.log("Loaded from Local Storage: " + gridData);
            ReloadGridDataFromStorage(JSON.parse(gridData));        
        }    
        else
        {
            console.log("Could not find row data saved in local storage.");
        }
    }

    function ReloadGridDataFromStorage(gridData)
    {
        //TODO might be possible for this to be way more concise
            //First, determine what format version to use, then set temp format version to either previous or current
            //Then go through grid regeeneration using temp format

        var formatVersion = gridData[0];
        console.log("The parsed Format Version is: " + formatVersion + ". The current Format Version is: " + CurrentStorageDataFormat.Version);

        if (formatVersion != CurrentStorageDataFormat.Version)
        {
            console.log("The data in storage is in an old format. Parsing it using legacy code.")

            console.log("There are " + ((gridData.length) - PreviousStorageDataFormat.FirstListIndex) + " grids saved in local storage.");
            for (var i = PreviousStorageDataFormat.FirstListIndex; i < gridData.length; i++) //Traverse all the grid data saved in local storage
            {
                //document.body.insertBefore(gridElement, document.getElementById('newRow'));
                var grid = new Grid('NewList', gridData[i][PreviousStorageDataFormat.ListTypeIndex], GetNextListId());
                AddListElementsToDOM(grid.GetElement(), grid.GetToggle().GetElement());
                //var nameElement = CreateNewElement('button', [ ['class','dropdown-item buttonCategory'], ['data-gridindex',(i-PreviousStorageDataFormat.FirstListIndex)] ]); 
                //nameElement.textContent = grid.GetName();

                //nameElement.addEventListener('mousedown', CategorySelected); 
                
                //document.getElementById('listDropdown').insertBefore(nameElement, document.getElementById('buttonAddList'));

                console.log("Regenerating Grid. Index: " + (i-PreviousStorageDataFormat.FirstListIndex) + " Name: " + grid.GetName() + " Type: " + grid.GetType() + " ----------");
                for (var j = PreviousStorageDataFormat.FirstRowIndex; j < gridData[i].length; j++) //Traverse all the rows belonging to the current grid, in local storage
                {
                    if (grid.GetType() == ListType.Travel)
                    {
                        console.log("Grid: " + i + ". Row: " + j + ". Item: " + gridData[i][j][0]);
                        grid.AddRow(gridData[i][j][0], gridData[i][j][1], gridData[i][j][2], gridData[i][j][3], gridData[i][j][4]);
                    }
                    else if (grid.GetType() == ListType.Checklist)
                    {
                        //TODO
                    } 
                }
    
                grids.push(grid);
            }
        }
        else if (formatVersion == CurrentStorageDataFormat.Version)
        {
            console.log("The data in storage is in the current format.");

            console.log("There are " + ((gridData.length) - CurrentStorageDataFormat.FirstListIndex) + " grids saved in local storage.");
            for (var i = CurrentStorageDataFormat.FirstListIndex; i < gridData.length; i++) //Traverse all the grid data saved in local storage
            {
                var list = new Grid(gridData[i][CurrentStorageDataFormat.ListNameIndex], gridData[i][CurrentStorageDataFormat.ListTypeIndex], GetNextListId());
                AddListElementsToDOM(list.GetElement(), list.GetToggle().GetElement());

                //TODO the console logs have the wrong indeces
                console.log("Regenerating List. Index: " + (i-CurrentStorageDataFormat.FirstListIndex) + " Name: " + list.GetName() + " Type: " + list.GetType() + " ----------");
                for (var j = CurrentStorageDataFormat.FirstRowIndex; j < gridData[i].length; j++) //Traverse all the rows belonging to the current list, in local storage
                {
                    if (list.GetType() == ListType.Travel)
                    {
                        console.log("List: " + i + ". Row: " + j + ". Item: " + gridData[i][j][0]);
                        list.AddRow(gridData[i][j][0], gridData[i][j][1], gridData[i][j][2], gridData[i][j][3], gridData[i][j][4]);
                    }
                    else if (list.GetType() == ListType.Checklist)
                    {
                        //TODO
                    } 
                }
    
                grids.push(list);
            }
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

    /** Button Interactions **/

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

    /** Experimental & In Progress **/

    function GetNextListId()
    {
        listCounter++;
        return listCounter;
    }

    function AddListElementsToDOM(elementList, elementListToggle)
    {
        //Add the list 
        document.body.insertBefore(elementList, document.getElementById('newRow'));
        
        //Add the list toggle
        document.getElementById('listOfLists').insertBefore(elementListToggle, document.getElementById('buttonAddList'));
    }

    function AddNewList()
    {
        var list = new Grid("New List", ListType.Travel, GetNextListId());
        grids.push(list);
        AddListElementsToDOM(list.GetElement(), list.GetToggle().GetElement());
        SwitchLists((grids.length-1), list.GetName());            
        SaveDataToStorage(); 
    }

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
                                document.getElementById('buttonCurrentList').textContent = '';
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

                    activeGrid = listToDisplay;
                    activeGrid.ToggleElementVisibility();  
                    headerToDisplay.ToggleElementVisibility();
                    document.getElementById('buttonCurrentList').textContent = activeGrid.GetName();
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
        },//TODO Maybe should have an Interaction Manager (or popover manager) for these
        GetActivePopover : function()
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
        ToggleActiveListSettingsView : function(newSettingsView)
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
        ListSelected : function()
        {
            console.log("element selected: " + this + ". gridindex: " + this.dataset.gridindex);

            GridManager.ToggleActiveSettingsView(null); //If there is any active row settings view, close it
            GridManager.ToggleActiveListSettingsView(null); //If there is any active list settings view, close it

            if (typeof(this.dataset.gridindex) == "undefined")
            {
                console.log("ERROR: the grid index property of the selected element is undefined");
            }
            else if (this.dataset.gridindex == grids.indexOf(activeGrid)) //If the list toggle selected is the same as the one currently active, just hide the list of lists          
            {
                console.log("Selected the toggle for the active list. Closing list of lists.")
                $('#listOfLists').collapse('hide');
            }
            else //If the list toggle selected is different from the one currently active, switch lists to the selected one 
            {
                SwitchLists(this.dataset.gridindex);
                $('#listOfLists').collapse('hide');
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

var ListType = {
    Travel: 0,
    Checklist: 1,
};

var PreviousStorageDataFormat = {
    FirstListIndex: 1,
    ListNameIndex: 'n/a',
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