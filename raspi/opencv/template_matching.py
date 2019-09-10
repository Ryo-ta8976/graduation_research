#!/usr/bin/env python
# -*- coding: utf-8 -*-

import cv2
import numpy as np
import random
import sys

if __name__ == '__main__':
    
    # 対象画像を指定
    base_image_path = './result.png'
    temp_image_path = './base2.png'
    
    # 画像をグレースケールで読み込み
    gray_base_src = cv2.imread(base_image_path, cv2.IMREAD_GRAYSCALE)
    gray_temp_src = cv2.imread(temp_image_path, cv2.IMREAD_GRAYSCALE)
    
    #gray_temp_src = cv2.resize(gray_temp_src, dsize=None, fx=0.3, fy=0.3)
    
    # ラベリング処理
    label = cv2.connectedComponentsWithStats(gray_base_src)
    n = label[0] - 1
    print(n)
    data = np.delete(label[2], 0, 0)
    
    # マッチング結果書き出し準備
    color_src = cv2.cvtColor(gray_base_src, cv2.COLOR_GRAY2BGR)
    height, width = gray_temp_src.shape[:2]
    

    # ラベリング情報を利用して各オブジェクトごとのマッチング結果を画面に表示
    for i in range(n-1):
 
        # 各オブジェクトの外接矩形を赤枠で表示
        x0 = data[i][0]
        y0 = data[i][1]
        x1 = data[i][0] + data[i][2]
        y1 = data[i][1] + data[i][3]
        #print(data[i][3])
        #print(data[i][2])
        cv2.rectangle(color_src, (x0, y0), (x1, y1), (0, 0, 255))

        # 各オブジェクトごとの類似度を求める
        x2 = x0 - 5
        y2 = y0 - 5
        #x3 = x0 + width + 5
        #y3 = y0 + height + 5
        x3 = x1 + 5
        y3 = y1 +5

        crop_src = gray_base_src[y2:y3, x2:x3]
        #cv2.imshow("",crop_src)
        c_height, c_width = crop_src.shape[:2]

        print(crop_src.shape,gray_temp_src.shape)
        res = cv2.matchTemplate(crop_src, gray_temp_src, cv2.TM_CCOEFF_NORMED)
        res_num = cv2.minMaxLoc(res)[1]
        cv2.putText(color_src, str(i + 1) + ") " +str(round(res_num, 3)), (x0, y1 + 15), cv2.FONT_HERSHEY_PLAIN, 1, (0, 255, 255))
        
    
    color_src = cv2.resize(color_src, dsize=None, fx=0.5, fy=0.5)
    # 結果の表示
    cv2.imshow("color_src", color_src)

    cv2.waitKey(0)
    cv2.destroyAllWindows()