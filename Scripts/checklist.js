document.addEventListener('DOMContentLoaded', Start);

function Start()
{
    document.getElementById('buttonAddRow').onclick = GridManager.AddNewRow;
    document.getElementById('buttonSaveToStorage').onclick = StoreGrid;
    document.getElementById('buttonLoadFromStorage').onclick = LoadGrid;
    //document.getElementById('buttonAddQuantity').onclick = AddQuantity;
    //document.getElementById('buttonReduceQuantity').onclick = ReduceQuantity;
}

function StoreGrid()
{
    SaveNameValuePairToLocalStorage('rowValues', JSON.stringify(GridManager.GetAllRowValues()));
}

function LoadGrid()
{
    GridManager.RecreateRowsFromStorage(JSON.parse(LoadValueFromLocalStorage('rowValues')));
}

/*** helper Functions ***/

// TODO change from SessionStorage to LocalStorage when ready
function SaveNameValuePairToLocalStorage(name, value)
{
    if (typeof(Storage) !== "undefined") 
    {
        sessionStorage.setItem(name, value);
        console.log('Pair added to sesion storage, with name "' + name + '" and value "' + value + '".');
    } 
    else 
    {
        alert('No Local Storage Available');
    }
}

// TODO change from SessionStorage to LocalStorage when ready
function LoadValueFromLocalStorage(name)
{
    if (typeof(Storage) !== "undefined") 
    {
        console.log('Request to load value for "' + name +'" from session storage.');        
        return sessionStorage.getItem(name);
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