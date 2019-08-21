// 必要なファイルを読み込み
var http = require('http');
var url = require('url');
var fs = require('fs');
var server = http.createServer();

const MongoClient = require('mongodb').MongoClient;
// Connection URL
 const url_db = 'mongodb://localhost:27017';
// Database Name
const dbName = 'study';
const client = new MongoClient(url_db,{useNewUrlParser: true});
const assert = require('assert');
var collection;
var value;

// Use connect method to connect to the server
client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

    // Get the documents collection
    collection = db.collection('user');

    collection.find({}).toArray(function(err, docs) {
        //assert.equal(err, null);
        //console.log("Found the following records");
        value=docs;
        //console.log(value);
        //callback(docs);
    });
});


// http.createServerがrequestされたら、(イベントハンドラ)
server.on('request', function (req, res) {
    // Responseオブジェクトを作成し、その中に必要な処理を書いていき、条件によって対応させる
    var Response = {
        "renderHTML": function () {
            var template = fs.readFile('./template/index.html', 'utf-8', function (err, data) {
                // HTTPレスポンスヘッダを出力する
                res.writeHead(200, {
                    'content-Type': 'text/html'
                });

                // HTTPレスポンスボディを出力する
                res.write(data);
                res.end();

            });

        },
        "getThree": function () {
            var template = fs.readFile('./js/three.js-master/build/three.min.js', 'utf-8', function (err, data) {
                // HTTPレスポンスヘッダを出力する
                res.writeHead(200, {
                    'content-Type': 'text/javascript'
                });

                // HTTPレスポンスボディを出力する
                res.write(data);
                res.end();
            });
         },
         "getOrbit": function () {
            var template = fs.readFile('./js/OrbitControls.js', 'utf-8', function (err, data) {
                 // HTTPレスポンスヘッダを出力する
                 res.writeHead(200, {
                     'content-Type': 'text/javascript'
                 });

                 // HTTPレスポンスボディを出力する
                 res.write(data);
                 res.end();
             });
          },
          "getValue": function () {
            //結果
           // var value;
                
            // Find some documents
            /*collection.find({}).toArray(function(err, docs) {
                //assert.equal(err, null);
                //console.log("Found the following records");
                value=docs;
                console.log(value);
                callback(docs);
            });*/
            /*value=collection.find();
            console.log(value);*/
            
            client.close();
            
            // HTTPレスポンスヘッダを出力する
            res.writeHead(200, {
                'content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            });

            console.log("レスポンス");
            //console.log(result);

            console.log(value);
            // HTTPレスポンスボディを出力する
            res.write(JSON.stringify(value));
            res.end();
           }
  };
    // urlのpathをuriに代入
    var uri = url.parse(req.url).pathname;
    console.log(uri);


    // URIで行う処理を分岐させる
    if (uri === "/") {
        // URLが「http://localhost:8080/」の場合、"renderHTML"の処理を行う
        Response["renderHTML"]();
        return;
    } else if (uri === "/js/three.js-master/build/three.min.js") {
        // URLが「http://localhost:8080/js/three.js-master/build/three.min.js」の場合、"getThree"の処理を行う
        Response["getThree"]();
        return;
    } else if (uri === "/js/OrbitControls.js") {
        // URLが「http://localhost:8080/js/OrbitControls.js」の場合、"getOrbit"の処理を行う
        Response["getOrbit"]();
        return;
    } else if (uri === "/get_value") {
        // URLが「http://localhost:8080/get_value」の場合、"getThree"の処理を行う
        Response["getValue"]();
        return;
    };
  });

  // 指定されたポート(8080)でコネクションの受け入れを開始する
  server.listen(1234);
  console.log('Server running at http://localhost:80/');
