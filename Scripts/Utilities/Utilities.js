/** General Utilities **/

function swapElementsInArray(array, index, indexToSwap, callback)
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