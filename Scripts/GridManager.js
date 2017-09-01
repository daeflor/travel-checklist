window.GridManager = function()
{
    document.addEventListener('DOMContentLoaded', Start);    

    var activePopover = null; //TODO should there be a separate popover manager? Maybe if Grid and ItemRow classes split out from this, it will not be necessary
    var grids = [];
    var activeGrid;

    function Start()
    {
        SetupGrids();
        document.getElementById('buttonAddRow').onclick = AddNewRow;
    
        // $(document).ready(function(){
        //     console.log("Enabling popovers");
        //     $('[data-toggle="popover"]').popover()
        // });
    
        LoadDataFromStorage();
    }

    /** Grid Setup & Storage Management **/

    function SetupGrids()
    {
        var gridElements = document.getElementsByClassName('grid');

        for (var i = 0; i < gridElements.length; i++)
        {
            grids.push(new Grid(gridElements[i]));
        }

        var categoryButtons = document.getElementsByClassName('buttonCategory');

        for (var i = 0; i < categoryButtons.length; i++)
        {
            categoryButtons[i] .addEventListener('click', CategorySelected); 
        }

        activeGrid = GetVisibleGrid();
        
        SwitchGrids(2, "Test"); //This is just for test purposes
    }

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
        console.log('There are ' + gridData.length + ' grids saved in local storage.');

        for (var i = 0; i < gridData.length; i++)
        {
            for (var j = 0; j < gridData[i].length; j++)
            {
                console.log("Grid: " + i + ". Row: " + j + ". Item: " + gridData[i][j][0]);
                
                //AddElementToGrid(CreateRow(rowValues[i][0], rowValues[i][1], rowValues[i][2], rowValues[i][3], rowValues[i][4]), false);
                
                //AddRowToGrid();

                grids[i].AddRow(gridData[i][j][0], gridData[i][j][1], gridData[i][j][2], gridData[i][j][3], gridData[i][j][4]);
            }
        }
    }

    function SaveDataToStorage()
    {
        SaveNameValuePairToLocalStorage('gridData', JSON.stringify(GetStorageData()));
    }


//TODO finish organizing (just moving around and labeling) functions below this
    
    function AddNewRow()
    {
        activeGrid.AddRow("", 0, 0, 0, 0);
        //GridManager.GridModified();
        SaveDataToStorage(); //TODO maybe these 'grid modified' calls should be done in the grid class.. Is it better though?...
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



    //TODO could/should (?) still have an Add method here in GridManager, that just calls Grid's add method and also the Update

    // function AddElementToGrid(elementToAdd, updateGrid=true)
    // {
    //     //console.log("Adding element to grid: " + elementToAdd + ". Before element: " + elementToPrecede + ". UpdateGrid value: " + updateGrid)
    //     activeGrid.appendChild(elementToAdd);  
       
    //     if (updateGrid == true)
    //     {
    //         UpdateGrid();        
    //     }    
    // }

    function RemoveElementFromGrid(elementToRemove)
    {
        //activeGrid.removeChild(elementToRemove);
        activeGrid.RemoveChildElement(elementToRemove);
        //GridManager.GridModified();
        SaveDataToStorage();
    }

    // function ModifyElementInGrid(element, attribute, value)
    // {
    //     element.setAttribute(attribute, value);
    //     UpdateGrid();
    // }

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

    /** Public Functions **/

    return { //TODO maybe only calls should be made here (e.g. getters/setters), not actual changes
        //TODO some of these could probably be moved into new Grid class, and Grid and Row 'classes' could be moved to a separate file, potentially
        RemoveRow : function(rowToRemove)
        {        
            var index = $(rowToRemove).index(); //TODO could use a custom data-index to avoid jquery, but doesn't seem necessary
            console.log("Index of row to be removed: " + index + ". Class name of row to be removed: " + rowToRemove.className);  
            if(index > -1) 
            {
                activeGrid.GetRowList().splice(index, 1);
                RemoveElementFromGrid(rowToRemove);
                console.log("Removed row at index " + index);
            }
            else
            {
                console.log("Failed to remove row from grid. Row index returned invalid value.");
            }
        },
        GetActivePopover : function()
        {
            return activePopover;
        },
        SetActivePopover : function(popover)
        {
            activePopover = popover;
        },
        HideActiveQuantityPopover : function(e)
        {     
            //TODO this is very hacky, and relies not only on my own class names but Bootstrap's too.
                //Does a quantity group function (object) make sense? To have this more controlled
            if (!e.target.className.includes('popover')) //ignore any clicks on any elements within a popover
            {
                document.removeEventListener('click', GridManager.HideActiveQuantityPopover);
                $(activePopover).popover('hide');
            }
        },
        GridModified : function()
        {
            SaveDataToStorage();
        }
    };
}();