document.addEventListener('DOMContentLoaded', Start);
//var rowList = [];

function Start()
{
    //console.log('Start called');
    document.getElementById('buttonAddRow').onclick = GridManager.AddNewRow;
    document.getElementById('buttonSaveToStorage').onclick = StoreGrid;
    document.getElementById('buttonLoadFromStorage').onclick = LoadGrid;
    //document.getElementById('buttonAddQuantity').onclick = AddQuantity;
    //document.getElementById('buttonReduceQuantity').onclick = ReduceQuantity;
}

function ItemRow(row, item, needed, packed, wearing)
{
    var row = row;

    var itemColumn = row.children[0];
    var needed = row.children[1].children[0];
    var packed = row.children[2].children[0];
    var wearing = row.children[3].children[0];
    var backpack = row.children[4].children[0];

    needed.oninput = SetItemColumnColor;
    packed.oninput = SetItemColumnColor;
    wearing.oninput = SetItemColumnColor;
    backpack.oninput = SetItemColumnColor;

    // function SetRowColor()
    // {
    //     //console.log("needed: " + needed.value + "; packed: " + packed.value + "; wearing: " + wearing.value + "; total prepared: " + totalPrepared);
    //     if (needed.value == 0)
    //     {
    //         row.style.backgroundColor = "grey";
    //     }
    //     else if (needed.value == (parseInt(packed.value) + parseInt(wearing.value)))
    //     {
    //         row.style.backgroundColor = "green";
    //     }
    //     else
    //     {
    //         row.style.backgroundColor = "orange";
    //     }
    // }

    function SetItemColumnColor()
    {
        if (needed.value == 0)
        {
            itemColumn.style.backgroundColor = "grey";
        }
        else if (needed.value == (parseInt(packed.value) + parseInt(wearing.value) + parseInt(backpack.value)))
        {
            itemColumn.style.backgroundColor = "green";
        }
        else
        {
            itemColumn.style.backgroundColor = "orange";
        }
    }
}

function AddInputElement(type, parent, value, cssClass, min)
{
    var input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.className = cssClass;
    input.min = min;
    parent.appendChild(input);
}

function AddRow()
{
    var divRow = document.createElement('div');
    divRow.className = "row"; 

    var divCol = document.createElement('div');
    divCol.className = "col-3"; 
    divCol.style.backgroundColor = "grey";
    divRow.appendChild(divCol);
    AddInputElement("text", divCol, "");

    for (var i = 0; i < 4; i++)
    {
        divCol = document.createElement('div');
        divCol.className = "col"; 
        divCol.style.backgroundColor = "bisque";
        divRow.appendChild(divCol);
        AddInputElement("number", divCol, 0, "quantity", 0);
    }




    // var divCol1 = document.createElement('div');
    // divCol1.className = "col-sm"; 

    // var divCol2 = document.createElement('div');
    // divCol2.className = "col-sm"; 

    // var divCol3 = document.createElement('div');
    // divCol3.className = "col-sm"; 

    // divRow.appendChild(divCol0);
    // divRow.appendChild(divCol1);
    // divRow.appendChild(divCol2);
    // divRow.appendChild(divCol3);

    this.parentElement.insertBefore(divRow, this.parentElement.children[this.parentElement.childElementCount-3]);    

    // RowManager.Create(divRow, divCol0, divCol1, divCol2, divCol3);

    // AddInputElement("text", divCol0, "");
    // AddInputElement("number", divCol1, 0, "quantity", 0);
    // AddInputElement("number", divCol2, 0, "quantity", 0);
    // AddInputElement("number", divCol3, 0, "quantity", 0);

    //var itemRow = new ItemRow(divRow, divCol0, divCol1, divCol2, divCol3);
    var itemRow = new ItemRow(divRow);
    //rowList.push(itemRow);

    //console.log(this.parentElement);
    //var encodedHtml = htmlEscape(this.parentElement.innerHTML);
    //console.log(encodedHtml);
    //var decodedHtml = htmlUnescape(encodedHtml);
    //console.log(decodedHtml);
}

function StoreGrid()
{
    SaveNameValuePairToLocalStorage('rowValues', JSON.stringify(GridManager.GetAllRowValues()));
}

function LoadGrid()
{
    // var rowsFromStorage = LoadValueFromLocalStorage('rowValues');
    // console.log(rowsFromStorage);
    // var parsedRows = JSON.parse(rowsFromStorage);
    // console.log(parsedRows);
    GridManager.RecreateRowsFromStorage(JSON.parse(LoadValueFromLocalStorage('rowValues')));
}

/*** helper Functions ***/

function SaveNameValuePairToLocalStorage(name, value)
{
    if (typeof(Storage) !== "undefined") 
    {
        //sessionStorage.gridHTML = htmlEscape(document.getElementById('grid').innerHTML);
        //sessionStorage.rowvalues = GridManager.GetAllRowValues();
        sessionStorage.setItem(name, value);
        console.log('Pair added to sesion storage, with name "' + name + '" and value "' + value + '".');
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
        //document.getElementById('grid').innerHTML = htmlUnescape(sessionStorage.gridHTML);
        console.log('Request to load value for "' + name +'" from session storage.');        
        return sessionStorage.getItem(name);
        //GridManager.RecreateRowsFromStorage(sessionStorage.rowvalues);
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