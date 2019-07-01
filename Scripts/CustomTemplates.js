'use strict';
window.CustomTemplates = (function () 
{   
    //TODO re-order these methods for better readability

    function createListItemFromTemplate(id, name, quantities, borderColor)
    {
        //Create the div wrapper for the entire List Item
        var wrapper = CreateNewElement('div', [ ['id',id], ['class','row divItemRow'] ]);

        //Create the name toggle that can be selected to open or close the Settings View for the List Item
        var nameToggle = CreateToggleForCollapsibleView('SettingsView-'.concat(id), 'buttonNameToggle buttonListItemToggle', name, 'NameButton-'.concat(id));
        
        //Set name toggle's border color to the value provided
        nameToggle.style.borderColor = borderColor;
        
        //Create the div wrapper for the List Item Name, with the name toggle as a child 
        var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], nameToggle);

        //Add the List Item Name to the DOM as a child of the List Item div wrapper
        wrapper.appendChild(nameWrapper);

        for (const key in QuantityTypes) //For each quantity type...
        {
            //Assign the initial value which should be displayed for the given quantity type, either using the values loaded from storage, if provided, or defaulting to zero otherwise.
            const _quantityValue = (quantities != null && quantities[key] != null) ? quantities[key] : 0;

            //Create a quantity toggle element from the template and add it to the DOM as a child of the List Item div wrapper
            wrapper.appendChild(createListItemQuantityToggleFromTemplate(id, key, _quantityValue)); 
        }

        //Create the Settings View for the List Item
        var settingsWrapper = createSettingsViewFromTemplate(
            id, 
            name, 
            'row', 
            function() { wrapper.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});}
        );

        //Add the Settings View to the DOM as a child of the List Item div wrapper
        wrapper.appendChild(settingsWrapper);   

        return wrapper;
    }

    function createListWrapperFromTemplate(listId)
    {
        return CreateNewElement('div', [ ['id','ListWrapper-'.concat(listId)], ['class','container-fluid'], ['hidden', 'true'] ]);
    }

    function createListToggleFromTemplate(id, name, type, borderColor)
    {
        if (id != null && name != null && type != null) //TODO Use try catch instead
        {
            //window.DebugController.Print("Request received to create a List Toggle from the Template, for List ID: " + list.id);

            var wrapper = CreateNewElement('div', [ ['id',id], ['class','row divItemRow divListToggleWrapper'] ]);

            /* Name Toggle/Button */

            //Create the name button/toggle that can be selected to open or close the settings view for the List
            var nameToggle = CreateToggleForCollapsibleView('SettingsView-'.concat(id), 'buttonNameToggle buttonListToggle', name, 'NameButton-'.concat(id));
            
            //Set name toggle's border color to the value provided
            nameToggle.style.borderColor = borderColor;

            //Create the div wrapper for the List Name button/toggle
            var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName divListToggleName'] ], nameToggle);

            /* Navigation Button */

            //var navButton = CreateButtonWithIcon({buttonId:('GoToList-'.concat(data.listId)), buttonClass:'buttonNavigateToList', iconClass:'fa fa-angle-double-right'});
            //TODO it's possible right now for this element creation to happen before the page is at the #travel hash location, which means the hyperlink below won't work. There are various ways this could be addressed. 
            //var hyperlink = (document.location.hash).concat('/').concat(data.listId);
            //console.log("current hash: " + (document.location.hash));
            //var navButton = CreateHyperlinkWithIcon({buttonId:('GoToList-'.concat(data.listId)), buttonClass:'buttonNavigateToList', iconClass:'fa fa-angle-double-right', hyperlink:(document.location.hash).concat('/').concat(data.listId)}); //'#'.concat(data.listType).concat('/').concat(data.listId) - I kind of like forcing it to the given list type...
            
            //var navButton = CreateHyperlinkWithIcon({buttonId:('GoToList-'.concat(data.listId)), buttonClass:'buttonNavigateToList', iconClass:'fa fa-angle-double-right', hyperlink:'html/list.html#/'.concat(data.listType).concat('/').concat(data.listId)}); 
            var navButton = CreateHyperlinkWithIcon({buttonId:('GoToList-'.concat(id)), buttonClass:'buttonNavigateToList', iconClass:'fa fa-angle-double-right', hyperlink:'#'.concat(type).concat('/').concat(id)}); 
            
            //var navButton = CreateButtonWithHyperlink({buttonId:('GoToList-'.concat(data.listId)), buttonClass:'buttonNavigateToList', iconClass:'fa fa-angle-double-right', hyperlink:'#/list/'.concat(data.listId)});


            var navButtonWrapper = CreateNewElement('div', [ ['class','col-2'] ], navButton);

            /* Settings View */

            //Create the Settings View for the List
            var settingsWrapper = createSettingsViewFromTemplate(
                id, 
                name, 
                'list', 
                function() { wrapper.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});}
            );

            /* Append all the individual div wrappers to the overall wrapper */
        
            wrapper.appendChild(nameWrapper);
            wrapper.appendChild(navButtonWrapper);
            wrapper.appendChild(settingsWrapper);

            return wrapper;
        }
        else
        {
            window.DebugController.LogError("Request received to create a List Toggle but valid List data was not provided. Expected a valid list ID, name, and type.");
        }
    }

    function createListItemQuantityToggleFromTemplate(listItemId, type, quantityValue)
    {
        //Create the 'plus' and 'minus' button elements that will appear in the modifier's popover
        var buttonMinus = CreateButtonWithIcon({buttonId:'buttonMinus', buttonClass:'popoverElement', iconClass:'fa fa-minus-circle fa-lg popoverElement'});
        var buttonPlus = CreateButtonWithIcon({buttonId:'buttonPlus', buttonClass:'popoverElement', iconClass:'fa fa-plus-circle fa-lg popoverElement'});

        //Create the element that toggles the visibility of the modifier's popover
        var popoverToggle = CreatePopoverToggle({id:type.concat('QuantityToggle-').concat(listItemId), class:'btn-sm buttonQuantity', display:quantityValue, children:[buttonMinus, buttonPlus], trigger:'manual'});

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

        /* Create Re-order Buttons */
        var buttonMoveUpwards = CreateNewElement(
            'button', 
            [ ['id','MoveUpwards-'.concat(id)], ['type','button'] ], 
            CreateNewElement('i', [['class','fa fa-arrow-up']])
        );

        var buttonMoveDownwards = CreateNewElement(
            'button', 
            [ ['id','MoveDownwards-'.concat(id)], ['type','button'] ], 
            CreateNewElement('i', [['class','fa fa-arrow-down']])
        );

        /* Create Element Wrappers */
        var divTextareaName = CreateNewElement('div', [ ['class','col-6 divEditName'] ], editNameTextarea);
        var divButtonDelete = CreateNewElement('div', [ ['class','col-2'] ], buttonDelete);
        var divButtonMoveUpwards = CreateNewElement('div', [ ['class','col-2'] ], buttonMoveUpwards);
        var divButtonMoveDownwards = CreateNewElement('div', [ ['class','col-2'] ], buttonMoveDownwards);
        
        var settingsRowClass = (parentType == 'list') ? 'row divSettingsWrapperRow divListSettingsWrapperRow' : 'row divSettingsWrapperRow';

        //TODO could consider only having to pass custom classes (i.e. the helper function would create element with default classes, and then add on any custom ones passed to it).
        var wrapper  = CreateCollapsibleView({collapsibleId:'SettingsView-'.concat(id), collapsibleClass:'collapse container-fluid divSettingsWrapper', collapsedChildren:[divTextareaName, divButtonDelete, divButtonMoveUpwards, divButtonMoveDownwards], rowClass:settingsRowClass});

        /* Setup Listeners */
        //When the animation to expand the Settings View ends, scroll the Settings View into view
        $(wrapper).on('shown.bs.collapse', function() { settingsViewExpandedCallback(); });

        //When the ENTER key is pressed, blur the text area
        editNameTextarea.addEventListener('keypress', function(e) 
        {
            if(e.keyCode == 13)
            {
                editNameTextarea.blur();
            }
        });

        return wrapper;
    }

    //TODO Maybe the QuantityTypes object should be passed as a parameter instead of being Global
    function createTravelHeaderFromTemplate()
    {
        var headerWrapper = CreateNewElement('div', [ ['class', 'row'] ]); //TODO Is there no better way to get the formatting right than to have this extra div?

        for (const key in QuantityTypes)
        {
            headerWrapper.appendChild(createQuantityHeaderToggle(key));
        }

        return CreateNewElement('div', [ ['class', 'col'] ], headerWrapper);;
    }

    function createQuantityHeaderToggle(quantityType)
    {
        var buttonClear = CreateButtonWithIcon({buttonId:'buttonClear', buttonClass:'btn-lg buttonClear', iconClass:'fa fa-lg fa-eraser'});

        var iconToggle = CreateNewElement('i', [ ['class',QuantityTypes[quantityType].iconClass] ]);    
        var popoverToggle = CreatePopoverToggle({id:(quantityType.concat('QuantityHeaderToggle')), class:QuantityTypes[quantityType].toggleClass, display:iconToggle, children:[buttonClear], trigger:'focus'});

        return CreateNewElement('div', [ ['class', QuantityTypes[quantityType].wrapperClass] ], popoverToggle);
    }

    return {
        CreateListWrapperFromTemplate: createListWrapperFromTemplate,
        CreateListToggleFromTemplate: createListToggleFromTemplate,
        CreateListItemFromTemplate: createListItemFromTemplate,
        CreateTravelHeaderFromTemplate: createTravelHeaderFromTemplate
    };
})();  