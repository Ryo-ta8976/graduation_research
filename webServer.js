/**
 * http通信用モジュールの読み込み
 * @type {Object} 
 */
var http = require('http');
/**
 * http通信のurl取得用モジュールの読み込み
 * @type {Object} 
 */
var url = require('url');
/**
 * ファイル読み込み用モジュールの読み込み
 * @type {Object} 
 */
var fs = require('fs');


/**
 * httpサーバの初期化
 * @type {Object} 
 */
var server = http.createServer();


/**
 * mongodbライブラリの読み込み
 * @type {Object} 
 */
const MongoClient = require('mongodb').MongoClient;
/**
 * mongodbの接続先URL
 * @type {String} 
 */
const URL_DB = 'mongodb://localhost:27017';
/**
 * mongodbの接続先データベース名
 * @type {String} 
 */
const DB_NAME = 'study';
/**
 * mongodbのインスタンスの作成
 * @type {Object} 
 */
var client = new MongoClient(URL_DB, { useNewUrlParser: true });
/**
 * mongodbのコレクションの初期化
 * @type {Object} 
 */
var collection = {};


//rasberrypiとの接続準備
//var https = require('https');
//var url_json = 'https://api.atnd.org/events/?keyword_or=javascript&format=json';
//var data_raspi = [];
/**
 * データ受信用変数の初期化
 * @type {String} 
 */
var data_string = "";


/**
 * MongoDB接続
 * @param {Object} 
 */
client.connect(function (err) {
    console.log("Connected correctly to server");
    const db = client.db(DB_NAME);
    collection = db.collection('user');
});

/**
 * MongoDB内検索処理
 * @param {Number} 1:レイアウトデータ 2:ガスデータ
 * @returns {Object}
 */
function searchData(index) {
    return new Promise((resolve) => {
        let data = collection.find({ "index": index });

        data.sort({ time: -1 }).toArray(function (err, docs) {
            for (let doc of docs) {
                var result = doc;
                break;
            }
            resolve(result);
        });
    });
}

/**
 * webサーバーの各処理
 * @param {Object} 
 * @param {Object} 
 */
server.on('request', function (req, res) {
    var Response = {
        /**
        * HTMLファイルの取得
        */
        "getHTML": function () {
            var template = fs.readFile('./template/index.html', 'utf-8', function (err, data) {
                res.writeHead(200, {
                    'content-Type': 'text/html'
                });
                res.write(data);
                res.end();
            });

        },
        /**
        * Three.jsライブラリの取得
        */
        "getThree": function () {
            var template = fs.readFile('./js/three.js-master/build/three.min.js', 'utf-8', function (err, data) {
                res.writeHead(200, {
                    'content-Type': 'text/javascript'
                });
                res.write(data);
                res.end();
            });
        },
        /**
        * 回転のためのライブラリの取得
        */
        "getOrbit": function () {
            var template = fs.readFile('./js/OrbitControls.js', 'utf-8', function (err, data) {
                res.writeHead(200, {
                    'content-Type': 'text/javascript'
                });
                res.write(data);
                res.end();
            });
        },
        /**
        * リアルタイムグラフのためのライブラリの取得
        */
        "getChartStreaming": function () {
            var template = fs.readFile('./js/chartjs-plugin-streaming.js', 'utf-8', function (err, data) {
                res.writeHead(200, {
                    'content-Type': 'text/javascript'
                });
                res.write(data);
                res.end();
            });
        },
        /**
        * 日付処理のためのライブラリの取得
        */
        "getMoment": function () {
            var template = fs.readFile('./js/node_modules/moment/moment.js', 'utf-8', function (err, data) {
                res.writeHead(200, {
                    'content-Type': 'text/javascript'
                });
                res.write(data);
                res.end();
            });
        },
        /**
        * cssファイルの取得
        */
        "getCSS": function () {
            var template = fs.readFile('./css/index.css', 'utf-8', function (err, data) {
                res.writeHead(200, {
                    'content-Type': 'text/css'
                });
                res.write(data);
                res.end();
            });
        },
        /**
        * レイアウトデータ取得
        */
        "getValue": async function () {
            let value = await searchData(1);

            res.writeHead(200, {
                'content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            });
            res.write(JSON.stringify(value));
            res.end();
        },
        /**
        * ガスデータ取得
        */
        "getGas": async function () {
            let value = await searchData(2);

            res.writeHead(200, {
                'content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            });
            res.write(JSON.stringify(value));
            res.end();
        },
        /**
        * レイアウトデータを登録
        */
        "postData": function () {
            req.on('data', function (data) {
                /**
                * バッファをstringに逐一変換
                */
                data_string += data.toString('utf-8', 0, data.length);
            });
            req.on('end', function () {
                var data_json = JSON.parse(data_string);

                /**
                * 最新データを検索するためにタイムスタンプを追加
                * @type {Object} 
                */
                var time = new Date().getTime();
                data_json["time"] = time;

                /**
                * index:1→レイアウト
                */
                data_json["index"] = 1;

                collection.insertOne(data_json);
                console.log('json data insert DB');
            });
        },
        /**
        * ガスデータを登録
        */
        "postGas": function () {
            req.on('data', function (data) {
                data_string += data.toString('utf-8', 0, data.length);
            });
            req.on('end', function () {
                var data_json = JSON.parse(data_string);

                var time = new Date().getTime();
                data_json["time"] = time;
                console.log(data_json.time);

                /**
                * index:2→ガス
                */
                data_json["index"] = 2;

                collection.insertOne(data_json);
                console.log('json data insert DB');
            });
        }
    };
    /**
    * urlのpathをuriに変換
    * @type {Object} 
    */
    var uri = url.parse(req.url).pathname;

    /**
    * uriで処理を分岐させる
    */
    if (uri === "/") {
        Response["getHTML"]();
        return;
    } else if (uri === "/js/three.js-master/build/three.min.js") {
        Response["getThree"]();
        return;
    } else if (uri === "/js/OrbitControls.js") {
        Response["getOrbit"]();
        return;
    } else if (uri === "/js/chartjs-plugin-streaming.js") {
        Response["getChartStreaming"]();
        return;
    } else if (uri === "/js/node_modules/moment/moment.js") {
        Response["getMoment"]();
        return;
    } else if (uri === "/css/index.css") {
        Response["getCSS"]();
        return;
    } else if (uri === "/get_value") {
        Response["getValue"]();
        return;
    } else if (uri === "/get_gas") {
        Response["getGas"]();
        return;
    } else if (uri === "/post_data") {
        Response["postData"]();
    } else if (uri === "/post_gas") {
        Response["postGas"]();
    };
});


server.listen(1234);
console.log('Server running ');
