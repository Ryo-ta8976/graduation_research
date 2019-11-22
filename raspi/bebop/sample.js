var bebop=require('node-bebop');

var drone=bebop.createClient();

drone.connect(function() {
	drone.takeOff();

	setTimeout(function() {
		drone.stop();
	},5000);

	setTimeout(function() {
		drone.up();
	},10000);

	setTimeout(function() {
		drone.land();
	},20000);
});
