## Travel Checklist

This custom checklist is a web app intended for mobile use that I created to avoid forgetting things when traveling, both when heading to a destination and when returning home. You can access the app here: https://daeflor-checklist.web.app/, though I would only recommend using it on mobile in its current state. 

To use the list you have to sign in with a Google account, and the list information you input gets stored in Firebase (Firestore). You can then create and re-order custom categories of list items, as needed. Within each category, you can create custom list items in a similar fashion. Within each category view there are different columns representing the quantity of items needed or packed. I had debated making these columns modular so they could be customized per person, but since I ended up just focusing the app for my personal use, I used hard-coded columns representing, in order from left to right, the quantity of items needed in total (e.g. 5 t-shirts), the quantity already packed in a suitcase, the quantity being worn or carried, and the quantity packed in a backpack or other. (In case you're wondering, yes, I don't like to forget things or leave them behind, and I may have taken this too far. But, for better or worse, I've actually gotten a lot of good use out of this app over the years). 

<img width="413" alt="List Item - Edit Quantity" src="https://user-images.githubusercontent.com/2702971/197485553-add11e30-25d5-4095-926b-b002a1895527.png">

For every quantity type of each list item, you can tap on the number to reveal buttons to increase or decrease the quantity. If the value of the left-most column doesn't match the sum of the other three, the list item will be colored orange, as a reminder that you've forgotten something. If any list item is in this state, the category itself will also be colored orange in the overall list of categories. If all the quantity values correctly match, then the list item will be colored green; if all list items are green, then the category will show up green as well. This way you can get a quick overview of all your categories to see if you've remembered to pack everyting, or which ones still need your attention. 

<img width="408" alt="List Item - View Options" src="https://user-images.githubusercontent.com/2702971/197486505-532bb7b1-bf46-4e82-baf1-3e5d11b485da.png">

If you tap on a list item or category, there are options to rename the item, delete it, or move it up or down in the list. There is also a separate option to qucikly clear all the quantity values throughout all lists. 
