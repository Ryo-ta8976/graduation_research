import serial
import time
import collections as cl
import re

def get_num(str):
    result=re.findall("\d+\.\d+", str)
    return result

def main():
    ser = serial.Serial('/dev/ttyUSB1', 9600)
    time.sleep(2)
    t0 = time.time()

    while True:
        # ser.write("114514")
        str = ser.readline()
        val = (str.decode())
        gas_list=get_num(val)
        print(val)
        data = cl.OrderedDict()
        data["gas"] = gas_list
        data = json.dumps(data)  # objectからstringに変換
        url = 'http://192.168.10.3:1234/post_gas'
        #url = 'http://172.16.10.137:1234/post_data'
        result = requests.post(url, data)
        time.sleep(60)


if __name__ == '__main__':
    main()
