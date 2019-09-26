import cv2

img = cv2.imread("sample.jpg")

# グレースケールに変換する。
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Canny 法で2値化する。
edges = cv2.Canny(gray, 150, 300, L2gradient=True)
imshow(edges)

# ハフ変換で直線検出する。
lines = cv2.HoughLines(edges, 1, np.pi / 180, 100)
lines = lines.squeeze(axis=1)
print(lines)