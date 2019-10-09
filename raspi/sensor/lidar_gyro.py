import serial
import smbus            # use I2C
import math             # mathmatics
import  time
from time import sleep  # time module
import numpy as np


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
i=0
gyro_z=[]
rotation_degree=[]
dist=[]

bus = smbus.SMBus(1)
bus.write_byte_data(DEV_ADDR, PWR_MGMT_1, 0)



ser = serial.Serial('/dev/ttyUSB0', 115200)

startmsg = bytearray(b'\x0a\x24\x00\x00\x00\x00\x00\x00\x0f\x72')
stopmsg = bytearray(b'\x0a\x30\x01\x00\x00\x00\x00\x00\xbc\x6f')

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
    z=get_gyro_data_lsb()
    z = z / 131.0
    return z


ser.write(startmsg)

for i in range(1000):

    ret0 = ser.read(15)

    z=get_gyro_data_deg()
    t_after = time.time()
    elapsed_time=t_after-t_before
    t_before=t_after
    gyro_z.append(z)
   
    dist.append((ret0[5]*256 + ret0[6])/10.0)
    rotation_degree.append(z*elapsed_time)
    
    sleep(timeval)
    

file=open('test.csv','w')

for i in range(1000):
    sum_degree=sum_degree+rotation_degree[i]
    file.write("%f,%08.3f\n" % (dist[i],sum_degree) )
    print('No. %d' % i)
    print("distance : %f" % dist[i] )
    print('degree: %08.3f' % sum_degree)
    print('\n')


file.close()
ser.write(stopmsg)
ser.close()



