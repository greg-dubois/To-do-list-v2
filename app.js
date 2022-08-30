//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB');

const Item = mongoose.model('Item', { name: String });

const item1 = new Item({ name: "item 1" });
const item2 = new Item({ name: "item 2" });
const item3 = new Item({ name: "item 3" });

const defaultItems = [item1, item2, item3];

const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema]
};



const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  Item.find({}, function (err, results) {

    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("items added");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: results});
    }

  });
});

app.get("/:customListName", function (req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, results) {
    if (!err) {
      if (!results) {
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show existing list
        res.render("list", {listTitle: results.name, newListItems: results.items});
      }
    } 
  });

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function (err, results) {
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }

  

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("item removed from DB");
        }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, results) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
