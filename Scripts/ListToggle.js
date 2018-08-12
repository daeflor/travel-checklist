function ListToggle(listName, listId) 
{   
    var wrapper = CreateNewElement('div', [ ['class','row divItemRow divListToggleWrapper'] ]);
    //var nameButton;
    var toggle; //TODO this is hacky and TEMP, just to replace nameButton above, until a better solution is implemented

    var Settings = {
        wrapper: null,
        editNameTextarea: null,
        buttonDelete: null,
    };

    SetupElements();

    function SetupElements()
    {
        CreateNameWrapper();
        CreateNavigationButton();
        CreateListSettingsView(listId, Settings, toggle, SettingsViewExpanded);
            
        Settings.buttonDelete.addEventListener('click', function() //TODO standardize events?
        {   
            console.log("Received request to delete a list, but this isn't supported yet");
            window.GridManager.RemoveList(wrapper);
        });
    
        wrapper.appendChild(Settings.wrapper);
    }

    function CreateNameWrapper()
    {
       //Create the name toggle that can be selected to open or close the settings view for the List Item
        toggle = CreateToggleForCollapsibleView('SettingsView-'.concat(listId), 'buttonListItem buttonListToggle', listName);
        
        //Create the div wrapper for the List Item Name 
        var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName divListToggleName'] ], toggle);

        // //TODO I don't think ID will work here. Has to be index or need a new way of switching lists. Will become a problem once we start deleting lists
        // //TODO can we get rid of data-gridindex now?
        // nameButton = CreateNewElement('button', [ ['class','btn buttonItemName'], ['data-gridindex',listId] ]); 
        // nameButton.textContent = listName;
        // nameButton.addEventListener('click', function() {
        //     GridManager.ListSelected(wrapper);
        // });        

        //var nameWrapper = CreateNewElement('div', [ ['class','col-8 divItemName'] ], nameButton);
        
        wrapper.appendChild(nameWrapper);
    }

    function CreateNavigationButton()
    {
        var button = CreateButtonWithIcon({buttonClass:'buttonNavigateToList', iconClass:'fa fa-angle-double-right'});

        button.addEventListener('click', function() 
        {
            window.GridManager.ListSelected(wrapper);
        });    

        var buttonWrapper = CreateNewElement('div', [ ['class','col-2'] ], button);

        wrapper.appendChild(buttonWrapper);
    }

    function SettingsViewExpanded()
    {
        console.log("A Settings View has been expanded.");
        wrapper.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
    }

    return { 
        GetName : function() 
        {
            return toggle.textContent;
        },
        GetElement : function() //TODO standardize these
        {
            return wrapper;
        },
        ExpandSettings : function() //TODO this only is used when a new row is added, which isn't very obvious. Could it take a param about whether or not it should focus, and this this could be used in all cases?
        {
            //Manually trigger the Settings View to begin expanding
            $(Settings.wrapper).collapse('show');

            //Bring focus to the Text Area to edit the List name
            Settings.editNameTextarea.focus();
        }
    };
}