var bebop = require('node-bebop');

var drone = bebop.createClient();

//setTimeoutをいちいち書くのが面倒なので関数化
function Timeout(passVal, ms) {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve(passVal);
    }, ms)
  )
}

async function f1() {
  drone.connect(function () {
    drone.takeOff();

    setTimeout(function () {
      drone.stop();
    }, 3000);
  });
  return "drone take off";
}
async function f2(passVal) {
  drone.connect(function () {
    drone.up(50);

    setTimeout(function () {
      drone.stop();
    }, 3000);
  });
  return "drone up";
}

async function f3(passVal) {
  console.log("#3: f3");
  return Timeout("f3 ==> f4", Math.random() * 3000);
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