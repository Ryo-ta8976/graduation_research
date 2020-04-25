import serial
import smbus
import math
import time
from time import sleep
import numpy as np
import json
import collections as cl
import requests
import sys


t_before = time.time()

DEV_ADDR = 0x68  # ジャイロのアドレス
address = 0x62  # Lider Lite v3のアドレス

# レジスタのアドレス
ACCEL_XOUT = 0x3b
ACCEL_YOUT = 0x3d
ACCEL_ZOUT = 0x3f
TEMP_OUT = 0x41
GYRO_XOUT = 0x43
GYRO_YOUT = 0x45
GYRO_ZOUT = 0x47
ACQ_COMMAND = 0x00
STATUS = 0x01
FULL_DELAY_HIGH = 0x0f
FULL_DELAY_LOW = 0x10

# 送信先URL
#URL = 'http://192.168.10.3:1234/post_data'
URL = 'http://192.168.42.58:1234/post_data'

# 変数の初期化
sum_degree_mesured = 0.0
sum_degree_mesuring = 0.0
timeval = 0.001
i = 0
count_point = 0
gyro_z = []
rotation_degree = []
dist = []
rot = []

bus = smbus.SMBus(1)


# 1byteの読み込み
def read_byte(adr):
    return bus.read_byte_data(DEV_ADDR, adr)


# 2byteの読み込み
def read_word(adr):
    high = bus.read_byte_data(DEV_ADDR, adr)
    low = bus.read_byte_data(DEV_ADDR, adr+1)
    val = (high << 8) + low
    return val


# センサデータの読み込み
def read_word_sensor(adr):
    val = read_word(adr)
    if (val >= 0x8000):
        return -((65535 - val) + 1)
    else:
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


while (1):
    # 距離を取得
    value = get_dist()
    # 回転角速度の取得
    z = get_gyro_data_deg()

    # 一回計測するのに必要な時間を計算
    t_after = time.time()
    elapsed_time = t_after-t_before
    t_before = t_after

    # 配列への追加
    gyro_z.append(z)
    dist.append(value)

    # 回転角を計算
    actual_rotation = z * elapsed_time
    rotation_degree.append(actual_rotation)
    sum_degree_mesuring += actual_rotation

    sleep(timeval)
    count_point += 1
    print(sum_degree_mesuring)

    if (sum_degree_mesuring > 300):
        print("stop")
        break


for i in range(count_point):
    sum_degree_mesured = sum_degree_mesured+rotation_degree[i]
    rot.append(sum_degree_mesured)


# 標準出力からの読み込み
error_degree = sys.stdin.readline()


if (error_degree != None):
    # 送信用辞書の作成
    data = cl.OrderedDict()
    data["dist"] = dist
    data["rot"] = rot
    data["count"] = count_point
    data["error_degree"] = error_degree
    data = json.dumps(data)
    print("send data")

    result = requests.post(URL, data)
