/** Experimental & In Progress **/

//TODO This is temporary. It should not be located here. 
    //Maybe create a debug utilities controller?
var DEBUG_MODE = false;

var VERSION = '0.0.1';

function Print(logString)
{
    if (DEBUG_MODE == true)
    {
        console.log(logString);
    }
}

function LogError(logString)
{
    document.getElementById('buttonDebug').style.color = 'red';

    console.log(logString);
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