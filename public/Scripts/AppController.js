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
    const hashChangedCallbacks = {
        screenChanged: null,
        navigatedHome: null
    };

    function init()
    {
        window.DebugController.Print("AppNavigationController: Setting up app navigation. Current Hash: " + document.location.hash);

        firebase.auth().getRedirectResult().then(function(result) 
        {
            console.log("The page was (re)loaded.");

            if (result.credential) 
            {
              // This gives you a Google Access Token. You can use it to access the Google API.
              var token = result.credential.accessToken;
              // ...
            }
            // The signed-in user info.
            var user = result.user;
            console.log(user);

            //If a user signed in and the current screen is the Home Screen...
            if (user != null && isHomeScreen(document.location.href) === true)
            {
                window.DebugController.Print("AppNavigationController: The user is signed in the current screen is the Home Screen. Current Hash: " + document.location.hash);

                //Initialize the View so that it can assign references to various persistent UI elements within the Checklist
                window.View.Init();

                //Inform the View to hide the Auth Screen
                window.View.Render('HideAuthScreen');

                //Inform the View to display the Home Screen
                window.View.Render('ShowHomeScreen');

                //Initialize the List Controller so that it sets up ongoing event listeners for UI elements within the Checklist and loads the Checklist data from storage
                window.ListController.Init();

                //Set up a persistent hash change listener to handle various navigation scenarios within the app flow
                setupPersistentHashChangedEventListener();
            }
            //Else, if no user is signed in and the current screen is the Authentication Screen...
            else if (user == null && isAuthScreen(document.location.href) === true)
            {
                document.getElementById('buttonGoogleSignIn').onclick = beginAuthentication;
            }
            //Else, if no user is signed in and the current screen is not the Authentication Screen...
            else if (user == null && isAuthScreen(document.location.href) !== true)
            {
                //Re-route the landing page to the Authentication Screen
                document.location.href = '#auth'; //TODO This doesn't really accomplish anything right now...
                document.getElementById('buttonGoogleSignIn').onclick = beginAuthentication;
                window.DebugController.Print("AppNavigationController: App re-routed to the Auth Screen. Current Hash: " + document.location.hash);
            }
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
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/appstate');
        firebase.auth().useDeviceLanguage();

        //Set the URL Hash to the Travel Checklist Home Screen, so that when the user is redirected to the app's landing page, they will immediately get redirected to the Home Screen
        document.location.href = '#travel';

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

    function isValidScreen(urlString)
    {
        const _fragmentIdentifier = GetFragmentIdentifierFromUrlString(urlString);
        const _fragmentIdentifierPrefix = GetFragmentIdentifierPrefixFromUrlString(urlString);
        const _urlSlug = GetUrlSlug(urlString);

        //If the URL string matches either the Home Screen or a List Screen, return true, else return false.
        return (isHomeScreen(urlString) === true || isListScreen(urlString) === true) ? true : false;
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