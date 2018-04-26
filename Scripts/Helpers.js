/** Element Creation **/

//TODO could change child parameter to a list of children instead
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

//TODO could standardize this more so that it doesn't need to take an id, if possible?
    //Maybe pass an options parameter
function CreateButtonWithIcon(buttonId, buttonClass, iconClass)
{
    return CreateNewElement(
        'button', 
        [ ['id',buttonId], ['class',buttonClass], ['type','button'] ], 
        CreateNewElement('i', [['class',iconClass]])
    );
}

function CreatePopoverToggle(toggleClass, toggleDisplay, popoverChildren, popoverTrigger)
{    
    /* Setup Popover Elements */
    var divPopover = document.createElement('div');
    for (var i = 0; i < popoverChildren.length; i++)
    {
        divPopover.appendChild(popoverChildren[i]);
    } 

    /* Create Popover Toggle */
    var popoverToggle = CreateNewElement('a', [ ['class',toggleClass], ['href','#!'], ['tabIndex','0'] ]); //Could also use 'javascript://' for the href attribute
    
    if (toggleDisplay != null && (typeof(toggleDisplay) == 'string') || typeof(toggleDisplay) == 'number')
    {
        popoverToggle.text = toggleDisplay;        
    }
    else if (toggleDisplay != null && typeof(toggleDisplay) == 'object')
    {
        popoverToggle.appendChild(toggleDisplay);        
    }

    $(popoverToggle).popover({
        placement: 'bottom',
        animation: false,
        delay: { "hide": 50 },
        html: true,
        trigger: popoverTrigger,
        content: divPopover.outerHTML
    }); 

    return popoverToggle;
}

function CreateToggleForCollapsibleView(collapsibleId, toggleClass, toggleDisplay)
{
    var idReference = '#'.concat(collapsibleId);
    var toggle = CreateNewElement('button', [ ['class',toggleClass], ['type','button'], ['aria-expanded','false'], ['aria-controls', collapsibleId], ['data-toggle','collapse'], ['data-target',idReference] ]);
    
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

//TODO could standardize this more so that it doesn't need to take an id, if possible?
    //Maybe pass an options parameter
function CreateCollapsibleView(collapsibleId, collapsibleClass, collapsedChildren)
{    
    var divCard = CreateNewElement('div', [ ['class','row'] ]); //card card-body
    for (var i = 0; i < collapsedChildren.length; i++)
    {
        divCard.appendChild(collapsedChildren[i]);
    } 

    return CreateNewElement('div', [ ['class',collapsibleClass], ['id',collapsibleId] ], divCard); 
}

/** Storage **/

function SaveNameValuePairToLocalStorage(name, value)
{
    if (typeof(Storage) !== "undefined") 
    {
        localStorage.setItem(name, value);
        console.log('Pair added to localstorage, with name "' + name + '" and value "' + value + '".');
    } 
    else 
    {
        alert('No Local Storage Available');
    }
}

function LoadValueFromLocalStorage(name)
{
    if (typeof(Storage) !== "undefined") 
    {
        console.log('Request to load value for "' + name +'" from localstorage.');        
        return localStorage.getItem(name);
    } 
    else 
    {
        alert('No Local Storage Available');
    }
}

/** Experimental & In Progress **/

function CreateRowSettingsView(index, elements, nameButton)
{
    CreateSettingsView(index, elements, nameButton, 'row', GridManager.ToggleActiveSettingsView);
}

function CreateListSettingsView(index, elements, nameButton)
{
    CreateSettingsView(index, elements, nameButton, 'list', GridManager.ToggleActiveListSettingsView);
}

/**
 * Creates a Settings View
 * @param {number} index The Index
 * @param {array} elements The elements that are part of the view
 * @param {*} nameButton The button with the name string that also toggles the settings view
 * @param {string} parentType The type of parent ('row' or 'list')
 * @param {*} toggleViewFunction The function that should be called when the settings view is toggled
 */
function CreateSettingsView(index, elements, nameButton, parentType, toggleViewFunction)
{
    //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed

    /* Create Text Area */
    elements.editNameTextarea = CreateNewElement('textarea', [ ['class',''] ]);
    elements.editNameTextarea.textContent = nameButton.textContent; 

    /* Create Delete Button */
    elements.buttonDelete = CreateNewElement(
        'button', 
        [ ['class','btn'], ['type','button'] ], 
        CreateNewElement('i', [['class','fa fa-trash']])
    );

    /* Create Element Wrappers */
    var divTextareaName = CreateNewElement('div', [ ['class','col-5 divEditName'] ], elements.editNameTextarea);
    var divButtonDelete = CreateNewElement('div', [ ['class','col-2'] ], elements.buttonDelete);
    //TODO could consider only having to pass custom classes (i.e. the helper function would create element with default classes, and then add on any custom ones passed to it).
    elements.wrapper  = CreateCollapsibleView('edit-'.concat(parentType).concat('-').concat(index), 'collapse container-fluid divSettingsWrapper', [divTextareaName, divButtonDelete]);

    /* Setup Listeners */
    $(elements.wrapper).on('show.bs.collapse', function() 
    {
        toggleViewFunction(elements.wrapper); //GridManager.ToggleActiveSettingsView(Elements.settingsWrapper);
    });

    elements.editNameTextarea.addEventListener("keypress", function(e) 
    {
        if(e.keyCode==13)
        {
            elements.editNameTextarea.blur();
        }
    });

    elements.editNameTextarea.addEventListener("change", function() 
    {
        nameButton.textContent = elements.editNameTextarea.value;
        GridManager.GridModified();
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