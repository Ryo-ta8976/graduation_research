const performance = require('perf_hooks').performance;

const startTime_all = performance.now();
var bebop = require('node-bebop');
var PythonShell = require('python-shell');
var rssi = require('../rssi/rssi.js');

var drone = bebop.createClient();
var startTime;
var endTime;
var rssi_array = [];

drone.connect(() => {
  //離陸
  var takeOff = () => {
    drone.takeOff()
    wait(5)
  };

  //スリープ関数
  var wait = (sec) => {
    return function () {
      return new Promise((resolve) => {
        setTimeout(resolve, sec * 1000)
      });
    }
  };

  while (1) {
    takeOff.then(() => {
      // 電波強度計測
      return new Promise((resolve) => {
        for (var i = 0; i < 8; i++) {
          rssi_array.push(rssi.ave).then(
            drone.counterClockwise(100).then(
              wait(1)
            ).then(
              drone.stop()
            )
          )
        }
        resolve('end mesure_rssi')
      })
    }).then((msg) => {
      console.log(msg)

      // 回転させる角度の計算
      return new Promise((resolve) => {
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
        let rotate_bebop; //bebopを回転させる角度index

        if (index_array == 0) {
          rotate_bebop = 6;
        } else if (index_array == 1) {
          rotate_bebop = 7;
        } else {
          rotate_bebop = index_array - 2;
        }

        resolve(rotate_bebop);
      })
    }).then((rotate_bebop) => {
      // bebopの回転
      return new Promise((resolve) => {
        let rotate_time = 1;

        drone.counterClockwise(100);
        console.log("turning");

        setTimeout(() => {
          drone.stop();
          resolve("drone stop")
        }, rotate_bebop * rotate_time);
      })
    }).then((msg) => {
      console.log(msg)

      // bebopの直進
      return new Promise((resolve) => {
        let forwarding_time = 2;

        drone.forward(20);
        console.log("forwarding");

        setTimeout(() => {
          drone.stop();
          resolve("drone stop")
        }, forwarding_time);
      })
    }).then((msg) => {
      console.log(msg)

      //真下方向の撮影
      return new Promise((resolve) => {
        const execSync = require('child_process').execSync;
        const result = execSync('raspistill -o linear.jpg');
        resolve("take a picture")
      })
    }).then((msg) => {
      console.log(msg)

      //線形検出
      var pyshell = new PythonShell('../opencv/hough.py');
      pyshell.on('message', function (data) {
        if (data == "error") {
          console.log("continue...")
        } else {
          console.log("end")
          drone.land();

          return false;
        }
      });

    }).catch(() => { // エラーハンドリング
      console.error('Something wrong!')
    })
  }


});
