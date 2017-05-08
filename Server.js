var express = require("express");
var app = express();
var helpers = require('express-helpers')
var router = express.Router();
var path = __dirname + '/views/';
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = "mongodb://localhost:27017/shopdb";
var async = require('async');
app.set('view engine', 'ejs'); //tell Express we're using EJS
helpers(app);
var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
});

// var insertDocument = function(db, callback) {
//     db.collection('shop_collection').insertOne({
//         "supplier": [{
//             "name": "Jungle Brothers",
//             "contact": "10075",
//             "products": [{
//                 "name": "Rizla",
//                 "cost": "0.5"
//             }, {
//                 "name": "Apples",
//                 "cost": "1"
//             }],
//         },
//         {
//             "name": "Mr Nice",
//             "contact": "20938",
//             "products": [{
//                 "name": "Bananas",
//                 "cost": "0.5"
//             }, {
//                 "name": "Oranges",
//                 "cost": "1"
//             }],
//         },
//       ]
//     });
// };
//
// MongoClient.connect(url, function(err, db) {
//     assert.equal(null, err);
//     insertDocument(db, function() {
//         db.close();
//     });
// });

const db = require('monk')('localhost/shopdb')
const collection = db.get('shop_collection')
db.then(() => {
  console.log('Connected correctly to server')
})

router.use(function(req, res, next) {
    console.log("/" + req.method);
    next();
});

router.get("/", function(req, res, next) {
    res.render(path + 'index.ejs');
});

router.get("/add_supplier", function(req, res, next) {
    res.render(path + 'add_supplier.ejs');
});

app.post('/add_supplier', function(req, res){
  var supplier_name = req.body.supplier_name;
  var supplier_contact = req.body.supplier_contact;
  console.log(supplier_name);
  console.log(supplier_contact);
  res.render(path + 'index.ejs');
});

router.get("/add_product", function(req, res, next) {
    res.render(path + 'add_supplier.ejs');
});

router.get("/edit_supplier", function(req, res, next) {
    res.render(path + 'edit_supplier.ejs');
});


router.get("/list_suppliers", function(req, res, next) {
    collection.find({},function(e,suppliers){
      console.log(suppliers);
        res.render(path + "list_suppliers.ejs",{suppliers:suppliers});
    });
});

app.use("/", router);


app.listen(3000, function() {
    console.log("Live at Port 3000");
});
