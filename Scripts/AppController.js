'use strict';
(function () 
{   
    //Initialize the app once the DOM content has loaded, and then remove this event listener
    document.addEventListener('DOMContentLoaded', init, {once:true});

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
    //TODO Currently, if a URL other than #/travel is provided when first opening the app, urlHashChanged gets called when the page loads 
        //This seems fine, at least for the time being. The View is Hide the Active Settings View and Quantity Popover, unnecessarily. 
        //Maybe it's possible to use the history to tell if the app was just launched...
    //TODO The first time a garbage URL is provided it doesn't clear it, but on successive attempts it does. Unclear why, but it doesn't seem to be causing any issues.

    function init()
    {
        window.DebugController.Print("Setting up app. Location Hash depth:" + document.location.hash.split('/').length);

        //Force the initial page to be the travel list selection screen 
        location.href = '#travel'; 

        //Set the behavior for when the URL fragment identifier changes
        window.onhashchange = urlHashChanged;
    }

    function urlHashChanged()
    {
        var currentScreenData = getCurrentScreenData();

        window.DebugController.Print("App: The URL fragment identifier changed. Hash route: " + GetLocationHashRoute());

        //If the current screen data is valid and specifies a checklist type...
        if (currentScreenData.listType != null && currentScreenData.listId != null && currentScreenData.listType !== '')
        {
            //If a list ID is not specified, on mobile, clear the browser history log
            if (currentScreenData.listId == '')
            {
                //If on Pixel 2, clear the browser history log
                if (/Android 9; Pixel 2/i.test(navigator.userAgent)) //TODO this probably won't work on any other devices
                {
                    window.DebugController.Print("Will clear browser history on Pixel 2 devices.");
                    window.history.go(-(window.history.length-1));
                }
            }
        }
    }
    
    //TODO Could/should this be made publicly accessible?

    function getCurrentScreenData()
    {
        // var currentScreenData = {
        //     listType: '', //TODO is this really better than null?
        //     listId: ''
        // };

        const _listType = GetLocationHashRoute();

        const _hashSegments = document.location.hash.split('/');

        //If the location hash has two segments, and the second segment is 13 characters long, then assign that segment string as the List ID
        const _listId = (_hashSegments.length == 2 && _hashSegments[1].length == 13) ? _hashSegments[1] : null; //TODO this could use additional validation

        // if(document.location.hash.split('/').length == 2)
        // {
        //     currentScreenData.listId = document.location.hash.split('/')[1]; //TODO this could use additional validation
        // }

        //return currentScreenData;

        //TODO is it really necessary return both of these in the same function? Seems like they could be handled individually
        return {
            listType: _listType,
            listId: _listId
        };
    }

    // function isHomeScreen(urlString)
    // {
    //     //If the url string matches the Home page for the Travel Checklist, return true, else return false
    //     return getFragmentIdentifierFromUrlString(urlString) === "travel" ? true : false;
    // }

    // function isListScreen(urlString)
    // {
    //     //TODO There is no validation here to ensure that this URL is within the 'Travel' app section

    //     //If the URL slug contains 13 characters, then assume that this is a List Screen and return true, else return false.
    //     return getUrlSlug(urlString).length == 13 ? true : false; //TODO this is pretty hacky
    // }

    return {
        Init: init,
        // ListenForEvent_HashChanged: listenForEvent_HashChanged,
        // ListenForEvent_NavigatedHome: ListenForEvent_NavigatedHome
    };
})();