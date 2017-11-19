function Header(listType)
{
    var element = CreateNewElement('div', [ ['class', 'col container-flud'], ['hidden', 'true'] ]);
    var row = CreateNewElement('div', [ ['class', 'row'] ]); //TODO this is TEMP and dumb 

    element.appendChild(row);

    if (listType == ListType.Travel)
    {
        //TODO class data could be contained in the QuantityType object
        CreatePopoverForQuantityHeader('col divQuantityHeader', 'fa fa-pie-chart fa-lg', QuantityType.Needed);
        CreatePopoverForQuantityHeader('col divQuantityHeader', 'fa fa-suitcase fa-lg', QuantityType.Luggage);
        CreatePopoverForQuantityHeader('col divQuantityHeader', 'fa fa-male fa-lg', QuantityType.Wearing);
        CreatePopoverForQuantityHeader('col divQuantityHeader iconSmall', 'fa fa-briefcase', QuantityType.Backpack);
    }
    else if (listType == ListType.Checklist)
    {
        CreatePopoverForQuantityHeader('col divQuantityHeader', 'fa fa-pie-chart fa-lg', QuantityType.Needed);
    }

    //TODO would like a separate 'class' for toggles
    //TODO should rename this to be clearer. Like 'createHeaderWithToggle' or something.
    function CreatePopoverForQuantityHeader(divClass, iconClass, index)
    {
        var buttonClear = CreateButtonWithIcon('buttonClear', 'btn btn-lg buttonClear', 'fa fa-lg fa-eraser');

        var iconToggle = CreateNewElement('i', [ ['class',iconClass] ]);    
        var popoverToggle = CreatePopoverToggle('', iconToggle, [buttonClear], 'focus');
        
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            console.log("A Header Popover was shown");
            document.getElementById('buttonClear').addEventListener('click', function()
            {
                GridManager.ClearButtonPressed(index);
            });
        });

        var divWrapper = CreateNewElement('div', [ ['class',divClass] ], popoverToggle);
        // document.getElementById('headerRow').appendChild(divWrapper);
        row.appendChild(divWrapper);
    }

    return { 
        GetElement : function()
        {
            return element;
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