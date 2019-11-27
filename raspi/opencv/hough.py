import cv2
import numpy as np
import math

img = cv2.imread("./linear.jpg")

# グレースケールに変換する。
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Canny 法で2値化する。
#edges = cv2.Canny(gray, 10, , L2gradient=True)
#cv2.imshow('result_hough.png',edges)
ret, edges = cv2.threshold(gray, 254, 255, cv2.THRESH_BINARY)



pi = np.pi

# ハフ変換で直線検出する。
lines = cv2.HoughLines(edges, 1, pi / 180, 550)
for line in lines:
    for rho, theta in line:
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a*rho
        y0 = b*rho
        x1 = int(x0 + 3000*(-b))
        y1 = int(y0 + 3000*(a))
        x2 = int(x0 - 3000*(-b))
        y2 = int(y0 - 3000*(a))
        
        
        cv2.line(img,(x1,y1),(x2,y2),(0,0,255),2)
        radian = math.atan2(y2-y1, x2-x1)
        theta = radian*180/pi
        print(theta)
        if(radian!=0):
            radian = math.degrees(pi/radian)
            #print("radian:"+ str(radian))
        else:
            radian=0

cv2.imwrite('./pictures/result_hough.png', img)