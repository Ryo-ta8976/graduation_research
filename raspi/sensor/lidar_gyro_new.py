import serial
import smbus            # use I2C
import math             # mathmatics
import time
from time import sleep  # time module
import numpy as np
import json
import collections as cl
import requests


# slave address
t_before = time.time()

DEV_ADDR = 0x68         # device address
# register address
ACCEL_XOUT = 0x3b
ACCEL_YOUT = 0x3d
ACCEL_ZOUT = 0x3f
TEMP_OUT = 0x41
GYRO_XOUT = 0x43
GYRO_YOUT = 0x45
GYRO_ZOUT = 0x47

address = 0x62  # Lider Lite v3のアドレス
ACQ_COMMAND = 0x00
STATUS = 0x01
FULL_DELAY_HIGH = 0x0f
FULL_DELAY_LOW = 0x10

sum_degree = 0.0
sum_deg = 0.0
timeval = 0.001
i = 0
count_point = 0
gyro_z = []
rotation_degree = []
dist = []

bus = smbus.SMBus(1)
#bus.write_byte_data(DEV_ADDR, PWR_MGMT_1, 0)


# 1byte read
def read_byte(adr):
    return bus.read_byte_data(DEV_ADDR, adr)
# 2byte read


def read_word(adr):
    high = bus.read_byte_data(DEV_ADDR, adr)
    low = bus.read_byte_data(DEV_ADDR, adr+1)
    val = (high << 8) + low
    return val
# Sensor data read


def read_word_sensor(adr):
    val = read_word(adr)
    if (val >= 0x8000):         # minus
        return -((65535 - val) + 1)
    else:                       # plus
        return val


def get_gyro_data_lsb():
    z = read_word_sensor(GYRO_ZOUT)
    return z


def get_gyro_data_deg():
    z = get_gyro_data_lsb()
    z = z / 131.0
    return z


def get_dist():
    # 0x00に0x04の内容を書き込む
    bus.write_block_data(address, ACQ_COMMAND, [0x04])

    # 0x01を読み込んで、最下位bitが0になるまで読み込む
    value = bus.read_byte_data(address, STATUS)
    while value & 0x01 == 1:
        value = bus.read_byte_data(address, STATUS)

    # 0x8fから2バイト読み込んで16bitの測定距離をcm単位で取得する

    high = bus.read_byte_data(address, FULL_DELAY_HIGH)
    low = bus.read_byte_data(address, FULL_DELAY_LOW)
    val = (high << 8) + low
    dist = val

    return dist


# for i in range(500):
#     value = get_dist()

#     z = get_gyro_data_deg()
#     t_after = time.time()
#     elapsed_time = t_after-t_before
#     t_before = t_after
#     gyro_z.append(z)

#     dist.append(value)
#     rotation_degree.append(z*elapsed_time)

#     sleep(timeval)

while(1):
    value = get_dist()
    z = get_gyro_data_deg()

    t_after = time.time()
    elapsed_time = t_after-t_before
    t_before = t_after
    gyro_z.append(z)
    dist.append(value)
    actual_rotation = z * elapsed_time
    rotation_degree.append(actual_rotation)
    sum_deg += actual_rotation
    sleep(timeval)
    count_point += 1
    if (sum_deg > 360):
        print("stop")
        break


# file=open('test_lidar_time.csv','w')

rot = []
for i in range(count_point):
    sum_degree = sum_degree+rotation_degree[i]
    rot.append(sum_degree)
    #file.write("%d,%08.3f\n" % (dist[i],sum_degree) )

# ys=cl.OrderedDict()
data = cl.OrderedDict()
data["dist"] = dist
data["rot"] = rot
data["count"] = count_point
data = json.dumps(data)  # objectからstringに変換
print("send data")
url = 'http://192.168.10.3:1234/post_data'
#url = 'http://172.16.10.137:1234/post_data'
result = requests.post(url, data)
