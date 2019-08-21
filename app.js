const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'study';

//結果
var value;

const client = new MongoClient(url,{useNewUrlParser: true});

const findDocuments = function(db, callback) {
    // Get the documents collection
    const collection = db.collection('user');
    // Find some documents
    collection.find({}).toArray(function(err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        value=docs
        console.log(value);
        callback(docs);
    });
    /*value=collection.find({}).toArray();
    console.log(value);*/
}

// Use connect method to connect to the server
client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

    findDocuments(db, function() {
        client.close(); 
    });
});

            