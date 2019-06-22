'use strict';
(function () 
{   
    //Initialize the app once the DOM content has loaded, and then remove this event listener
    document.addEventListener('DOMContentLoaded', init, {once:true}); //TODO I guess this could also be part of AppNavigationController. Would just have to init that first, and then let it handle initializing the rest

    function init()
    {
        //Initialize the View and the other Controllers
        window.AppNavigationController.Init();
        window.View.Init();
        window.DebugController.Init();
        window.ListController.Init();
    }    
})();  

window.AppNavigationController = (function() 
{
    const hashChangedCallbacks = {
        hashChanged: null,
        navigatedHome: null
    };
    
    //TODO Currently, if a URL other than #/travel is provided when first opening the app, urlHashChanged gets called when the page loads 
        //This seems fine, at least for the time being. 
        //Maybe it's possible to use the history to tell if the app was just launched...
    //TODO The first time a garbage URL is provided it doesn't clear it, but on successive attempts it does. Unclear why, but it doesn't seem to be causing any issues.
        //I think it's because the first time it doesn't trigger a page refresh, just a hash change. 
        //This must be some browser behavior, can probably be ignored

    function init()
    {
        window.DebugController.Print("AppNavigationController: Setting up app. Current Hash: " + document.location.hash);


        //TODO Document/Comment this
        if (location.hash !== '#travel')
        {
            window.DebugController.LogWarning("AppNavigationController: The app loaded at a page other than the Home Screen. Current Hash: " + document.location.hash);
            
            //Initialize the app once the DOM content has loaded, and then remove this event listener
            document.addEventListener('hashchange', setupHashChangedEventListener, {once:true});

            //Force the initial page to be the travel list selection screen 
            location.href = '#travel'; 
        }
        else
        {
            setupHashChangedEventListener();
        }

        // //Force the initial page to be the travel list selection screen 
        // location.href = '#travel'; 

        // //Set the behavior for when the URL fragment identifier changes
        // window.onhashchange = urlHashChanged;
    }

    function setupHashChangedEventListener() //TODO this is going to be very confusing, should rename and reorganize
    {
        //Set the behavior for when the URL fragment identifier changes
        window.onhashchange = urlHashChanged;
    }

    function urlHashChanged(hashChangeEvent)
    {
        //let _currentScreenData = getCurrentScreenData();
        //const _data = getDataOnScreenChange(hashChangeEvent);

        //console.log(hashChangeEvent);
        window.DebugController.Print("AppNavigationController: The URL fragment identifier changed. The browser history length is: " + window.history.length);
        //window.DebugController.Print("AppNavigationController: The URL fragment identifier changed. The old URL was: " + hashChangeEvent.oldURL);
        //window.DebugController.Print("AppNavigationController: The URL fragment identifier changed. The new prefix is: " + GetFragmentIdentifierPrefixFromCurrentUrl());

        //TODO What needs to be know for this function?
            //ID of previous List screen
            //List type of new screen
            //Fragment Identifier of new screen (this would contain the list type)

            //In other words:
                //Is this a valid travel page?
                //Is the new screen the home screen?
                //Was the previous screen a List Screen?
                //What is the ID of the previous List?

                //Maybe don't need to check if it's valid.. just check if the new page is the home screen. If yes, then it must be valid, if no, do nothing. Won't be able to log an error because won't be certain but that's the only downside.
                //And also don't need the previous List ID as long as activeListId is being used, just need to know that it was the List Screen (though that pretty much amounts to the same work)

        //If the current screen data specifies the 'travel' checklist type...
        if (getListTypeFromCurrentUrl() === 'travel')
        {
            hashChangedCallbacks.hashChanged();

            //If the new page is the Home Screen and the previous page was a List Screen...
            if (isHomeScreen(hashChangeEvent.newURL) && isListScreen(hashChangeEvent.oldURL))
            {                
                //Execute the List Controller's callback to navigate to the Home Screen, passing the previous's List's ID as an argument
                hashChangedCallbacks.navigatedHome();//(getListIdFromUrlString(hashChangeEvent.oldURL));

                 //If on Pixel 2, clear the browser history log
                 if (/Android 9; Pixel 2/i.test(navigator.userAgent)) //TODO this probably won't work on any other devices
                 {
                     window.DebugController.Print("Browser history will be cleared on Pixel 2 devices.");
                     window.history.go(-(window.history.length-1));
                 }
            }


            // //If a list ID is not specified...
            // if (_currentScreenData.listId == null)
            // {
            //     hashChangedCallbacks.navigatedHome();

            //     //If on Pixel 2, clear the browser history log
            //     if (/Android 9; Pixel 2/i.test(navigator.userAgent)) //TODO this probably won't work on any other devices
            //     {
            //         window.DebugController.Print("Will clear browser history on Pixel 2 devices.");
            //         window.history.go(-(window.history.length-1));
            //     }
            // }
        }
    }

    //TODO All of the URL parsing below could use additional validation

    function getDataOnScreenChange(hashChangeEvent)
    {
        // const _newUrlPrefix = GetFragmentIdentifierPrefixFromUrlString(hashChangeEvent.newURL);
        // const _isValidPage = (GetFragmentIdentifierPrefixFromUrlString(hashChangeEvent.newURL) === 'travel') ? true : false;

        const _oldUrlFragmentIdentifierPrefix = GetFragmentIdentifierPrefixFromUrlString(hashChangeEvent.oldURL);
        const _oldUrlSlug = GetUrlSlug(hashChangeEvent.oldURL);

        return {
            currentScreen: {
                //isValid: (GetFragmentIdentifierPrefixFromUrlString(hashChangeEvent.newURL) === 'travel') ? true : false,
                isHomeScreen: (GetFragmentIdentifierFromUrlString(hashChangeEvent.newURL) === 'travel') ? true : false
            },
            previousScreen: {
                //isListScreen: (GetFragmentIdentifierPrefixFromUrlString(hashChangeEvent.oldURL) == 'travel' && GetUrlSlug(hashChangeEvent.oldURL).length == 13) ? true : false,
                listId: (_oldUrlFragmentIdentifierPrefix == 'travel' && _oldUrlSlug.length == 13) ? _oldUrlSlug : null
            },
        };
    }
    
    function getCurrentScreenData()
    {
        //TODO actually now I kind of do want to go back to using this... maybe

        const _listType = GetFragmentIdentifierPrefixFromCurrentUrl();

        const _hashSegments = document.location.hash.split('/');

        //If the location hash has two segments, and the second segment is 13 characters long, then assign that segment string as the List ID
        const _listId = (_hashSegments.length == 2 && _hashSegments[1].length == 13) ? _hashSegments[1] : null; 

        //TODO is it really necessary return both of these in the same function? Seems like they could be handled individually
        return {
            listType: _listType,
            listId: _listId
        };
    }

    function getListTypeFromCurrentUrl()
    {
        return GetFragmentIdentifierPrefixFromCurrentUrl();
    }

    function getListIdFromUrlString(urlString)
    {
        let _fragmentIdentifierPrefix = GetFragmentIdentifierPrefixFromUrlString(urlString);
        let _urlSlug = GetUrlSlug(urlString);

        //If the hash route is 'travel' and the URL slug contains 13 characters, then assume that this is a List Screen and return true, else return false.
        return (_fragmentIdentifierPrefix == 'travel' && _urlSlug.length == 13) ? _urlSlug : null; //TODO this is pretty hacky. Also is 'null' the best thing to return?
    }

    function isHomeScreen(urlString)
    {
        //If the entire Fragment Identifier of the URL string matches the Home page for the Travel Checklist, return true, else return false
        return GetFragmentIdentifierFromUrlString(urlString) === 'travel' ? true : false;
    }

    //TODO There is some redundancy within these functions

    function isListScreen(urlString)
    {
        //If the hash route is 'travel' and the URL slug contains 13 characters, then assume that this is a List Screen and return true, else return false.
        return (GetFragmentIdentifierPrefixFromUrlString(urlString) == 'travel' && GetUrlSlug(urlString).length == 13) ? true : false; //TODO this is pretty hacky
    }

    // function listenForEvent_HashChanged(callback)
    // {
    //     hashChangedCallbacks.hashChanged = callback;
    // }

    // function listenForEvent_NavigatedHome(callback)
    // {
    //     hashChangedCallbacks.navigatedHome = callback;
    // }

    function listenForEvent(eventName, callback)
    {
        if (eventName == 'HashChanged')
        {
            hashChangedCallbacks.hashChanged = callback;
        }
        else if (eventName == 'NavigatedHome')
        {
            hashChangedCallbacks.navigatedHome = callback;
        }
        //TODO Maybe include 'NavigatedToList' here
        else
        {
            window.DebugController.LogError("Request received to listen to an event, but an invalid event name was provided. Event name: " + eventName);
        }
    }

    return {
        Init: init,
        ListenForEvent: listenForEvent
        // ListenForEvent_HashChanged: listenForEvent_HashChanged,
        // ListenForEvent_NavigatedHome: listenForEvent_NavigatedHome
    };
})();