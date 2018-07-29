function ListToggle(listName, listId) 
{
    var model = {
        data : {
            name : null,
        },
        GetName : function()
        {
            return this.data.name;
        },
        // SetName : function(name)
        // {
        //     //console.log("The modifier value was requested. Current value is: " + this.data.value);
        //     this.data.name = name;
        // },
    };
    
    var wrapper = CreateNewElement('div', [ ['class','row divItemRow'] ]);
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
        CreateSettingsToggle();
        CreateListSettingsView(listId, Settings, toggle);
            
        Settings.buttonDelete.addEventListener('click', function() //TODO standardize events?
        {   
            console.log("Received request to delete a list, but this isn't supported yet");
            GridManager.RemoveList(wrapper);
        });
    
        wrapper.appendChild(Settings.wrapper);
    }

    function CreateNameWrapper()
    {
       //Create the name toggle that can be selected to open or close the settings view for the List Item
        toggle = CreateToggleForCollapsibleView('edit-list-'.concat(listId), 'btn buttonItemName', listName);
        
        //Create the div wrapper for the List Item Name 
        var nameWrapper = CreateNewElement('div', [ ['class','col-5 divItemName'] ], toggle);

        // //TODO I don't think ID will work here. Has to be index or need a new way of switching grids. Will become a problem once we start deleting lists
        // //TODO can we get rid of data-gridindex now?
        // nameButton = CreateNewElement('button', [ ['class','btn buttonItemName'], ['data-gridindex',listId] ]); 
        // nameButton.textContent = listName;
        // nameButton.addEventListener('click', function() {
        //     GridManager.ListSelected(wrapper);
        // });        

        //var nameWrapper = CreateNewElement('div', [ ['class','col-8 divItemName'] ], nameButton);
        
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
            //return nameButton.textContent;
            return toggle.textContent;
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