import serial
import time
import collections as cl
import re  # バリデーション用モジュール
import json
import requests

# バリデーション


def get_num(str):
    result = re.findall("\d+\.\d+", str)
    return result


def main():
    URL = 'http://192.168.42.58:1234/post_gas'
    ser = serial.Serial('/dev/ttyUSB0', 9600)  # デバイスの指定
    time.sleep(2)
    t0 = time.time()

    while True:
        # 標準出力からの読み込み
        str = ser.readline()
        val = (str.decode())

        # バリデーション
        gas_list = get_num(val)
        print(val)

        # 送信用辞書の作成
        data = cl.OrderedDict()
        data["gas"] = gas_list
        data = json.dumps(data)

        result = requests.post(URL, data)
        time.sleep(60)


if __name__ == '__main__':
    main()
