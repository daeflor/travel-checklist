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
        var settingsWrapper = createSettingsViewFromTemplate(
            data.listItemId, 
            data.listItemName, 
            'row', 
            function() { wrapper.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});}
        );

        //Add the Settings View to the DOM as a child of the List Item div wrapper
        wrapper.appendChild(settingsWrapper);   

        return wrapper;
    }

    function createListWrapperFromTemplate(listId)
    {
        return CreateNewElement('div', [ ['id',listId], ['class','container-fluid'], ['hidden', 'true'] ]);
    }

    function createListToggleFromTemplate(data)
    {
        console.log("Request received to create a List Toggle from the Template, for List ID: " + data.listId);

        var wrapper = CreateNewElement('div', [ ['id','ListToggle-'.concat(data.listId)], ['class','row divItemRow divListToggleWrapper'] ]);

        /* Name Toggle/Button */

        //Create the name button/toggle that can be selected to open or close the settings view for the List
        var nameToggle = CreateToggleForCollapsibleView('SettingsView-'.concat(data.listId), 'buttonListItem buttonListToggle', data.listName, 'NameButton-'.concat(data.listId));
        
        //Create the div wrapper for the List Name button/toggle
        var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName divListToggleName'] ], nameToggle);

        /* Navigation Button */

        var navButton = CreateButtonWithIcon({buttonClass:'buttonNavigateToList', iconClass:'fa fa-angle-double-right'});

        navButton.addEventListener('click', function() 
        {
            window.GridManager.ListSelected(wrapper);
        });    

        var navButtonWrapper = CreateNewElement('div', [ ['class','col-2'] ], navButton);

        /* Settings View */

        //var settingsWrapper = CreateListSettingsView(listId, Settings, toggle, SettingsViewExpanded);

        //Create the Settings View for the List
        var settingsWrapper = createSettingsViewFromTemplate(
            data.listId, 
            data.listName, 
            'list', 
            function() { wrapper.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});}
        );

        // Settings.buttonDelete.addEventListener('click', function() //TODO standardize events?
        // {   
        //     console.log("Received request to delete a list, but this isn't supported yet");
        //     window.GridManager.RemoveList(wrapper);
        // });

        /* Append all the individual div wrappers to the overall wrapper */
    
        wrapper.appendChild(nameWrapper);
        wrapper.appendChild(navButtonWrapper);
        wrapper.appendChild(settingsWrapper);

        return wrapper;
    }

    //TODO Lots of things that can probably be moved out of this method (e.g. Binds)
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
       
    //TODO Would like to get rid of or change the 'parentType' param. Could pass an optional class param and Add it as an Attribute
    /**
     * Creates a Settings View
     * @param {number} id The ID of the List or List Item to which the Settings View belongs
     * @param {string} name The initial name value assigned to the List or ListItem when it is created, to be passed along as the default text value for the Edit Name Text Area
     * @param {string} parentType The type of parent ('row' or 'list')
     * @param {function} settingsViewExpandedCallback The function that should be called when the settings view has finished expanding
     */
    function createSettingsViewFromTemplate(id, name, parentType, settingsViewExpandedCallback)
    {
        //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed

        /* Create Text Area */
        var editNameTextarea = CreateNewElement('textarea', [ ['id','EditName-'.concat(id)] ]);
        editNameTextarea.textContent = name; 

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
        //When the animation to expand the Settings View ends, scroll the Settings View into view
        $(wrapper).on('shown.bs.collapse', function() { settingsViewExpandedCallback(); });

        //When the ENTER key is pressed, blur the text area
        editNameTextarea.addEventListener('keypress', function(e) 
        {
            if(e.keyCode==13)
            {
                editNameTextarea.blur();
            }
        });

        return wrapper;
    }

    return {
        CreateListWrapperFromTemplate : createListWrapperFromTemplate,
        CreateListToggleFromTemplate : createListToggleFromTemplate,
        CreateListItemFromTemplate : createListItemFromTemplate
    };
})();  