'use strict';
(function () 
{   
    //Initialize the app once the DOM content has loaded, and then remove this event listener
    document.addEventListener('DOMContentLoaded', init, {once:true}); //TODO I guess this could also be part of AppNavigationController. Would just have to init that first, and then let it handle initializing the rest

    function init()
    {
        //Initialize the Debug Controller to enable debug capabilities and update the UI as needed
        window.DebugController.Init();

        //Initialize the App Navigation Controller to handle navigation throughout the app
        window.AppNavigationController.Init();
    }    
})();  

window.AppNavigationController = (function() 
{
    const StaticScreens = {
        Landing: '',
        //Authentication: 'Auth',
        Home: 'travel',
    };

    const hashChangedCallbacks = {
        screenChanged: null,
        navigatedHome: null
    };

    function init()
    {
        window.DebugController.Print("AppNavigationController: Setting up app navigation. Current Hash: " + document.location.hash);

        //TODO need to have some sort of loading / signing in / splash screen in between here. With lower internet speeds, it looks janky right now, because after the user has signed in the sign in button will still be displayed briefly. 
            //Maybe the first page should not be the sign in screen, but actually some more generic loading screen.
                //Flow:
                //1) If the screen is *not* LANDING SCREEN, re-route to LANDING SCREEN
                //2) If the screen is LANDING SCREEN, check if user is signed in
                //3) If user is *not* signed in, navigate to AUTH SCREEN
                    //3a) Once user selects the sign in button, hide the auth screen and set the URl Hash to the LANDING SCREEN
                    //3b) Once user completes sign-in flow and page reloads, should end up at Step 2. 
                //4) If user is signed in, navigate to HOME SCREEN

            //TODO Need a better / more seamless connection/interaction between screens changing in AppNavigationController & View
                //Would be good to figure out a strategy for this before cleaning up the flow laid out above
                //Maybe View should have dedicated 'change screen' section
        
        //if (isScreen(StaticScreens.Landing) === true)
        //if (isScreen('Landing') === true)

        //TODO Alternate, more concise flow:
        //1) Check if user is signed in
        //2) If user is *not* signed in, navigate to / show AUTH SCREEN
            //2a) Once user selects the sign in button, hide the auth screen (and set the URl Hash to the LANDING SCREEN?)
            //2b) Once user completes sign-in flow and page reloads, should end up at Step 1. 
        //3) If user is signed in, navigate to HOME SCREEN

        firebase.auth().getRedirectResult().then(function(result) 
        {
            console.log("The page was (re)loaded.");

            /*
            if (result.credential) 
            {
              // This gives you a Google Access Token. You can use it to access the Google API.
              var token = result.credential.accessToken;
              // ...
            }
            */
            // The signed-in user info.
            var user = result.user;
            console.log(user);

            //Initialize the View so that it can assign references to various persistent UI elements within the Checklist
            window.View.Init();

            if (result.user == null)
            {
                //Inform the View to hide the Landing Screen
                window.View.Render('HideLandingScreen');

                //Inform the View to show the Authentication Screen
                window.View.Render('ShowAuthScreen');

                document.getElementById('buttonGoogleSignIn').onclick = beginAuthentication;
            }
            else
            {
                window.DebugController.Print("AppNavigationController: The user is signed in the current screen is the Home Screen. Current Hash: " + document.location.hash);

                //Inform the View to hide the Landing Screen
                window.View.Render('HideLandingScreen');

                //Inform the View to display the Home Screen
                window.View.Render('ShowHomeScreen');

                //TODO Think about how necessary it is to actually use hash values in the URl. Maybe limit use to only when actually useful. 
                    //For example, it turned out not being useful for the auth screen
                //Route the app to the Travel Checklist Home Screen
                //document.location.href = '#travel'; 
                //TODO ^ Need to re-work the above or make it work like it used to, where a one-time hash listener is set up which then sets a parsistent one.
                    //As it is currently the first time the list screen is opened, an 'invalid URL interaction' error will be hit.

                //Initialize the List Controller so that it sets up ongoing event listeners for UI elements within the Checklist and loads the Checklist data from storage
                window.ListController.Init();

                //Set up a persistent hash change listener to handle various navigation scenarios within the app flow
                //window.onhashchange = urlHashChanged;


                //TODO maybe use same model/format that ListController uses for listeners, now that there are actually quite a few in this file
                //Listen for a one-time hash change event, which will fire when the app is re-routed to the Travel Checklist Home Screen, at which point a persistent hash change listener can be set up.
                window.addEventListener('hashchange', setupPersistentHashChangedEventListener, {once:true});

                //Route the app to the Travel Checklist Home Screen
                document.location.href = '#travel'; 
            }

            // //If a user signed in and the current screen is the Home Screen...
            // if (user != null && isHomeScreen(document.location.href) === true)
            // {
            //     window.DebugController.Print("AppNavigationController: The user is signed in the current screen is the Home Screen. Current Hash: " + document.location.hash);

            //     //Initialize the View so that it can assign references to various persistent UI elements within the Checklist
            //     window.View.Init();

            //     //Inform the View to hide the Auth Screen
            //     window.View.Render('HideAuthScreen');

            //     //Inform the View to display the Home Screen
            //     window.View.Render('ShowHomeScreen');

            //     //Initialize the List Controller so that it sets up ongoing event listeners for UI elements within the Checklist and loads the Checklist data from storage
            //     window.ListController.Init();

            //     //Set up a persistent hash change listener to handle various navigation scenarios within the app flow
            //     setupPersistentHashChangedEventListener();
            // }
            // //Else, if no user is signed in and the current screen is the Authentication Screen...
            // else if (user == null && isAuthScreen(document.location.href) === true)
            // {
            //     document.getElementById('buttonGoogleSignIn').onclick = beginAuthentication;
            // }
            // //Else, if no user is signed in and the current screen is not the Authentication Screen...
            // else if (user == null && isAuthScreen(document.location.href) !== true)
            // {
            //     //Re-route the landing page to the Authentication Screen
            //     document.location.href = '#auth'; //TODO This doesn't really accomplish anything right now...

            //     document.getElementById('buttonGoogleSignIn').onclick = beginAuthentication;
            //     window.DebugController.Print("AppNavigationController: App re-routed to the Auth Screen. Current Hash: " + document.location.hash);
            // }
        }).catch(function(error) 
        {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
            console.log("REDIRECT CALLBACK ERROR CALLED");
            console.log(error);
        });

        // //If the landing page is not the Checklist Authentication Screen...
        // if (isAuthScreen(document.location.href) !== true)
        // {
        //     //Re-route the landing page to the Checklist Auth Screen
        //     document.location.href = '#auth';
        //     window.DebugController.Print("AppNavigationController: App re-routed to the Auth Screen. Current Hash: " + document.location.hash);
        // }

        // document.getElementById('buttonGoogleSignIn').onclick = beginAuthentication;

        // if (isHomeScreen(document.location.href) === true)
        // {
            
        // }

    ///////////////////////////////////////////////////////////////////////////

        // //If the landing page is the Checklist Auth Screen...
        // if (isAuthScreen(document.location.href) === true)
        // {
        //     beginAuthentication();
        // }
        // else //Else, if the landing page is any other URL
        // {
        //     window.DebugController.LogWarning("AppNavigationController: The app loaded at a page other than the Auth Screen. Current Hash: " + document.location.hash);
            
        //     //Listen for a one-time hash change event, which will fire when the app is re-routed to the correct landing page
        //     window.addEventListener('hashchange', beginAuthentication, {once:true});

        //     //Re-route the landing page to the Checklist Auth Screen
        //     document.location.href = '#auth'; 
        // }

        // //If the landing page is the Travel Checklist Home Screen...
        // if (isHomeScreen(document.location.href) === true)
        // {
        //     //Set up the listener for whenever the hash changes throughout the app session
        //     setupPersistentHashChangedEventListener();
        // }
        // else //Else, if the landing page is set to an invalid initial url
        // {
        //     window.DebugController.LogWarning("AppNavigationController: The app loaded at a page other than the Home Screen. Current Hash: " + document.location.hash);
            
        //     //Listen for a one-time hash change event, which will fire when the app is re-routed to the correct landing page, at which point a persistent hash change listener can be set up.
        //     window.addEventListener('hashchange', setupPersistentHashChangedEventListener, {once:true});

        //     //Re-route the landing page to the Travel Checklist Home Screen
        //     document.location.href = '#travel'; 
        // }
    }

    function beginAuthentication()
    {
        //Inform the View to hide the Auth Screen
        window.View.Render('HideAuthScreen');

        //Inform the View to show the Landing Screen
        window.View.Render('ShowLandingScreen');
        
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/appstate');
        firebase.auth().useDeviceLanguage();

        //Set the URL Hash to the Travel Checklist Home Screen, so that when the user is redirected to the app's landing page, they will immediately get redirected to the Home Screen
        //document.location.href = '#travel';

        firebase.auth().signInWithRedirect(provider);
    }

    function directToHomeScreen()
    {        
        //Initialize the View so that it can assign references to various persistent UI elements within the Checklist
        window.View.Init();

        //Inform the View to display the Home Screen
        window.View.Render('ShowHomeScreen');

        //Initialize the List Controller so that it sets up ongoing event listeners for UI elements within the Checklist and loads the Checklist data from storage
        window.ListController.Init();

        //Listen for a one-time hash change event, which will fire when the app is re-routed to the Home Screen, at which point a persistent hash change listener can be set up.
        window.addEventListener('hashchange', setupPersistentHashChangedEventListener, {once:true});

        //Re-route to the Travel Checklist Home Screen
        document.location.href = '#travel';
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
            hashChangedCallbacks.screenChanged();

            //TODO Instead of trying to catch all the edge cases here, it might be easiest to just check if the new screen is a List Screen
                //If it is, display the List. (This case might actually not be necessary because there are dedicated Go To List buttons/logic)
                //If it isn't, force the page to the home, hide any active Lists, and clear the browser history
                    //This may need new functionality to determine any non-hidden Lists, if activeListId doesn't suffice
                //Or something roughly along these lines.

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

    //TODO This is no longer entirely accurate, since additional screens have been added
    function isValidScreen(urlString)
    {
        const _fragmentIdentifier = GetFragmentIdentifierFromUrlString(urlString);
        const _fragmentIdentifierPrefix = GetFragmentIdentifierPrefixFromUrlString(urlString);
        const _urlSlug = GetUrlSlug(urlString);

        //If the URL string matches either the Home Screen or a List Screen, return true, else return false.
        return (isHomeScreen(urlString) === true || isListScreen(urlString) === true) ? true : false;
    }

    /**
     * Checks if the provided screen name matches the provided hash or, if no hash is provided, the hash of the current page
     * @param {string} screenName The name of the screen to match
     * @param {string} [hash] [Optional] The hash to match. If no hash is provided, this defaults to the hash of the current page
     * @returns {boolean} true if the screen name and hash match, otherwise false
     */
    function isScreen(screenName, hash)
    {
        //If a URL hash was provided, use that value, otherwise use the hash from the current page
        const _hash = (hash != null) ? hash : document.location.hash;

        //If the name provided is for a List Screen...
        if (screenName === 'List')
        {
            const _hashPrefix = GetFragmentIdentifierPrefix(_hash);
            const _urlSlug = GetUrlSlug(_hash);

            //If the Fragment Identifier prefix is set to 'travel', the full Fragment Identifier is 20 characters long and the URL Slug is 13 characters long, assume this is a List Screen within the Checklist and return true, else return false.
            return (_hashPrefix === 'travel' && _hash.length === 20 && _urlSlug.length === 13) ? true : false;
        }
        //Else, if any other screen name was provided...
        else
        {
            //If the hash value is a match for the screen name provided, return true, else return false
            return (_hash === StaticScreens[screenName]) ? true : false;
        }
    }

    // /**
    //  * Checks if the provided screen name matches the provided URL or, if no URL is provided, the URL of the current page
    //  * @param {string} screenName The name of the screen to match
    //  * @param {string} [urlString] [Optional] The URL string to match. If no URL string is provided, this defaults to the URL of the current page
    //  * @returns {boolean} true if the screen name and URL match, otherwise false
    //  */
    // function isScreen(screenName, urlString)
    // {
    //     //If a URL string was provided, use that, otherwise use the URL from the current page
    //     const _urlString = urlString || document.location.href;

    //     //Get the hash (Fragment Identifier) from the URL string
    //     const _hash = GetFragmentIdentifierFromUrlString(_urlString);

    //     //If the name provided is for a List Screen...
    //     if (screenName === 'List')
    //     {
    //         const _hashPrefix = GetFragmentIdentifierPrefixFromUrlString(_urlString);
    //         const _urlSlug = GetUrlSlug(_hash);

    //         //If the Fragment Identifier prefix is set to 'travel', the full Fragment Identifier is 20 characters long and the URL Slug is 13 characters long, assume this is a List Screen within the Checklist and return true, else return false.
    //         return (_hashPrefix === 'travel' && _hash.length === 20 && _urlSlug.length === 13) ? true : false;
    //     }
    //     //Else, if any other screen name was provided...
    //     else
    //     {
    //         //If the hash value is a match for the screen name provided, return true, else return false
    //         return (_hash === StaticScreens[screenName]) ? true : false;
    //     }
    // }

    function isCurrentStaticScreen(screenName)
    {
        //return (GetFragmentIdentifierFromUrlString(urlString) === StaticScreens[screenName]) ? true : false;
        return (document.location.hash === StaticScreens[screenName]) ? true : false;
    }

    function getCurrentScreenName()
    {
        //For each static screen within the Checklist App...
        for (const key in StaticScreens)
        {
            //If the screen's hash value matches the hash of the currently displayed screen...
            if (StaticScreens[key] === document.location.hash)
            {
                //Return the screen's name
                return key;
            }
        }

        const _fragmentIdentifier = document.location.hash;
        const _fragmentIdentifierPrefix = GetFragmentIdentifierPrefixFromUrlString(document.location.href);
        const _urlSlug = GetUrlSlug(document.location.hash);

        //If the Fragment Identifier prefix is set to 'travel', the full Fragment Identifier is 20 characters long and the URL Slug is 13 characters long, assume this is a List Screen within the Checklist.
        if (_fragmentIdentifierPrefix === 'travel' && _fragmentIdentifier.length === 20 && _urlSlug.length === 13)
        {
            return 'List';
        }

        //TODO maybe could have a DynamicScreens object and each time a List screen is opened, add it to the object, if it isn't already tracked.

        window.DebugController.LogError("Request received to get the current screen name, but the current screen hash did not match any accepted values. Current Hash: " + document.location.hash);
    }

    function isLandingScreen(urlString)
    {
        //If the Fragment Identifier of the URL string is blank, return true, else return false
        return (GetFragmentIdentifierFromUrlString(urlString) === '') ? true : false;
    }

    function isAuthScreen(urlString)
    {
        //If the entire Fragment Identifier of the URL string matches the Auth Screen for the Checklist, return true, else return false
        return (GetFragmentIdentifierFromUrlString(urlString) === 'auth') ? true : false;
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

    function listenForEvent(eventName, callback)
    {
        if (eventName == 'ScreenChanged')
        {
            hashChangedCallbacks.screenChanged = callback;
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