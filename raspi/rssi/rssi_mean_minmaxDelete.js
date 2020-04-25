var noble = require('noble');
var fs = require('fs');
const csvSync = require('csv-parse/lib/sync');

var DEVICE_NAME = "ble_akiyama";
//var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
//var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
var count = 0;
/**
 * 計測回数
 * @type {Number} 
 */
const NUMBER_MESURE = 10;

function compareFunc(a, b) {
  return a - b;
}

/**
 * ble検索開始
 * @param {Object} 
 */
noble.on('stateChange', function (state) {
  if (state === 'poweredOn') {
    noble.startScanning();
  } else {
    noble.stopScanning();
  }
});

/**
  * ヒットしたデバイスの表示
  */
noble.on('discover', function (peripheral) {
  //output seach device
  console.log("DEVICE_NAME: " + peripheral.advertisement.localName);
  console.log("UUID: " + peripheral.uuid);
  console.log("RSSI: " + peripheral.rssi);
  console.log();


  if (peripheral.advertisement.localName == DEVICE_NAME) {
    count++;
    console.log("device find");
    noble.stopScanning();
    fs.appendFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv', peripheral.rssi + ',', (error) => {
    });
    /**
    * 指定回数計測
    */
    if (count < NUMBER_MESURE) {
      noble.startScanning();
    } else {
      let data = fs.readFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');
      let res = csvSync(data);
      let array = [];

      array = res[0];
      array = array.map(Number);
      array.sort(
        function (a, b) {
          return (a < b ? -1 : 1);
        }
      );

      let sum = 0;

      /**
      * 最大値を外す
      */
      for (i = 1; i < 9; i++) {
        sum += array[i];
      }

      let ave = sum / 8;
      console.log(ave);
      fs.appendFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble_ave.csv', ave + ',', (error) => {
      });
      fs.unlinkSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');
    }
  }
});