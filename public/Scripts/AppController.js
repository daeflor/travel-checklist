'use strict';
(function () 
{   
    //Initialize the app once the DOM content has loaded, and then remove this event listener
    window.document.addEventListener('DOMContentLoaded', init, {once:true}); //TODO I guess this could also be part of AppNavigationController. Would just have to init that first, and then let it handle initializing the rest

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
        //Loading: '',
        //Authentication: 'Auth',
        Home: 'travel',
    };

    const hashChangedCallbacks = {
        screenChanged: null,
        navigatedHome: null
    };

    let authUI;
    //let uiConfig;

    // function printPoppedState(event)
    // {
    //     console.log("PRINTING POPPED STATE EVENT");
    //     console.log(event);
    // }  

    function init()
    {
        window.DebugController.Print("AppNavigationController: Initializing Application... Current Hash: " + window.document.location.hash);

        //window.onpopstate = printPoppedState;

        //Clear any hash value from the URL, since the app will start at the default landing page regardless of any URL hash provided
        //window.document.location.hash = ''; 
        window.history.replaceState({}, window.document.title, window.location.pathname);

        //TODO Need a better / more seamless connection/interaction between screens changing in AppNavigationController & View
            //Maybe View should have dedicated 'change screen' section
            //View as a function of state
        
        //if (isScreen(StaticScreens.Loading) === true)
        //if (isScreen('Loading') === true)

        //TODO Alternate, more concise flow:
        //1) Check if user is signed in
        //2) If user is *not* signed in, navigate to / show AUTH SCREEN
            //2a) Once user selects the sign in button, hide the auth screen (and set the URl Hash to the LANDING SCREEN?)
            //2b) Once user completes sign-in flow and page reloads, should end up at Step 1. 
        //3) If user is signed in, navigate to HOME SCREEN

        //TODO would be nice if only necessary components of the View were loaded at certain points (i.e. separate Loading & Auth Screens from Travel Checklist Screens)
            //Perhaps AppView, ChecklistView, & ListView, where a Checklist is a collection of related Lists (e.g. a Travel Checklist containing a Clothes List)
        // //Initialize the View so that it can assign references to various persistent UI elements within the Checklist
        // window.View.Init();

        // //Inform the View to hide the Loading Screen
        // window.View.Render('HideLoadingScreen');

        // //Initialize the FirebaseUI Widget using Firebase.
        // authUI = new firebaseui.auth.AuthUI(firebase.auth());

        // console.log("IS PENDING REDIRECT?");
        // console.log(authUI.isPendingRedirect());

        // firebase.auth().onAuthStateChanged(reactToAuthStateChange);

        listenForEvent_AuthStateChanged();
    }

    /**
     * Listens for a change in the authentication state of the current user of the application
     */
    function listenForEvent_AuthStateChanged()
    {
        firebase.auth().onAuthStateChanged(reactToEvent_AuthStateChanged);
    }

    /**
     * Reacts to a change in the authentication state of the current user of the application. 
     * If they are not signed in, the Authentication Screen is displayed and Firebase Google Authentication UI is initiated.
     * If they are signed in, the Home Screen is displayed.
     * @param {object} user The object representing the data for the authenticated user, if one exists
     */
    function reactToEvent_AuthStateChanged(user)
    {
        window.DebugController.Print("AppNavigationController: Auth state changed. User signed in?: " + (user != null));

        //TODO would be nice if only necessary components of the View were loaded at certain points (i.e. separate Loading & Auth Screens from Travel Checklist Screens)
            //Perhaps AppView, ChecklistView, & ListView, where a Checklist is a collection of related Lists (e.g. a Travel Checklist containing a Clothes List)
        //Initialize the View so that it can show and hide screens as needed throughout the authentication flow
        window.View.Init();

        //Inform the View to hide the Loading Screen, as either the Auth Screen or Home Screen will be displayed, based on the authentication state
        window.View.Render('HideLoadingScreen');

        //TODO - TEMP
        ////
            // //Initialize the FirebaseUI Widget using Firebase.
            // authUI = new firebaseui.auth.AuthUI(firebase.auth());

            // console.log("IS PENDING REDIRECT?");
            // console.log(authUI.isPendingRedirect());
        ////

        //TODO (remove this note)
            //Here, isPendingRedirect would be true after sign-in attempt

        //If there is no user signed into the app...
        if (user == null)
        {
            window.DebugController.Print("AppNavigationController: There is no user signed in so the Auth Screen will be displayed.");

            // //Inform the View to hide the Loading Screen
            // window.View.Render('HideLoadingScreen');
            
            //Inform the View to show the Authentication Screen
            window.View.Render('ShowAuthScreen');

            //Start the Firebase Authentication UI flow
            startFirebaseAuthUIFlow();
        }
        //Else, if there is a user signed into the app...
        else
        {
            window.DebugController.Print("AppNavigationController: A user is signed in so the Home Screen will be displayed.");

            // //Inform the View to hide the Loading Screen
            // window.View.Render('HideLoadingScreen');

            //Inform the View to display the Home Screen
            window.View.Render('ShowHomeScreen');

            //When the Sign-Out button is pressed, sign the user out and show the Authentication Screen
            listenForEvent_SignOutButtonPressed();

            //Initialize the List Controller so that it sets up ongoing event listeners for UI elements within the Checklist and loads the Checklist data from storage
            window.ListController.Init();

            //TODO not sure if pushState or replaceState is best here... Depends on flow on mobile, and on other screens that may be added. But right now there is no reason to allow the user to return to the loading screen.
            window.history.replaceState({screen:'Home'}, window.document.title, window.location.pathname + '#travel');

            //TODO may want to clear history so user can't go back to Google sign-in page. 
                //Need to test this flow on mobile. 

            //Set up a persistent hash change listener to handle various navigation scenarios within the app flow
            window.onhashchange = urlHashChanged;
            
            // //TODO Think about how necessary it is to actually use hash values in the URl. Maybe limit use to only when actually useful. 
            //     //For example, it turned out not being useful for the auth screen. It should only be necessary when a user needs to be able to navigate backward or forward to that page. 
        }
    }

    function startFirebaseAuthUIFlow()
    {
        window.DebugController.Print("AppNavigationController: Starting Firebase UI flow.");

        //Declare a variable to hold the configuration for the Firebase Auth UI flow
        let _uiConfig;

        //If a Firebase AuthUI instance does not already exist, set up a new instance along with a configuration
        if (authUI == null)
        {
            window.DebugController.Print("AppNavigationController: A Firebase AuthUI instance does not already exist, so setting up a new one.");

            //Initialize the FirebaseUI Widget using Firebase.
            authUI = new firebaseui.auth.AuthUI(firebase.auth());

            console.log("IS PENDING REDIRECT?");
            console.log(authUI.isPendingRedirect());

            _uiConfig = {
                callbacks: {
                    uiShown: function() {
                        console.log("UI SHOWN Triggered");
                        console.log("IS PENDING REDIRECT?");
                        console.log(authUI.isPendingRedirect());
                        // The widget is rendered.
                        // Hide the loader.
                        document.getElementById('loader').style.display = 'none';

                        replaceFirebaseUIAuthProgressBarWithCustomVariant();

                // //If there is no user signed into the app...
                // if (firebase.auth().currentUser != null)
                // {
                //     //Inform the View to hide the Auth Screen
                //     window.View.Render('HideAuthScreen');

                //     //Inform the View to show the Loading Screen
                //     window.View.Render('ShowLoadingScreen');
                // }
                
                    },
                    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                        console.log("SUCCESSFUL SIGN IN");
                        console.log("IS PENDING REDIRECT?");
                        console.log(authUI.isPendingRedirect());
                        // User successfully signed in.
        
                        // Return type determines whether we continue the redirect automatically
                        // or whether we leave that to developer to handle.
                        return false;
                    }
                },
                signInFlow: 'redirect',
                //signInSuccessUrl: '#travel',
                signInOptions : [
                    {
                        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                        scopes: [
                            'https://www.googleapis.com/auth/appstate'
                        ],
                        customParameters: {
                            // Forces account selection even when one account is available.
                            prompt: 'select_account'
                        }
                    }
                ]
            };
        }

        authUI.start('#firebaseui-auth-container', _uiConfig);
    }

    function replaceFirebaseUIAuthProgressBarWithCustomVariant()
    {
        //TODO The logic below is a hacky way of getting rid of the ugly firebase authenicating widget and replacing it with a minimalistic variant
        let _progressBar = document.getElementsByClassName('mdl-card');

        if (_progressBar[0] != null)
        {
            _progressBar[0].remove();

            //Inform the View to hide the Auth Screen
            window.View.Render('HideAuthScreen');

            //Inform the View to show the Loading Screen
            document.getElementById('divLoadingScreen').textContent = "Authenticating...";
            window.View.Render('ShowLoadingScreen');
        }
    }

    /**
     * Listens for an event indicting the Sign-Out button has been pressed
     */
    function listenForEvent_SignOutButtonPressed()
    {
        window.document.getElementById('buttonSignOut').onclick = reactToEvent_SignOutButtonPressed;
    }

    function reactToEvent_SignOutButtonPressed()
    {
        //TODO could possibly show loading screen here, but it likely isn't necessary

        firebase.auth().signOut().then(function() {
            //Inform the View to hide the Home Screen
            window.View.Render('HideHomeScreen');

            window.history.replaceState({screen:'Auth'}, window.document.title, window.location.pathname);

            //The reactToAuthStateChange function will also be automatically called here, which will show the auth screen

            //TODO what happens if user signs in again after signing out? Everything *should* work because the page would reload and everything would get re-initialized, but it would be good to confirm/test
                //Seems like everything is working fine.

        }).catch(function(error) {
            // An error happened.
            window.DebugController.LogError("An error was encountered when trying to sign the user out. Error (below): ");
            window.DebugController.LogError(error);
          });
    }

    // function reactToAuthStateChange(user)
    // {
    //     window.DebugController.Print("AppNavigationController: Auth state changed. The user is: " + user);

    //     //If there is no user signed into the app...
    //     if (user == null)
    //     {
    //         //Inform the View to show the Authentication Screen
    //         window.View.Render('ShowAuthScreen');

            


    //         // The start method will wait until the DOM is loaded.
    //         authUI.start('#firebaseui-auth-container', uiConfig);

    //         // //TODO is there a good way to tell if this has already been done? Currently, it will get called if the user signs out, even though the button listener is already set up
    //         // //Add a listener to the 'Sign Out' button so that when it is pressed, the user is signed out
    //         // window.document.getElementById('buttonGoogleSignIn').onclick = beginAuthentication;
    //     }
    //     //Else, if there is a user signed into the app...
    //     else
    //     {
    //         window.DebugController.Print("AppNavigationController: The user is signed in so the Home Screen will be displayed.");

    //         //Inform the View to hide the Loading Screen
    //         window.View.Render('HideLoadingScreen');

    //         //Inform the View to display the Home Screen
    //         window.View.Render('ShowHomeScreen');

    //         //Add a listener to the 'Sign In' button so that when it is pressed, the authentication process is initiated
    //         window.document.getElementById('buttonSignOut').onclick = signOut;

    //         //Initialize the List Controller so that it sets up ongoing event listeners for UI elements within the Checklist and loads the Checklist data from storage
    //         window.ListController.Init();

    //         window.history.replaceState({screen:'Home'}, window.document.title, window.location.pathname + '#travel'); //TODO not sure if pushState or replaceState is best here... Depends on flow on mobile, and on other screens that may be added. But right now there is no reason to allow the user to return to the loading screen.

    //         //TODO may want to clear history so user can't go back to Google sign-in page. 
    //             //Need to test this flow on mobile. Will be easier to test once there is a sign-out option.

    //         //Set up a persistent hash change listener to handle various navigation scenarios within the app flow
    //         window.onhashchange = urlHashChanged;
            
    //         // //TODO Think about how necessary it is to actually use hash values in the URl. Maybe limit use to only when actually useful. 
    //         //     //For example, it turned out not being useful for the auth screen. It should only be necessary when a user needs to be able to navigate backward or forward to that page. 
    //     }
    // }

    function beginAuthentication()
    {
        //Inform the View to hide the Auth Screen
        window.View.Render('HideAuthScreen');

        //Inform the View to show the Loading Screen
        window.View.Render('ShowLoadingScreen');
        
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/appstate');
        firebase.auth().useDeviceLanguage();

        firebase.auth().signInWithRedirect(provider);
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

        console.log(window.history.state);
        //TODO might need to use onpopstate event instead...
        
        //TODO my current theory as to why it's behaving weird:
            //1)The Go to List button is pressed
            //2) The history state gets set
            //3) The URL Hash actually changes (because of delay, this doesn't happen sooner)
            //4) The history state is now null because the most recent history change was not caused by replaceState
            //It seems that using a combination of hash routing and replaceState() calls is not a compatible solution
        //TODO would probably be best to comment out these changes and work on them some time in the future in a separate branch, dedicated to improving the app navigation flow 

        // if (window.history.state == null)
        // {
        //     //TODO Log Warning
        //     //Clear any hash value from the URL, since... TODO
        //     window.history.replaceState({screen:'Home'}, window.document.title, window.location.pathname);
        //     //TODO actually would want to force a reload in this case I think... (though also not allow the user to go back to the invalid page)
        // }
        // else
        // {
        //     //Execute the ListController's hash changed callback function 
        //     hashChangedCallbacks.screenChanged();

        //     if (window.history.state != null && window.history.state.screen === 'List' && isScreen('Home') === true)
        //     {
        //         window.history.replaceState({screen:'Home'}, window.document.title);
                
        //         //Execute the List Controller's callback to navigate to the Home Screen
        //         hashChangedCallbacks.navigatedHome();

        //         //On Pixel 2, clear the browser history log, so that the user cannot navigate 'back' when in the Home Screen
        //         if (/Android 9; Pixel 2/i.test(navigator.userAgent)) //TODO this won't work on any other devices or OS
        //         {
        //             window.DebugController.Print("Browser history will be cleared on Pixel 2 devices.");
        //             window.history.go(-(window.history.length-1));

        //             //TODO Note that clearing browser history will cause issues if the app is not being ran in PWA mode

        //             //TODO might want to differentiate between back button pressed and home button pressed. 
        //                 //When Home button pressed, could go back one level in browser history or use location.replace
        //                 //Then it shouldn't be necessary to clear the history / go to initial page in history as is being done above.
        //                 //The problem is, how to propery listen for the Home button being pressed? Probably direclty between AppNavigationController and View (not using ListController)
        //             //TODO a separate option, which I like less, could be that when the app loads, clear the browser history, then force re-route to #travel. 
        //                 //This should make the Home Screen always the first page, even within Chrome. 
        //                 //However, this seems like a poor solution, expecially when compared to the ones above. 
        //             //TODO yeah the correct solution seems to be to utilise replaceState() and pushState() for routing instead of current logic
        //         }
        //     }
        // }

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
                window.document.location.href = '#travel'; //Re-route the landing page to the Travel Checklist Home Screen

                //TODO Problem here is that if you're at the Home Screen and manually input a valid List Screen URL, it treats that as valid, but doesn't actually navigate to the List Screen. 
                    //If you then navigate to a different List Screen it detects that as going from List Screen to List Screen and forces the app back to Home Screen
                    //Not much way around this edge case expect to handle 'Go To List' event here in AppNavigationController as well. 
            }
        }
        else 
        {
            window.DebugController.LogWarning("AppNavigationController: The URL Hash changed to an invalid value that is not part of the Travel Checklist. The app will be re-routed to the Home Screen.");
            window.document.location.href = '#travel'; //Re-route the landing page to the Travel Checklist Home Screen

            //TODO This may not always be the best resort because forcing the app to the home page may then subsequently result in the other error, that the URL changed in an unsupported way.
        }
    }

    //TODO This is no longer entirely accurate, since additional screens have been added
    function isValidScreen(urlString)
    {
        //const _fragmentIdentifier = GetFragmentIdentifierFromUrlString(urlString);
        //const _fragmentIdentifierPrefix = GetFragmentIdentifierPrefix(_fragmentIdentifier);
        //const _urlSlug = GetUrlSlug(urlString);

        //If the URL string matches either the Home Screen or a List Screen, return true, else return false.
        return (isHomeScreen(urlString) === true || isListScreen(urlString) === true) ? true : false;
    }

    // /**
    //  * Checks if the provided screen name matches the provided hash or, if no hash is provided, the hash of the current page
    //  * @param {string} screenName The name of the screen to match
    //  * @param {string} [hash] [Optional] The hash to match. If no hash is provided, this defaults to the hash of the current page
    //  * @returns {boolean} true if the screen name and hash match, otherwise false
    //  */
    // function isScreen(screenName, hash)
    // {
    //     //If a URL hash was provided, use that value, otherwise use the hash from the current page
    //     const _hash = (hash != null) ? hash : window.document.location.hash;
    //     //TODO PROBLEM: This hash value will include the # symbol

    //     //If the name provided is for a List Screen...
    //     if (screenName === 'List')
    //     {
    //         const _hashPrefix = GetFragmentIdentifierPrefix(_hash);
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

    /**
     * Checks if the provided screen name matches the provided URL or, if no URL is provided, the URL of the current page
     * @param {string} screenName The name of the screen to match
     * @param {string} [urlString] [Optional] The URL string to match. If no URL string is provided, this defaults to the URL of the current page
     * @returns {boolean} true if the screen name and URL match, otherwise false
     */
    function isScreen(screenName, urlString)
    {
        //If a URL string was provided, use that, otherwise use the URL from the current page
        const _urlString = urlString || document.location.href;

        //Get the hash (Fragment Identifier) from the URL string
        const _hash = GetFragmentIdentifierFromUrlString(_urlString);

        //If the name provided is for a List Screen...
        if (screenName === 'List')
        {
            const _hashPrefix = GetFragmentIdentifierPrefixFromUrlString(_urlString);
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

    //TODO maybe use same model/format that ListController uses for listeners, now that there are actually quite a few in this file
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