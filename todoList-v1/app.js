const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const _ = require("lodash");

const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/todoListDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name:"Welcome to your todo list"
});


const item2 = new Item({ 
  name:"Click + to add items to your todo list"
});

const item3 = new Item({
  name:"<-- Click here to delete items from your todo list"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


//let day = date.getDate();
const app = express();


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", function(req, res){

  Item.find({}, function(err, foundItems){

  if(foundItems.length ===0){

  Item.insertMany(defaultItems, function(err){
    if(err){
    console.log(err);
  }else{
    console.log("Added Succesfully");
  }
  });
  res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});




app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
  name: itemName
  });


if(listName === "Today"){
  item.save();

  res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName);
  })
}






});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(!err){
        console.log("Succesfully deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.get("/:customListName", function(req, res){

const customListName = _.capitalize(req.params.customListName);



List.findOne({name:customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      const list = new List({
      name: customListName,
      items: defaultItems

      });

      list.save();
      res.redirect("/"+ customListName);
    }
  else{
    res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
  }
}

});
});


// app.get("/work", function(req, res){
//   res.render("list",{ listTitle: "Work List", newListItems: workItems });
// })

app.get("/about", function(req, res){
  res.render("about")
});

app.listen(3000, function(){
console.log("server running");

});
