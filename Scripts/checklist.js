document.addEventListener('DOMContentLoaded', Start);

function Start()
{
    document.getElementById('buttonAddRow').onclick = GridManager.AddNewRow;
    document.getElementById('buttonSaveToStorage').onclick = StoreGrid;
    //document.getElementById('buttonAddQuantity').onclick = AddQuantity;
    //document.getElementById('buttonReduceQuantity').onclick = ReduceQuantity;

    // $(document).ready(function(){
    //     console.log("Enabling popovers");
    //     $('[data-toggle="popover"]').popover()
    // });

    GridManager.SetGridDiv(document.getElementById('grid'));

    LoadGrid();
}

function StoreGrid()
{
    SaveNameValuePairToLocalStorage('rowValues', JSON.stringify(GridManager.GetAllRowValues()));
}

function LoadGrid()
{
    var rowValues = LoadValueFromLocalStorage('rowValues');

    if (rowValues != null)
    {
        console.log("Loaded from Local Storage: " + rowValues);
        GridManager.RecreateRowsFromStorage(JSON.parse(rowValues));        
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