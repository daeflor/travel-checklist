/**
 * Creates a new Modifier that can be applied to a List Item
 * @param {function} modifierChangedCallback A reference to the function to call when the modifer value has been changed
 * @param {array} modifierValue The initial value of the Modifier to display when it is created
 */
function ListItemModifier(modifierChangedCallback, modifierValue)
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
            this.data.value--;
            console.log("The modifier was decremented by 1");
        },
        IncrementValue : function()
        {
            this.data.value++;
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
            self.elements.popoverToggle = CreatePopoverToggle('btn-sm buttonQuantity', initialValue, [buttonMinus, buttonPlus], 'manual');

            //Add a listener to the toggle 
            self.elements.popoverToggle.addEventListener('click', function(e) 
            {
            //TODO maybe this section should be in the controller. The View shouldn't know about this, should just bind to a callback without knowing the details
            //Maybe really what it is is that GetActivePopover should be part of the same view
        
                console.log("A Popover toggle was pressed");

                //If there is no popover currently active, show the popover for the selected toggle
                if(GridManager.GetActivePopover() == null)
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
                GridManager.SetActivePopover(null);
            });

            self.elements.wrapper = CreateNewElement('div', [ ['class','col divListItemModifier'] ], self.elements.popoverToggle);
        },
        Render : function(command, parameter)
        {
            var self = this;

            var viewCommands = {
                updateModifierText: function() 
                {
                    self.elements.popoverToggle.text = parameter;
                },
            };

            viewCommands[command]();
        },
        Bind : function(event, callback)
        {
            var self = this;

            if (event === 'showPopover') 
            {
                //Set the behavior for when the popover is made visible
                $(self.elements.popoverToggle).on('shown.bs.popover', function() 
                {
                    console.log("A Popover was shown");
                    callback(self.elements.popoverToggle);
                });    
            }
            else if (event === 'decrementQuantity') 
            {
                document.getElementById('buttonMinus').addEventListener('click', function() 
                {
                    callback(false);
                });         
            }
            else if (event === 'incrementQuantity') 
            {
                document.getElementById('buttonPlus').addEventListener('click', function() 
                {
                    callback(true);
                });      
            }
        },
    };

    SetupModelAndView();

    function SetupModelAndView()
    {
        // var data;
        // data.value = modifierValue;
        // model.SetData(data);
        model.SetValue(modifierValue);

        view.AddElementsToDom(model.GetValue());

        view.Bind('showPopover', function(popoverElement)
        {
            GridManager.SetActivePopover(popoverElement);

            view.Bind('decrementQuantity', function(increase)
            {
                ModifyQuantityValue(increase);
            });

            view.Bind('incrementQuantity', function(increase)
            {
                ModifyQuantityValue(increase);
            });

            //TODO could move this to a Bind as well, assuming this all even works
            document.addEventListener('click', GridManager.HideActiveQuantityPopover);
            console.log("An onclick listener was added to the whole document");
        });
    }

    //TODO changing the UI/DOM to display the modifier value maybe should be handled separately from informing the parent that a change has happened
    function ModifyQuantityValue(increase)
    {
        console.log("Request called to modify a quantity value.");

        //TODO the increase vs decrease could probably all be handled in the model (a single function with increase passed as a parameter). This current implementation may be a bit over-complicated. 
        if (increase == true)
        {
            //TODO Whenever the model is updated, also update the view and the parent
            model.IncrementValue();
            view.Render('updateModifierText', model.GetValue()); //TODO in the future this may need to be a callback passed to the model (e.g. if it interacts with Storage), but for now it isn't necessary
            
            modifierChangedCallback(); //TODO still seems like this should be handled more cleanly
        }
        else if (model.GetValue() > 0)
        {
            model.DecrementValue();
            view.Render('updateModifierText', model.GetValue());
            
            modifierChangedCallback();
        }
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
            view.Render('updateModifierText', model.GetValue()); 
        }
    };
}