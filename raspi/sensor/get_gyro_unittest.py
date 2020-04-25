# -*- coding: utf-8 -*-
#!/usr/bin/python


import smbus            # I2C用モジュール
import math
import time
from time import sleep
import numpy as np


t_before = time.time()
DEV_ADDR = 0x68  # デバイスのアドレス

# レジスタのアドレス
ACCEL_XOUT = 0x3b
ACCEL_YOUT = 0x3d
ACCEL_ZOUT = 0x3f
TEMP_OUT = 0x41
GYRO_XOUT = 0x43
GYRO_YOUT = 0x45
GYRO_ZOUT = 0x47
PWR_MGMT_1 = 0x6b
PWR_MGMT_2 = 0x6c

sum_degree = 0.0  # 回転角の初期化
timeval = 0.001
COUNT = 1000  # 計測回数

# コネクションオブジェクトの取得
bus = smbus.SMBus(1)
bus.write_byte_data(DEV_ADDR, PWR_MGMT_1, 0)


def read_byte(adr):
    return bus.read_byte_data(DEV_ADDR, adr)


# 2バイト分読み込み
def read_word(adr):
    high = bus.read_byte_data(DEV_ADDR, adr)
    low = bus.read_byte_data(DEV_ADDR, adr+1)
    val = (high << 8) + low
    return val


# センサデータの読み込み
def read_word_sensor(adr):
    val = read_word(adr)
    if (val >= 0x8000):         # 負
        return -((65535 - val) + 1)
    else:                       # 正
        return val


# ジャイロデータの取得
def get_gyro_data_lsb():
    #x = read_word_sensor(GYRO_XOUT)
    #y = read_word_sensor(GYRO_YOUT)
    z = read_word_sensor(GYRO_ZOUT)
    # return [x, y, z]
    return z


def get_gyro_data_deg():
    #x,y,z = get_gyro_data_lsb()
    z = get_gyro_data_lsb()  # 今回はz軸データのみ使用
    #x = x / 131.0
    #y = y / 131.0
    z = z / 131.0
    # return [x, y, z]
    return z


# 変数の初期化
i = 0
gyro_z = []
rotation_degree = []
sum = 0


# 指定回数計測
while i < COUNT:
    z = get_gyro_data_deg()
    t_after = time.time()
    elapsed_time = t_after-t_before  # 計測間隔計算
    sum += elapsed_time
    t_before = t_after
    gyro_z.append(z)
    rotation_degree.append(z*elapsed_time)

    sleep(timeval)
    i = i+1


file = open('test_gyro.text', 'w')


for i in range(COUNT):
    file.write('No. %d ' % i)
    file.write('degree: %08.3f ' % sum_degree)
    file.write('\n')
    print('gyro[deg/s]')
    print('z: %08.3f' % gyro_z[i])
    sum_degree = sum_degree+rotation_degree[i]
    print('degree: %08.3f' % sum_degree)
    print('\n')


print(sum/1000)
file.close()
