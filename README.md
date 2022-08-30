# To-do-list-v2
Updated todolist using mongoDB

Lists now persist when the pge is refreshed. 

User can create custom lists by adding "/customListName" in the URL. The customListName will be rendered as the title and a new collection will be added in the database. This is accomplished using express route parameters.
