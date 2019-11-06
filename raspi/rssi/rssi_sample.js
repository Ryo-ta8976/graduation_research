var noble = require('noble');
var fs = require('fs');
const csvSync = require('csv-parse/lib/sync');

var DEVICE_NAME = "ble_koji";
var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
var count = 0;

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
    fs.appendFile('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv', peripheral.rssi + ',', (error) => {
    });
    if (count < 10) {
      noble.startScanning();
    } else {
      let data = fs.readFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');
      let res = csvSync(data);
      let sum = 0;
      for (i = 0; i < 10; i++) {
        sum += num;
      }
      let ave = sum / 10;
      console.log(ave);
      fs.unlink('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');
    }
  }
});