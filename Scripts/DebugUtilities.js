window.DebugController = (function()
{
    var debugModeEnabled = false;
    var VERSION = '0.0.6';

    //Initiate setup once the DOM content has loaded, and then remove this event listener after a single firing
    document.addEventListener('DOMContentLoaded', setup, {once:true});

    //TODO it's pretty silly having multiple 'DOMContentLoaded' event listeners. This kind of thing should probably be consolidated.
    function setup()
    {
        window.DebugView.Init(VERSION);

        window.DebugView.Bind('DebugButtonPressed', toggleDebugMode);

        updateDebugModeState(debugModeEnabled);
    }

    //TODO There's a lot of seemingly unnecessarily repetition in the code here
    function updateDebugModeState(enabled)
    {
        window.DebugView.Render('UpdateDebugButtonColor', {debugMode:enabled});
        window.DebugView.Render('SetVersionVisibility', {debugMode:enabled});
    }

    function toggleDebugMode()
    {
        debugModeEnabled = !debugModeEnabled;
        console.log("Debug Mode toggled. New Debug Mode Enabled: " + debugModeEnabled);

        updateDebugModeState(debugModeEnabled);
        // window.DebugView.Render('ToggleVersionVisibility');
        // window.DebugView.Render('UpdateDebugButtonColor', {debugMode:debugModeEnabled}); 
    }

    function print(logString)
    {
        if (debugModeEnabled == true)
        {
            console.log(logString);
        }
    }

    //TODO It's possible for there to be errors before the DOM has finished loading, therefore before the DebugView has been initialized 
    function logError(logString)
    {
        console.log(logString);

        window.DebugView.Render('SetVersionVisibility', {debugMode:true}); //TODO this is janky
        window.DebugView.Render('UpdateDebugButtonColor', {debugMode:'Error'});
    }

    return {
        Print : print,
        LogError: logError
    };
})();

window.DebugView = (function()
{
    var elements = {  
        versionNumberDiv : null,
        debugButton : null
    };

    function init(versionNumber)
    {
        elements.versionNumberDiv = document.getElementById('versionNumber');  
        elements.debugButton = document.getElementById('buttonDebug');

        elements.versionNumberDiv.innerText = versionNumber;
    }

    /**
     * @param {string} event The name used to identify the event being bound
     * @param {*} callback The function to call when the corresponding event has been triggered 
     */
    function bind(event, callback)
    {
        if (event === 'DebugButtonPressed') 
        {
            //Set the behavior for when the Debug button is pressed
            elements.debugButton.addEventListener('click', callback);         
        }
    }

    function render(command, parameters)
    {
        var viewCommands = 
        {
            SetVersionVisibility: function() 
            {
                elements.versionNumberDiv.hidden = !parameters.debugMode;
            },
            // ToggleVersionVisibility: function() 
            // {
            //     elements.versionNumberDiv.hidden = !elements.versionNumberDiv.hidden;
            // },
            UpdateDebugButtonColor: function() 
            {
                console.log("Request received to change the Debug Button color. New Debug Mode state: " + parameters.debugMode);

                //TODO it seems weird to expect different types from a single variable... But I guess that's JavaScript...?
                if (parameters.debugMode === 'Error')
                {
                    elements.debugButton.style.color = 'red';
                }
                else if (parameters.debugMode === true)
                {
                    elements.debugButton.style.color = '#FFCC00';
                }
                else if (parameters.debugMode === false)
                {
                    elements.debugButton.style.color = 'green';
                }
            }
        };

        viewCommands[command]();
    }

    return {
        Init : init,
        Bind: bind,
        Render: render
    };
})();