const performance = require('perf_hooks').performance;

const startTime_all = performance.now();
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
 * 機体回転誤差を保持するための変数
 * @type {Number} 
 */
var mesureRotationBefore;
var mesureRotationAfter;

var startTime;
var endTime;
var pyshell_layout;


/**
 * UAV制御開始
 */
drone.connect(function () {
  /**
   * UAV離陸
   */
  drone.takeOff();
  console.log("drone take off");

  setTimeout(function () {
    drone.stop();
    console.log("drone stop");
  }, 5000);

  /**
  * UAV上昇
  */
  setTimeout(function () {
    drone.up(100);
    console.log("drone up");
  }, 8000);

  setTimeout(function () {
    drone.stop();
    console.log("drone stop");
  }, 11000);

  /**
  * 機体真下画像の撮影
  */
  setTimeout(function () {
    startTime = performance.now();
    const execSync = require('child_process').execSync;
    const result = execSync('raspistill -o linear.jpg');
    endTime = performance.now();
    console.log("take a picture: %f", endTime - startTime);
  }, 15000);

  /**
  * Hough変換
  */
  setTimeout(function () {
    startTime = performance.now();
    var pyshell = new PythonShell('../opencv/hough.py');
    pyshell.on('message', function (data) {
      console.log(data);
      if (data == "error") {
        mesureRotationBefore = 1;
      } else {
        console.log(data);
        mesureRotationBefore = data;
        console.log("hough did: %f", endTime - startTime);
      }
    });
  }, 20000);

  /**
  * UAV制御開始
  */
  setTimeout(function () {
    drone.counterClockwise(100);
    console.log("turning");

    startTime = performance.now();
    /**
    * 外部pythonプログラム実行
    * Lidarとジャイロセンサによるレイアウト計測
    * @type {Object}
    */
    pyshell_layout = new PythonShell('../sensor/lidar_gyro_new.py');
    pyshell_layout.on('message', function (data) {
      console.log(data);
      if (data == "stop") {
        drone.stop();
        endTime = performance.now();
        console.log("stop now: %f", endTime - startTime);
      }
    });
    console.log("mesuring");
  }, 25000);

  /**
  * 画像撮影
  */
  setTimeout(function () {
    const execSync = require('child_process').execSync;
    const result = execSync('raspistill -o linear.jpg');
    console.log("take a picture");
  }, 35000);

  /**
  * Hough変換
  */
  setTimeout(function () {
    var pyshell = new PythonShell('../opencv/hough.py');
    pyshell.on('message', function (data) {
      if (data == "error") {
        console.log("err");
        mesureRotationAfter = 2;
      } else {
        console.log(data);
        mesureRotationAfter = data;
        console.log("hogh did");
      }
    });
  }, 40000);

  /**
  * 角度補正計算
  */
  setTimeout(function () {
    startTime = performance.now();
    var errorDegree = mesureRotationBefore - mesureRotationAfter;
    pyshell_layout.send(errorDegree);
    endTime = performance.now();

    pyshell_layout.on('message', function (data) {
      console.log(data);
    });

    console.log("error degree send: %f", endTime - startTime);
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
