window.TemplateManager = (function () 
{
    function createListItemFromTemplate(data)
    {
        //Create the div wrapper for the entire List Item
        var wrapper = CreateNewElement('div', [ ['id',data.listItemId], ['class','row divItemRow'] ]);

        //Create the name toggle that can be selected to open or close the Settings View for the List Item
        var nameToggle = CreateToggleForCollapsibleView('SettingsView-'.concat(data.listItemId), 'buttonListItem buttonListItemName', data.listItemName);
        
        //Create the div wrapper for the List Item Name, with the name toggle as a child 
        var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], nameToggle);

        //Add the List Item Name to the DOM as a child of the List Item div wrapper
        wrapper.appendChild(nameWrapper);

        //Add the Modifier elements to the DOM as children of the List Item div wrapper
        for (var i = 0; i < data.modifiers.length; i++)
        {
            //console.log("Added a modifier with index " + i + " to ListItem with ID: " + data.listItemId);
            //TODO see if this is really necessary or if it can be done a better way
            wrapper.appendChild(data.modifiers[i].GetWrapper()); 
        }  

        //Create the Settings View for the List Item
        //The behavior here should be set with a BIND
        createSettingsViewFromTemplate(data.listItemId, data.settings, nameToggle, 'row', window.GridManager.ToggleActiveSettingsView, function() {
            wrapper.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        });

        //TODO After the list item gets created, the controller should call to bind the new buttons to events

        //Add the Settings View to the DOM as a child of the List Item div wrapper
        wrapper.appendChild(data.settings.wrapper);   

        //TODO a BIND call should be used for this instead
        //Add an event listener to the Delete Button to remove the List Item
        data.settings.buttonDelete.addEventListener('click', function() {   
            window.GridManager.RemoveRow(wrapper);
        });

        return wrapper;
    }
        
    /**
     * Creates a Settings View
     * @param {number} id The ID of the List or List Item to which the Settings View belongs
     * @param {array} elements The elements that are part of the Settings View
     * @param {*} nameButton The object (element) that contains/displays the name of the list item (and which may also toggle the settings view)
     * @param {string} parentType The type of parent ('row' or 'list')
     * @param {*} toggleViewFunction The function that should be called when the settings view is toggled
     */
    function createSettingsViewFromTemplate(id, elements, nameButton, parentType, toggleViewFunction, viewExpandedCallback)
    {
        //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed

        /* Create Text Area */
        elements.editNameTextarea = CreateNewElement('textarea', [ ['class',''] ]);
        elements.editNameTextarea.textContent = nameButton.textContent; 

        /* Create Delete Button */
        elements.buttonDelete = CreateNewElement(
            'button', 
            [ ['type','button'] ], 
            CreateNewElement('i', [['class','fa fa-trash']])
        );

        /* Create Element Wrappers */
        var divTextareaName = CreateNewElement('div', [ ['class','col-5 divEditName'] ], elements.editNameTextarea);
        var divButtonDelete = CreateNewElement('div', [ ['class','col-2'] ], elements.buttonDelete);
        
        var settingsRowClass = (parentType == 'list') ? 'row divSettingsWrapperRow divListSettingsWrapperRow' : 'row divSettingsWrapperRow';

        //TODO could consider only having to pass custom classes (i.e. the helper function would create element with default classes, and then add on any custom ones passed to it).
        elements.wrapper  = CreateCollapsibleView({collapsibleId:'SettingsView-'.concat(id), collapsibleClass:'collapse container-fluid divSettingsWrapper', collapsedChildren:[divTextareaName, divButtonDelete], rowClass:settingsRowClass});

        /* Setup Listeners */

        //When the animation to expand the Settings View starts, inform the GridManager to change the Active Settings View
        $(elements.wrapper).on('show.bs.collapse', function() 
        {
            toggleViewFunction(elements.wrapper);
        });

        //When the animation to expand the Settings View ends, scroll the Settings View into view
        $(elements.wrapper).on('shown.bs.collapse', function() 
        {
            viewExpandedCallback();
        });

        elements.editNameTextarea.addEventListener('keypress', function(e) 
        {
            if(e.keyCode==13)
            {
                elements.editNameTextarea.blur();
            }
        });

        elements.editNameTextarea.addEventListener('change', function() 
        {
            nameButton.textContent = elements.editNameTextarea.value;
            window.GridManager.GridModified();
        });
    }

    return {
        CreateListItemFromTemplate : createListItemFromTemplate
    };
})();  