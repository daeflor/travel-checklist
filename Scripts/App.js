(function () 
{ 
    //window.addEventListener('load', setView, {once:true});
    
    //Initiate setup once the DOM content has loaded, and then remove this event listener after a single firing
    document.addEventListener('DOMContentLoaded', setup, {once:true});

    //Whenever the URL fragment identifier changes, update the screen accordingly
    window.addEventListener('hashchange', setView);

    function setup()
    {
        window.DebugController.Setup();
        window.ListController.Setup();
    }

    function setView()
    {
        window.ListController.SetView();
    }
})();  
