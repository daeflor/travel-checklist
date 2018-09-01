/** Experimental & In Progress **/

function GetElement(id, callback)
{
    var element = document.getElementById(id);

    if (element != null)
    {
        callback(element);
    }
    else
    {
        window.DebugController.LogError("ERROR: Failed to find element with an ID of: " + id);
    }
}

/** Unused Utilities **/

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