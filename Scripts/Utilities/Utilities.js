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

        //Return the swapped element once the swap has been executed
        return elementToSwap;
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

/**
 * Get the index of an object which has a key that matches the given value, in the given array 
 * @param {array} array The array in which to search for the object
 * @param {string} key The key for which to find a matching value
 * @param {*} value The value of the provided key to search for
 * @returns the index of the found object in the array provided
 */
function GetArrayIndexOfObjectWithKVP(array, key, value)
{
    //Traverse the array, searching for an object that has a key matching the given value
    for (var i = array.length-1; i >= 0; i--)
    {
        //If a match is found, return the index
        if (array[i][key] == value)
        {
            window.DebugController.Print("Returned object with Key: " + key + ", Value: " + value);
            return i;
        }
    } 

    window.DebugController.LogError("ERROR: Unable to find an object with a key matching the given value. Key: " + key + ", Value: " + value);
}

function GetLocationHashRoute()
{
    return document.location.hash.split('/')[1];
}

function MergeObjects(target, source)
{
    //If a source object is provided
    if (source !== undefined)
    {
        //If the target is undefined, assign an empty object to it
        if (target === undefined)
        {
            target = {};
        }

        //Merge any properties from the source object to the target object
        Object.assign(target, source);

        window.DebugController.Print("Merged two objects into the following target object: ");
        window.DebugController.Print(target);
    }

    return target;
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