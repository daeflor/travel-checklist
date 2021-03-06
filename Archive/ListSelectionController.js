// window.ListSelectionController = (function()
// {
//     var self = this;
    
//     var activeListId;
//     //var checklistType;

//     /** List & Button Setup **/

//     // function init(checklistType)
//     // {            
//     //     self.checklistType = checklistType;
        
//     //     window.View.Bind('NewListButtonPressed', addNewList);
//     // }

//     // function loadListsIntoView(loadedListData)
//     // {
//     //     window.DebugController.Print("Number of Lists retrieved from Model: " + loadedListData.length);

//     //     for (var i = 0; i < loadedListData.length; i++) 
//     //     {
//     //         addListToView(loadedListData[i]);
//     //     }
//     // }

//     /** List Management **/

//     // function addNewList()
//     // {
//     //     //TODO should there be error checking to ensure all the data needed is actually provided when the List is created?

//     //     window.Model.AddList(function(data)
//     //     {
//     //         addListToView(data);

//     //         //After the List is added to the DOM, expand its Settings View
//     //         window.View.Render('ExpandSettingsView', {id:data.id});
//     //     });
//     // }

//     function addListToView(data) //TODO don't really like using 'data' here
//     {
//         // window.View.Render(
//         //     'AddList', 
//         //     {listId:data.id, listName:data.name, listType:self.checklistType} //listType:document.location.hash.split('/')[0]
//         // );

//         //TODO this method could possibly be standardized and re-used for list item
//         // //When the animation to expand the Settings View starts, change the Active Settings View
//         // //bindSettingsViewExpansion(data.id);
//         // window.View.Bind(
//         //     'SettingsViewExpansionStarted', 
//         //     function() 
//         //     {
//         //         window.View.Render('HideActiveSettingsView'); 
//         //     },
//         //     {id:data.id}
//         // );

//         //TODO can this be merged with the corresponding method for List Item?
//         // var _updateName = function(updatedValue) 
//         // {
//         //     //Set up the callback method to execute once the Model has been updated
//         //     var updateView = function()
//         //     {
//         //         window.View.Render('UpdateName', {id:data.id, updatedValue:updatedValue}); 
//         //     };

//         //     //TODO updatedName/Value should be consistent

//         //     //Update the Model
//         //     window.Model.ModifyList('EditName', data.id, updateView, {updatedName:updatedValue});
//         // };

//         // //TODO wouldn't it be simpler to just always pass the full object (list or list item) and then from that you can get the most up to date name, ID, etc.
//         // //Add an event listener for when the Text Area to edit the List Item name is modified
//         // window.View.Bind('NameEdited', _updateName, {id:data.id});

//         // //When the Text Area to edit a list name gets modified, update the text in the List name toggle
//         // window.View.Bind(
//         //     'NameEdited', 
//         //     function(updatedValue) 
//         //     {
//         //         window.Model.EditListName(data.id, updatedValue);
//         //         window.View.Render('UpdateName', {id:data.id, updatedValue:updatedValue}); 
//         //     },
//         //     {id:data.id}
//         // );

//         // //TODO standardize ID parameter names
//         // //TODO it might be possible to merge this with the method to remove a ListItem at some point, once the middleman data (lists, rows, etc.) is cut out
//         // var _removeList = function() 
//         // {
//         //     //Set up the callback method to execute once the Model has been updated
//         //     var _modelUpdated = function()
//         //     {
//         //         //If the List that was removed was the most recently Active List, set the Active List ID to null
//         //         if (activeListId == data.id)
//         //         {
//         //             activeListId = null;
//         //         }

//         //         window.View.Render('RemoveList', {listId:data.id}); 
//         //     };

//         //     //Update the Model
//         //     window.Model.ModifyList('Remove', data.id, _modelUpdated);
//         // };

//         // //Add an event listener for when the button to delete a List is pressed
//         // window.View.Bind('DeleteButtonPressed', _removeList, {id:data.id});


//         // //When the Go To List button is selected, navigate to that list
//         // // window.View.Bind(
//         // //     'GoToListButtonPressed', 
//         // //     function() 
//         // //     {
//         // //         navigateToList(data.id);
//         // //     },
//         // //     {listId:data.id}
//         // // );

//         // //Add an event listener to the Move Upwards Button to move the List upwards by one position in the Lists array
//         // window.View.Bind(
//         //     'MoveUpwardsButtonPressed', 
//         //     function() 
//         //     {
//         //         //TODO could probably just return the swapped list instead of specifically it's ID
//         //         window.Model.ModifyList('MoveUpwards', data.id, function(swappedList) {
//         //             window.View.Render('SwapListObjects', {moveUpwardsId:data.id, moveDownwardsId:swappedList.id});
//         //         });
//         //     }, 
//         //     {id:data.id}
//         // );

//         // //Add an event listener to the Move Downwards Button to move the List downwards by one position in the Lists array
//         // window.View.Bind(
//         //     'MoveDownwardsButtonPressed', 
//         //     function() 
//         //     {
//         //         //TODO could probably just return the swapped list instead of specifically it's ID
//         //         window.Model.ModifyList('MoveDownwards', data.id, function(swappedList) {
//         //             window.View.Render('SwapListObjects', {moveUpwardsId:swappedList.id, moveDownwardsId:data.id});
//         //         });
//         //     }, 
//         //     {id:data.id}
//         // );
//     }

//     //TODO not sure I like this passive naming convention
//     // function listSelected(listId)
//     // {   
//     //     //If there is any active settings view, close it
//     //     window.View.Render('HideActiveSettingsView');

//     //     //TODO It might make more sense to have a HideActiveList command in the View, instead of passing the activeListId as a parameter to DisplayList
//     //         //Although, if this is the only place the Active List is hidden, then maybe it's fine
//     //         //But then again, if there needs to be a special check for the activeListId not being null, then maybe it does make sense to have it be separate
//     //     //Display the specified List Screen (and hide the Active List Screen, if applicable)
//     //     window.View.Render('DisplayList', {listId:listId, activeListId:activeListId});

//     //     //Set the newly selected List as the Active List
//     //     activeListId = listId;
//     // }

//     /** Experimental & In Progress **/

//     // return {
//     //     Init : init,
//     //     LoadListsIntoView : loadListsIntoView,
//     //     ListSelected : listSelected,
//     //     GetActiveListId : function() {return activeListId;} //TODO Note that this is only used by calls to ModifyList, so maybe those should not be part of ListController...
//     // };
// })();