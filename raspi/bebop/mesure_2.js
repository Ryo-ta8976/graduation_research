var bebop = require('node-bebop');
var { PythonShell } = require('python-shell');

var drone = bebop.createClient();

drone.connect(function () {
  drone.takeOff();
  console.log("drone take off");

  setTimeout(function () {
    drone.up();
    console.log("drone up");
  }, 5000);

  setTimeout(function () {
    drone.stop();
    console.log("drone stop");
  }, 10000);

  setTimeout(function () {
    //const execSync = require('child_process').execSync;
    //const result = execSync('raspistill -o linear.jpg');
    console.log("take a picture");
  }, 15000);

  setTimeout(function () {
    var pyshell_1 = new PythonShell('../opencv/hough.py');
    pyshell_1.on('message', function (data) {
      console.log(data);
    });
    console.log("hough did");
  }, 20000);

  setTimeout(function () {
    drone.counterClockwise(100);
    console.log("turning");

    var pyshell_2 = new PythonShell('../sensor/lidar_gyro_new.py');
    pyshell_2.on('message', function (data) {
      if (data == "stop") {
        drone.stop();
        console.log("stop now");
      } else {
        console.log(data);
      }
    });
    console.log("mesuring");

  }, 25000);

  setTimeout(function () {
    drone.stop();
  }, 35000);

  setTimeout(function () {
    drone.land();
  }, 40000);
});
