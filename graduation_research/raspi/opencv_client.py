import socket
import numpy as np
import cv2
import time


s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)#ソケットオブジェクト作成

s.bind(("192.168.100.71", 1234) )   # サーバー側PCのipと使用するポート

print("接続待機中")

s.listen(1)                     # 接続要求を待機

soc, addr = s.accept()          # 要求が来るまでブロック

print(str(addr)+"と接続完了")

cam = cv2.VideoCapture(0)#カメラオブジェクト作成

count=0

while (True):

    flag,img = cam.read()       #カメラから画像データを受け取る

    img = img.tostring()#numpy行列からバイトデータに変換
    print(img)
    break
    soc.send(img)# ソケットにデータを送信

    counbt=count+1
    print(count)
    #time.sleep(0.5)            #フリーズするなら#を外す。

    k = cv2.waitKey(1)         #↖
    if k== 13 :                #←　ENTERキーで終了
        break                  #↙

cam.releace()                  #カメラオブジェクト破棄
