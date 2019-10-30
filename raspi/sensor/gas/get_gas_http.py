import serial
import time


def main():
    ser = serial.Serial('/dev/ttyUSB0', 9600)
    time.sleep(2)
    t0 = time.time()

    while True:
        # ser.write("114514")
        str = ser.readline()
        val = (str.decode())
        print(val)


if __name__ == '__main__':
    main()
