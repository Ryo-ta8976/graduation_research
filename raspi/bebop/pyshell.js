var {PythonShell} = require('python-shell');

var pyshell = new PythonShell('../opencv/hough.py');

pyshell.on('message', function (data) {
  console.log(data);
});