var noble = require('noble');

var DEVICE_NAME = "ble_koji";
var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";

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
    console.log("find");
    noble.stopScanning();

    console.log('device found');
  }
});