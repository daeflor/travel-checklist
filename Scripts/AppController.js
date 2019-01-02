(function () 
{   
    //Initialize once the DOM content has loaded, and then remove this event listener after a single firing
    document.addEventListener('DOMContentLoaded', init, {once:true});

    function init()
    {
        window.DebugController.LogWarning("Setting up app. Location Hash depth:" + document.location.hash.split('/').length);

        //Force the initial page to be the travel list selection screen 
        location.href = '#/travel';

        //Set the behavior for when the URL fragment identifier changes
        window.onhashchange = urlHashChanged;

        //Initialize the View and the other Controllers
        window.View.Init();
        window.DebugController.Init();
        window.ListController.Init('travel');

        //Load the list data from storage
        loadAppData();
    }

    function loadAppData()
    {
        //TODO no longer need this extra callback abstraction, I think
        var _loadListsIntoView = function(loadedListData) 
        {
            window.ListController.LoadChecklistDataIntoView(loadedListData);

            // for (var i = 0; i < lists.length; i++) 
            // {
            //     addListToView(lists[i]);
    
            //     for (var j = 0; j < lists[i].listItems.length; j++) 
            //     {
            //         addListItemToView(lists[i].id, lists[i].listItems[j]);
            //     }
            // }
        };

        window.Model.RetrieveChecklistData(_loadListsIntoView);
    }

    //TODO Currently, if a URL other than #/travel is provided when first opening the app, urlHashChanged gets called when the page loads 
        //This seems fine, at least for the time being. The View is informed to Show the Home Screen and Hide the Active Settings View, unnecessarily. 

    function urlHashChanged()
    {
        var currentScreenData = getCurrentScreenData();

        window.DebugController.LogWarning("App: The URL fragment identifier changed. Hash route: " + GetLocationHashRoute());

        //If the current screen data is valid and specifies a checklist type...
        if (currentScreenData.listType != null && currentScreenData.listId != null && currentScreenData.listType !== '')
        {
            //If a list ID is specified, inform the List Selection Controller that a List was selected
            if (currentScreenData.listId !== '')
            {
                window.ListController.ListSelected(currentScreenData.listId);
            }
            else //Else, if no list ID is specified...
            {
                //If on Pixel 2, clear the browser history log
                if (/Android 9; Pixel 2/i.test(navigator.userAgent))
                {
                    window.history.go(-(window.history.length-1));
                }

                //Hide any active settings view and display the Home Screen
                window.View.Render('HideActiveSettingsView'); //TODO can hiding the Active settings view be part of showing the home screen?
                window.View.Render('showHomeScreen'); 
            }
        }
    }
    
    function getCurrentScreenData()
    {
        var currentScreenData = {
            listType: '', //TODO is this really better than null?
            listId: ''
        };

        if(document.location.hash.split('/').length >= 2)
        {
            currentScreenData.listType = GetLocationHashRoute();

            if(document.location.hash.split('/').length == 3)
            {
                currentScreenData.listId = document.location.hash.split('/')[2]; //TODO this could use additional validation
            }
        }

        return currentScreenData;
    }
})();  