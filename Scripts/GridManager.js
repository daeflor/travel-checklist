window.GridManager = function()
{
    var view = {
        elements: {  
            listHeader : null,
            homeHeader : null,
            homeScreen : null,
            listsWrapper : null,
            listTitle : null,
        }, 
        AddElementsToDom : function(data) //TODO should rename this
        {
            var self = this;

            //TODO Several of these (both variable name and element ID) could probably be renamed for clarity
            
            //Assign the Home Screen elements
            self.elements.homeHeader = document.getElementById('divHomeHeader');
            self.elements.homeScreen = document.getElementById('divHomeScreen'); 
            self.elements.homeScreenListElements = document.getElementById('divHomeScreenListElements'); 

            //Assign the List Screen elements
            self.elements.listHeader = document.getElementById('divListHeader');
            self.elements.listTitle = document.getElementById('headerCurrentListName');
            self.elements.listScreen = document.getElementById('divListScreen'); 
            self.elements.listScreenListElements = document.getElementById('divListScreenListElements');
            
            self.elements.listHeader.appendChild(data.headerElement); //TODO This is weird. Also, these should be renamed because it isn't very clear. The headerElement is for the Quantity Header section
        },
        Render : function(command, parameter)
        {
            var self = this;

            var viewCommands = {
                showHomeScreen: function() 
                {
                    //Hide the List Header
                    self.elements.listHeader.hidden = true;

                    //Hide the List Screen
                    self.elements.listScreen.hidden = true;

                    //Show the Home Header
                    self.elements.homeHeader.hidden = false;

                    //Show the Home Screen
                    self.elements.homeScreen.hidden = false;
                },
                showListScreen: function() 
                {
                    //Hide the Home Header when an individual List is displayed
                    self.elements.homeHeader.hidden = true;

                    //Hide the Home Screen when an individual List is displayed
                    self.elements.homeScreen.hidden = true;
                    
                    //Show the List Header when an individual List is displayed
                    self.elements.listHeader.hidden = false;

                    //Show the List Screen when an individual List is displayed
                    self.elements.listScreen.hidden = false;
                },
                addList: function() 
                {
                    //Add the List Toggle element to the DOM, under the Home Screen List Elements div
                    self.elements.homeScreenListElements.appendChild(parameter.listToggleElement);
                    
                    //TODO Should be consistent on either prefixing or suffixing element vars with 'element'. Right now both are used...
                    //Add the List element to the DOM, under the List Screen List Elements div
                    self.elements.listScreenListElements.appendChild(parameter.listElement);
                },
                setListTitle: function() 
                {
                    //Set the List title
                    self.elements.listTitle.textContent = parameter.listName;
                },
                removeList: function() 
                {
                    //Remove the List element from the Lists wrapper
                    self.elements.listScreenListElements.removeChild(parameter.listElement);

                    //Remove the List Toggle element from the Lists of Lists wrapper
                    self.elements.homeScreenListElements.removeChild(parameter.listToggleElement);
                },
            };

            viewCommands[command]();
        },
        Bind : function(event, callback)
        { //TODO There are still a lot more things in GridManager that can be bound here
            var self = this;

            if (event === 'NavigateHome') 
            {
                //Set the behavior for when the Home button is pressed
                document.getElementById('buttonHome').addEventListener('click', callback);         
            }
            else if (event === 'AddList') 
            {
                //Set the behavior for when the Add List button is pressed
                document.getElementById('buttonAddList').addEventListener('click', callback);         
            }
            else if (event === 'AddRow') 
            {
                //Set the behavior for when the Add Row button is pressed
                document.getElementById('buttonAddRow').addEventListener('click', callback);         
            }
        },
    };

    //Initiate Setup once the DOM content has loaded
    document.addEventListener('DOMContentLoaded', Setup);

    var activePopover = null; //TODO should there be a separate popover manager? 
    var activeSettingsView = null; //TODO could this be moved into the View? 
    var lists = [];
    var activeList;
    var rowCounter = 0;
    var listCounter = -1; //TODO this is super hacky and TEMP. Is it really?... Other idea for IDs: List0Item0, List1Item4, List2Item12, etc.

    /** List & Button Setup **/

    function Setup()
    {            
        //Once the DOM content has loaded and Setup initiated, remove the event listener
        document.removeEventListener('DOMContentLoaded', Setup);

        var header = new Header(ListType.Travel);
        view.AddElementsToDom({headerElement: header.GetElement()})

        view.Bind('NavigateHome', NavigateHome);
        view.Bind('AddList', AddNewList);
        view.Bind('AddRow', AddNewRow);

        LoadDataFromStorage();
    }

    /** Storage Management **/

    //TODO should probably have a separate Storage Manager file

    function LoadDataFromStorage()
    {
        var storageData = LoadValueFromLocalStorage('gridData');
    
        if (storageData != null)
        {
            console.log("Loaded from Local Storage: " + storageData);
            ReloadListDataFromStorage(JSON.parse(storageData));        
        }    
        else
        {
            console.log("Could not find any list data saved in local storage.");
        }
    }

    function ReloadListDataFromStorage(storageData)
    {
        var storedFormatVersion = storageData[0];
        var storedFormat;

        console.log("The parsed Format Version from storage data is: " + storedFormatVersion + ". The current Format Version is: " + CurrentStorageDataFormat.Version);        

        if (storedFormatVersion == CurrentStorageDataFormat.Version)
        {
            storedFormat = CurrentStorageDataFormat;
            console.log("The data in storage is in the current format.");            
        }
        else
        {
            storedFormat = PreviousStorageDataFormat;
            console.log("The data in storage is in an old format. Parsing it using legacy code.")            
        }

        console.log("There are " + ((storageData.length) - storedFormat.FirstListIndex) + " lists saved in local storage.");
        
        //Traverse the data for all of the lists saved in local storage
        for (var i = storedFormat.FirstListIndex; i < storageData.length; i++) 
        {
            var list = new List({name:storageData[i][storedFormat.ListNameIndex], type:storageData[i][storedFormat.ListTypeIndex], id:GetNextListId()});
            
            //TODO Do Something with the Model here first
            view.Render('addList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});

            console.log("Regenerating List. Index: " + (i-storedFormat.FirstListIndex) + " Name: " + list.GetName() + " Type: " + list.GetType() + " ----------");
            
            //Traverse all the rows belonging to the current list, in local storage
            for (var j = storedFormat.FirstRowIndex; j < storageData[i].length; j++) 
            {
                if (list.GetType() == ListType.Travel)
                {
                    console.log("List: " + (i-storedFormat.FirstListIndex) + ". Row: " + (j-storedFormat.FirstRowIndex) + ". Item: " + storageData[i][j][0]);
                    list.AddRow(storageData[i][j][0], storageData[i][j][1], storageData[i][j][2], storageData[i][j][3], storageData[i][j][4]);
                }
                else if (list.GetType() == null)
                {
                    console.log("ERROR: Tried to load a List with a ListType of null from storage");
                }
            }

            lists.push(list);
        }
    }

    function SaveDataToStorage()
    {
        SaveNameValuePairToLocalStorage('gridData', JSON.stringify(GetDataForStorage()));
    }

    function GetDataForStorage()
    {
        var data = [];

        console.log("Current Format Version is: " + CurrentStorageDataFormat.Version);
        data.push(CurrentStorageDataFormat.Version);

        for (var i = 0; i < lists.length; i++)
        {
            data.push(lists[i].GetDataForStorage());
        }

        return data;
    }

    /** List Management **/

    function GetNextListId()
    {
        listCounter++;
        return listCounter;
    }

    function AddNewRow()
    {
        if (activeList != null)
        {
            activeList.AddNewRow();
            SaveDataToStorage(); 
        }
        else
        {
            console.log("ERROR: Tried to add a row to the Active List, which doesn't exist");
        }
    }

    function AddNewList()
    {
        var list = new List({name:'', type:ListType.Travel, id:GetNextListId()});
        
        lists.push(list);

        //TODO do something with the Model here, first
        view.Render('addList', {listElement:list.GetElement(), listToggleElement:list.GetToggle().GetElement()});
        
        list.GetToggle().ExpandSettings(); 
  
        SaveDataToStorage(); 
    }

    function NavigateToList(indexToDisplay)
    {   
        console.log("Request received to switch lists to grid index: " + indexToDisplay);
        
        if (indexToDisplay < lists.length)
        {
            var listToDisplay = lists[indexToDisplay];

            //TODO move some (much) of this to the View

            if (listToDisplay != activeList)
            {
                //If there was a previous Active List, hide it
                if (activeList != null)
                {
                    activeList.ToggleElementVisibility();
                }

                //Set the selected List as Active
                activeList = listToDisplay;

                //Display the selected List
                activeList.ToggleElementVisibility();  

                //TODO do something with the Model here

                //Udate the List Title text
                view.Render('setListTitle', {listName:activeList.GetName()});
            }
            else
            {
                console.log("Navigating to the list which was already Active");
            }

            //If there is any active settings view, close it
            GridManager.ToggleActiveSettingsView(null);

            //Display the List Screen
            view.Render('showListScreen'); 
        }
        else
        {
            console.log("ERROR: Tried to switch to a list which doesn't exist");
        }
    }

    function NavigateHome()
    {
        //TODO move some of this to the View

        //If there is any active settings view, close it
        GridManager.ToggleActiveSettingsView(null);

        //TODO Do something with the Model here (e.g. update it)
        view.Render('showHomeScreen'); 
        //TODO can hiding the Active settings view be part of showing the home screen?
    }

    /** Experimental & In Progress **/

    /** Public Functions **/

    return { //TODO maybe only calls should be made here (e.g. getters/setters), not actual changes
        RemoveRow : function(rowElementToRemove)
        {        
            if (activeList != null)
            {
                activeList.RemoveRow(rowElementToRemove);
                SaveDataToStorage(); 
            }
            else
            {
                console.log("ERROR: Tried to remove a row from the Active List, which doesn't exist");
            }
        },
        RemoveList : function(listElementToRemove)
        {        
            var index = $(listElementToRemove).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary

            console.log("Index of list to be removed: " + index + ". Class name of list to be removed: " + listElementToRemove.className);  
            
            if(index > -1) 
            {
                //TODO Do something with the Model here, no?
                view.Render('removeList', {listElement:lists[index].GetElement(), listToggleElement:listElementToRemove});

                lists.splice(index, 1);
                
                console.log("Removed list at index " + index + ". Number of Lists is now: " + lists.length);
            }
            else
            {
                console.log("Failed to remove list. List index returned invalid value.");
            }

            SaveDataToStorage();
        },
        GetActivePopover : function() //TODO Maybe should have an Interaction Manager (or popover manager) for these
        {
            return activePopover;
        },
        SetActivePopover : function(popover)
        {
            activePopover = popover;
            console.log("The Active Popover changed");
        },
        HideActiveQuantityPopover : function(e)
        {     
            //TODO this is very hacky, and relies not only on my own class names but Bootstrap's too.
                //Does a quantity group function (object) make sense? (and maybe a list?) To have this more controlled
            if (!e.target.className.includes('popover')) //ignore any clicks on any elements within a popover
            {
                document.removeEventListener('click', GridManager.HideActiveQuantityPopover);
                $(activePopover).popover('hide');
                console.log("The active popover was told to hide");
            }
        },
        ToggleActiveSettingsView : function(newSettingsView) //TODO Part of this should be moved to View
        {     
            //If there is a Settings View currently active, hide it
            if (activeSettingsView != null)
            {
                $(activeSettingsView).collapse('hide');
            }

            //If the new Settings View is defined (e.g. could be an actual Settings view or deliberately null), set it as the Active Settings View
            if (newSettingsView !== undefined)
            {
                activeSettingsView = newSettingsView;
            }
        },
        GridModified : function()
        {
            SaveDataToStorage();
        },
        GetNextRowId : function()
        {
            rowCounter++;
            return rowCounter;
        },
        ClearButtonPressed : function(columnIndex)
        {
            if (activeList != null)
            {
                console.log("Button pressed to clear column " + columnIndex + " for grid " + activeList);
                activeList.ClearQuantityColumnValues(columnIndex);
                SaveDataToStorage();
            }
            else
            {
                console.log("ERROR: Tried to clear a column in the Active List, which doesn't exist");
            }
        },
        ListSelected : function(elementListToggle)
        {   
            if (this == "undefined")
            {
                console.log("ERROR: no element selected");
            }
            else
            {
                var index = $(elementListToggle).index(); //TODO could use a custom index to avoid jquery, but doesn't seem necessary
                
                console.log("List Toggle Element selected: " + elementListToggle + ". index: " + index);
                
                if (typeof(index) == "undefined")
                {
                    console.log("ERROR: the index of the selected element is undefined");
                }
                else
                {
                    NavigateToList(index);
                    //CloseHomeScreen();
                }
            }
        }
    };
}();

//TODO Consider moving this to a separate file?
var QuantityType = {
    Needed: {
        index: 0,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-pie-chart fa-lg iconHeader'
    },
    Luggage: {
        index: 1,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-suitcase fa-lg iconHeader'
    },
    Wearing: {
        index: 2,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-male fa-lg iconHeader'
    },
    Backpack: {
        index: 3,
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader toggleSmallIcon',
        iconClass: 'fa fa-briefcase iconHeader'
    },
};

var ListType = {
    Travel: 0,
    Checklist: 1,
};

var PreviousStorageDataFormat = {
    FirstListIndex: 1,
    ListNameIndex: 0,
    ListTypeIndex: 0,
    FirstRowIndex: 1,
};

var CurrentStorageDataFormat = {
    Version: 'fv1',
    FirstListIndex: 1,
    ListNameIndex: 0,
    ListTypeIndex: 1, //TODO this and above could be their own sub-object, contained within index 1
    FirstRowIndex: 2, //TODO this could then always be 1, even if new properties about the list need to be stored
};