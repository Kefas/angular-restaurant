var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();

var server = app.listen(5000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server has started and listen on http://%s:%s", host, port)
});

var io = require('socket.io').listen(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

function handler (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(html, 'utf8'));
    res.end(html);
}

mongoose.connect('mongodb://localhost/restaurant');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function() {
    console.log('connection with db is established');
});

var Schema = mongoose.Schema;


// ********** ITEMS ************
var Items = new Schema({
    title: String,
    price: Number,
    category: String,
    description: String,
    comments: [{
        author: String,
        text: String,
        date: Date
    }]
});

mongoose.model('Item', Items);

app.get('/items', function (req, res) {
    var Item = mongoose.model('Item');
    Item.find({}, function(err, items) {
        var itemsList = [];

        items.forEach(function(item) {
            itemsList.push(item);
        });

        res.send(JSON.stringify(itemsList));
    });
});

app.get('/items/:id', function (req, res) {
    var Item = mongoose.model('Item');
    Item.findById(req.params.id, function(err, item) {
        console.log('item was found');
        res.end(JSON.stringify(item));
    });
});

app.post('/items', function (req, res) {

    var Item = mongoose.model('Item');
    var item = new Item();

    item.title = req.query.title;
    item.price = req.query.price;
    item.category = req.query.category;
    item.description = req.query.description;

    item.save(function(err) {
        if (err) throw err;
        console.log('Task has been saved');
    });

    res.end(item.toString());
});

app.post('/items/:id/comments', function(req, res) {
    var Item = mongoose.model('Item');
    Item.update(
        { _id: req.params.id },
        { $push: {
            comments: {
                author: req.body.author,
                text: req.body.text,
                date: Date.now()
            }
        }},
        {multi: false},
        function(err, rows_updated) {
            if (err) throw err;
            console.log('Updated');
            Item.findById(req.params.id, function(err, item) {
                console.log('item was found');

                io.sockets.on('connection', function (socket) {
                    socket.emit('comment', JSON.stringify(item.comments.slice(-1)[0]) );
                });

                res.end(JSON.stringify(item.comments.slice(-1)[0]));
            });
        }
    );
});

app.delete('/items/:id', function (req, res) {
    var Item = mongoose.model('Item');
    Item.findById(req.params.id, function(err, item) {
        res.end(JSON.stringify(item));
        item.remove();
    });
});

app.put('/items/:id', function (req, res) {
    var Item = mongoose.model('Item');
    Item.update(
        {_id: req.params.id},
        {
            title: req.query.title,
            price: req.query.price,
            description: req.query.description,
            category: req.query.category
        },
        {multi: false},
        function(err, rows_updated) {
            if (err) throw err;
            console.log('Updated');
            res.end("Updated");
        }
    );

});




