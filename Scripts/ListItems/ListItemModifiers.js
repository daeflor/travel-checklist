/**
 * Creates a new set of Modifiers that can be applied to a List Item
 * @param {array} modifierValues An array of modifiers that can be applied to the List Item
 */
function ListItemModifiers(modifierValues)
{
    var modifierElements;


    // //Create the name toggle that can be selected to open or close the settings view for the List Item
    // var toggle = CreateToggleForCollapsibleView('edit-row-'.concat(rowId), 'btn buttonItemName', itemName);
    
    // //Create the div wrapper for the List Item Name 
    // var wrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], toggle);


    if (modifierValues != null)
    {
        for (var i = 0; i < modifierValues.length; i++)
        {
            modifierElements.push(CreateQuantityModifier(modifierValues[i]));
        }
    }

    /**
     * Creates the elements necessary for a Quantity ('travel') modifier, including a popover
     * @param {number} quantity The initial value of modifier to display
     */
    function CreateQuantityModifier(quantity)
    {
        //Create the 'plus' and 'minus' button elements that will appear in the modifier's popover
        var buttonMinus = CreateButtonWithIcon('buttonMinus', 'btn popoverElement', 'fa fa-minus-circle fa-lg popoverElement');
        var buttonPlus = CreateButtonWithIcon('buttonPlus', 'btn popoverElement', 'fa fa-plus-circle fa-lg popoverElement');
    
        //Create the element that toggles the visibility of the modifier's popover
        var popoverToggle = CreatePopoverToggle('btn btn-sm buttonQuantity', quantity, [buttonMinus, buttonPlus], 'manual');
    
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

        return popoverToggle;

        // Elements.listQuantityPopovers.push(popoverToggle);
    
        // Elements.wrapper.appendChild(CreateNewElement('div', [ ['class','col'] ], popoverToggle));
    }

    /** Public Functions **/

    return { 
        GetWrapper : function()
        {
            return wrapper;
        },
        GetModifierElements : function()
        {
            return modifierElements;
        }
    };
}

var thing = {}
thing.cat = 'skanl'
thing.cat
thing['cat']


var animal = {}
var person = {}

animal.bones = '250'
person.bones = '200'

animal.popover

var everything = [animal, person]

var animal = {type: 'cat', name: 'sally'}

Eat(animal)

var animal = ['cat', 'sally']

Eat(animal)