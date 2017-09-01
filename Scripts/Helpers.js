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

function CreateButtonWithIcon(buttonId, buttonClass, iconClass)
{
    return CreateNewElement(
        'button', 
        [['id',buttonId], ['class',buttonClass], ['type','button']], 
        CreateNewElement('i', [['class',iconClass]])
    );
}

function CreatePopoverToggle(toggleClass, toggleDisplay, popoverChildren, popoverTrigger)
{
    //console.log("Request to create a popover with display of type: " + typeof(toggleDisplay));
    
    /* Setup Popover Elements */
    var divPopover = CreateNewElement('div', [ ['class','popoverElement'] ]); 
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
        animation: true,
        html: true,
        trigger: popoverTrigger,
        content: divPopover.outerHTML
    }); 

    return popoverToggle;
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