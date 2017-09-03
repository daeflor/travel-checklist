function Row(rowId, itemName, neededQuantity, luggageQuantity, wearingQuantity, backpackQuantity)
{
    //var index = rowIndex; //TODO this doesn't work because it's not getting updated when rows are deleted
    
    //var divRow = CreateNewElement('div', [ ['class','row divItemRow'] ]);
    //var divItemName;
    //var textareaItemName;
    var listQuantityPopovers = [];

    var Elements = {
        wrapper: CreateNewElement('div', [ ['class','row divItemRow'] ]),
        nameWrapper: null,
        nameToggle: null,
        settingsWrapper: null,
    };

    //console.log("This: " + this);

    CreateDivForEditPopover();

    //CreateDivForItemName(itemName);
    CreateCollapsibleDivForItemName(rowId, itemName);
    
    CreateDivForQuantityPopover(neededQuantity);
    CreateDivForQuantityPopover(luggageQuantity);
    CreateDivForQuantityPopover(wearingQuantity);
    CreateDivForQuantityPopover(backpackQuantity);

    Elements.wrapper.appendChild(Elements.settingsWrapper);

    SetItemColumnColor();

    function CreateDivForEditPopover()
    {
        /* Create Popover Elements */
        var buttonTrash = CreateButtonWithIcon('buttonTrash', 'btn', 'fa fa-trash');
    
        /* Create Edit Button Elements */
        var iconToggle = CreateNewElement('i', [ ['class','fa fa-pencil-square-o'] ]);    
        var popoverToggle = CreatePopoverToggle('btn buttonEdit', iconToggle, [buttonTrash], 'focus');
        
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            document.getElementById('buttonTrash').addEventListener('click', function()
            {
                GridManager.RemoveRow(Elements.wrapper);
            });
        });

        Elements.wrapper.appendChild(CreateNewElement('div', [ ['class','col-1 divEdit'] ], popoverToggle));
    }  

    // function CreateDivForItemName(itemName)
    // {
    //     textareaItemName = CreateNewElement('textarea');
    //     textareaItemName.value = itemName;
    //     textareaItemName.onchange = GridManager.GridModified;
    
    //     divItemName = CreateNewElement('div', [ ['class','col-4 divItemName'] ], textareaItemName);
    //     Elements.wrapper.appendChild(divItemName);
    // }
    
    function CreateDivForQuantityPopover(quantity)
    {
        /* Create Popover Elements */
        var buttonMinus = CreateButtonWithIcon('buttonMinus', 'btn buttonEditQuantity popoverElement', 'fa fa-minus-circle fa-lg popoverElement');
        var buttonPlus = CreateButtonWithIcon('buttonPlus', 'btn buttonEditQuantity popoverElement', 'fa fa-plus-circle fa-lg popoverElement');
    
        var popoverToggle = CreatePopoverToggle('btn btn-sm buttonQuantity', quantity, [buttonMinus, buttonPlus], 'manual');
    
        popoverToggle.addEventListener('click', function() 
        {
            //If there is already a popover active, remove focus from the selected quantity button. Otherwise, show the button's popover. 
            if(GridManager.GetActivePopover() == null)
            {
                $(popoverToggle).popover('show');
            }
            else
            {
                popoverToggle.blur();
            }
        });
    
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            GridManager.SetActivePopover(popoverToggle);
    
            document.getElementById('buttonMinus').addEventListener('click', function() 
            {
                ModifyQuantityValue(popoverToggle, false);
            });         
            document.getElementById('buttonPlus').addEventListener('click', function() 
            {
                ModifyQuantityValue(popoverToggle, true);
            }); 
    
            document.addEventListener('click', GridManager.HideActiveQuantityPopover);
        });
    
        $(popoverToggle).on('hidden.bs.popover', function()
        {
            GridManager.SetActivePopover(null);
        });

        listQuantityPopovers.push(popoverToggle);
    
        Elements.wrapper.appendChild(CreateNewElement('div', [ ['class','col divQuantity'] ], popoverToggle));
    }

    function ModifyQuantityValue(quantityElement, increase)
    {
        console.log("Request called to modify a quantity value.");

        if (increase == true)
        {
            quantityElement.text = parseInt(quantityElement.text) + 1;
            SetItemColumnColor();
            GridManager.GridModified();
        }
        else if (parseInt(quantityElement.text) > 0)
        {
            quantityElement.text = parseInt(quantityElement.text) - 1;
            SetItemColumnColor();
            GridManager.GridModified();
        }
    }

    function SetItemColumnColor()
    {
        if (listQuantityPopovers[QuantityType.Needed].text == 0)
        {
            Elements.nameWrapper.style.backgroundColor = "darkgrey";
        }
        else if (listQuantityPopovers[QuantityType.Needed].text == (parseInt(listQuantityPopovers[QuantityType.Luggage].text) + parseInt(listQuantityPopovers[QuantityType.Wearing].text) + parseInt(listQuantityPopovers[QuantityType.Backpack].text)))
        {
            Elements.nameWrapper.style.backgroundColor = "mediumseagreen";
        }
        else
        {
            Elements.nameWrapper.style.backgroundColor = "peru";
        }
    }

    /** Experimental & In Progress **/

    function TestCollapse()
    {
        var html = '<button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExampleJS" aria-expanded="false" aria-controls="collapseExample">Button with data-target</button><div class="collapse" id="collapseExampleJS"><div class="card card-body">Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.</div></div>';
        var newDiv = CreateNewElement('div');
        newDiv.innerHTML = html;
        divRow.appendChild(newDiv);

        //$('.collapse').collapse();
    }

    function CreateCollapsibleDivForItemName(rowId, itemName)
    {
        //TODO ideally we'd have a good method of re-arranging the rows list and updating all IDs which rely on index as needed
            //But for this scenario may just need an easier, different approach for unique IDs
        
        var textareaName = CreateNewElement('textarea', [ ['class','rowName'] ]); //, [ ['class',''], ['id','nameRow-'.concat(rowId)] ]            
        var buttonDeleteRow = CreateButtonWithIcon('deleteRow-'.concat(rowId), 'btn', 'fa fa-trash');

        var divTextareaName = CreateNewElement('div', [ ['class','col-5'] ], textareaName);
        var divButtonDeleteRow = CreateNewElement('div', [ ['class','col-2'] ], buttonDeleteRow);

        //TODO could consider only having to pass custom classes (i.e. the helper function would create element with default classes, and then add on any custom ones passed to it).
        var collapsibleElements = CreateCollapsibleElements('editRow-'.concat(rowId), 'btn buttonItemName', itemName, 'collapse container-fluid divSettingsWrapper', [divTextareaName, divButtonDeleteRow]);
        Elements.nameToggle= collapsibleElements[0];
        Elements.settingsWrapper = collapsibleElements[1];

        textareaName.textContent = Elements.nameToggle.textContent;
        textareaName.onchange = GridManager.GridModified;

        $(Elements.settingsWrapper).on('shown.bs.collapse', function() 
        {
            //console.log("Collapsible element expanded");
            //document.getElementById('deleteRow-'.concat(rowId)).addEventListener('click', function()
            buttonDeleteRow.addEventListener('click', function()
            {
                //console.log("DROPDOWNTRASH CLICKED");
                GridManager.RemoveRow(Elements.wrapper);
            });

            // textareaName.textContent = Elements.nameToggle.textContent;
        });

        $(Elements.settingsWrapper).on('hide.bs.collapse', function()
        {
            //console.log("Collapsible element collapsed");
            Elements.nameToggle.textContent = textareaName.value;
        });

        Elements.nameWrapper = CreateNewElement('div', [ ['class','col-4 divItemName'] ], Elements.nameToggle);

        Elements.wrapper.appendChild(Elements.nameWrapper);
        //Elements.wrapper.appendChild(Elements.settingsWrapper);
    }

    // function TestTwo()
    // {
    //     var newDiv = CreateNewElement('div', [ ['class',''] ]);
    //     newDiv. innerHTML = document.getElementById('dropdownHeader').outerHTML;
    //     divRow.appendChild(newDiv);
    // }

    // function Test()
    // {
    //     var dropdownHtml = '<button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Clothes</button><div class="dropdown-menu"><button class="dropdown-item buttonCategory" data-gridindex="0" type="button">Clothes</button><button class="dropdown-item buttonCategory" data-gridindex="1" type="button">Sundries</button><button class="dropdown-item buttonCategory" data-gridindex="2" type="button">Test</button></div>';
    //     var newDiv = CreateNewElement('div', [ ['class','col-4 dropdown header itemCategory'] ]);
    //     newDiv.innerHTML = dropdownHtml;
    //     divRow.appendChild(newDiv);

    //     //$('.dropdown-toggle').dropdown('toggle');
    //     $('[data-toggle="dropdown"]').parent().removeClass('open');
    // }

    // function CreateDropDownForItemName(itemName)
    // {
    //     var buttonTrash = CreateButtonWithIcon('buttonTrashDropdown', 'btn dropdown-item', 'fa fa-trash');
    //     var textareaName = CreateNewElement('textarea', [ ['class','dropdown-item'], ['id','textareaName'] ]);
        
    //     var dropdownWrapper = CreateDropdownWrapper('btn dropdown-toggle', itemName, [buttonTrash, textareaName]);
    //     var dropdownToggle = dropdownWrapper.children[0];

    //     console.log("Dropdown class: " + dropdownToggle.className);

    //     textareaItemName = dropdownToggle;

    //     divItemName = CreateNewElement('div', [ ['class','col-4 divItemName'] ], dropdownWrapper);

    //     dropdownToggle.addEventListener('click', function() 
    //     {
    //         $(dropdownToggle).dropdown('toggle');
    //     });

    //     $(dropdownToggle).on('shown.bs.dropdown', function() 
    //     {
    //         document.getElementById('buttonTrashDropdown').addEventListener('click', function()
    //         {
    //             console.log("DROPDOWNTRASH CLICKED");
    //             GridManager.RemoveRow(divRow);
    //         });

    //         textareaName.text = popoverToggle.textContent;
    //     });

    //     // $(dropdownToggle).on('hide.bs.dropdown', function()
    //     // {
    //     //     dropdownToggle.text = document.getElementById('textareaName').text;
    //     // });

    //     //divItemName = CreateNewElement('div', [ ['class','col-4 divItemName'] ], dropdownWrapper);
    //     divRow.appendChild(divItemName);
    // }
    
    /** Public Functions **/

    return { 
        GetDiv : function()
        {
            return Elements.wrapper;
            //return divRow;
        },
        // GetIndex : function()
        // {
        //     return $(Elements.wrapper).index();
        // },
        GetStorageData : function()
        {
            return [
                Elements.nameToggle.textContent, 
                listQuantityPopovers[QuantityType.Needed].text, 
                listQuantityPopovers[QuantityType.Luggage].text, 
                listQuantityPopovers[QuantityType.Wearing].text, 
                listQuantityPopovers[QuantityType.Backpack].text
            ];
        },
        ClearQuantityValue : function(quantityIndex)
        {
            listQuantityPopovers[quantityIndex].text = 0; 
            SetItemColumnColor();
        }
    };
}

