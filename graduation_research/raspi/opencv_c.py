from PIL import Image
import socket
import numpy as np
import cv2

udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
to_send_addr = ('192.168.50.236', 12345)

img = np.array(Image.open('sample.png'))  # テスト画像作成
with closing(udp):
    jpg_str = cv2.imencode('.jpeg', img)

    # 画像を分割する
    for i in np.array_split(jpg_str[1], 10):
        # 画像の送信
        udp.sendto(i.tostring(), to_send_addr)

    # １つのデータが終了したよを伝えるために判断できる文字列を送信する
    # -> チェックするなら送信する画像のbytes数のほうがいいと思った
    udp.sendto(b'__end__', to_send_addr)
    udp.close()
