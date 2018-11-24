//TODO should this whole file be wrapped in an IIFE?

/** Standard Element Creation **/

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
        window.DebugController.LogError("ERROR: Failed to create new element. No name provided.");
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
    var popoverToggle = CreateNewElement('a', [ ['id',data.id], ['class',data.class], ['tabIndex','0'] ]); //Could also set the 'href' attribute to '#!' or 'javascript://' as a hyperlink placeholder
    
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
        delay: { "show": 50, "hide": 50 },
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

    /** Experimental & In Progress **/

function CreateHyperlinkWithIcon(data)
{
    var iconElement = document.createElement('i');

    if (data.iconClass !== undefined)
    {
        iconElement.setAttribute('class', data.iconClass);
    }

    //TODO 'a' elements don't get the default Button style

    //TODO should merge this with the CreateButtonWithIcon method, and simply pass it a type
    
    var buttonElement = CreateNewElement('a', [ ['href', data.hyperlink] ], iconElement);

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

// function CreateButtonWithHyperlink(data)
// {
//     var iconElement = document.createElement('i');

//     if (data.iconClass !== undefined)
//     {
//         iconElement.setAttribute('class', data.iconClass);
//     }

//     var buttonElement = CreateNewElement('button', [ ['type','button'], ['onclick', data.hyperlink] ], iconElement);

//     if (data.buttonId !== undefined)
//     {
//         buttonElement.setAttribute('id', data.buttonId);
//     }

//     if (data.buttonClass !== undefined)
//     {
//         buttonElement.setAttribute('class', data.buttonClass);
//     }

//     return buttonElement;
// }
