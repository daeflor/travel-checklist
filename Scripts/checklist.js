document.addEventListener('DOMContentLoaded', Start);
var rowList = [];

function Start()
{
    document.getElementById('buttonAddRow').onclick = AddRow;
    //document.getElementById('buttonAddQuantity').onclick = AddQuantity;
    //document.getElementById('buttonReduceQuantity').onclick = ReduceQuantity;

    var list = document.getElementsByName("rowItem");

    for (var i = 0; i < list.length; i++)
    {
        list[i].style.backgroundColor = "grey";
    }

    list = document.getElementsByName("quantity");
    
    for (var i = 0; i < list.length; i++)
    {
        list[i].oninput = SetColor;
    }
}

function ItemRow(row, item, needed, packed, wearing)
{
    var row = row;
    // this.item = item;
    // this.needed = needed;
    // this.packed = packed;
    // this.wearing = wearing;

    var item = row.children[0].children[0];
    var needed = row.children[1].children[0];
    var packed = row.children[2].children[0];
    var wearing = row.children[3].children[0];

    needed.oninput = SetRowColor;
    packed.oninput = SetRowColor;
    wearing.oninput = SetRowColor;

    function SetRowColor()
    {
        var totalPrepared = packed.value + wearing.value;
        console.log("needed: " + needed.value + "; packed: " + packed.value + "; wearing: " + wearing.value + "; total prepared: " + totalPrepared);
        if (needed.value == 0)
        {
            row.style.backgroundColor = "grey";
        }
        else if (needed.value == (parseInt(packed.value) + parseInt(wearing.value)))
        {
            row.style.backgroundColor = "green";
        }
        else
        {
            row.style.backgroundColor = "orange";
        }
    }
}

function AddInputElement(type, parent, value, min)
{
    var input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.min = min;
    parent.appendChild(input);

    //input.oninput = onInputFunction;
}

function AddRow()
{
    //TODO unnecessary to declare so many vars
    var divRow = document.createElement('div');
    divRow.className = "row"; 
    divRow.style.backgroundColor = "grey";

    var divCol0 = document.createElement('div');
    divCol0.className = "col-sm-4"; 


    var divCol1 = document.createElement('div');
    divCol1.className = "col-sm"; 

    var divCol2 = document.createElement('div');
    divCol2.className = "col-sm"; 

    var divCol3 = document.createElement('div');
    divCol3.className = "col-sm"; 
    //AddInputElement("number", divCol3, 0, 0);

    divRow.appendChild(divCol0);
    divRow.appendChild(divCol1);
    divRow.appendChild(divCol2);
    divRow.appendChild(divCol3);

    this.parentElement.insertBefore(divRow, this.parentElement.children[this.parentElement.childElementCount-1]);    

    // RowManager.Create(divRow, divCol0, divCol1, divCol2, divCol3);

    // AddInputElement("text", divCol0, RowManager.SetRowColor, "");
    // AddInputElement("number", divCol1, RowManager.SetRowColor, 0, 0);
    // AddInputElement("number", divCol2, RowManager.SetRowColor, 0, 0);
    // AddInputElement("number", divCol3, RowManager.SetRowColor, 0, 0);

    AddInputElement("text", divCol0, "");
    AddInputElement("number", divCol1, 0, 0);
    AddInputElement("number", divCol2, 0, 0);
    AddInputElement("number", divCol3, 0, 0);

    //var itemRow = new ItemRow(divRow, divCol0, divCol1, divCol2, divCol3);
    var itemRow = new ItemRow(divRow);
    //rowList.push(itemRow);
}

// function AddRow()
// {
//     var tr = document.createElement('TR'); 
//     var td = document.createElement('TD'); 
//     td.textContent = 'hello'; 
//     tr.appendChild(td); 
//     this.parentElement.insertBefore(tr, this.parentElement.children[this.parentElement.childElementCount-1]);
//     //document.getElementById('grid').insertBefore(tr, document.getElementById('grid').children[document.getElementById('grid').childElementCount-1]);
// }

function SetColor()
{
    alert("did you change something: " + this.name);
}


// Need an itemrow class, so that different elements can easily reference other ones




// var RowManager = function()
// {
//     var row;
//     var item;
//     var needed;
//     var packed;
//     var wearing;

//     return { 
//         Create : function(row, item, needed, packed, wearing)
//         {
//             console.log('This classname: ' + this.className);
//             row = row;
//             item = item;
//             needed = needed;
//             packed = packed;
//             wearing = wearing;

//             console.log('needed is: ' + needed);
//             console.log('needed classname: ' + needed.className);
//         },
//         zzSetRowColor : function()
//         {
//             console.log('An input changed');
//             alert("something changed");
//             if (needed.value == 0)
//             {
//                 row.style.backgroundColor = "grey";
//             }
//             else if (needed.value == (packed.value + wearing.value))
//             {
//                 row.style.backgroundColor = "green";
//             }
//             else
//             {
//                 row.style.backgroundColor = "orange";
//             }
//         },
//         GetKey : function()
//         {
//             return key; 
//         },
//         GetBackupKey : function()
//         {
//             return backupKey; 
//         },
//         SetTab : function(tab)
//         {
//             currentTab = tab;
//         },
//         SetPlaylistName : function(name)
//         {
//             playlistName = name;
//             key = chrome.runtime.id + '_Playlist_\'' + playlistName + '\'';
//             console.log("Playlist name set to: " + playlistName + ". Key set to: " + key);
//         }
//     };
// }();