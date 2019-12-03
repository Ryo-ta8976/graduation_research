var bebop = require('node-bebop');

var drone = bebop.createClient();

drone.connect(function () {

  //setTimeoutをいちいち書くのが面倒なので関数化
  function Timeout(passVal, ms) {
    return new Promise(resolve =>
      setTimeout(() => {
        resolve(passVal);
      }, ms)
    )
  }

  async function f1() {

    drone.takeOff();

    setTimeout(function () {
      drone.stop();

      return "drone take off";
    }, 3000);
  }

  async function f2(passVal) {

    drone.up(50);

    setTimeout(function () {
      drone.stop();

      return "drone up";
    }, 3000);
  }

  async function f3(passVal) {
    const execSync = require('child_process').execSync;
    const result = execSync('raspistill -o linear.jpg');
    return "take a picture";
  }

  async function f4(passVal) {
    console.log("#4: f4");
    return Timeout("f4", Math.random() * 3000);

  }


  async function runAll() {
    try {
      console.log("[START]");
      const res1 = await f1();
      console.log(res1);

      const res2 = await f2(res1);
      console.log(res2);

      const res3 = await f3(res2);
      console.log(res3);

      const res4 = await f4(res3);
      console.log("Final function: " + res4);

      console.log("[END]");

    } catch (err) {
      //エラー処理
      //とりあえず何もしない
    }
  }

  runAll();

});