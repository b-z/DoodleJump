# DoodleJump
https://b-z.github.io/DoodleJump

#####正在施工。。不过估计也不会有人看。。

## TODOs:

* [x] onresize事件
* [x] 按r重开
* [x] 鼠标交互修改
* [x] 自动生成平台
* [ ] ~~平台改用字典存储?~~
* [x] 加入键盘操作
* [ ] 鼠标指针换一下
* [x] 自动生成多样式的平台
* [ ] 可以把instruction和纪录都放到游戏区域里绘制
* [x] 平台之间距离的随机性不够
* [ ] 游戏结束功能
* [ ] 缩小资源文件尺寸
* [ ] 弹簧
* [x] 暂停

# 开发记录

## 2018/02/11

* 调整生成平台种类的频率
* 解决与break平台相关的若干bug
* 可以暂停
* 可以键盘操作

## 2018/02/10

* 按r可以重开
* 调整鼠标交互: 
  * 鼠标移出游戏区域后的处理方式改为对游戏区域宽度求模
  * 限制最高移动速度
  * 目前仍然不够理想，当鼠标从屏幕外移动进来的时候不够智能
* 可以自动生成平台: 之前弃坑就是因为感觉这个不好写。。这次的写法是维护一个NEXT_DISTANCE变量，变量表示生成的平台高出当前最上面的平台的距离，它随分数增加而增加。对每一帧，判断当前最高的平台高度，如果高度小于2×屏幕高度，那就while循环不断生成平台。这样做也方便以后扩展(可以生成固定的模式: 固定几个平台位置，直接push上去就行)
* 心得: 交互不舒服的时候，想一下理想的交互应该是怎么样的，再考虑如何实现

## 2015/01/19

开发时间: 2h

* 增加title图片
* 垂直运动的平台

## 2015/01/18

开发时间: 6h。。。

* 发现bug: doodle在屏幕边缘时踩踏判定范围有问题
* 终于知道是哪里卡了: 为了测试画的几条水平线。但不知道为什么卡。测试方法: 使用Chrome的Timeline，分别关掉几个函数，发现卡在drawAll里，然后再去掉几行，发现居然是水平线卡住了。。去掉之后非常流畅。。
* 图片加载问题解决: 设置计数器，目前每个主题有11张图片，每加载一张，计数器加一，加到11的时候运行游戏。
* 尝试改变了运动模型。
* 垂直加速度变成自动计算，原版游戏每分钟跳46下，即每下落一次的时间是60*60/46/2帧。ay=h/(0.5 *t *t)

## 2015/01/17

工作时间: 4小时

* 补充了注释，(略微)优化代码结构。
* 画面可以卷动了: 当doodle高度超过屏幕一半的时候，把屏幕上所有的游戏元素都往下移动超出的距离。
* 计分功能: 参考原版游戏的分数设定(目测法。。): 跳跃一次的高度: 180分，弹簧: 360分，蹦床: 600分，竹蜻蜓: 1500分，火箭:3500分。
* 砖块判定: 把它看成一个线段。每一帧查找doodle身下最高的一个，如果不存在，就设置高度为-1000。
* 昨天的弹跳有问题: doodle每次弹跳的初速度应该是一样的，而不是完全弹性碰撞。
* 速度变成自动算了。。v ^ 2 = 2 * g * h
* 分数的字体换成原版~
* 现在platform会动!
* 遗留问题: 图片加载。还有游戏时间长了会非常卡。。bullet没有删



##2015/01/16

工作时间: 6小时

* 素材的提取: 解压Doodle Jump的apk包，图片素材位于assets文件夹，各个主题的素材被分在不同子文件夹下，以后的开发过程中直接以这些文件夹名为主题命名。为了管理方便，我对每个文件夹里的资源图片都进行了重命名。

* 资源图片裁剪: 有的图片，例如src.png，是若干个小图片放在一起显示的，最后只需要显示它的一部分。我采用的方法是在用canvas的drawImage时进行截取处理。

* 确定程序结构: 使用定时器控制帧率为60fps。在程序的开始处，会获取窗口的宽高，以摆放canvas。在窗口大小发生改变时将触发canvas大小的改变。此外，还需要使用init、addEvent、addTimer三个函数开始运行游戏。其中，init函数接受一个bool参数，表示是否切换主题，在init函数中还将完成对各个全局变量赋初始值的工作; addEvent将为游戏添加各种事件，今天完成了mousemove、mousedown、mouseup三个事件的添加; addTimer为游戏添加定时器，定时器触发时，会增加全局计数器CLOCK、绘制当前帧、计算下一帧。

* 窗口resize的处理: 1.重新计算窗口大小 2.清空body标签 3.重新添加canvas 4.重新绑定ctx 5.执行init函数，这次执行不切换主题。

* 画图: 分元素画图。目前，游戏中的元素有doodle、platform、head(上方积分条)、bottom(场景下面的装饰)、background。使用drawAll函数按一定顺序绘制以上元素。

* 切换主题操作: 需要对游戏中涉及的所有图片进行替换。图片是全局变量，直接换。

* Doodle的运动模型: 我测量了原游戏中的相关参数，发现当doodle稳定跳跃时，platform位于据底边1/8高度处，跳跃最高点不超过屏幕1/2高度。游戏每刷新一帧时都将做一次运算。将Doodle的运动分解为水平运动和垂直运动，二者之间不相互关联。在垂直方向的运动采用重力加速度的设定，使用和原游戏相同的跳跃频率; 当doodle高度低于平台时(由于计算并不是实时的，很可能会低于平台一个微小距离)，判断发生了碰撞，doodle的垂直高度关于平台表面做对称(注意垂直高度并不等于平台高度，如果不改变这个高度，它将永远低于平台)，垂直速度反向，这样就模拟了真实世界的碰撞。水平方向的运动沿用了EndlessSea游戏中的物理模型，即弹簧+阻尼的模型; 该模型中，物体加速度与它到鼠标的距离正相关，与当前速度负相关。

* 超出边界的处理: 在跨越边界时，两侧都将绘制doodle，处理方法是同时绘制三个doodle。跨越边界后将它的位置进行调整。

* 遗留问题: 现在还不能跳平台，屏幕不能卷上去。。水平方向运动，在鼠标超出边界时还比较不爽。在图片加载完成前会有问题。


