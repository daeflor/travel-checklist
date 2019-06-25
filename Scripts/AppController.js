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

    function init()
    {
        window.DebugController.Print("AppNavigationController: Setting up app. Current Hash: " + document.location.hash);

        //If the landing page is the Travel Checklist Home Screen...
        if (isHomeScreen(document.location.href) === true)
        {
            //Set up the listener for whenever the hash changes throughout the app session
            setupPersistentHashChangedEventListener();
        }
        else //Else, if the landing page is set to an invalid initial url
        {
            window.DebugController.LogWarning("AppNavigationController: The app loaded at a page other than the Home Screen. Current Hash: " + document.location.hash);
            
            //Listen for a one-time hash change event, which will fire when the app is re-routed to the correct landing page, at which point a persistent hash change listener can be set up.
            window.addEventListener('hashchange', setupPersistentHashChangedEventListener, {once:true});

            //Re-route the landing page to the Travel Checklist Home Screen
            document.location.href = '#travel'; 
        }
    }

    function setupPersistentHashChangedEventListener() 
    {
        //Set the behavior for when the URL fragment identifier changes
        window.onhashchange = urlHashChanged;
        window.DebugController.Print("AppNavigationController: A persistent Hash Changed event listener has been set up.");
    
        //TODO Maybe a different approach to this would be, in urlHashChanged, to use the browser history to tell if the app was just launched / is on the first page. If so, then ignore the event...
            //This would also only work on mobile for the same reasons as clearing browser history though... On regular Chrome, the landing page may not actually be the first page in history.
            //Maybe instead, look at previous page in history (if possible). If it exists, and is not part of the travel checklist, then you know this is the first launch of the app.
            //That seems hackier than the current solution though, which is actually fine. 
    }

    function urlHashChanged(hashChangeEvent)
    {
        window.DebugController.Print("AppNavigationController: The URL fragment identifier changed. The new URL is: " + hashChangeEvent.newURL + ". The browser history length is: " + window.history.length);
        //window.DebugController.Print("AppNavigationController: The URL fragment identifier changed. The old URL was: " + hashChangeEvent.oldURL);
        //window.DebugController.Print("AppNavigationController: The URL fragment identifier changed. The new prefix is: " + GetFragmentIdentifierPrefixFromCurrentUrl());

        //If the new page is a valid screen within the Travel Checklist app...
        if (isValidScreen(hashChangeEvent.newURL) === true)
        {
            //Execute the ListController's hash changed callback function 
            hashChangedCallbacks.hashChanged();

            //If the new page is the Home Screen and the previous page was a List Screen...
            if (isHomeScreen(hashChangeEvent.newURL) === true && isListScreen(hashChangeEvent.oldURL) === true)
            {                
                //Execute the List Controller's callback to navigate to the Home Screen
                hashChangedCallbacks.navigatedHome();

                //On Pixel 2, clear the browser history log, so that the user cannot navigate 'back' when in the Home Screen
                if (/Android 9; Pixel 2/i.test(navigator.userAgent)) //TODO this won't work on any other devices or OS
                {
                    window.DebugController.Print("Browser history will be cleared on Pixel 2 devices.");
                    window.history.go(-(window.history.length-1));

                    //TODO Note that clearing browser history will cause issues if the app is not being ran in PWA mode

                    //TODO might want to differentiate between back button pressed and home button pressed. 
                        //When Home button pressed, could go back one level in browser history or use location.replace
                        //Then it shouldn't be necessary to clear the history / go to initial page in history as is being done above.
                        //The problem is, how to propery listen for the Home button being pressed? Probably direclty between AppNavigationController and View (not using ListController)
                     //TODO a separate option, which I like less, could be that when the app loads, clear the browser history, then force re-route to #travel. 
                        //This should make the Home Screen always the first page, even within Chrome. 
                        //However, this seems like a poor solution, expecially when compare to the ones above. 
                }
            }
            //Else, if the old page was not the Home Screen or the new page is not a List Screen (i.e. the old page was the List Screen or an invalid page, or the new page is the Home Screen or an invalid page)...
            else if (isHomeScreen(hashChangeEvent.oldURL) === false || isListScreen(hashChangeEvent.newURL) === false) 
            {
                window.DebugController.LogWarning("AppNavigationController: The URL Hash changed in an unsupported way. The app will be re-routed to the Home Screen.");
                document.location.href = '#travel'; //Re-route the landing page to the Travel Checklist Home Screen

                //TODO Problem here is that if you're at the Home Screen and manually input a valid List Screen URL, it treats that as valid, but doesn't actually navigate to the List Screen. 
                    //If you then navigate to a different List Screen it detects that as going from List Screen to List Screen and forces the app back to Home Screen
                    //Not much way around this edge case expect to handle 'Go To List' event here in AppNavigationController as well. 
            }
        }
        else 
        {
            window.DebugController.LogWarning("AppNavigationController: The URL Hash changed to an invalid value that is not part of the Travel Checklist. The app will be re-routed to the Home Screen.");
            document.location.href = '#travel'; //Re-route the landing page to the Travel Checklist Home Screen

            //TODO This may not always be the best resort because forcing the app to the home page may then subsequently result in the other error, that the URL changed in an unsupported way.
        }
    }

    function isValidScreen(urlString)
    {
        const _fragmentIdentifier = GetFragmentIdentifierFromUrlString(urlString);
        const _fragmentIdentifierPrefix = GetFragmentIdentifierPrefixFromUrlString(urlString);
        const _urlSlug = GetUrlSlug(urlString);

        //If the URL string matches either the Home Screen or a List Screen, return true, else return false.
        return (isHomeScreen(urlString) === true || isListScreen(urlString) === true) ? true : false;
    }

    function isHomeScreen(urlString)
    {
        //If the entire Fragment Identifier of the URL string matches the Home Screen for the Travel Checklist, return true, else return false
        return (GetFragmentIdentifierFromUrlString(urlString) === 'travel') ? true : false;
    }

    function isListScreen(urlString)
    {
        const _fragmentIdentifier = GetFragmentIdentifierFromUrlString(urlString);
        const _fragmentIdentifierPrefix = GetFragmentIdentifierPrefixFromUrlString(urlString);
        const _urlSlug = GetUrlSlug(urlString);

        //If the Fragment Identifier prefix is set to 'travel', the full Fragment Identifier is 20 characters long and the URL Slug is 13 characters long, assume this is a List Screen within the Checklist.
        return (_fragmentIdentifierPrefix === 'travel' && _fragmentIdentifier.length === 20 && _urlSlug.length === 13) ? true : false;
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