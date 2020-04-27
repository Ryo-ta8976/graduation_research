/**
 * bebopサンプルプログラム
 */

var bebop = require('node-bebop');

var drone = bebop.createClient();

drone.connect(function () {
	drone.takeOff();

	setTimeout(function () {
		drone.up(10);
	}, 2000);

	setTimeout(function () {
		drone.land();
	}, 7000);
});
