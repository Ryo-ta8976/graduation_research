import cv2
import numpy as np


if __name__ == '__main__':
    
    temp_image_path = './image_2.jpg'
    gray_temp_src = cv2.imread(temp_image_path, cv2.IMREAD_GRAYSCALE)
    ret,img_thresh = cv2.threshold(gray_temp_src, 40, 255, cv2.THRESH_BINARY_INV)
    height,width = img_thresh.shape[:2]
    #img_thresh = cv2.resize(img_thresh, dsize=None, fx=0.8, fy=0.8)
    #cv2.imshow("img_thresh", img_thresh)
    cv2.imwrite("result.png", img_thresh)
    #cv2.waitKey()
    #cv2.destroyAllWindows()
    
    
