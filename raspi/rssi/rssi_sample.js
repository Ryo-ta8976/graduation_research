'use strict';

const noble = require('noble-mac');
//const noble = require('noble'); //npm install bobleをする必要あり
const fs = require('fs');

function asyncFunc(rssi) {
  return new Promise((resolve) => {
    // ...何かしらの時間がかかる処理...
    let result;
    console.log(rssi);

    fs.appendFile('out.csv', ',' + rssi, (error) => {
      result = "csvファイルに出力しました";
      resolve(result);
    })
  });
}

//BLE deviceをさがす。
const discovered = async (peripheral) => {
  console.log(`BLE Device Found: ${peripheral.advertisement.localName}(${peripheral.uuid}) RSSI${peripheral.rssi}`);

  if (peripheral.advertisement.localName === 'BlueJelly') {
    noble.stopScanning();
    let text = await asyncFunc(peripheral.rssi);
    noble.stopScanning();
    console.log(text);
    console.log('device found');

  }
}

//スキャン開始
const scanStart = () => {
  noble.startScanning();
  noble.on('discover', discovered);
}


if (noble.state === 'poweredOn') {
  scanStart();
} else {
  noble.on('stateChange', scanStart);
}