function ListItemName(rowId, itemName)
{
    //Create the name toggle that can be selected to open or close the settings view for the List Item
    var toggle = CreateToggleForCollapsibleView('edit-row-'.concat(rowId), 'buttonListItem buttonListItemName', itemName);
    
    //Create the div wrapper for the List Item Name 
    var wrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], toggle);

    /** Public Functions **/

    return { 
        // GetWrapper : function()
        // {
        //     return wrapper;
        // },
        // GetToggle : function()
        // {
        //     return toggle;
        // },
        // GetValue : function()
        // {
        //     return toggle.textContent;
        // }
        // SetColor : function(color) //Sets the color of the List Item name (e.g. 'rgb(x,x,x)' or 'black')
        // {
        //     toggle.style.borderColor = color;
        // }
    };
}