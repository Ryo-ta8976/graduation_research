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
  }, 7000);

  setTimeout(function () {
    const execSync = require('child_process').execSync;
    const result = execSync('raspistill -o linear.jpg');
    console.log("take a picture");
  }, 10000);

  setTimeout(function () {
    var pyshell = new PythonShell('../opencv/hough.py');
    pyshell.on('message', function (data) {
      console.log(data);
    });
    console.log("hough did");
  }, 15000);

  setTimeout(function () {
    drone.counterClockwise(100);
    console.log("turn");

    var pyshell = new PythonShell('../opencv/hough.py');
    pyshell.on('message', function (data) {
      console.log(data);
    });
    console.log("hough did");
  }, 20000);

  setTimeout(function () {
    drone.land();
  }, 5000);
});
