document.addEventListener('DOMContentLoaded', Start);

function Start()
{
    GridManager.SetupGrids();
    document.getElementById('buttonAddRow').onclick = GridManager.AddNewRow;

    // $(document).ready(function(){
    //     console.log("Enabling popovers");
    //     $('[data-toggle="popover"]').popover()
    // });

    LoadGrid();
}

function StoreGrid()
{
    SaveNameValuePairToLocalStorage('gridData', JSON.stringify(GridManager.GetStorageData()));
}

function LoadGrid()
{
    var gridData = LoadValueFromLocalStorage('gridData');

    if (gridData != null)
    {
        console.log("Loaded from Local Storage: " + gridData);
        GridManager.ReloadGridDataFromStorage(JSON.parse(gridData));        
    }    
    else
    {
        console.log("Could not find row data saved in local storage.");
    }
}

/*** helper Functions ***/

function SaveNameValuePairToLocalStorage(name, value)
{
    if (typeof(Storage) !== "undefined") 
    {
        localStorage.setItem(name, value);
        console.log('Pair added to localstorage, with name "' + name + '" and value "' + value + '".');
    } 
    else 
    {
        alert('No Local Storage Available');
    }
}

function LoadValueFromLocalStorage(name)
{
    if (typeof(Storage) !== "undefined") 
    {
        console.log('Request to load value for "' + name +'" from localstorage.');        
        return localStorage.getItem(name);
    } 
    else 
    {
        alert('No Local Storage Available');
    }
}

//TODO move these elsewhere
function htmlEscape(str) 
{
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function htmlUnescape(str)
{
    return str
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}