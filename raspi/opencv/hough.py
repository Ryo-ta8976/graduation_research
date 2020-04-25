import cv2
import numpy as np
import math

img = cv2.imread("./linear.jpg")

# グレースケールに変換する。
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 二値化処理
ret, edges = cv2.threshold(gray, 254, 255, cv2.THRESH_BINARY)

# 変数の初期化
pi = np.pi
count = 0
sum_theta = 0

# ハフ変換で直線検出
try:
    lines = cv2.HoughLines(edges, 1, pi / 180, 280)
    for line in lines:
        for rho, theta in line:
            cos = np.cos(theta)
            sin = np.sin(theta)
            x0 = cos*rho
            y0 = sin*rho
            x1 = int(x0 + 4000*(-sin))
            y1 = int(y0 + 4000*(cos))
            x2 = int(x0 - 4000*(-sin))
            y2 = int(y0 - 4000*(cos))

            #　直線の描画
            cv2.line(img, (x1, y1), (x2, y2), (0, 0, 255), 2)

            # 直線のなす角の計算
            radian = math.atan2(y2-y1, x2-x1)
            theta = radian * 180 / pi

            count += 1
            sum_theta += theta

    # 直線のなす角の平均を計算
    ave_theta = sum_theta / count
    print(ave_theta)

except:
    print("error")

cv2.imwrite('./pictures/result_hough.png', img)
