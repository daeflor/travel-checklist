/**
 * Creates a new Modifier that can be applied to a List Item
 * @param {function} modifierChangedCallback A reference to the function to call when the modifer value has been changed
 * @param {array} modifierValue The initial value of the Modifier to display when it is created
 */
function ListItemModifier(modifierChangedCallback, modifierValue)
{
    //var modified = ModifierModified; //TODO TEMP until we re-assess
    var popoverToggle; //TODO rename to 'toggle'
    var wrapper;

    SetupElements();

    function SetupElements()
    {
        //Create the 'plus' and 'minus' button elements that will appear in the modifier's popover
        var buttonMinus = CreateButtonWithIcon('buttonMinus', 'btn popoverElement', 'fa fa-minus-circle fa-lg popoverElement');
        var buttonPlus = CreateButtonWithIcon('buttonPlus', 'btn popoverElement', 'fa fa-plus-circle fa-lg popoverElement');

        //Create the element that toggles the visibility of the modifier's popover
        popoverToggle = CreatePopoverToggle('btn btn-sm buttonQuantity', modifierValue, [buttonMinus, buttonPlus], 'manual');

        //Add a listener to the toggle 
        popoverToggle.addEventListener('click', function(e) 
        {
            console.log("A Popover toggle was pressed");

            //If there is no popover currently active, show the popover for the selected toggle
            if(GridManager.GetActivePopover() == null)
            {
                //When there is no active popover and a toggle is selected, prevent further click events from closing the popover immediately
                if(e.target == popoverToggle)
                {
                    console.log("Prevented click event from bubbling up");
                    e.stopPropagation();
                }

                $(popoverToggle).popover('show');
            }
        });

        //TODO maybe adding these event listeners should be handled by the parent (List Item) (or a controller...)
        //Set the behavior for when the popover is made visible
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            console.log("A Popover was shown");
            GridManager.SetActivePopover(popoverToggle);

            document.getElementById('buttonMinus').addEventListener('click', function() 
            {
                ModifyQuantityValue(popoverToggle, false);
            });         
            document.getElementById('buttonPlus').addEventListener('click', function() 
            {
                ModifyQuantityValue(popoverToggle, true);
            }); 

            document.addEventListener('click', GridManager.HideActiveQuantityPopover);
            console.log("An onclick listener was added to the whole document");
        });

        //Set the behavior for when the popover is hidden
        $(popoverToggle).on('hidden.bs.popover', function()
        {
            console.log("A Popover was hidden");
            GridManager.SetActivePopover(null);
        });

        wrapper = CreateNewElement('div', [ ['class','col'] ], popoverToggle);
    }

    //TODO if this stays here, don't need to pass quantityElement. Can use popoverToggle/toggle variable instead
    //TODO changing the UI/DOM to display the modifier value should be handled separately from informing the parent that a change has happened
    function ModifyQuantityValue(quantityElement, increase)
    {
        console.log("Request called to modify a quantity value.");

        if (increase == true)
        {
            quantityElement.text = parseInt(quantityElement.text) + 1;
            
            modifierChangedCallback(); 
            //console.log("my parent is: " + parent);
            //parent.Modify();
            //parent.ModifierValueModified(); //TODO figure out a cleaner way to do this
            // SetItemColumnColor();
            // GridManager.GridModified();
        }
        else if (parseInt(quantityElement.text) > 0)
        {
            quantityElement.text = parseInt(quantityElement.text) - 1;
            
            modifierChangedCallback();
            //parent.ModifierValueModified();
            // SetItemColumnColor();
            // GridManager.GridModified();
        }
    }

    /** Public Functions **/

    return { 
        GetWrapper : function()
        {
            return wrapper;
        },
        GetValue : function()
        {
            return popoverToggle.text;
        },
        SetValue : function(value) //Sets the value of the modifier
        {
            popoverToggle.text = value;
        }
    };
}