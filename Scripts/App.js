(function () 
{ 
    //window.addEventListener('load', setView, {once:true});
    //window.removeEventListener('hashchange', setView);
    //unloadApp();
    
    //Initiate setup once the DOM content has loaded, and then remove this event listener after a single firing
    document.addEventListener('DOMContentLoaded', setup, {once:true});

    function setup()
    {
        //If the URL doesn't specify a checklist type, default to 'travel'
        if (document.location.hash.length == 0)
        {
            DebugController.LogWarning("URL doesn't specify a checklist type, so it will default 'travel' and hash will be set to '#/travel'");
            location.href = '#/travel';
        }

        //var checklistType = document.location.hash.split('/')[1];

        //If the URL specifies the 'travel' checklist type, setup the Controllers
        if (getChecklistTypeFromUrl() == 'travel')
        {
            DebugController.LogWarning("Hash checklist is set to travel. Setting up Controllers.");

            window.DebugController.Setup();
            window.ListController.Setup('travel');

            //Set the behavior for when the URL fragment identifier changes
            window.onhashchange = urlHashChanged;
            //window.addEventListener('hashchange', setView);

            //Set the behavior for when the window is closed or reloaded
            //window.addEventListener('unload', unloadApp);
            // window.onbeforeunload = unloadApp;
        }
    }

    //TODO Currently, the Controller's SetView gets called twice if the root URL was provided 
        //- Once, during setup,
        //- A second time, because the hash gets defaulted to #/travel, which triggers the listening method below
    //This seems fine, at least for the time being. 'NavigateHome' will get called twice.

    function urlHashChanged()
    {
        DebugController.LogWarning("App: The URL fragment identifier changed");

        //If the URL specifies the 'travel' checklist type, update the screen
        if (getChecklistTypeFromUrl() == 'travel')
        {
            DebugController.LogWarning("The URL hash specifies the 'travel' checklist type. Updating the view.");

            window.ListController.SetView();
        }
    }

    function getChecklistTypeFromUrl()
    {
        return document.location.hash.split('/')[1];
    }

    // function unloadApp()
    // {
    //     DebugController.Print("App: The app will be unloaded, and the hashchange event listener will be removed.");

    //     //Remove the hashchange event listener
    //     window.removeEventListener('hashchange', setView);
    // }
})();  
