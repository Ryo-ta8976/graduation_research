import matplotlib.pyplot as plt
import numpy as np
import csv


# レーダーチャート作成
def plot_polar(labels, values, imgname):
    angles = np.linspace(0, 2 * np.pi, len(labels) +
                         1, endpoint=True)  # 等差数列を生成
    values = np.concatenate((values, [values[0]]))  # 閉じた多角形にする
    fig = plt.figure()  # 新しいwindowを作成
    ax = fig.add_subplot(111, polar=True)
    ax.plot(angles, values, 'o-')  # 外枠
    ax.fill(angles, values, alpha=0.25)  # 塗りつぶし
    ax.set_thetagrids(angles[:-1] * 180 / np.pi, labels)  # 軸ラベル
    ax.set_rlim(-90, -40)
    fig.savefig(imgname)
    plt.close(fig)


# ラベル付け
labels = ['0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°']


with open('./ble_ave_mean_20.csv') as f:
    reader = np.loadtxt(f, delimiter=',', dtype='float')
    values = []
    for row in reader:
        values.append(row)


plot_polar(labels, values, "radar.png")
