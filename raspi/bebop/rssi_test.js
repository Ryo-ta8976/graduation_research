var noble = require('noble');
var fs = require('fs');
//const csvSync = require('csv-parse/lib/sync');

var DEVICE_NAME = "ble_koji";
var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
var count = 0;

var rssi_array = [];

function get_rssi() {
  return new Promise((resolve) => {
    console.log("rssi mesuring...")
    // var temp = rssi.ave
    // import('../rssi/rssi.js').then((rssi_ave) => {
    //   resolve(rssi_ave)
    // })

    //start ble
    noble.on('stateChange', function (state) {
      if (state === 'poweredOn') {
        noble.startScanning();
      } else {
        noble.stopScanning();
      }
    });

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
        let array = [];
        array.push(peripheral.rssi);
        // fs.appendFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv', peripheral.rssi + ',', (error) => {
        // });
        if (count < 10) {
          noble.startScanning();
        } else {
          //let data = fs.readFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');
          //let res = csvSync(data);    

          //array = res[0];
          //array = array.map(Number);
          array.sort(
            function (a, b) {
              return (a < b ? -1 : 1);
            }
          );

          // let ave = array[9];
          // exports.ave = ave;
          // console.log(ave);
          // fs.appendFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble_ave.csv', ave + ',', (error) => {
          // });
		//
	  console.log(array[9]);
          resolve(array[9]);
          fs.unlinkSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');
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
