/*
(function () 
{   
    // var ScreenType = {
    //     Travel: 'travel',
    //     Invalid: ''
    // };

    var currentScreen = {
        listType: '',
        listId: ''
    };

    //DebugController.LogWarning('App.js LOADED');  

    //Initiate setup once the DOM content has loaded, and then remove this event listener after a single firing
    document.addEventListener('DOMContentLoaded', setup, {once:true});

    function setup()
    {
        window.DebugController.LogWarning("Setting up app. Location Hash depth:" + document.location.hash.split('/').length);

        //Force the initial page to be the travel list selection screen 
        location.href = '#/travel';

        window.View.Init();
        window.DebugController.Setup();
        window.ListSelectionController.Setup('travel');

        //Set the behavior for when the URL fragment identifier changes
        window.onhashchange = urlHashChanged;
    }

    //TODO Currently, the Controller's SetView gets called twice if the root URL was provided 
        //- Once, during setup,
        //- A second time, because the hash gets defaulted to #/travel, which triggers the listening method below
    //This seems fine, at least for the time being. 'NavigateHome' will get called twice.

    function urlHashChanged()
    {
        setScreenData();

        //If on Pixel 2, and the new page is the List Selection screen, clear the browser history log
        if (/Android 9; Pixel 2/i.test(navigator.userAgent) && currentScreen.listType != '' && currentScreen.listId == '')
        {
            window.history.go(-(window.history.length-1));
        }

        window.DebugController.LogWarning("App: The URL fragment identifier changed. Hash route: " + GetLocationHashRoute());

        //If the URL specifies the 'travel' checklist type, update the screen
        if (currentScreen.listType == 'travel')
        {
            window.DebugController.Print("The URL hash specifies the 'travel' checklist type. Updating the view.");

            window.ListController.SetView();
        }
    }
    
    function setScreenData()
    {
        //Clear data from previous screen
        currentScreen.listType = '';
        currentScreen.listId = '';

        if(document.location.hash.split('/').length >= 2)
        {
            currentScreen.listType = GetLocationHashRoute();

            if(document.location.hash.split('/').length == 3)
            {
                currentScreen.listId = document.location.hash.split('/')[2]; //TODO this could use additional validation
            }
        }

        // if (document.location.hash.split('/').length == 2)
        // {
        //     currentScreen.screenLevel = 'ListSelection';
        // }
        // else
        // {
        //     currentScreen.screenLevel = 'List';
        //     currentScreen.listId = document.location.hash.split('/')[2]; //TODO this could use additional validation
        // }
    }
})();  
*/