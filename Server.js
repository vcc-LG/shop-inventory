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
var ObjectId = require('mongodb').ObjectID;

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
});

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

app.post('/add_supplier', function(req, res) {
    var tasks = [
        function(callback) {
            var supplier_name = req.body.supplier_name;
            var supplier_contact = req.body.supplier_contact;
            console.log(supplier_name);
            console.log(supplier_contact);
            var insertDocument = function(db, callback) {
                db.collection('shop_collection').insertOne({
                    "supplier_name": supplier_name,
                    "supplier_contact": supplier_contact
                }, function(err, result) {
                    assert.equal(err, null);
                    console.log("Inserted a document into the collection.");
                    callback();
                });
            };
            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                insertDocument(db, function() {
                    db.close();
                    callback();
                });
            });
        }
    ];

        async.parallel(tasks, function(err) {
            if (err) return next(err);
            res.redirect('/list_suppliers');
    });
});

app.get('/edit/:id', function(req, res, next) {
    // console.log(req.params.id);
    collection.find({
        "_id": ObjectId(req.params.id)
    }, function(e, supplier_edit) {
        // console.log(supplier_edit);
        res.render(path + "edit.ejs", {
            data: supplier_edit
        });
    });
});


app.get('/add_product/:id', function(req, res, next) {
    // console.log(req.params.id);
    collection.find({
        "_id": ObjectId(req.params.id)
    }, function(e, data) {
        // console.log(supplier_edit);
        res.render(path + "add_product.ejs", {
            supplier: data
        });
    });
});

app.post('/add_product', function(req, res) {

    var tasks = [
        function(callback) {
          var product_name = req.body.product_name;
          var product_price = req.body.product_price;
          var supplier_id = req.body.supplier_id;


            var updateDocument = function(db, callback) {
                db.collection('shop_collection').update(
                  {"_id":ObjectId(supplier_id)},
                  {$push: { products: {
                      product_name: product_name,
                      product_price: product_price
                    }  }
                  }
                , function(err, result) {
                    assert.equal(err, null);
                    console.log("Updated document");
                    callback();
                });
            };
            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                updateDocument(db, function() {
                    db.close();
                    callback();
                });
            });
        }
    ];

    async.parallel(tasks, function(err) {
        if (err) return next(err);
        res.redirect('/list_suppliers');
    });
});



app.get('/delete/:id', function(req, res, next) {
  console.log('hello');
    var tasks = [
        function(callback) {
          var supplier_id = req.params.id;

            var deleteDocument = function(db, callback) {
                db.collection('shop_collection').deleteOne(
                  {"_id":ObjectId(supplier_id)},function(err, result) {
                    assert.equal(err, null);
                    console.log("Removed document");
                    callback();
                });
            };
            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                deleteDocument(db, function() {
                    db.close();
                    callback();
                });
            });
        }
    ];

    async.parallel(tasks, function(err) {
        if (err) return next(err);
        res.redirect('/list_suppliers');
    });
});

app.post('/edit_supplier', function(req, res) {
  console.log('hello');
    var supplier_name = req.body.supplier_name;
    var supplier_contact = req.body.supplier_contact;
    var supplier_id = req.body.supplier_id;

    console.log(supplier_name);
    console.log(supplier_contact);
    console.log(supplier_id);
    var tasks = [
        function(callback) {
            var supplier_name = req.body.supplier_name;
            var supplier_contact = req.body.supplier_contact;
            var supplier_id = req.body.supplier_id;

            var updateDocument = function(db, callback) {
                db.collection('shop_collection').update(
                  {"_id":ObjectId(supplier_id)},
                  {$set: {
                      supplier_name: supplier_name,
                      supplier_contact: supplier_contact
                    }
                  }
                , function(err, result) {
                    assert.equal(err, null);
                    console.log("Updated document");
                    callback();
                });
            };
            MongoClient.connect(url, function(err, db) {
                assert.equal(null, err);
                updateDocument(db, function() {
                    db.close();
                    callback();
                });
            });
        }
    ];

    async.parallel(tasks, function(err) {
        if (err) return next(err);
        res.redirect('/list_suppliers');
    });
});

app.post('/edit_product/:id/:product_name/:product_price', function(req, res) {
  var supplier_id = req.params.id;
  var product_name = req.params.product_name;
  var product_price = req.params.product_price;

    console.log(supplier_id);
    console.log(product_name);
    console.log(product_price);

});


router.get("/add_product", function(req, res, next) {
    res.render(path + 'add_product.ejs');
});

router.get("/edit_supplier", function(req, res, next) {
    res.render(path + 'edit_supplier.ejs');
});


router.get("/list_suppliers", function(req, res, next) {
    collection.find({}, function(e, suppliers) {
        // console.log(suppliers);
        res.render(path + "list_suppliers.ejs", {
            suppliers: suppliers
        });
    });
});

app.use("/", router);


app.listen(3000, function() {
    console.log("Live at Port 3000");
});
