window.InteractionManager = function()
{
    document.addEventListener('DOMContentLoaded', Start);    

    var activePopover = null; 

    function Start()
    {
        SetupButtons();
    }

    /** Button Setup & Interactions **/

    function SetupButtons()
    {
        var categoryButtons = document.getElementsByClassName('buttonCategory');

        for (var i = 0; i < categoryButtons.length; i++)
        {
            categoryButtons[i] .addEventListener('click', CategorySelected); 
        }

        document.getElementById('buttonAddRow').onclick = AddNewRow; //FIX
    }

    function CategorySelected()
    {   
        //If the category selected is different from the one currently active, switch grids to the selected category
        if (this.dataset.gridindex != grids.indexOf(activeGrid))
        {
            SwitchGrids(this.dataset.gridindex, this.textContent); //FIX
            document.getElementById('buttonCurrentCategory').textContent = categoryTextToDisplay; //FIX            
        }
    }

    /** Public Functions **/

    return {
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
                //Does a quantity group function (object) make sense? (and maybe a list?) To have this more controlled
            if (!e.target.className.includes('popover')) //ignore any clicks on any elements within a popover
            {
                document.removeEventListener('click', InteractionManager.HideActiveQuantityPopover);
                $(activePopover).popover('hide');
            }
        }
    };
}();