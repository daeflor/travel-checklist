function ListItemName(rowId, itemName)
{
    
    var toggle = CreateToggleForCollapsibleView('edit-row-'.concat(rowId), 'btn buttonItemName', itemName);
    var wrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], toggle);

    /** Public Functions **/

    return { 
        GetWrapper : function()
        {
            return wrapper;
        },
        GetToggle : function()
        {
            return toggle;
        },
        GetString : function()
        {
            return toggle.textContent;
        },
        SetColor : function(color) //Sets the color of the List Item name (e.g. 'rgb(x,x,x)' or 'black')
        {
            toggle.style.borderColor = color;
        }
    };
}