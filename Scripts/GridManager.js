window.GridManager = function()
{
    document.addEventListener('DOMContentLoaded', Setup);    

    var activePopover = null; //TODO should there be a separate popover manager? Maybe if Grid and ItemRow classes split out from this, it will not be necessary
    var activeSettingsView = null;
    var grids = [];
    var activeGrid;
    var rowCounter = 0;

    function Setup()
    {
        // $(document).ready(function(){
        //     console.log("Enabling popovers");
        //     $('[data-toggle="popover"]').popover()
        // });
    
        SetupGrids();
        SetupInteractibles();
        LoadDataFromStorage();
    }

    /** Grid & Button Setup **/

    function SetupGrids()
    {
        var gridElements = document.getElementsByClassName('grid');

        for (var i = 0; i < gridElements.length; i++)
        {
            grids.push(new Grid(gridElements[i]));
        }

        activeGrid = GetVisibleGrid();
        
        SwitchGrids(2, "Test"); //This is just for test purposes
    }

    function SetupInteractibles()
    {
        var categoryButtons = document.getElementsByClassName('buttonCategory');

        for (var i = 0; i < categoryButtons.length; i++)
        {
            categoryButtons[i] .addEventListener('click', CategorySelected); 
        }

        document.getElementById('buttonAddRow').onclick = AddNewRow;

        //TODO class data could be contained in the QuantityType object
        //CreatePopoverForQuantityHeader('col header', 'fa fa-pie-chart fa-lg', QuantityType.Needed);
        CreatePopoverForQuantityHeader('col header', 'fa fa-suitcase fa-lg', QuantityType.Luggage);
        CreatePopoverForQuantityHeader('col header', 'fa fa-male fa-lg', QuantityType.Wearing);
        CreatePopoverForQuantityHeader('col header smallicon', 'fa fa-briefcase', QuantityType.Backpack);
    }

    function GetVisibleGrid()
    {
        for (var i = 0; i < grids.length; i++)
        {
            if (grids[i].GetElement().hidden == false)
            {
                return grids[i];
            }
        }
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
        //console.log('There are ' + gridData.length + ' grids saved in local storage.');
        for (var i = 0; i < gridData.length; i++)
        {
            console.log("Regenerating Grid " + i + " ----------");

            for (var j = 0; j < gridData[i].length; j++)
            {
                //console.log("Grid: " + i + ". Row: " + j + ". Item: " + gridData[i][j][0]);
                grids[i].AddRow(gridData[i][j][0], gridData[i][j][1], gridData[i][j][2], gridData[i][j][3], gridData[i][j][4]);
            }
        }
    }

    function SaveDataToStorage()
    {
        SaveNameValuePairToLocalStorage('gridData', JSON.stringify(GetStorageData()));
    }

    function GetStorageData()
    {
        var gridData = [];

        for (var i = 0; i < grids.length; i++)
        {
            gridData.push(grids[i].GetStorageData());
        }

        return gridData;
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
        //console.log("Request received to switch grids to grid index: " + indexToDisplay);
        activeGrid.ToggleElementVisibility();
        activeGrid = grids[indexToDisplay];
        activeGrid.ToggleElementVisibility();

        document.getElementById('buttonCurrentCategory').textContent = categoryTextToDisplay;
    }

    function AddNewRow()
    {
        activeGrid.AddRow("", 0, 0, 0, 0).ExpandSettings();
        SaveDataToStorage(); 
    }

    /** Experimental & In Progress **/

    //TODO It doesn't really make sense for this to be in a 'GridManager'
    function CreatePopoverForQuantityHeader(divClass, iconClass, quantityHeaderIndex)
    {
        var buttonClear = CreateButtonWithIcon('buttonClear', 'btn btn-lg buttonClear', 'fa fa-lg fa-eraser');

        var iconToggle = CreateNewElement('i', [ ['class',iconClass] ]);    
        var popoverToggle = CreatePopoverToggle('', iconToggle, [buttonClear], 'focus');
        
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            console.log("A Header Popover was shown");
            document.getElementById('buttonClear').addEventListener('click', function()
            {
                //console.log("A Clear button was pressed");
                activeGrid.ClearQuantityColumnValues(quantityHeaderIndex);
                SaveDataToStorage();
            });
            //console.log("Added an onclick event listener to a Clear button");
        });

        var divWrapper = CreateNewElement('div', [ ['class',divClass] ], popoverToggle);
        document.getElementById('headerRow').appendChild(divWrapper);
    }

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
        // SetActiveSettingsView : function(settingsView)
        // {
        //     activeSettingsView = settingsView;
        // },
        ToggleActiveSettingsView : function(newSettingsView)
        {     
            if (activeSettingsView != null)
            {
                $(activeSettingsView).collapse('hide');
            }
            activeSettingsView = newSettingsView;
        },
        GridModified : function()
        {
            SaveDataToStorage();
        },
        GetNextRowId : function()
        {
            rowCounter++;
            return rowCounter;
        }
        // CollapseSettings : function()
        // {
        //     for (var i = 0; i < grids.length; i++)
        //     {    
        //         grids[i].CollapseSettings();
        //     }
        // }
    };
}();

//TODO expand this to also contain class data for the headers
var QuantityType = {
    Needed: 0,
    Luggage: 1,
    Wearing: 2,
    Backpack: 3,
};