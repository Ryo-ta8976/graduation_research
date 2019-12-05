var noble = require('noble');
var fs = require('fs');
const csvSync = require('csv-parse/lib/sync');

var DEVICE_NAME = "ble_koji";
var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
var count = 0;

// 合計値の計算
function calcSum(data) {
  var sum = 0;
  for (i = 0; i < data.length; i++) {
    sum = sum + data[i];
  }
  return (sum);
}

// 平均値の計算
function calcAve(data) {
  return (calcSum(data) / data.length);
}

// 分散の計算
function calcVar(data) {
  var ave = calcAve(data);    // 平均値
  var varia = 0;
  for (i = 0; i < data.length; i++) {
    varia = varia + Math.pow(data[i] - ave, 2);
  }
  return (varia / data.length);
}

// 標準偏差の計算
function calcStd(data) {
  return Math.sqrt(calcVar(data));    // 分散の平方根
}

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
    if (count < 10) {
      noble.startScanning();
    } else {
      let data = fs.readFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');
      let res = csvSync(data);
      let sum = 0;

      for (i = 0; i < 10; i++) {
        sum += (-1) * res[0][i];
      }

      let ave = sum / 10;
      ave = (-1) * ave;
      console.log(ave);
      let re = res[0].map(function (value) {
        return value * (-1);
      });
      console.log((-1) * calcStd(re));
      fs.appendFileSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble_ave.csv', ave + ',', (error) => {
      });
      fs.unlinkSync('/home/pi/Desktop/kenkyu/raspi/rssi/ble.csv');
    }
  }
});