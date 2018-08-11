function Header(listType)
{
    var element = CreateNewElement('div', [ ['class', 'col container-flud'] ]);
    var row = CreateNewElement('div', [ ['class', 'row'] ]); //TODO this is TEMP and dumb (why?)

    element.appendChild(row);

    if (listType == ListType.Travel)
    {
        CreatePopoverForQuantityHeader(QuantityType.Needed);
        CreatePopoverForQuantityHeader(QuantityType.Luggage);
        CreatePopoverForQuantityHeader(QuantityType.Wearing);
        CreatePopoverForQuantityHeader(QuantityType.Backpack);
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
        var popoverToggle = CreatePopoverToggle({class:data.toggleClass, display:iconToggle, children:[buttonClear], trigger:'focus'});
        // var popoverToggle = CreatePopoverToggle(data.toggleClass, iconToggle, [buttonClear], 'focus');
        
        $(popoverToggle).on('shown.bs.popover', function() 
        {
            console.log("A Header Popover was shown for quantity type: " + data.type);
            document.getElementById('buttonClear').addEventListener('click', function()
            {
                console.log("Clear button was clicked for quantity type: " + data.type);
                window.GridManager.ClearButtonPressed(data.type);
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