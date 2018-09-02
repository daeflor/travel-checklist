/** General Utilities **/

function SwapElementsInArray(array, index, indexToSwap, callback)
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