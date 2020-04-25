import cv2


# 画像の読み込み
img = cv2.imread("./image_1.jpg")

# 閾値の設定
threshold = 40

# 二値化(閾値10を超えた画素を0にする。)
ret, img_thresh = cv2.threshold(img, threshold, 255, cv2.THRESH_BINARY_INV)

# 二値化画像の表示
height = img_thresh.shape[0]
width = img_thresh.shape[1]
img_thresh = cv2.resize(img_thresh, (int(width*0.3), int(height*0.3)))
cv2.imshow("img_th", img_thresh)
cv2.waitKey()
cv2.destroyAllWindows()
