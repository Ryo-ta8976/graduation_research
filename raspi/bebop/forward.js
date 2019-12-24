var bebop = require('node-bebop');

var drone = bebop.createClient();

drone.connect(function () {
  drone.takeOff();

  setTimeout(function () {
    drone.forward(20);
  }, 2000);

  setTimeout(function () {
    drone.stop();
  }, 7000);

  setTimeout(function () {
    drone.land();
  }, 10000);
});
