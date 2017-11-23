function ListToggle(listName, listId) 
{
    var wrapper = CreateNewElement('div', [ ['class','row divItemRow'] ]);
    var nameButton;

    var Settings = {
        wrapper: null,
        editNameTextarea: null,
        buttonDelete: null,
    };

    SetupElements();

    function SetupElements()
    {
        CreateNameWrapper();
        CreateSettingsToggle();
        CreateListSettingsView(listId, Settings, nameButton);
            
        Settings.buttonDelete.addEventListener('click', function() //TODO standardize events?
        {   
            console.log("Received request to delete a list, but this isn't supported yet");
            GridManager.RemoveList(wrapper);
        });
    
        wrapper.appendChild(Settings.wrapper);
    }

    function CreateNameWrapper()
    {
        //TODO I don't think ID will work here. Has to be index or need a new way of switching grids. Will become a problem once we start deleting lists
        //TODO can we get rid of data-gridindex now?
        nameButton = CreateNewElement('button', [ ['class','btn buttonItemName'], ['data-gridindex',listId] ]); 
        nameButton.textContent = listName;
        nameButton.addEventListener('click', function() {
            GridManager.ListSelected(wrapper);
        });        

        var nameWrapper = CreateNewElement('div', [ ['class','col-8 divItemName'] ], nameButton);
        
        wrapper.appendChild(nameWrapper);
    }

    function CreateSettingsToggle()
    {
        var settingsToggle = CreateToggleForCollapsibleView('edit-list-'.concat(listId), 'btn', CreateNewElement('i', [['class','fa fa-cog']]));

        var toggleWrapper = CreateNewElement('div', [ ['class','col-2'] ], settingsToggle);

        wrapper.appendChild(toggleWrapper);
    }

    return { 
        GetName : function() 
        {
            return nameButton.textContent;
        },
        GetElement : function() //TODO standardize these
        {
            return wrapper;
        },
        ToggleElementVisibility : function()
        {
            if (element.hidden == true)
            {
                element.hidden = false;
            }
            else
            {
                element.hidden = true;
            }
        }
    };
}