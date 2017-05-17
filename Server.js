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
var moment = require('moment');

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
});

const db = require('monk')('localhost/shopdb')
// const collection = db.get('shop_collection')
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

router.get("/order", function(req, res, next) {
  db.get('order_collection').find({}, function(e, orders) {
      // console.log(suppliers);
      res.render(path + "order.ejs", {
          orders: orders
      });
  });
});

  app.post('/add_order', function(req, res) {

    var tasks = [
        function(callback) {
          var supplier_names = req.body.supplier_name;
          var supplier_contacts = req.body.supplier_contact;
          var product_names = req.body.product_name;
          var price_per_units = req.body.product_price;
          var product_quantities = req.body.product_quantity;
          var cost_for_items = req.body.product_price_total;
          var order_total = req.body.order_total;
          // console.log(supplier_names);
          // console.log(supplier_contacts);
          // console.log(product_names);
          // console.log(price_per_units);
          // console.log(product_quantities);
          // console.log(cost_for_items);
          // console.log(order_total);

          var items = [];
          var number_of_items = supplier_names.length;
          // console.log(number_of_items);
          if (number_of_items == Array){
          for (var i = 0; i < number_of_items; i++) {
            items.push({
              "supplier_name":supplier_names[i],
              "supplier_contact":supplier_contacts[i],
              "product_name":product_names[i],
              "product_price":price_per_units[i],
              "product_quantity":product_quantities[i],
              "product_total_cost":cost_for_items[i],
            })
          }
        }
        else {
          items.push({
            "supplier_name":supplier_names,
            "supplier_contact":supplier_contacts,
            "product_name":product_names,
            "product_price":price_per_units,
            "product_quantity":product_quantities,
            "product_total_cost":cost_for_items,
          })
        }
          // console.log(items);
            var insertDocument = function(db, callback) {
                db.collection('order_collection').insertOne({
                  "items":items,
                  "order_total":order_total,
                  "order_datetime":moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
                }, function(err, result) {
                    assert.equal(err, null);
                    console.log("Inserted a document into the collection");
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
            res.redirect('/order');
    });
});



router.get("/new_order", function(req, res, next) {
    db.get('shop_collection').find({products : {$exists:true}, $where:'this.products.length>0'}, function(e, suppliers) {
        // console.log(suppliers);
        res.render(path + "new_order.ejs", {
            suppliers: suppliers
        });
    });
});


app.post('/add_supplier', function(req, res) {
    var tasks = [
        function(callback) {
            var supplier_name = req.body.supplier_name;
            var supplier_contact = req.body.supplier_contact;
            // console.log(supplier_name);
            // console.log(supplier_contact);
            var insertDocument = function(db, callback) {
                db.collection('shop_collection').insertOne({
                    "supplier_name": supplier_name,
                    "supplier_contact": supplier_contact
                }, function(err, result) {
                    assert.equal(err, null);
                    console.log("Inserted a document into the db.get('shop_collection').");
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
    db.get('shop_collection').find({
        "_id": ObjectId(req.params.id)
    }, function(e, supplier_edit) {
        // console.log(supplier_edit);
        res.render(path + "edit.ejs", {
            data: supplier_edit
        });
    });
});

app.get('/edit_order/:id', function(req, res, next) {
    // console.log(req.params.id);

    var locals = {};
    var tasks = [
        // Load users
        function(callback) {
            db.collection('shop_collection').find({products : {$exists:true}, $where:'this.products.length>0'}, function(e, suppliers) {
                locals.suppliers = suppliers;
                callback();
            });
        },
        function(callback) {
            db.collection('order_collection').find({"_id": ObjectId(req.params.id)}, function(e, order_edit) {
                locals.order = order_edit;
                callback();
            });
        }
    ];

    async.parallel(tasks, function(err) { //This function gets called after the two tasks have called their "task callbacks"
        if (err) return next(err); //If an error occurred, let express handle it by calling the `next` function
        // console.log(locals.suppliers[0]);
        res.render(path + "edit_order.ejs", {
            order: locals.order[0],
            suppliers: locals.suppliers
        });
});
});



app.get('/add_product/:id', function(req, res, next) {
    // console.log(req.params.id);
    db.get('shop_collection').find({
        "_id": ObjectId(req.params.id)
    }, function(e, data) {
        // console.log(supplier_edit);
        res.render(path + "add_product.ejs", {
            supplier: data
        });
    });
});

app.get('/view_order/:id', function(req, res, next) {

    // console.log(req.params.id);
    // res.render(path+"view_order.ejs",{
    //
    // });
    db.get('order_collection').find({
        "_id": ObjectId(req.params.id)
    }, function(e, order) {
        // console.log(order);
        res.render(path + "view_order.ejs", {
            order: order[0]
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
  // console.log('hello');
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

app.get('/delete_order/:id', function(req, res, next) {
  // console.log('hello');
    var tasks = [
        function(callback) {
          var supplier_id = req.params.id;

            var deleteDocument = function(db, callback) {
                db.collection('order_collection').deleteOne(
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
        res.redirect('/order');
    });
});

app.post('/edit_supplier', function(req, res) {
  console.log('hello');
    var supplier_name = req.body.supplier_name;
    var supplier_contact = req.body.supplier_contact;
    var supplier_id = req.body.supplier_id;
    //
    // console.log(supplier_name);
    // console.log(supplier_contact);
    // console.log(supplier_id);
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
  // var product_names = req.body['product_name_'+req.params.product_name];
  //
  // console.log(product_names);
    var tasks = [
        function(callback) {
          var supplier_id = req.params.id;
          var old_product_name = req.params.product_name;

          var new_product_name = req.body['product_name_'+req.params.product_name];
          var new_product_price = req.body['product_price_'+req.params.product_price];

            var updateDocument = function(db, callback) {
                db.collection('shop_collection').update(
                  {"_id":ObjectId(supplier_id),
                  'products.product_name':old_product_name},
                  {$set:{"products.$.product_price":new_product_price,
                  "products.$.product_name":new_product_name}}
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


router.get("/add_product", function(req, res, next) {
    res.render(path + 'add_product.ejs');
});

router.get("/edit_supplier", function(req, res, next) {
    res.render(path + 'edit_supplier.ejs');
});


router.get("/list_suppliers", function(req, res, next) {
    db.get('shop_collection').find({}, function(e, suppliers) {
        // console.log(suppliers);
        res.render(path + "list_suppliers.ejs", {
            suppliers: suppliers
        });
    });
});


app.post('/update_order', function(req, res) {
// console.log('hello');
  var tasks = [
      function(callback) {
        var supplier_names = req.body.supplier_name;
        var supplier_contacts = req.body.supplier_contact;
        var product_names = req.body.product_name;
        var price_per_units = req.body.product_price;
        var product_quantities = req.body.product_quantity;
        var cost_for_items = req.body.product_price_total;
        var order_total = req.body.order_total;
        var order_id = req.body.order_id;

        var items = [];
        var number_of_items = supplier_names.length;
        // console.log(number_of_items);
        if (number_of_items == Array){
        for (var i = 0; i < number_of_items; i++) {
          items.push({
            "supplier_name":supplier_names[i],
            "supplier_contact":supplier_contacts[i],
            "product_name":product_names[i],
            "product_price":price_per_units[i],
            "product_quantity":product_quantities[i],
            "product_total_cost":cost_for_items[i],
          })
        }
      }
      else {
        items.push({
          "supplier_name":supplier_names,
          "supplier_contact":supplier_contacts,
          "product_name":product_names,
          "product_price":price_per_units,
          "product_quantity":product_quantities,
          "product_total_cost":cost_for_items,
        })
      }
        // console.log(items);
          var insertDocument = function(db, callback) {
              db.collection('order_collection').update({"_id": ObjectId(order_id)},
              {
                "items":items,
                "order_total":order_total,
                "order_datetime":moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
              }, function(err, result) {
                  assert.equal(err, null);
                  console.log("Inserted a document into the collection");
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
          res.redirect('/order');
  });
});




app.use("/", router);


app.listen(3000, function() {
    console.log("Live at Port 3000");
});
