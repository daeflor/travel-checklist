/** Element Creation **/

//TODO could change child parameter to a list of children instead. 
    //Or better, change to a single object param, and one of the properties is a list of children
function CreateNewElement(elementName, attributes, child)
{
    var element;
    
    if (elementName != null)
    {
        element = document.createElement(elementName);

        if (attributes != null)
        {
            for (var i = 0; i < attributes.length; i++)
            {
                element.setAttribute(attributes[i][0], attributes[i][1]);
            }
        }

        if (child != null)
        {
            element.appendChild(child);
        }

        return element;
    }
    else
    {
        console.log("Failed to create new element. No name provided.");
    }
}

function CreateButtonWithIcon(data)
{
    var iconElement = document.createElement('i');

    if (data.iconClass !== undefined)
    {
        iconElement.setAttribute('class', data.iconClass);
    }

    var buttonElement = CreateNewElement('button', [ ['type','button'] ], iconElement);

    if (data.buttonId !== undefined)
    {
        buttonElement.setAttribute('id', data.buttonId);
    }

    if (data.buttonClass !== undefined)
    {
        buttonElement.setAttribute('class', data.buttonClass);
    }

    return buttonElement;
}

//TODO maybe this SHOULD actually be in a 'helper' or util file... Maybe 'CustomTemplates' (this) vs 'StandardTemplates' (helpers)...?
//TODO is it possible to always reuse the same popover for editing quantity values? Is that even desired?
function CreatePopoverToggle(data)
{    
    /* Setup Popover Elements */
    var divPopover = document.createElement('div');
    for (var i = 0; i < data.children.length; i++)
    {
        divPopover.appendChild(data.children[i]);
    } 

    /* Create Popover Toggle */
    var popoverToggle = CreateNewElement('a', [ ['id',data.id], ['class',data.class], ['href','#!'], ['tabIndex','0'] ]); //Could also use 'javascript://' for the href attribute
    
    if (data.display != null && (typeof(data.display) == 'string') || typeof(data.display) == 'number')
    {
        popoverToggle.text = data.display;  
    }
    else if (data.display != null && typeof(data.display) == 'object')
    {
        popoverToggle.appendChild(data.display);        
    }

    $(popoverToggle).popover({
        placement: 'bottom',
        animation: false,
        delay: { "hide": 50 },
        html: true,
        trigger: data.trigger,
        content: divPopover.outerHTML
    }); 

    return popoverToggle;
}

/**
 * 
 * @param {string} collapsibleId The id for the toggle element
 * @param {string} toggleClass The class for the toggle element
 * @param {*} toggleDisplay The string or object (element) that will be displayed in the toggle
 */
function CreateToggleForCollapsibleView(collapsibleId, toggleClass, toggleDisplay, toggleId)
{
    var idReference = '#'.concat(collapsibleId);
    var toggle = CreateNewElement('button', [ ['id',toggleId], ['class',toggleClass], ['type','button'], ['aria-expanded','false'], ['aria-controls', collapsibleId], ['data-toggle','collapse'], ['data-target',idReference] ]);
    
    if (toggleDisplay != null && (typeof(toggleDisplay) == 'string'))
    {
        toggle.textContent = toggleDisplay;        
    }    
    else if (toggleDisplay != null && typeof(toggleDisplay) == 'object')
    {
        toggle.appendChild(toggleDisplay);        
    }

    return toggle;
}

function CreateCollapsibleView(data)
{    
    var divCard = CreateNewElement('div', [ ['class', data.rowClass] ]); 
    for (var i = 0; i < data.collapsedChildren.length; i++)
    {
        divCard.appendChild(data.collapsedChildren[i]);
    } 

    var wrapperElement = CreateNewElement('div', null, divCard);

    if (data.collapsibleId !== undefined)
    {
        wrapperElement.setAttribute('id', data.collapsibleId);
    }

    if (data.collapsibleClass !== undefined)
    {
        wrapperElement.setAttribute('class', data.collapsibleClass);
    }

    return wrapperElement;
}

//TODO break this file up into different, more specific Utility files

/** Experimental & In Progress **/

function CreateRowSettingsView(id, elements, nameButton, viewExpandedCallback)
{
    CreateSettingsView(id, elements, nameButton, 'row', window.GridManager.ToggleActiveSettingsView, viewExpandedCallback);
}

function CreateListSettingsView(id, elements, nameButton, viewExpandedCallback)
{
    CreateSettingsView(id, elements, nameButton, 'list', window.GridManager.ToggleActiveSettingsView, viewExpandedCallback);
}

/**
 * Creates a Settings View
 * @param {number} id The ID of the List or List Item to which the Settings View belongs
 * @param {array} elements The elements that are part of the Settings View
 * @param {*} nameButton The object (element) that contains/displays the name of the list item (and which may also toggle the settings view)
 * @param {string} parentType The type of parent ('row' or 'list')
 * @param {*} toggleViewFunction The function that should be called when the settings view is toggled
 */
function CreateSettingsView(id, elements, nameButton, parentType, toggleViewFunction, viewExpandedCallback)
{
    //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed

    /* Create Text Area */
    elements.editNameTextarea = CreateNewElement('textarea', [ ['class',''] ]);
    elements.editNameTextarea.textContent = nameButton.textContent; 

    /* Create Delete Button */
    elements.buttonDelete = CreateNewElement(
        'button', 
        [ ['id','Delete-'.concat(id)], ['type','button'] ], 
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

/** Unused **/
//TODO move these elsewhere

function htmlEscape(str) 
{
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function htmlUnescape(str)
{
    return str
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}