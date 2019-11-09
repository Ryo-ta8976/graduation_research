import matplotlib.pyplot as plt
import numpy as np
import csv


def plot_polar(labels, values, imgname):
    angles = np.linspace(0, 2 * np.pi, len(labels) +
                         1, endpoint=True)  # 等差数列を生成
    values = np.concatenate((values, [values[0]]))  # 閉じた多角形にする
    fig = plt.figure()  # あたらしいwindowを作成
    ax = fig.add_subplot(111, polar=True)
    ax.plot(angles, values, 'o-')  # 外枠
    ax.fill(angles, values, alpha=0.25)  # 塗りつぶし
    ax.set_thetagrids(angles[:-1] * 180 / np.pi, labels)  # 軸ラベル
    ax.set_rlim(-90, -40)
    fig.savefig(imgname)
    plt.close(fig)


labels = ['0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°']
#values = [-71, -61, -78, -79, -81, -78, -77, -79]
with open('./ble_ave.csv') as f:
    reader = csv.reader(f)
    for row in reader:
        values = row
        print(values)

print(type(values))
plot_polar(labels, values, "radar.png")
