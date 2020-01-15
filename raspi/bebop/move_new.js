//処理時間計測
const performance = require('perf_hooks').performance;
const startTime_all = performance.now();
var startTime;
var endTime;

//bebop制御
var bebop = require('node-bebop');
var { PythonShell } = require('python-shell');
var drone = bebop.createClient();
var rssi_array = [];
let rotate_bebop; //bebopを回転させる角度index

//rssi計測
var noble = require('noble');
var fs = require('fs');
var DEVICE_NAME = "ble_koji";
var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
var count = 0;
var rssi_array = [];
let array = [];

//rssi計測
function get_rssi() {
  return new Promise(resolve => {
    console.log("rssi mesuring...")
    noble.startScanning();

    //search ble
    noble.on('discover', function (peripheral) {
      //output seach device
      console.log("DEVICE_NAME: " + peripheral.advertisement.localName);
      console.log("UUID: " + peripheral.uuid);
      console.log("RSSI: " + peripheral.rssi);
      console.log();

      //equals devicename
      if (peripheral.advertisement.localName == DEVICE_NAME) {
        count++;
        console.log("device find");
        noble.stopScanning();

        array.push(peripheral.rssi);

        if (count < 10) {
          noble.startScanning();
        } else {
          console.log(array);
          array.sort(
            function (a, b) {
              return (a < b ? -1 : 1);
            }
          );
          count = 0;
          let max = array[9];
          array = [];
          console.log(max);
          resolve(max);
        }
      }
    })
  });
}

function sleep(waitSec) {
  return new Promise(function (resolve) {

    setTimeout(function () { resolve() }, waitSec);

  });
}

const main = () => {
  //while (1){
  drone.connect(async () => {
    //離陸
    drone.takeOff();
    console.log("drone take off");

    //5秒待機
    await sleep(5000);

    //上昇
    drone.up(50);
    console.log("drone up");
    await sleep(3000);
    drone.stop();

    while (1) {
      startTime = performance.now();
      //8箇所のrssi計測
      for (let i = 0; i < 8; i++) {
        let rssi_max = await get_rssi();
        rssi_array.push(rssi_max);
        // get_rssi.then((rssi_max) => {
        //   rssi_array.push(rssi_max);
        // })
        console.log(rssi_max)
        console.log(i);

        console.log("turning");
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
      //方向の決定
      const get_direction = new Promise(resolve => {
        console.log("getting deirection");
        var temp_array = [];

        temp_array = rssi_array;
        //昇順ソート
        temp_array.sort(
          function (a, b) {
            return (a < b ? -1 : 1);
          }
        );

        let rssi_max = temp_array[9];
        let index_array = rssi_array.indexOf(rssi_max); //電波強度が最大の時のindex

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
      //bebopの回転
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
      //bebopの直進
      const go_straight = new Promise(resolve => {
        let forwarding_time = 3000;

        drone.forward(30);
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
      //画像の撮影
      const take_picture = new Promise(resolve => {
        const execSync = require('child_process').execSync;
        const result = execSync('raspistill -o linear.jpg');
        resolve("take a picture")
      });

      result = await take_picture;
      console.log(result);
      endTime = performance.now();
      console.log("take a picture: %f", endTime - startTime);

      startTime = performance.now();
      //線形検出
      const detect_linear = new Promise(resolve => {
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
