window.GridManager = function()
{
    document.addEventListener('DOMContentLoaded', Setup);    

    var activePopover = null; //TODO should there be a separate popover manager? 
    var activeSettingsView = null;
    var headers = [];
    var grids = [];
    var activeGrid;
    var rowCounter = 0;
    var currentFormatVersion = 'fv0';

    function Setup()
    {            
        SetupHeaders();

        LoadDataFromStorage();

        SwitchGrids(2, "Test"); //TODO This is hard-coded for test purposes. Will need a proper solution eventually to determine what grid should be active by default

        SetupInteractibles();
    }

    /** Grid & Button Setup **/

    function SetupInteractibles()
    {
        var categoryButtons = document.getElementsByClassName('buttonCategory');

        for (var i = 0; i < categoryButtons.length; i++)
        {
            categoryButtons[i].addEventListener('click', CategorySelected); 
        }

        document.getElementById('buttonAddRow').onclick = AddNewRow;
    }

    // function GetVisibleGrid()
    // {
    //     for (var i = 0; i < grids.length; i++)
    //     {
    //         if (grids[i].GetElement().hidden == false)
    //         {
    //             return grids[i];
    //         }
    //     }
    // }

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
        var formatVersion = gridData[0];
        console.log("The parsed Format Version is: " + formatVersion);

        if (formatVersion != currentFormatVersion)
        {
            console.log("The data in storage is in an old format. Parsing it using legacy code.")
            console.log('There are ' + gridData.length + ' grids saved in local storage.');
            for (var i = 0; i < gridData.length; i++) //Traverse all the grid data saved in local storage
            {
                var gridElement = CreateNewElement('div', [ ['class','container-fluid grid'], ['hidden', 'true'] ]);
                document.body.insertBefore(gridElement, document.getElementById('newRow'));
                var grid = new Grid(gridElement, ListType.Travel);
    
                console.log("Regenerating Grid. Index: " + i + " Type: " + gridData[i][0] + " ----------");
                for (var j = 0; j < gridData[i].length; j++) //Traverse all the rows belonging to the current grid, in local storage
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
        else if (formatVersion == currentFormatVersion)
        {
            console.log("The data in storage is in the current format.");
            console.log("There are " + ((gridData.length) - 1) + " grids saved in local storage.");
            for (var i = 1; i < gridData.length; i++) //Traverse all the grid data saved in local storage
            {
                var gridElement = CreateNewElement('div', [ ['class','container-fluid grid'], ['hidden', 'true'] ]);
                document.body.insertBefore(gridElement, document.getElementById('newRow'));
                var grid = new Grid(gridElement, gridData[i][0]);
    
                console.log("Regenerating Grid. Index: " + i + " Type: " + gridData[i][0] + " ----------");
                for (var j = 1; j < gridData[i].length; j++) //Traverse all the rows belonging to the current grid, in local storage
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
    }

    function SaveDataToStorage()
    {
        SaveNameValuePairToLocalStorage('gridData', JSON.stringify(GetDataForStorage()));
    }

    function GetDataForStorage()
    {
        var data = [];

        data.push(currentFormatVersion);

        for (var i = 0; i < grids.length; i++)
        {
            data.push(grids[i].GetDataForStorage());
        }

        return data;
    }

    /** Button Interactions **/

    function CategorySelected()
    {   
        //If the category selected is different from the one currently active, switch grids to the selected category
        if (this.dataset.gridindex != grids.indexOf(activeGrid))
        {
            SwitchGrids(this.dataset.gridindex, this.textContent);
        }
    }

    function SwitchGrids(indexToDisplay, categoryTextToDisplay)
    {
        console.log("Request received to switch grids to grid index: " + indexToDisplay);

        GridManager.ToggleActiveSettingsView(null);

        //TODO Maybe the two checks below could be merged into one. 
            //I think perhaps the we should not de-activate the current grid if there is no valid one to switch to. We should just error out right away.

        if (activeGrid != null)
        {
            var listType = activeGrid.GetType();

            if (listType != null)
            {   
                if (headers[listType] != null)
                {
                    activeGrid.ToggleElementVisibility();   
                    activeGrid = null;
                    headers[listType].ToggleElementVisibility(); //TODO this could be more efficient
                    document.getElementById('buttonCurrentCategory').textContent = '';
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

        if (indexToDisplay < grids.length)
        {
            var listToDisplay = grids[indexToDisplay];
            var listType = listToDisplay.GetType()

            if (listType != null)
            {
                var headerToDisplay = headers[listType];
                
                if (headerToDisplay != null)
                {
                    activeGrid = listToDisplay;
                    activeGrid.ToggleElementVisibility();  
                    headerToDisplay.ToggleElementVisibility();
                    document.getElementById('buttonCurrentCategory').textContent = categoryTextToDisplay;
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