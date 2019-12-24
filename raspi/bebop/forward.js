var bebop = require('node-bebop');

var drone = bebop.createClient();

drone.connect(function () {
  drone.takeOff();

  setTimeout(function () {
    drone.forward(30);
  }, 5000);

  setTimeout(function () {
    drone.stop();
  }, 8000);

  setTimeout(function () {
    drone.land();
  }, 10000);
});
