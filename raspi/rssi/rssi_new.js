var noble = require('noble');
var fs = require('fs');
const csvSync = require('csv-parse/lib/sync');

var DEVICE_NAME = "ble_koji";
var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
var count = 0;

exports.submodule = () => {
  return new Promise((resolve) => {
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
        fs.appendFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv', peripheral.rssi + ',', (error) => {
        });
        for (let i = 1; i < 10; i++) {
          peripheral.updateRssi(function (error, rssi) {
            fs.appendFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv', rssi + ',', (error) => {
            });
          });
        }
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

        // let ave = array[9];
        // exports.ave = ave;
        // console.log(ave);
        // fs.appendFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble_ave.csv', ave + ',', (error) => {
        // });
        resolve(array[9]);
        fs.unlinkSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');

      }
    })
  });
}