# -*- coding: utf-8 -*-
#!/usr/bin/python

# import module
import smbus            # use I2C
import math             # mathmatics
import  time
from time import sleep  # time module
import numpy as np

#
# define
#
# slave address
t_before=time.time()

DEV_ADDR = 0x68         # device address
# register address
ACCEL_XOUT = 0x3b
ACCEL_YOUT = 0x3d
ACCEL_ZOUT = 0x3f
TEMP_OUT = 0x41
GYRO_XOUT = 0x43
GYRO_YOUT = 0x45
GYRO_ZOUT = 0x47
PWR_MGMT_1 = 0x6b       # PWR_MGMT_1
PWR_MGMT_2 = 0x6c       # PWR_MGMT_2


sum_degree=0.0
timeval=0.001

bus = smbus.SMBus(1)
                        # Sleep解除.
bus.write_byte_data(DEV_ADDR, PWR_MGMT_1, 0)

#
# Sub function
#
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
#
# 温度
#
#def get_temp():
#    temp = read_word_sensor(TEMP_OUT)
#    x = temp / 340 + 36.53      # data sheet(register map)記載の計算式.
#    return x

#
# 角速度(full scale range ±250 deg/s
#        LSB sensitivity 131 LSB/deg/s
#        -> ±250 x 131 = ±32750 LSB[16bitで表現])
#   Gyroscope Configuration GYRO_CONFIG (reg=0x1B)
#   FS_SEL(Bit4-Bit3)でfull scale range/LSB sensitivityの変更可.
#
# get gyro data
def get_gyro_data_lsb():
    #x = read_word_sensor(GYRO_XOUT)
    #y = read_word_sensor(GYRO_YOUT)
    z = read_word_sensor(GYRO_ZOUT)
    #return [x, y, z]
    return z
    
def get_gyro_data_deg():
    #x,y,z = get_gyro_data_lsb()
    z=get_gyro_data_lsb()
    #x = x / 131.0
    #y = y / 131.0
    z = z / 131.0
    #return [x, y, z]
    return z

#
# 加速度(full scale range ±2g
#        LSB sensitivity 16384 LSB/g)
#        -> ±2 x 16384 = ±32768 LSB[16bitで表現])
#   Accelerometer Configuration ACCEL_CONFIG (reg=0x1C)
#   AFS_SEL(Bit4-Bit3)でfull scale range/LSB sensitivityの変更可.
#
# get accel data
#def get_accel_data_lsb():
#    x = read_word_sensor(ACCEL_XOUT)
#    y = read_word_sensor(ACCEL_YOUT)
#    z = read_word_sensor(ACCEL_ZOUT)
#    return [x, y, z]
# get accel data
#def get_accel_data_g():
#    x,y,z = get_accel_data_lsb()
#    x = x / 16384.0
#    y = y / 16384.0
#    z = z / 16384.0
#    return [x, y, z]

#
# Main function
#
i=0
gyro_z=[]
rotation_degree=[]
sum=0

while  i<1000:
    
    # 温度.
     #temp = get_temp()
    # 小数点以下第1位まで表示.
    #print  ('temperature[degrees C]:')
    #print ('%04.1f' % temp)
    #print ('||')
    # 角速度.
     #gyro_x,gyro_y,gyro_z = get_gyro_data_deg()

    z=get_gyro_data_deg()
    t_after = time.time()
    elapsed_time=t_after-t_before
    sum+=elapsed_time
    t_before=t_after
    gyro_z.append(z)
    
    # 小数点以下第3位まで表示.
    #print ('gyro[deg/s]')
    #print ('x: %08.3f' % gyro_x)
    #print ('y: %08.3f' % gyro_y)
    #print ('z: %08.3f' % gyro_z)
    #print ('||')
    # 加速度
    #accel_x,accel_y,accel_z = get_accel_data_g()
    # 小数点以下第3位まで表示.
    #print ('accel[g]')
    #print ('x: %06.3f' % accel_x)
    #print ('y: %06.3f' % accel_y)
    #print ('z: %06.3f' % accel_z)

    #print ('\n')      # 改行.
    #print(elapsed_time)
    #print(z)
    #rotation_degree.append(np.multiply(z, elapsed_time))
    
    rotation_degree.append(z*elapsed_time)
    
    #print('\n')
    #print('\n')
    #sum_degree+=rotation_degree
    #print('degree: %08.3f' % sum_degree)
    #print(sum_degree)
    sleep(timeval)
    i=i+1
    
file=open('test_gyro.text','w')
    
for i in range(1000):
    file.write('No. %d ' % i)
    file.write('degree: %08.3f ' % sum_degree)
    file.write('\n')
    print ('gyro[deg/s]')
    print('z: %08.3f' % gyro_z[i])
    sum_degree=sum_degree+rotation_degree[i]
    print('degree: %08.3f' % sum_degree)
    print('\n')

print(sum/1000)

file.close()