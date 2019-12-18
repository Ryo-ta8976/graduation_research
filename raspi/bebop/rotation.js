var bebop = require('node-bebop');

var drone = bebop.createClient();

drone.connect(function () {
  drone.takeOff();

  setTimeout(function () {
    drone.stop();
  }, 3000);

  setTimeout(function () {
    drone.counterClockwise(100);
  }, 5000);

  setTimeout(function () {
    drone.stop();
  }, 15000);

  setTimeout(function () {
    drone.land();
  }, 17000);
});
