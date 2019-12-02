'use strict';

//TODO Not sure if these checklist enums should be in another file altogether, separate from the ChecklistBalanceUtilities

const ListTypes = {
    Travel: 'travel',
    Checklist: 'shopping'
};

const QuantityTypes = {
    needed: {
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-pie-chart fa-lg iconHeader'
    },
    luggage: {
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-suitcase fa-lg iconHeader'
    },
    wearing: {
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader',
        iconClass: 'fa fa-male fa-lg iconHeader'
    },
    backpack: {
        wrapperClass: 'col divQuantityHeader',
        toggleClass: 'toggleQuantityHeader toggleSmallIcon',
        iconClass: 'fa fa-briefcase iconHeader'
    },
};

window.ChecklistUtilities = (function()
{
    /**
     * Returns the List ID associated with the given Checklist Item ID
     * @param {*} id The ID of the Checklist Item (can be a number or a string)
     * @returns {string} The List ID extracted from the given Checklist Item ID
     */
    function getListIdFromChecklistItemId(id)
    {
        return id.toString().split('-')[0];
    }

    /**
     * Returns the Checklist Item type (List or List Item) based on its ID
     * @param {*} id The ID of the Checklist Item (can be a number or a string)
     * @returns {string} The Checklist Item type determined by the ID provided
     */
    function getChecklistItemTypeFromId(id)
    {
        if (typeof(id) === 'number') //List IDs are stored as numbers
        {
            return 'list';
        }
        else if (typeof(id) === 'string') //List Item IDs include the '-' character, and so are stored as strings
        {
            return 'listItem';
        }
        else
        {
            window.DebugController.LogError("Request received to get Checklist Item type from its ID, but an invalid ID was provided. ID provided: " + id);
        }
    }

    return {
        GetListIdFromChecklistItemId: getListIdFromChecklistItemId,
        GetChecklistItemTypeFromId: getChecklistItemTypeFromId
    };
13
})();

window.ChecklistBalanceUtilities = (function()
{
    const BalanceCategories = {
        None: 'None',
        Balanced: 'Balanced',
        Unbalanced: 'Unbalanced'
    };

    /**
     * Calculates the balance of a List Item based on its different quantity values
     * @param {object} quantities The List Item's 'quantities' object
     * @returns {string} The balance of the List Item, in the form of a BalanceCategories string value
     */
    function calculateListItemBalance(quantities)
    {
        //Calculate the List Item's balance based on its different quantity values
        let _listItemBalance = quantities.needed - quantities.luggage - quantities.wearing - quantities.backpack;

        if (_listItemBalance !== 0) //If the balance is not equal to zero, return Unbalanced
        {
            return BalanceCategories.Unbalanced;
        } 
        else if (quantities.needed !== 0) //Else, if the 'needed' quantity is not equal to zero, return Balanced
        {
            return BalanceCategories.Balanced;
        }
        else //Else return None
        {
            return BalanceCategories.None;
        }
    }

    /**
     * Calculates the balance of a List based on the balance of its List Items
     * @param {array} listItems The array of List Items that the List comprises
     * @returns {string} The balance of the List, in the form of a BalanceCategories string value
     */
    function calculateListBalance(listItems)
    {
        //Set the List's balance as None by default
        let _listBalance = BalanceCategories.None;

        //For each List Item in the List...
        for (let i = 0; i < listItems.length; i++)
        {
            //Calculate the List Item's balance based on its different quantity values
            let _listItemBalance = calculateListItemBalance(listItems[i].quantities);

            //If the List Item is Unbalanced, then the List must also be, so set the List's balance as Unbalanced
            if (_listItemBalance === BalanceCategories.Unbalanced)
            {
                _listBalance = BalanceCategories.Unbalanced;
                break;
            } 
            //Else, if the List Item is Balanced, then set the List's balance as Balanced (as it can no longer be None, and has not yet been determined to be Unbalanced)
            else if (_listItemBalance === BalanceCategories.Balanced)
            {
                _listBalance = BalanceCategories.Balanced;
            }
        }

        return _listBalance;
    }

    /**
     * Gets the color value associated with the provided balance value
     * @param {string} balance The List or List Item balance
     * @returns {string} the color value associated with the provided balance
     */
    function getBorderColorFromBalance(balance)
    {
       return (balance === BalanceCategories.Unbalanced) ? 'peru' //lightsalmon is also good
            : (balance === BalanceCategories.Balanced)   ? 'mediumseagreen'
            :                                              'rgb(77, 77, 77)'; //"darkgrey" is also good;
    }

    return {
        CalculateListItemBalance: calculateListItemBalance,
        CalculateListBalance: calculateListBalance,
        GetBorderColorFromBalance: getBorderColorFromBalance
    };
})();