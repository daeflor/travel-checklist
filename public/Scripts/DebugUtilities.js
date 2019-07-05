'use strict';
window.DebugController = (function()
{
    //TODO Consider a system of debug log priorities/verbosity. (Such that older low-risk ones don't print unless specified, so it's easier to filter through the logs).
    
    //TODO Maybe the DebugController should be made to be more generic (like Utilities.js) rather than specific to the Checklist app. 
    
    var debugModeEnabled = true;
    var VERSION = '0.0.13';

    function init()
    {
        window.DebugView.Init(VERSION);

        window.DebugView.Bind('DebugButtonPressed', toggleDebugMode);
        window.DebugView.Bind('TestButtonPressed', testMethod);

        updateDebugModeState(debugModeEnabled);
    }

    //TODO There's a lot of seemingly unnecessarily repetition in the code here
    function updateDebugModeState(enabled)
    {
        window.DebugView.Render('UpdateDebugButtonColor', {debugMode:enabled});
        window.DebugView.Render('SetVersionVisibility', {debugMode:enabled});
        window.DebugView.Render('SetTestButtonVisibility', {debugMode:enabled});
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
            //console.trace(logString);
        }
    }

    function logWarning(logString)
    {
        console.warn(logString);
    }

    //TODO It's possible for there to be errors before the DOM has finished loading, therefore before the DebugView has been initialized 
    function logError(logString)
    {
        console.error(logString);

        window.DebugView.Render('SetVersionVisibility', {debugMode:true}); //TODO this is janky
        window.DebugView.Render('UpdateDebugButtonColor', {debugMode:'Error'});
    }

    function testMethod()
    {
        console.log("Test Method Executed. User agent: " + navigator.userAgent);
        //window.history.go(-(window.history.length-1));

        if (/Android 9; Pixel 2/i.test(navigator.userAgent))
        {
            window.DebugView.Render('UpdateTestButtonColor', {color:'red'});
        }
        else
        {
            console.log("The current device is not a mobile device.");
        }
    }

    return {
        Init : init,
        Print : print,
        LogWarning : logWarning,
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
        elements.testButton = document.getElementById('buttonTest');

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
        else if (event === 'TestButtonPressed') 
        {
            //Set the behavior for when the Debug button is pressed
            elements.testButton.addEventListener('click', callback);         
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
            SetTestButtonVisibility: function() 
            {
                elements.testButton.hidden = !parameters.debugMode;
            },
            // ToggleVersionVisibility: function() 
            // {
            //     elements.versionNumberDiv.hidden = !elements.versionNumberDiv.hidden;
            // },
            UpdateDebugButtonColor: function() 
            {
                //console.log("Request received to change the Debug Button color. New Debug Mode state: " + parameters.debugMode);

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
            },
            UpdateTestButtonColor: function() 
            {
                elements.testButton.style.color = parameters.color;
            }
        };

        viewCommands[command]();
    }

    return {
        Init: init,
        Bind: bind,
        Render: render
    };
})();