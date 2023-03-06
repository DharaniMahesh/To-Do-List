const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");

const app = express();

let items = ["Buy food","Cook Food","Eat Food"];
let workItems = []

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function (req, res){
    // var currentDay = today.getDay();
    // var allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let day = date.getDate();
    res.render("list", {listTitle:day, nextTask: items});

});

app.post("/", function(req, res){
    let task = req.body.task;
    if(req.body.list === "Work List") //it means the button is pressed in work page so task is added to workItems list and it is redirected to the same page i.e /work
    {    
        if(task !== ""){
            workItems.push(task);
        }
        res.redirect("/work");
    }
    else{
          
        if(task !== ""){
            items.push(task);
        }
        res.redirect("/");
    }
});

app.get("/work", function (req, res){
    res.render("list", {listTitle:"Work List", nextTask: workItems});
});


app.listen("3000", function (){
    console.log("running...");
});