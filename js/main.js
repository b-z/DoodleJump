/*初始化canvas，标准尺寸:640*1024 = 5:8，放在屏幕中间，上下填充满*/
var SCREEN_WIDTH=document.documentElement.clientWidth;//屏幕宽度高度
var SCREEN_HEIGHT=document.documentElement.clientHeight;
var WIDTH = SCREEN_HEIGHT*5/8;
var HEIGHT = SCREEN_HEIGHT;
$('body').prepend('<canvas id="canv" tabindex="0" style="position:absolute;left:'+(SCREEN_WIDTH-WIDTH)/2+'px;top:0px;" width='+WIDTH+'px height='+HEIGHT+'px>请换个浏览器。。</canvas>');
var ctx=$('#canv')[0].getContext('2d');

/*数学计算函数*/
var cos=Math.cos, sin=Math.sin, random=Math.random, PI=Math.PI, abs=Math.abs, atan2=Math.atan2, round=Math.round, floor=Math.floor, sqrt=Math.sqrt;
	
function cube(x)//平方
{
	return x*x;
}

function rad(d)//角度-->弧度
{
	return d/180*PI;
}

function xy(u)//转极坐标为直角坐标
{
	return {x:u.r*cos(u.t), y:u.r*sin(u.t)};
}

function dis2(x1,y1,x2,y2)//距离的平方
{
	return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}

function ran(a,b)//生成[a, b)的随机实数
{
	return a+(b-a)*random();
}

function ranInt(a,b)//生成[a, b]的随机整数
{
	return floor(a+(b-a+1)*random());
}

function min(a,b)
{
	return a>b?b:a;
}

/*全局变量*/
var THEME;
var BACKGROUND_IMAGE = new Image();
var SOURCE_IMAGE = new Image();
var BOTTOM_IMAGE = new Image();
var HEAD_IMAGE = new Image();
var DOODLE_IMAGE = {
	l: new Image(),
	ls: new Image(),
	r: new Image(),
	rs: new Image(),
	u: new Image(),
	us: new Image()
};
var DOODLE = {
	x: WIDTH/2,
	y: HEIGHT/2-90*HEIGHT / 1024,
	vx: 0,
	vy: 0,
	ax: 0,
	ay: -0.29,
	status: 'l',
	hidden: false
};
var PLATFORM = [];
var MOUSEX;
var TIMER;
var CLOCK;
var FPS;
var SIZE;//缩放比例 = HEIGHT / 1024
var THEMES = ['bunny','doodlestein','ghost','ice','jungle','lik','ninja','snow','soccer','space','underwater'];

function init(change)
{
	if (change) changeTheme(THEMES[ranInt(0,THEMES.length-1)]);
	FPS = 60;
	CLOCK = 0;
	MOUSEX = SCREEN_WIDTH/2;
	SIZE = HEIGHT / 1024;
	PLATFORM = [];
	PLATFORM.push({x:WIDTH/2,y:HEIGHT/8,t:'std',frame:0});
	PLATFORM.push({x:WIDTH/2-85,y:HEIGHT/8+2,t:'movex',frame:0});
	PLATFORM.push({x:WIDTH/2+85,y:HEIGHT/8+4,t:'burn',frame:0});
	PLATFORM.push({x:WIDTH/2+170,y:HEIGHT/8-2,t:'hide',frame:0});
	PLATFORM.push({x:WIDTH/2-170,y:HEIGHT/8,t:'break',frame:0});
}
/*字符串*/

/*绘图函数*/
//图像裁剪方法:drawImage(image,sourceX,sourceY,sourceWidth,sourceHeight,destX,destY,destWidth, destHeight)
function drawBackground()
{
	ctx.drawImage(BACKGROUND_IMAGE, 0, 0, WIDTH, HEIGHT);
}

function drawDoodle()//脚下中心点为基准
{
	if (!DOODLE.hidden)
	{
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2, HEIGHT-DOODLE.y-120*SIZE, 124*SIZE, 120*SIZE);
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2+WIDTH, HEIGHT-DOODLE.y-120*SIZE, 124*SIZE, 120*SIZE);
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2-WIDTH, HEIGHT-DOODLE.y-120*SIZE, 124*SIZE, 120*SIZE);
	}
}

function drawOnePlatForm(p)//上中心点为基准
{
	with(p)
	{
		if (t == 'std') 	ctx.drawImage(SOURCE_IMAGE, 1, 2, 117, 30 , x-116*SIZE/2, HEIGHT-y-2/*平台像素的偏移*/, 116*SIZE, 30*SIZE);
		if (t == 'movex') 	ctx.drawImage(SOURCE_IMAGE, 1, 35, 117, 34 , x-116*SIZE/2, HEIGHT-y-3/*平台像素的偏移*/, 116*SIZE, 34*SIZE);		
		if (t == 'movey') 	ctx.drawImage(SOURCE_IMAGE, 1, 71, 117, 34 , x-116*SIZE/2, HEIGHT-y-3/*平台像素的偏移*/, 116*SIZE, 34*SIZE);
		if (t == 'hide') 	ctx.drawImage(SOURCE_IMAGE, 1, 108, 117, 34 , x-116*SIZE/2, HEIGHT-y-2/*平台像素的偏移*/, 116*SIZE, 34*SIZE);
		if (t == 'break') 	ctx.drawImage(SOURCE_IMAGE, 1, 145, 124, 33 , x-124*SIZE/2, HEIGHT-y-3/*平台像素的偏移*/, 124*SIZE, 33*SIZE);
		if (t == 'burn') 	ctx.drawImage(SOURCE_IMAGE, 1, 367, 117, 32 , x-116*SIZE/2, HEIGHT-y-2/*平台像素的偏移*/, 116*SIZE, 32*SIZE);
	}
}

function drawPlatForms()//1,117,2,32
{
	for (p in PLATFORM)
	{
		drawOnePlatForm(PLATFORM[p]);
	}
}

function drawBottom()
{
	ctx.drawImage(BOTTOM_IMAGE, 0, HEIGHT - SIZE*BOTTOM_IMAGE.height, SIZE*BOTTOM_IMAGE.width, SIZE*BOTTOM_IMAGE.height);
}

function drawHead()
{
	ctx.drawImage(HEAD_IMAGE, 0,0,640,128,0,-60*SIZE,640*SIZE,128*SIZE);
}

function drawAll()
{
	drawBackground();
	drawPlatForms();
	drawDoodle();
	drawBottom();
	drawHead();
}

/*计算位置、移动等*/
function changeDoodlePosition()//决定使用endless sea小鱼的运动模型...
{
	with(DOODLE)
	{
		var mx = MOUSEX - (SCREEN_WIDTH-WIDTH)/2;
		var u1=6;
		var u2=80;
		//if (mx<0) mx += x-WIDTH/2;
		//if (mx>WIDTH) mx += x+WIDTH/2;
		ax = mx - x - vx/u1;
		vx += ax;
		x += vx/u2;
		while (x<0) x += WIDTH;
		while (x>WIDTH) x -= WIDTH;
	
		vy += ay;
		y += vy;

		var u = HEIGHT/8;
		if (y<u) {
			y=2*u-y;
			vy = -vy;
		}

		//if (ran(0,1)<0.01||abs(vx)>5) ax*=-1;

		var t = ['l','ls','r','rs','u','us'];
		if (vx>0&&status!='u'&&status!='us') status = 'r';
		if (vx<0&&status!='u'&&status!='us') status = 'l';;
	}
}

function computeNextFrame()
{
	changeDoodlePosition();
}

/*主题相关*/
function changeTheme(theme)
{
	THEME = theme;
	var sr = 'img/' + THEME +'/';
	BACKGROUND_IMAGE.src = sr + 'bg.png';
	SOURCE_IMAGE.src = sr + 'src.png';
	BOTTOM_IMAGE.src = sr + 'bt.png';
	HEAD_IMAGE.src = sr + 'head.png';
	with(DOODLE_IMAGE) {
		l.src = sr + 'l.png';
		ls.src = sr + 'ls.png';
		r.src = sr + 'r.png';
		rs.src = sr + 'rs.png';
		u.src = sr + 'u.png';
		us.src = sr + 'us.png';
	}
}

/*事件*/
window.onresize = function()
{
	/*初始化canvas，标准尺寸:640*1024 = 5:8，放在屏幕中间，上下填充满*/
	SCREEN_WIDTH=document.documentElement.clientWidth;//屏幕宽度高度
	SCREEN_HEIGHT=document.documentElement.clientHeight;
	WIDTH = SCREEN_HEIGHT*5/8;
	HEIGHT = SCREEN_HEIGHT;
	$('body').html('');
	$('body').prepend('<canvas id="canv" tabindex="0" style="position:absolute;left:'+(SCREEN_WIDTH-WIDTH)/2+'px;top:0px;" width='+WIDTH+'px height='+HEIGHT+'px>请换个浏览器。。</canvas>');
	ctx=$('#canv')[0].getContext('2d');
	init(false);
}

function addEvent()
{
	document.addEventListener('mousemove',function(e)
	{
		MOUSEX = e.x;
	});
	document.addEventListener('mousedown',function(e)
	{
		DOODLE.status = 'u';
	});
	document.addEventListener('mouseup',function(e)
	{
		DOODLE.status = DOODLE.vx>0?'r':'l';
	});
}

function addTimer()
{
	TIMER = setInterval(function(){
		CLOCK ++;
		drawAll();
		if (CLOCK % 1 == 0) computeNextFrame();
	}, 1000/FPS);
}

/*运行游戏*/
function runNewGame()
{
	init(true);
	addEvent();
	addTimer();
}

runNewGame();