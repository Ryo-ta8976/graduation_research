const startTime_all = perfomance.now();
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
    startTime = perfomance.now();
    const execSync = require('child_process').execSync;
    const result = execSync('raspistill -o linear.jpg');
    endTime = perfomance.now();
    console.log("take a picture: %f", endTime - startTime);
  }, 15000);

  //Hough変換
  setTimeout(function () {
    startTime = perfomance.now();
    var pyshell = new PythonShell('../opencv/hough.py');
    pyshell.on('message', function (data) {
      console.log(data);
      mesure_rotation_degree_1 = data;
      endTime = perfomance.now();
      console.log("hough did: %f", endTime - startTime);
    });
  }, 20000);

  //レイアウト計測
  setTimeout(function () {
    drone.counterClockwise(100);
    console.log("turning");

    startTime = perfomance.now();
    var pyshell_layout = new PythonShell('../sensor/lidar_gyro_new.py');
    pyshell_layout.on('message', function (data) {
      if (data == "stop") {
        drone.stop();
        endTime = perfomance.now();
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
      console.log(data);
      mesure_rotation_degree_2 = data;
    });
    console.log("hough did");
  }, 40000);

  //角度補正計算
  setTimeout(function () {
    startTime = perfomance.now();
    var error_degree = mesure_rotation_degree_1 - mesure_rotation_degree_2;
    pyshell_layout.send(error_degree);
    endTime = perfomance.now();

    console.log("error_degree send: %f", endTime - startTime);
  }, 45000);

  setTimeout(function () {
    drone.stop();
  }, 35000);

  setTimeout(function () {
    drone.land();
    const endTime_all = perfomance.now();
    console.log("end: %f", endTime_all - startTime_all);
  }, 40000);
});
