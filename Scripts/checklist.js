document.addEventListener('DOMContentLoaded', Start);
var rowList = [];

function Start()
{
    document.getElementById('buttonAddRow').onclick = AddRow;
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

    needed.oninput = SetItemColumnColor;
    packed.oninput = SetItemColumnColor;
    wearing.oninput = SetItemColumnColor;

    function SetRowColor()
    {
        //console.log("needed: " + needed.value + "; packed: " + packed.value + "; wearing: " + wearing.value + "; total prepared: " + totalPrepared);
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

    function SetItemColumnColor()
    {
        if (needed.value == 0)
        {
            itemColumn.style.backgroundColor = "grey";
        }
        else if (needed.value == (parseInt(packed.value) + parseInt(wearing.value)))
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
    //TODO unnecessary to declare so many vars
    var divRow = document.createElement('div');
    divRow.className = "row"; 
    //divRow.style.backgroundColor = "grey";

    var divCol = document.createElement('div');
    divCol.className = "col-4"; 
    divCol.style.backgroundColor = "grey";
    divRow.appendChild(divCol);
    AddInputElement("text", divCol, "");

    for (var i = 0; i < 3; i++)
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

    this.parentElement.insertBefore(divRow, this.parentElement.children[this.parentElement.childElementCount-1]);    

    // RowManager.Create(divRow, divCol0, divCol1, divCol2, divCol3);

    // AddInputElement("text", divCol0, RowManager.SetRowColor, "");
    // AddInputElement("number", divCol1, RowManager.SetRowColor, 0, 0);
    // AddInputElement("number", divCol2, RowManager.SetRowColor, 0, 0);
    // AddInputElement("number", divCol3, RowManager.SetRowColor, 0, 0);

    // AddInputElement("text", divCol0, "");
    // AddInputElement("number", divCol1, 0, "quantity", 0);
    // AddInputElement("number", divCol2, 0, "quantity", 0);
    // AddInputElement("number", divCol3, 0, "quantity", 0);

    //var itemRow = new ItemRow(divRow, divCol0, divCol1, divCol2, divCol3);
    var itemRow = new ItemRow(divRow);
    //rowList.push(itemRow);
}

// function SetColor()
// {
//     alert("did you change something: " + this.name);
// }