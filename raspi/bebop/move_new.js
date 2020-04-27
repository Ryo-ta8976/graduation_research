/**
 * 処理時間計測
 */
const performance = require('perf_hooks').performance;
const startTime_all = performance.now();
var startTime;
var endTime;

/**
 * bebopをnodeで制御するためのライブラリ
 * @type {Object} 
 */
var bebop = require('node-bebop');
/**
 * nodeからpythonプログラムを実行するためのモジュール
 * @type {Object} 
 */
var { PythonShell } = require('python-shell');
var drone = bebop.createClient();


/**
 * rssi計測
 */
/**
 * nodeでのble取得用モジュールの読み込み
 * @type {Object} 
 */
var noble = require('noble');
var fs = require('fs');
var DEVICE_NAME = "ble_akiyama";
//var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
//var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
/**
 * rssi計測回数をカウント
 * @type {Number} 
 */
var count = 0;
/**
 * 計測回数
 * @type {Number} 
 */
const NUMBER_MESURE = 10;
var rssi_array = [];
/**
 * rssi計測値を格納
 * @type {Array} 
 */
let array = [];
let rotate_bebop; //bebopを回転させる角度index
const NUMBER_RSSI = 8;


/**
 * rssi取得
 * @returns {Number} 
 */
function get_rssi() {
  return new Promise(resolve => {
    console.log("rssi mesuring...")
    noble.startScanning();

    /**
    * ble検索開始
    * @param {Object} 
    */
    noble.on('discover', function (peripheral) {
      /**
      * ヒットしたデバイスの表示
      */
      console.log("DEVICE_NAME: " + peripheral.advertisement.localName);
      console.log("UUID: " + peripheral.uuid);
      console.log("RSSI: " + peripheral.rssi);
      console.log();

      /**
      * 対象のデバイスを発見した時の処理
      */
      if (peripheral.advertisement.localName == DEVICE_NAME) {
        count++;
        console.log("device find");
        noble.stopScanning();

        array.push(peripheral.rssi);

        /**
        * 指定回数計測
        */
        if (count < NUMBER_MESURE) {
          noble.startScanning();
        } else {
          console.log(array);
          /**
          * 昇順ソート
          */
          array.sort(
            function (a, b) {
              return (a < b ? -1 : 1);
            }
          );
          count = 0;
          /**
          * 最大値の取得
          * @type {Number} 
          */
          let max = array[9];
          array = [];
          console.log(max);
          resolve(max);
        }
      }
    })
  });
}


/**
* スリープ
* @param {Number} 
*/
function sleep(waitSec) {
  return new Promise(function (resolve) {

    setTimeout(function () { resolve() }, waitSec);

  });
}


const main = () => {
  drone.connect(async () => {
    /**
    * 離陸
    */
    drone.takeOff();
    console.log("drone take off");
    /**
    * 5秒待機
    */
    await sleep(5000);
    /**
    * 指定の速度で上昇
    * @param {Number} 
    */
    drone.up(70);
    console.log("drone up");
    await sleep(6000);
    /**
    * 停止
    */
    drone.stop();

    /**
    * BLE探索開始
    */
    while (1) {
      startTime = performance.now();
      /**
      * 8箇所のrssi計測
      */
      for (let i = 0; i < NUMBER_RSSI; i++) {
        let rssi_max = await get_rssi();
        rssi_array.push(rssi_max);
        console.log(rssi_max)
        console.log(i);
        console.log("turning");
        /**
        * 反時計回りに回転
        * @param {Number} 
        */
        drone.counterClockwise(100);
        await sleep(6500);
        console.log("stop");
        drone.stop();
        await sleep(1000);
      }

      endTime = performance.now();
      console.log("rssi mesure: %f", endTime - startTime);
      console.log("rssi mesured");
      await sleep(5000);
      startTime = performance.now();

      /**
      * 進行方向の決定
      */
      const get_direction = new Promise(resolve => {
        console.log("getting deirection");
        var temp_array = [];
        temp_array = rssi_array;
        rssi_array = [];
        console.log(temp_array);

        /**
        * 昇順ソート
        */
        temp_array.sort(
          function (a, b) {
            return (a < b ? -1 : 1);
          }
        );

        let rssi_max = temp_array[7];
        console.log(rssi_max);
        let index_array = rssi_array.indexOf(rssi_max);
        console.log(index_array);

        /**
        * 実験結果より最大値を取得できた方向の二つ前を進行方向とする
        */
        if (index_array == 0) {
          rotate_bebop = 6;
        } else if (index_array == 1) {
          rotate_bebop = 7;
        } else {
          rotate_bebop = index_array - 2;
        }

        console.log("rotate_bebop:" + rotate_bebop);
        resolve(rotate_bebop);
      })

      const rotaion = await get_direction;
      endTime = performance.now();
      console.log("get direction: %f", endTime - startTime);
      startTime = performance.now();

      /**
      * bebopを回転
      */
      const rotate = new Promise(resolve => {
        let rotate_time = 6000;

        drone.counterClockwise(100);
        console.log("turning...");

        setTimeout(() => {
          drone.stop();
          resolve("drone stop")
        }, rotate_bebop * rotate_time);
      });

      result = await rotate;
      console.log(result);
      endTime = performance.now();
      console.log("rotate: %f", endTime - startTime);

      startTime = performance.now();
      /**
      * bebopの直進
      */
      const go_straight = new Promise(resolve => {
        let forwarding_time = 8000;

        /**
        * 直進
        * @param {Number} 
        */
        drone.forward(60);
        console.log("forwarding");

        setTimeout(() => {
          drone.stop();
          resolve("drone stop")
        }, forwarding_time);
      });

      result = await go_straight;
      console.log(result);
      endTime = performance.now();
      console.log("go straight: %f", endTime - startTime);
      startTime = performance.now();

      const take_picture = new Promise(resolve => {
        /**
        * シェルコマンドを実行するためのモジュール
        * @type {Object} 
        */
        const execSync = require('child_process').execSync;
        /**
        * カメラモジュールによる画像の撮影
        * @type {Object} 
        */
        const result = execSync('raspistill -o linear.jpg');
        resolve("take a picture")
      });

      result = await take_picture;
      console.log(result);
      endTime = performance.now();
      console.log("take a picture: %f", endTime - startTime);

      startTime = performance.now();
      /**
      * Hough変換による測定値の補正
      * @returns {String} 
      */
      const detect_linear = new Promise(resolve => {
        /**
        * 外部プログラム実行
        * @type {Object} 
        */
        var pyshell = new PythonShell('../opencv/hough.py');
        pyshell.on('message', function (data) {
          if (data == "error") {
            resolve("continue");
          } else {
            console.log("end")
            drone.land();

            resolve("end");
          }
        });
      });

      endTime = performance.now();
      console.log("detect linear: %f", endTime - startTime);
      result = await detect_linear;

      console.log(result);
      if (result == "end") {
        const endTime_all = performance.now();
        console.log("end: %f", endTime_all - startTime_all);
        break;
      }
    }
  })
}

main();
