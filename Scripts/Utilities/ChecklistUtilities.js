'use strict';
window.ChecklistUtilities = (function()
{
    /**
     * Calculates the balance of a List Item based on its different quantity values
     * @param {object} quantities The List Item's 'quantities' object
     * @returns The balance of the List Item, in the form of a ChecklistObjectBalance value
     */
    function calculateListItemBalance(quantities)
    {
        //Calculate the List Item's balance based on its different quantity values
        let _listItemBalance = quantities.needed - quantities.luggage - quantities.wearing - quantities.backpack;

        if (_listItemBalance !== 0) //If the balance is not equal to zero, return Unbalanced
        {
            return ChecklistObjectBalance.Unbalanced;
        } 
        else if (quantities.needed !== 0) //Else, if the 'needed' quantity is not equal to zero, return Balanced
        {
            return ChecklistObjectBalance.Balanced;
        }
        else //Else return None
        {
            return ChecklistObjectBalance.None;
        }
    }

    /**
     * Calculates the balance of a List based on the balance of its List Items
     * @param {array} listItems The array of List Items that the List comprises
     * @returns The balance of the List, in the form of a ChecklistObjectBalance value
     */
    function calculateListBalance(listItems)
    {
        //Set the List's balance as None by default
        let _listBalance = ChecklistObjectBalance.None;

        //For each List Item in the List...
        for (let i = 0; i < listItems.length; i++)
        {
            //Calculate the List Item's balance based on its different quantity values
            let _listItemBalance = calculateListItemBalance(listItems[i].quantities);

            //If the List Item is Unbalanced, then the List must also be, so set the List's balance as Unbalanced
            if (_listItemBalance === ChecklistObjectBalance.Unbalanced)
            {
                _listBalance = ChecklistObjectBalance.Unbalanced;
                break;
            } 
            //Else, if the List Item is Balanced, then set the List's balance as Balanced (as it can no longer be None, and has not yet been determined to be Unbalanced)
            else if (_listItemBalance === ChecklistObjectBalance.Balanced)
            {
                _listBalance = ChecklistObjectBalance.Balanced;
            }
        }

        return _listBalance;
    }

    return {
        CalculateListItemBalance: calculateListItemBalance,
        CalculateListBalance : calculateListBalance
    };
})();

//TODO Not sure if this should be inside the namespace or not. 
    //Or in another file altogether, along with all other checklist enums.
        //Or should all the other checklist enums be brought into this file?
const ChecklistObjectBalance = {
    None: 'None',
    Balanced: 'Balanced',
    Unbalanced: 'Unbalanced'
};