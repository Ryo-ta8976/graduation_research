var bebop = require('node-bebop');

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
    drone.land();
  }, 5000);
});
