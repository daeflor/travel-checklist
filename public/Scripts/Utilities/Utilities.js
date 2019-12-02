'use strict';
/** General Utilities **/

//TODO Utilities should probably have its own namespace, for clarity

function SwapElementsInArray(array, index, indexToSwap, callback) //TODO these are not DOM elements. Is this confusing?
{
    //Assign the element in the array that should be swapped with the one selected
    let elementToSwap = array[indexToSwap];

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

function RemoveElementFromArray(array, index)
{
    //Remove the element at the given index from the given array
    array.splice(index, 1);
}

//TODO Might be useful to use Try/Catch here
function FindElement(id, callback)
{
    let element = document.getElementById(id);

    if (element != null)
    {
        callback(element);
    }
    else
    {
        window.DebugController.LogError("ERROR: Failed to find element with an ID of: " + id);
    }
}

function GetElement(id)
{
    let element = document.getElementById(id);

    if (element != null)
    {
        return element
    }
    else
    {
        window.DebugController.LogError("ERROR: Failed to get element with an ID of: " + id);
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
    for (let i = array.length-1; i >= 0; i--)
    {
        //If a match is found, return the index
        if (array[i][key] == value)
        {
            //window.DebugController.Print("Returned object with Key: " + key + ", Value: " + value);
            return i;
        }
    } 

    window.DebugController.LogError("ERROR: Unable to find an object with a key matching the given value. Key: " + key + ", Value: " + value);
}

//TODO see if this is still necessary after upcoming changes to AppNavigationController
function GetFragmentIdentifierPrefixFromUrlString(urlString)
{
    const _fragmentIdentifier = GetFragmentIdentifierFromUrlString(urlString);
    
    //return (_fragmentIdentifier != null) ? _fragmentIdentifier.split('/')[0] : null;

    if (_fragmentIdentifier != null) //TODO replace with try catch
    {
        return _fragmentIdentifier.split('/')[0]; 
        //TODO if there is no Hash Route, would it be better to return an empty string rather than 'undefined'?
    }
    else
    {
        window.DebugController.LogError("Fragment Identifier prefix requested but a valid Fragment Identifier string was not provided.");
    }
}

function GetFragmentIdentifierPrefix(fragmentIdentifier)
{    
    //return (_fragmentIdentifier != null) ? _fragmentIdentifier.split('/')[0] : null;

    window.DebugController.Print("Utilities: Request received to get the prefix for the following fragment identifier: " + fragmentIdentifier);

    if (fragmentIdentifier != null) //TODO replace with try catch
    {
        return fragmentIdentifier.split('/')[0]; 
        //TODO if there is no Hash Route, would it be better to return an empty string rather than 'undefined'?
    }
    else
    {
        window.DebugController.LogError("Fragment Identifier prefix requested but a valid Fragment Identifier string was not provided.");
    }
}

/**
 * Get the Fragment Identifier (anchor tag) for the provided URL
 * @param {string} urlString The full URL string
 * @returns the Fragment Identifier (anchor tag) for the provided URL
 */
function GetFragmentIdentifierFromUrlString(urlString)
{
    if (urlString != null) //TODO replace with try catch
    {
        return urlString.split('#')[1];
        //TODO if there is no Fragment Identifier, would it be better to return an empty string rather than 'undefined'?
    }
    else
    {
        window.DebugController.LogError("Fragment Identifier requested but a valid URL string was not provided.");
    }
}

/**
 * Get the final path segment ("slug") of the provided URL
 * @param {string} urlString The URL or portion of a URL
 * @returns the final path segment ("slug") of the provided URL
 */
function GetUrlSlug(urlString)
{
    //Split the URL into the various path segments separated by '/'
    let _pathSegments = urlString.split('/');

    //Return the last path segment in the URL
    return _pathSegments[_pathSegments.length-1]; 
}

/** Experimental & In Progress **/

/** Unused Utilities **/

// /**
//  * Validates that the provided object contains valid values for the given keys
//  * @param {Object} object the object to validate
//  * @param {string[]} keyArray an array of key strings to validate
//  * @returns {boolean} whether or not the object contains valid valid values for the given keys. 
//  */
// function validateObjectContainsValidKVPs(object, keyArray)
// {
//     //TODO would it be better to use the arguments[] variable here, so that the user can just input mulitple keys as individual parameters?

//     //If a valid object and array of keys was provided...
//     if (object != null && keyArray != null) //TODO should also validate that keyArray is actually an array, and not empty (currently this function will return true in those cases)
//     {
//         let _validResults = true;
        
//         //For each key in the provided array of keys
//         for (let i = 0; i < keyArray.length; i++)
//         {
//             //If the object does not contain that key, or the value for that key is null, log an error and return false.
//             if (object[keyArray[i]] == null)
//             {
//                 _validResults = false;
//                 window.DebugController.LogError("Object does not contain valid values for the given keys. Object: " + JSON.stringify(object));
//                 break;
//             }
//         } 

//         window.DebugController.Print("Object contains valid values for the given keys. Object: " + JSON.stringify(object));
//         return _validResults;
//     }
//     else
//     {
//         //TODO Does it makes sense to be using the DebugController in the Utilities file? Maybe the DebugController should also be made to be more generic (like this file) rather than specific to the Checklist app. 
//         window.DebugController.LogError("Request received to validate that an object contains valid values for the given keys, but either an invalid object or invalid keys array was provided. Object: " + JSON.stringify(object));
//     }
// }

// function MergeObjects(target, source)
// {
//     //If a source object is provided
//     if (source !== undefined)
//     {
//         //If the target is undefined, assign an empty object to it
//         if (target === undefined)
//         {
//             target = {};
//         }

//         //Merge any properties from the source object to the target object
//         Object.assign(target, source);

//         //window.DebugController.Print("Merged two objects into the following target object: ");
//         //window.DebugController.Print(target);
//     }

//     return target;
// }

// function htmlEscape(str) 
// {
//     return str
//         .replace(/&/g, '&amp;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#39;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;');
// }

// function htmlUnescape(str)
// {
//     return str
//         .replace(/&quot;/g, '"')
//         .replace(/&#39;/g, "'")
//         .replace(/&lt;/g, '<')
//         .replace(/&gt;/g, '>')
//         .replace(/&amp;/g, '&');
// }