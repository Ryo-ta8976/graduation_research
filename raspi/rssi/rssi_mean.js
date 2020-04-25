var noble = require('noble');
var fs = require('fs');
const csvSync = require('csv-parse/lib/sync');

var DEVICE_NAME = "ble_akiayam";
//var SERVICE_UUID = "713d0000503e4c75ba943148f18d941e";
//var SERVICE_CHARACTERISTIC_UUID = "f7913b5d5898";
var count = 0;
/**
 * 計測回数
 * @type {Number} 
 */
const NUMBER_MESURE = 10;

/**
 * 合計値を計算
 * @param {Array} 
 * @returns {Number}
 */
function calcSum(data) {
  var sum = 0;
  for (i = 0; i < data.length; i++) {
    sum = sum + data[i];
  }
  return (sum);
}

/**
 * 平均値を計算
 * @param {Array} 
 * @returns {Number}
 */
function calcAve(data) {
  return (calcSum(data) / data.length);
}

/**
 * 分散を計算
 * @param {Array} 
 * @returns {Number}
 */
function calcVar(data) {
  var ave = calcAve(data);
  var varia = 0;
  for (i = 0; i < data.length; i++) {
    varia = varia + Math.pow(data[i] - ave, 2);
  }
  return (varia / data.length);
}

// 標準偏差の計算
/**
 * 標準偏差を計算
 * @param {Array} 
 * @returns {Number}
 */
function calcStd(data) {
  return Math.sqrt(calcVar(data));    // 分散の平方根
}

/**
 * ble計測開始
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
 * ble検索開始
 * @param {Object} 
 */
noble.on('discover', function (peripheral) {
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