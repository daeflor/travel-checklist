(function () 
{     
    //Initiate setup once the DOM content has loaded, and then remove this event listener after a single firing
    document.addEventListener('DOMContentLoaded', setup, {once:true});

    function setup()
    {
        window.DebugController.Print("Setting up app");

        //If the URL doesn't specify a checklist type, default to 'travel'
        if (document.location.hash.length == 0)
        {
            window.DebugController.Print("URL doesn't specify a checklist type, so it will default 'travel' and hash will be set to '#/travel'");
            location.href = '#/travel';
        }

        //If the URL specifies the 'travel' checklist type, setup the Controllers
        if (GetLocationHashRoute() == 'travel')
        {
            window.DebugController.Print("Hash checklist is set to travel. Setting up Controllers.");

            window.DebugController.Setup();
            window.ListSelectionController.Setup('travel');

            //Set the behavior for when the URL fragment identifier changes
            window.onhashchange = urlHashChanged;
        }
    }

    //TODO Currently, the Controller's SetView gets called twice if the root URL was provided 
        //- Once, during setup,
        //- A second time, because the hash gets defaulted to #/travel, which triggers the listening method below
    //This seems fine, at least for the time being. 'NavigateHome' will get called twice.

    function urlHashChanged()
    {
        // //If the new page is the root (List of Lists), clear the browser history log
        // if (document.location.hash.split('/').length == 2 && window.history.length > 2)
        // {
        //     window.history.go(-(window.history.length-1));
        // }

        //If on Pixel 2, and the new page is the root (List of Lists), clear the browser history log
        if (/Android 9; Pixel 2/i.test(navigator.userAgent) && document.location.hash.split('/').length == 2)
        {
            window.history.go(-(window.history.length-1));
        }

        window.DebugController.Print("App: The URL fragment identifier changed. Hash route: " + GetLocationHashRoute());

        //If the URL specifies the 'travel' checklist type, update the screen
        if (GetLocationHashRoute() == 'travel')
        {
            window.DebugController.Print("The URL hash specifies the 'travel' checklist type. Updating the view.");

            //window.ListController.SetView();
        }
    }
})();  
