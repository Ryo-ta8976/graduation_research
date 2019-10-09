import serial
import time

ser = serial.Serial('/dev/ttyUSB0', 115200)

startmsg = bytearray(b'\x0a\x24\x00\x00\x00\x00\x00\x00\x0f\x72')
stopmsg = bytearray(b'\x0a\x30\x01\x00\x00\x00\x00\x00\xbc\x6f')

#t1=time.time()

ser.write(startmsg)

for i in range(1000):
    ret0 = ser.read(15)
    dist = (ret0[5]*256 + ret0[6])/10.0
    prec = (ret0[11]*256 + ret0[12])

    print("times : " + str(i))
    print("raw data : " + ret0.hex())
    print("distance : " + str(dist))

 #t2=time.time()
#a=t2-t1
#print(a)

ser.write(stopmsg)
ser.close()
