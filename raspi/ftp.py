# -*- coding: utf-8 -*-
import ftplib

def ftp_upload(hostname, username, password, upload_src_path, upload_dst_path):
    # FTP接続・アップロード
    print("a")
    ftp = ftplib.FTP(hostname)
    print("b")
    ftp.set_pasv("true")
    print("c")
    ftp.login(username, password)
    print("d")
    fp = open(upload_src_path, 'rb')
    print("e")
    ftp.storbinary(upload_dst_path ,fp)

    # 終了処理
    ftp.close()
    fp.close()


hostname = " akiyamaryoutanoMac-mini.local" # 接続先サーバーのホスト名
upload_src_path = "test.csv" # アップロードするファイルパス
upload_dst_path = "STOR /Users/akiyamaryoufutoshi/Desktop/ゼミ/test.csv" # アップロード先のファイルパス
username = "秋山諒太" # サーバーのユーザー名
password = "2023" # サーバーのログインパスワード

ftp_upload(hostname, username, password, upload_src_path, upload_dst_path)
