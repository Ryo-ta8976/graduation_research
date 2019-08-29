# coding: UTF-8
import requests
import json


with open('test2.json') as file:
    data = json.load(file)
    data = json.dumps(data)  # stringに変換

url = 'http://192.168.50.226:1234/post_data'
#url = 'http://172.16.10.137:1234/post_data'
result = requests.post(url, data)
print result.text
