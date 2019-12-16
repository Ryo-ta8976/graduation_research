const performance = require('perf_hooks').performance;

const startTime_all = performance.now();
var bebop = require('node-bebop');
var { PythonShell } = require('python-shell');

var drone = bebop.createClient();
var mesure_rotation_degree_1;
var mesure_rotation_degree_2;
var startTime;
var endTime;

drone.connect(function () {
  drone.takeOff();
  console.log("drone take off");

  setTimeout(function () {
    drone.stop();
    console.log("drone stop");
  }, 5000);

  //上昇
  setTimeout(function () {
    drone.up();
    console.log("drone up");
  }, 8000);

  setTimeout(function () {
    drone.stop();
    console.log("drone stop");
  }, 13000);

  //カメラ撮影
  setTimeout(function () {
    startTime = performance.now();
    const execSync = require('child_process').execSync;
    const result = execSync('raspistill -o linear.jpg');
    endTime = performance.now();
    console.log("take a picture: %f", endTime - startTime);
  }, 15000);

  //Hough変換
  setTimeout(function () {
    startTime = performance.now();
    var pyshell = new PythonShell('../opencv/hough.py');
    pyshell.on('message', function (data) {
      if (data == "error") {
        mesure_rotation_degree_1 = 1;
      } else {
        console.log(data);
        mesure_rotation_degree_1 = data;
        console.log("hough did: %f", endTime - startTime);
      }
    });
  }, 20000);

  //レイアウト計測
  setTimeout(function () {
    drone.counterClockwise(100);
    console.log("turning");

    startTime = performance.now();
    var pyshell_layout = new PythonShell('../sensor/lidar_gyro_new.py');
    pyshell_layout.on('message', function (data) {
      if (data == "stop") {
        drone.stop();
        endTime = performance.now();
        console.log("stop now: %f", endTime - startTime);
        //drone.land();
      } else {
        //console.log(data);
      }
    });
    console.log("mesuring");

  }, 25000);

  //カメラ撮影
  setTimeout(function () {
    const execSync = require('child_process').execSync;
    const result = execSync('raspistill -o linear.jpg');
    console.log("take a picture");
  }, 35000);

  //Hough変換
  setTimeout(function () {
    var pyshell = new PythonShell('../opencv/hough.py');
    pyshell.on('message', function (data) {
      if (data == "error") {
        mesure_rotation_degree_2 = 2;
      } else {
        console.log(data);
        mesure_rotation_degree_2 = data;
        console.log("hogh did");
      }
    });

  }, 40000);

  //角度補正計算
  setTimeout(function () {
    startTime = performance.now();
    var error_degree = mesure_rotation_degree_1 - mesure_rotation_degree_2;
    pyshell.send(error_degree);
    endTime = performance.now();

    pyshell.on('message', function (data) {
      console.log(data);
    });

    console.log("error_degree send: %f", endTime - startTime);
  }, 45000);

  setTimeout(function () {
    drone.stop();
  }, 50000);

  setTimeout(function () {
    drone.land();
    const endTime_all = performance.now();
    console.log("end: %f", endTime_all - startTime_all);
  }, 55000);
});
