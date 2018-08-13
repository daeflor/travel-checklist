window.TemplateManager = (function () 
{
    function createListItemFromTemplate(data)
    {
        //Create the div wrapper for the entire List Item
        var wrapper = CreateNewElement('div', [ ['id',data.listItemId], ['class','row divItemRow'] ]);

        //Create the name toggle that can be selected to open or close the Settings View for the List Item
        var nameToggle = CreateToggleForCollapsibleView('SettingsView-'.concat(data.listItemId), 'buttonListItem buttonListItemName', data.listItemName, 'NameButton-'.concat(data.listItemId));
        
        //Create the div wrapper for the List Item Name, with the name toggle as a child 
        var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], nameToggle);

        //Add the List Item Name to the DOM as a child of the List Item div wrapper
        wrapper.appendChild(nameWrapper);

        //Create Modifier elements from the template and add them to the DOM as children of the List Item div wrapper
        for (var key in data.quantityValues)
        {
            wrapper.appendChild(createListItemModifierFromTemplate(data.listItemId, key, data.quantityValues[key])); 
        }

        //Create the Settings View for the List Item
        //The behavior here should be set with a BIND. Actually, since this is purely DOM related, it may be fine to leave here
        var settingsWrapper = createSettingsViewFromTemplate(
            data.listItemId, 
            nameToggle, 
            'row', 
            // window.GridManager.ToggleActiveSettingsView, 
            function() { wrapper.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});}
        );

        //TODO After the list item gets created, the controller should call to bind the new buttons to events

        //Add the Settings View to the DOM as a child of the List Item div wrapper
        wrapper.appendChild(settingsWrapper);   

        return wrapper;
    }

    function createListItemModifierFromTemplate(listItemId, type, initialValue)
    {
        //Create the 'plus' and 'minus' button elements that will appear in the modifier's popover
        var buttonMinus = CreateButtonWithIcon({buttonId:'buttonMinus', buttonClass:'popoverElement', iconClass:'fa fa-minus-circle fa-lg popoverElement'});
        var buttonPlus = CreateButtonWithIcon({buttonId:'buttonPlus', buttonClass:'popoverElement', iconClass:'fa fa-plus-circle fa-lg popoverElement'});

        //TODO is it necessary to pass a default/initial value for what the toggle displays? 
        //Create the element that toggles the visibility of the modifier's popover
        var popoverToggle = CreatePopoverToggle({id:type.concat('QuantityToggle-').concat(listItemId), class:'btn-sm buttonQuantity', display:initialValue, children:[buttonMinus, buttonPlus], trigger:'manual'});

        //TODO this binding should be handled between the controller and the View. The View should just bind to a callback without knowing the details
            //TODO Maybe/also really what it is is that GetActivePopover should be part of the same view
        //Add a listener to the toggle 
        popoverToggle.addEventListener('click', function(e) 
        {
            console.log("A Popover toggle was pressed");

            //If there is no popover currently active, show the popover for the selected toggle
            if(window.GridManager.GetActivePopover() == null)
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

        //TODO this binding should be handled between the controller and the View.
        //Set the behavior for when the popover is hidden
        $(popoverToggle).on('hidden.bs.popover', function()
        {
            console.log("A Popover was hidden");
            window.GridManager.SetActivePopover(null);
        });

        return CreateNewElement('div', [ ['class','col divListItemModifier'] ], popoverToggle);
    }
        
    //TODO remove toggleViewFunction param
    /**
     * Creates a Settings View
     * @param {number} id The ID of the List or List Item to which the Settings View belongs
     * @param {element} nameButton The object (element) that contains/displays the name of the list item (and which may also toggle the settings view)
     * @param {string} parentType The type of parent ('row' or 'list')
     * @param {function} settingsViewExpandedCallback The function that should be called when the settings view has finished expanding
     */
    function createSettingsViewFromTemplate(id, nameButton, parentType, settingsViewExpandedCallback)
    {
        //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed

        /* Create Text Area */
        var editNameTextarea = CreateNewElement('textarea', [ ['id','EditName-'.concat(id)] ]);
        editNameTextarea.textContent = nameButton.textContent; 

        /* Create Delete Button */
        var buttonDelete = CreateNewElement(
            'button', 
            [ ['id','Delete-'.concat(id)], ['type','button'] ], 
            CreateNewElement('i', [['class','fa fa-trash']])
        );

        /* Create Element Wrappers */
        var divTextareaName = CreateNewElement('div', [ ['class','col-5 divEditName'] ], editNameTextarea);
        var divButtonDelete = CreateNewElement('div', [ ['class','col-2'] ], buttonDelete);
        
        var settingsRowClass = (parentType == 'list') ? 'row divSettingsWrapperRow divListSettingsWrapperRow' : 'row divSettingsWrapperRow';

        //TODO could consider only having to pass custom classes (i.e. the helper function would create element with default classes, and then add on any custom ones passed to it).
        var wrapper  = CreateCollapsibleView({collapsibleId:'SettingsView-'.concat(id), collapsibleClass:'collapse container-fluid divSettingsWrapper', collapsedChildren:[divTextareaName, divButtonDelete], rowClass:settingsRowClass});

        /* Setup Listeners */

        // //When the animation to expand the Settings View starts, inform the GridManager to change the Active Settings View
        // $(wrapper).on('show.bs.collapse', function() 
        // {
        //     toggleViewFunction(wrapper);
        // });

        //When the animation to expand the Settings View ends, scroll the Settings View into view
        $(wrapper).on('shown.bs.collapse', function() { settingsViewExpandedCallback(); });

        editNameTextarea.addEventListener('keypress', function(e) 
        {
            if(e.keyCode==13)
            {
                editNameTextarea.blur();
            }
        });

        //TODO Bind this in controller
        // editNameTextarea.addEventListener('change', function() 
        // {
        //     nameButton.textContent = editNameTextarea.value;

        //     //Model.Edit ListName or ListItem Name...
        //     window.GridManager.GridModified();
        // });

        return wrapper;
    }

    return {
        CreateListItemFromTemplate : createListItemFromTemplate
    };
})();  