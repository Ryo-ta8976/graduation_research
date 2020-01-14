var noble = require('noble');
var fs = require('fs');

var DEVICE_NAME = "ble_koji";
var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
var count = 0;

var rssi_array = [];
let array = [];

function get_rssi() {

  return new Promise(resolve => {
    console.log("rssi mesuring...")

    //start ble
    // noble.on('stateChange', function (state) {
    //   if (state === 'poweredOn') {
    //     console.log("OK")
    //     noble.startScanning();
    //   } else {
    //     console.log("NO")
    //     noble.stopScanning();
    //   }
    // });
    noble.startScanning();

    //search ble
    noble.on('discover', function (peripheral) {
      //output seach device
      console.log("DEVICE_NAME: " + peripheral.advertisement.localName);
      console.log("UUID: " + peripheral.uuid);
      console.log("RSSI: " + peripheral.rssi);
      console.log();

      //equals devicename
      if (peripheral.advertisement.localName == DEVICE_NAME) {
        count++;
        console.log("device find");
        noble.stopScanning();

        array.push(peripheral.rssi);

        if (count < 10) {
          noble.startScanning();
        } else {
          console.log(array);
          array.sort(
            function (a, b) {
              return (a < b ? -1 : 1);
            }
          );
          count = 0;
          let max = array[9];
          array = [];
          console.log(max);
          resolve(max);
        }
      }
    })
  });
}


function sleep(waitSec) {
  return new Promise(function (resolve) {

    setTimeout(function () { resolve() }, waitSec);

  });
}

const main = async () => {
  //受信電波強度の計測
  console.log("start");
  while (1) {
    for (let i = 0; i < 8; i++) {
      let rssi_max = await get_rssi();
      rssi_array.push(rssi_max);
      // get_rssi.then((rssi_max) => {
      //   rssi_array.push(rssi_max);
      // })
      console.log(rssi_max)
      console.log(i);

      console.log("wait 1500");
      drone.counterClockwise(100);
      await sleep(1500);

      console.log("wait 1000");
      drone.stop();
      await sleep(1000);
    }
    console.log(rssi_array);
  }
}



main();
