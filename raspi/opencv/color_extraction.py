#!/usr/bin/python
import numpy as np
import cv2

# image info
image_file = 'led.png'
img = cv2.imread(image_file)

# detect pink 
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
lower = np.array([250, 250, 250])    # 紫に近いピンク
upper = np.array([255, 255, 255]) # 赤に近いピンク
img_mask = cv2.inRange(hsv, lower, upper)
img_color = cv2.bitwise_and(img, img, mask=img_mask)

# debug
cv2.imwrite("led_hsv.png", img_color)