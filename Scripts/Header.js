function Header(listType)
{
    var element = CreateNewElement('div', [ ['class', 'col container-flud'] ]);
    var row = CreateNewElement('div', [ ['class', 'row'] ]); //TODO this is TEMP and dumb (why?)

    element.appendChild(row);

    if (listType == ListType.Travel)
    {
        //TODO class data could be contained in the QuantityType object
        CreatePopoverForQuantityHeader({wrapperClass:'col divQuantityHeader', toggleClass:'toggleQuantityHeader', iconClass:'fa fa-pie-chart fa-lg iconQuantityHeader', index:QuantityType.Needed});
        CreatePopoverForQuantityHeader({wrapperClass:'col divQuantityHeader', toggleClass:'toggleQuantityHeader', iconClass:'fa fa-suitcase fa-lg iconQuantityHeader', index:QuantityType.Luggage});
        CreatePopoverForQuantityHeader({wrapperClass:'col divQuantityHeader', toggleClass:'toggleQuantityHeader', iconClass:'fa fa-male fa-lg iconQuantityHeader', index:QuantityType.Wearing});
        CreatePopoverForQuantityHeader({wrapperClass:'col divQuantityHeader', toggleClass:'toggleQuantityHeader toggleSmallIcon', iconClass:'fa fa-briefcase iconQuantityHeader', index:QuantityType.Backpack});
    }
    // else if (listType == ListType.Checklist)
    // {
    //     CreatePopoverForQuantityHeader('col divQuantityHeader', 'fa fa-pie-chart fa-lg', QuantityType.Needed);
    // }

    //TODO should rename this to be clearer. Like 'createHeaderWithToggle' or something.
    function CreatePopoverForQuantityHeader(data)
    {
        var buttonClear = CreateButtonWithIcon({buttonId:'buttonClear', buttonClass:'btn-lg buttonClear', iconClass:'fa fa-lg fa-eraser'});

        var iconToggle = CreateNewElement('i', [ ['class',data.iconClass] ]);    
        var popoverToggle = CreatePopoverToggle(data.toggleClass, iconToggle, [buttonClear], 'focus');
        
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            console.log("A Header Popover was shown");
            document.getElementById('buttonClear').addEventListener('click', function()
            {
                GridManager.ClearButtonPressed(data.index);
            });
        });

        var divWrapper = CreateNewElement('div', [ ['class', data.wrapperClass] ], popoverToggle);
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