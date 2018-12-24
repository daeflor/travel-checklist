/** General Utilities **/

//TODO Utilities should probably have its own namespace, for clarity

function SwapElementsInArray(array, index, indexToSwap, callback) //TODO these are not DOM elements. Is this confusing?
{
    //Assign the element in the array that should be swapped with the one selected
    var elementToSwap = array[indexToSwap];

    //If the element is not null...
    if (elementToSwap != null)
    {
        //Swap the positions of the elements in the array
        array[indexToSwap] = array[index];
        array[index] = elementToSwap;

        //Execute the provided callback method once the swap has been executed, passing the swapped element as an argument
        callback(elementToSwap);
    }
    else
    {
        window.DebugController.Print("Unable to swap elements in array as the element to swap with is not defined");
    }
}

function RemoveElementFromArray(array, index, callback)
{
    //Remove the element at the given index from the given array
    array.splice(index, 1);

    //Execute the provided callback method once the element has been removed from the array
    callback();
}

//TODO Might be useful to use Try/Catch here
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

function GetArrayIndexOfObjectWithKVP(array, key, value, callback)
{
    //Traverse the array, searching for an object that has a key matching the given value
    for (var i = array.length-1; i >= 0; i--)
    {
        //If a match is found, call the passed callback method and end execution of this method
        if (array[i][key] == value)
        {
            window.DebugController.Print("Returned object with Key: " + key + ", Value: " + value);
            callback(i);
            return;
        }
    } 

    window.DebugController.LogError("ERROR: Unable to find an object with a key matching the given value. Key: " + key + ", Value: " + value);
}

function GetLocationHashRoute()
{
    return document.location.hash.split('/')[1];
}

/** Experimental & In Progress **/

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