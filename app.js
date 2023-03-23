const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
mongoose.connect("mongodb+srv://admin-mahesh:Mahesh123@cluster0.6ijrrec.mongodb.net/todolistDB");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = mongoose.Schema({
    task: String
});


const Item = mongoose.model("Item", itemsSchema);

const Item1 = new Item({
    task: "Welcome to your todolist!"
});

const Item2 = new Item({
    task: "Hit the + button to add a new item."
});

const Item3 = new Item({
    task: "<--- Hit this to delete an item."
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema)

app.get("/", function (req, res){
    // res.redirect("/");
    res.set("cache-control","no-store");
    var day = date.getDate();
    Item.find().then(function (items) {
        if(items.length === 0){
            Item.insertMany(defaultItems).then(function () {
                console.log("Successfully saved defult items to DB");
              }).catch(function (err) {
                console.log(err);
              });
        }
        res.render("list", {listTitle:day, nextTask: items});
    }).catch(function (err) {
        console.log(err);
    });
});

app.post("/", function(req, res){
    res.redirect("/");
    let taskName = req.body.task;
    let listName = req.body.list;
    console.log(listName);
    if(taskName.length !== 0)
    {
        const newItem = new Item({
            task: taskName
        });
        if(listName === date.getDate()){
            newItem.save();
            res.redirect("/");
        }
        else{
            List.findOne({name: listName}).then(function (foundList){
                foundList.items.push(newItem);
                foundList.save();
            });
            // console.log("/"+req.body.listName);
            res.redirect("/"+listName);
        }
    }

});

app.post("/delete", function(req, res) {
    let del_record_id = req.body.checkbox;
    let listName = req.body.listName;

    if(listName === date.getDate()){
        Item.deleteOne({_id: del_record_id}).then(function (){
            console.log("deleted");
            res.redirect("/");
        }).catch(function (err){
            console.log(err);
        });
    }
    else
    {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: del_record_id}}}).then(function (){
            res.redirect("/"+listName);
        }).catch(function (err){
            console.log(err);
        });
    }
});

app.get("/:newRoute", function (req, res){
    // res.set("cache-control","no-store");
    const customListName = _.capitalize(req.params.newRoute);
    List.findOne({name:customListName}).then(function (foundList){
        if(!foundList){
            const list = new List({
                name: customListName,
                items:defaultItems
            });
            list.save(); 
            res.redirect("/"+customListName);
        }
        else{
        res.render("list",  {listTitle:foundList.name, nextTask:foundList.items})
        }
    }).catch(function (err){
        console.log(err);
    })

  
});


app.listen(process.env.PORT || 3000, function (){
    console.log("running...");
});