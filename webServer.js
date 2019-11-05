// 必要なファイルを読み込み
var http = require('http');
var url = require('url');
var fs = require('fs');
var server = http.createServer();


//DB接続準備
const MongoClient = require('mongodb').MongoClient;
const url_db = 'mongodb://localhost:27017'; // Connection URL
const dbName = 'study'; // Database Name
const client = new MongoClient(url_db, { useNewUrlParser: true });
const assert = require('assert');
var collection;
//var value;


//rasberrypiとの接続準備
var https = require('https');
var url_json = 'https://api.atnd.org/events/?keyword_or=javascript&format=json';
var data_raspi = [];
var data_string = "";



// Use connect method to connect to the server
client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const db = client.db(dbName);

    // Get the documents collection
    collection = db.collection('user');
});

function asyncFunc(index) {
    return new Promise((resolve) => {
        // ...何かしらの時間がかかる処理...
        let result;

        let col=collection.find({"index":index});
        col.sort({ time: -1 }).toArray(function (err, docs) {
        //collection.find({}).sort({ time: -1 }).toArray(function (err, docs) {
            console.log("はいった");
            for (let doc of docs) {
                result = doc;
                break;
            }
            //value = docs;
            resolve(result);
        });

        //process.on('unhandledRejection', console.dir)
        
    });

}


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
        "getCSS": function () {
            var template = fs.readFile('./css/index.css', 'utf-8', function (err, data) {
                // HTTPレスポンスヘッダを出力する
                res.writeHead(200, {
                    'content-Type': 'text/css'
                });

                // HTTPレスポンスボディを出力する
                res.write(data);
                res.end();
            });
        },
        "getValue": async function () {

            let value = await asyncFunc(1);
            //client.close();

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
        },
        "postData": function () {
            req.on('data', function (data) {
                data_string += data.toString('utf-8', 0, data.length); //バッファをstringに逐一変換
            });
            req.on('end', function () {
                var data_json = JSON.parse(data_string); //stringをjsonに変換
                //console.log(data_json.rot);


                //jsonにタイムスタンプを追加(あとで最新の物を検索して取り出せるように)
                var time = new Date().getTime();
                data_json["time"] = time;
                console.log(data_json.time);

                //index:1はレイアウト
                data_json["index"]=1;

                //データをDBに保存
                collection.insertOne(data_json);
                console.log('json data insert DB');
            });
        },
        "postGas": function () {
            req.on('data', function (data) {
                data_string += data.toString('utf-8', 0, data.length); //バッファをstringに逐一変換
            });
            req.on('end', function () {
                var data_json = JSON.parse(data_string); //stringをjsonに変換
                //console.log(data_json.rot);


                //jsonにタイムスタンプを追加(あとで最新の物を検索して取り出せるように)
                var time = new Date().getTime();
                data_json["time"] = time;
                console.log(data_json.time);

                //index:2はgas
                data_json["index"]=2;

                //データをDBに保存
                collection.insertOne(data_json);
                console.log('json data insert DB');
            });
        }
    };
    // urlのpathをuriに代入
    var uri = url.parse(req.url).pathname;
    console.log(uri);


    // URIで行う処理を分岐させる
    if (uri === "/") {
        // URLが「IPアドレス/:1234/」の場合、"renderHTML"の処理を行う
        Response["renderHTML"]();
        return;
    } else if (uri === "/js/three.js-master/build/three.min.js") {
        // URLが「IPアドレス/:1234/js/three.js-master/build/three.min.js」の場合、"getThree"の処理を行う
        Response["getThree"]();
        return;
    } else if (uri === "/js/OrbitControls.js") {
        // URLが「IPアドレス/:1234/js/OrbitControls.js」の場合、"getOrbit"の処理を行う
        Response["getOrbit"]();
        return;
    } else if (uri === "/css/index.css") {
        Response["getCSS"]();
        return;
    } else if (uri === "/get_value") {
        // URLが「IPアドレス/:1234/get_value」の場合、"getThree"の処理を行う
        Response["getValue"]();
        return;
    } else if (uri === "/post_data") {
        // URLが「IPアドレス/:1234/post_data」の場合、"postData"の処理を行う
        Response["postData"]();
    } else if (uri === "/post_gas") {
        // URLが「IPアドレス/:1234/post_gas」の場合、"postData"の処理を行う
        Response["postGas"]();
    };
});

// 指定されたポート(1234)でコネクションの受け入れを開始する
server.listen(1234);
console.log('Server running ');
