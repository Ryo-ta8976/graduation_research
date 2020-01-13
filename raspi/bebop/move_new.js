const performance = require('perf_hooks').performance;

const startTime_all = performance.now();
var bebop = require('node-bebop');
var PythonShell = require('python-shell');
// var rssi = require('../rssi/rssi.js');

var drone = bebop.createClient();
var startTime;
var endTime;
var rssi_array = [];
let rotate_bebop; //bebopを回転させる角度index

function get_rssi() {
  return new Promise((resolve) => {
    console.log("rssi mesuring...")
    // var temp = rssi.ave
    import('../rssi/rssi.js').then((rssi_ave) => {
      resolve(rssi_ave)
    })
  })
}

function sleep(waitSec) {
  return new Promise(function (resolve) {

    setTimeout(function () { resolve() }, waitSec);

  });
}

const main = async () => {
  while (1) {
    drone.connect(() => {
      //離陸
      drone.takeOff();
      console.log("drone take off");

      //5秒待機
      await sleep(5000);

      //受信電波強度の計測
      const mesure_rssi = new Promise(resolve => {
        console.log("mesuring rssi");
        for (var i = 0; i < 8; i++) {
          rssi_array.push(get_rssi())
            .then(
              drone.counterClockwise(100),
              sleep(1500)
            ).then(
              drone.stop(),
              sleep(1000)
            )
        }
        resolve('end mesure_rssi')
      });

      let result = await mesure_rssi;
      console.log(result);
      await sleep(5000);

      //方向の決定
      const get_direction = Promise(resolve => {
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

        resolve(rotate_bebop);
      })

      const rotaion = await get_direction;

      //bebopの回転
      const rotate = new Promise(resolve => {
        let rotate_time = 1;

        drone.counterClockwise(100);
        console.log("turning...");

        setTimeout(() => {
          drone.stop();
          resolve("drone stop")
        }, rotate_bebop * rotate_time);
      });

      result = await rotate;
      console.log(result);

      //bebopの直進
      const go_straight = new Promise(resolve => {
        let forwarding_time = 2;

        drone.forward(20);
        console.log("forwarding");

        setTimeout(() => {
          drone.stop();
          resolve("drone stop")
        }, forwarding_time);
      });

      result = await go_straight;
      console.log(result);

      //画像の撮影
      const take_picture = new Promise(resolve => {
        const execSync = require('child_process').execSync;
        const result = execSync('raspistill -o linear.jpg');
        resolve("take a picture")
      });

      result = await take_picture;
      console.log(result);

      //線形検出
      const detect_linear = new Promise(resolve => {
        var pyshell = new PythonShell('../opencv/hough.py');
        pyshell.on('message', function (data) {
          if (data == "error") {
            console.log("continue...")
            resolve(true);
          } else {
            console.log("end")
            drone.land();

            resolve(false);
          }
        });
      });

      return await detect_linear;
    })
  }
}

main();