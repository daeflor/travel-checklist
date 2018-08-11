/**
 * Creates a new Modifier that can be applied to a List Item
 * @param {function} modifierChangedCallback A reference to the function to call when the modifer value has been changed
 * @param {array} modifierValue The initial value of the Modifier to display when it is created
 */
function ListItemModifier(modifierChangedCallback, modifierValue, type, listItemId)
{
//TODO I think it might be possible to accidentally reference the wrong view or model, from a different file

    var model = {
        data : {
            value : 0,
        },
        GetValue : function()
        {
            //console.log("The modifier value was requested. Current value is: " + this.data.value);
            return this.data.value;
        },
        SetValue : function(newValue) //TODO so far we've only been supposed to use SetData
        {
            if (newValue != null)
            {
                this.data.value = newValue;
                console.log("The modifier value was set to: " + newValue);
            }
        }, //TODO ultimately this kind of functionality should probably be handled partially in the controller, with data only/simply getting set (and maybe stored) in the model
        DecrementValue : function()
        {
            this.SetValue(this.GetValue()-1);
            //this.data.value--;
            console.log("The modifier was decremented by 1");
        },
        IncrementValue : function()
        {
            console.log(this);
            this.SetValue(this.GetValue()+1);
            //data.value++;
            console.log("The modifier was incremented by 1");
        },
    };

    var view = {
        elements: {
            wrapper : null,
            popoverToggle : null, //TODO Consider renaming this (perhaps to 'toggle'), as well as other variables
        }, 
        GetElements : function()
        {
            return this.elements;
        },
        AddElementsToDom : function(initialValue)
        {
            var self = this;

            //Create the 'plus' and 'minus' button elements that will appear in the modifier's popover
            var buttonMinus = CreateButtonWithIcon({buttonId:'buttonMinus', buttonClass:'popoverElement', iconClass:'fa fa-minus-circle fa-lg popoverElement'});
            var buttonPlus = CreateButtonWithIcon({buttonId:'buttonPlus', buttonClass:'popoverElement', iconClass:'fa fa-plus-circle fa-lg popoverElement'});

            //TODO is it necessary to pass a default/initial value for what the toggle displays? 
            //Create the element that toggles the visibility of the modifier's popover
            self.elements.popoverToggle = CreatePopoverToggle({id:type.concat('QuantityToggle-').concat(listItemId), class:'btn-sm buttonQuantity', display:initialValue, children:[buttonMinus, buttonPlus], trigger:'manual'});

            //Add a listener to the toggle 
            self.elements.popoverToggle.addEventListener('click', function(e) 
            {
            //TODO maybe this section should be in the controller. The View shouldn't know about this, should just bind to a callback without knowing the details
            //Maybe really what it is is that GetActivePopover should be part of the same view
        
                console.log("A Popover toggle was pressed");

                //If there is no popover currently active, show the popover for the selected toggle
                if(window.GridManager.GetActivePopover() == null)
                {
                    //When there is no active popover and a toggle is selected, prevent further click events from closing the popover immediately
                    if(e.target == self.elements.popoverToggle)
                    {
                        console.log("Prevented click event from bubbling up");
                        e.stopPropagation();
                    }

                    $(self.elements.popoverToggle).popover('show');
                }
            });

            //Set the behavior for when the popover is hidden
            $(self.elements.popoverToggle).on('hidden.bs.popover', function()
            {
                console.log("A Popover was hidden");
                window.GridManager.SetActivePopover(null);
            });

            self.elements.wrapper = CreateNewElement('div', [ ['class','col divListItemModifier'] ], self.elements.popoverToggle);
        },
    };

    SetupModelAndView();

    function SetupModelAndView()
    {
        model.SetValue(modifierValue);

        view.AddElementsToDom(model.GetValue());
    }

    /** Public Functions **/

    return { 
        GetWrapper : function() //Returns the element for the modifier's wrapper
        {
            return view.GetElements().wrapper;
        },
        GetValue : function() //Returns the value of the modifier stored in the Model
        {
            return model.GetValue();
        },
        SetValue : function(value) //Updates the value of the modifier in the Model and then updates the View accordingly
        {
            model.SetValue(value);

            modifierChangedCallback(type, model.GetValue());

            //window.View.Render('updateModifierValue', {updatedValue:model.GetValue()}); 
        },
        DecrementValue : model.DecrementValue,
        IncrementValue : model.IncrementValue
    };
}