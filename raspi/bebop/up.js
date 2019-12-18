var bebop = require('node-bebop');

var drone = bebop.createClient();

drone.connect(function () {
  drone.takeOff();

  setTimeout(function () {
    drone.stop();
  }, 3000);

  setTimeout(function () {
    drone.minAltitude(2);
  }, 5000);

  setTimeout(function () {
    drone.land();
  }, 10000);
});
