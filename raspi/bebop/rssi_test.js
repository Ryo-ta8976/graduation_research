

function get_rssi() {
  return new Promise((resolve) => {
    console.log("rssi mesuring...")
    // var temp = rssi.ave
    import('../rssi/rssi.js').then((rssi_ave) => {
      resolve(rssi_ave)
    })
  })
}

function sleep(waitSec) {
  return new Promise(function (resolve) {

    setTimeout(function () { resolve() }, waitSec);

  });
}

const main = async () => {
  //受信電波強度の計測
  const mesure_rssi = new Promise(resolve => {
    console.log("mesuring rssi");
    for (var i = 0; i < 8; i++) {
      rssi_array.push(get_rssi())
        .then(
          console.log("wait..."),
          sleep(1500)
        ).then(
          console.log("wait"),
          sleep(1000)
        )
    }
    resolve('end mesure_rssi')
  });

  let result = await mesure_rssi;
  console.log(result);
}

main();