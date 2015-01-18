/*初始化canvas，标准尺寸:640*1024 = 5:8，放在屏幕中间，上下填充满*/
var SCREEN_WIDTH=document.documentElement.clientWidth;//屏幕宽度高度
var SCREEN_HEIGHT=703;//document.documentElement.clientHeight;
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

function cos_gizagiza(i)
{
	if (i%2<1)
		return 2*(i%1)-1;
	else
		return 1-2*(i%1);
}

/*全局变量*/
var THEME;								//string, 主题的文件夹名
var BACKGROUND_IMAGE = new Image();		//背景图片
var SOURCE_IMAGE = new Image();			//各个platform、妖怪等的图片
var BOTTOM_IMAGE = new Image();			//底部装饰图片
var HEAD_IMAGE = new Image();			//顶部计分图片
var BULLET_IMAGE = new Image();
var DOODLE_IMAGE = {					//doodle的图片，分为各个动作
	l: new Image(),
	ls: new Image(),
	r: new Image(),
	rs: new Image(),
	u: new Image(),
	us: new Image()
};
var DOODLE = {							//doodle的状态，包括位置、速度、加速度、面部朝向、是否隐藏
	x: WIDTH/2,
	y: HEIGHT/2-90*HEIGHT / 1024,
	vx: 0,
	vy: 0,
	ax: 0,
	ay: 0,
	status: 'r',
	hidden: false
};
var PLATFORM = [];						//当前的platform的状态数组，内含多个对象，每个platform的属性包括位置、类型、帧(用于控制动画)
var BULLET = [];						//Bullet状态数组，对象属性为子弹位置、frame、speed
var MOUSEX;								//鼠标横坐标
var MOUSEY;								//鼠标纵坐标
var PLAT;								//当前doodle会降落的plat序号
var SCORE;								//分数
var TIMER;								//定时器
var CLOCK;								//全局计数器
var DOODLE_JUMP_CLOCK;					//控制DOODLE下蹲动作的计数器
var FPS;								//帧率
var SIZE;								//缩放比例 = HEIGHT / 1024，每个绘制对象的大小都要乘上这个
var IMAGE_LOADED;
var THEMES = ['bunny','doodlestein','ghost','ice','jungle','lik','ninja','snow','soccer','space','underwater'];
										//各个主题的文件夹名
var PLATFORM_TYPE = ['std','movex','movey','burn','hide','break'];

function init(change)
{
	ctx.font = "20px sans-serif";
	ctx.fillText('loading, please wait...',100,HEIGHT/2);
	IMAGE_LOADED = 0;
	if (change) changeTheme(THEMES[ranInt(0,THEMES.length-1)]);
	FPS = 60;
	CLOCK = 0;
	SCORE = 0;
	PLAT = createPlatform(-1000,-1000,'break',0,0);
	MOUSEX = SCREEN_WIDTH/2;
	SIZE = HEIGHT / 1024;
	DOODLE_JUMP_CLOCK = 0;
	DOODLE.ay=-((HEIGHT*3/8-90*HEIGHT/1024)/((3600/46/2)*(3600/46/2)/2)),
	PLATFORM = [];
	PLATFORM.push(createPlatform(WIDTH/2,HEIGHT/8,'std',0,0));
	PLATFORM.push(createPlatform(WIDTH/2-85*HEIGHT/703,HEIGHT/8+2*HEIGHT/782,'movey',0,0));
	PLATFORM.push(createPlatform(WIDTH/2+85*HEIGHT/782,HEIGHT/8+4*HEIGHT/703,'burn',0,0));
	PLATFORM.push(createPlatform(WIDTH/2+170*HEIGHT/782,HEIGHT/8-2*HEIGHT/703,'hide',0,0));
	PLATFORM.push(createPlatform(WIDTH/2-170*HEIGHT/703,HEIGHT/8,'break',0,0));
	PLATFORM.push(createPlatform(WIDTH/2-170*HEIGHT/703,HEIGHT/8*3,'std',0,0));
	PLATFORM.push(createPlatform(WIDTH/2-170*HEIGHT/703,HEIGHT/8*5,'std',0,0));
	PLATFORM.push(createPlatform(WIDTH/2-170*HEIGHT/703,HEIGHT/8*7,'std',0,0));
}

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
		if (DOODLE_JUMP_CLOCK > 0)
		{
			if (DOODLE.status.length==1)
				DOODLE.status+='s';
		}
		else
			DOODLE.status = DOODLE.status[0];
		var offset = DOODLE.status.length==1?8*SIZE:0;
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2, HEIGHT-DOODLE.y-120*SIZE+offset, 124*SIZE, 120*SIZE);
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2+WIDTH, HEIGHT-DOODLE.y-120*SIZE+offset, 124*SIZE, 120*SIZE);
		ctx.drawImage(DOODLE_IMAGE[DOODLE.status], DOODLE.x-124*SIZE/2-WIDTH, HEIGHT-DOODLE.y-120*SIZE+offset, 124*SIZE, 120*SIZE);
	}
}

function drawOnePlatForm(p)//上中心点为基准
{
	with(p)
	{
		if (t=='movex')
			x = WIDTH/2 + 200*HEIGHT/703*cos_gizagiza(CLOCK/speed);
		if (t == 'std') 	ctx.drawImage(SOURCE_IMAGE, 1, 2, 117, 30 , x-116*SIZE/2, HEIGHT-y-2*HEIGHT/703/*平台像素的偏移*/, 116*SIZE, 30*SIZE);
		if (t == 'movex') 	ctx.drawImage(SOURCE_IMAGE, 1, 35, 117, 34 , x-116*SIZE/2, HEIGHT-y-3*HEIGHT/703/*平台像素的偏移*/, 116*SIZE, 34*SIZE);		
		if (t == 'movey') 	ctx.drawImage(SOURCE_IMAGE, 1, 71, 117, 34 , x-116*SIZE/2, HEIGHT-y-3*HEIGHT/703/*平台像素的偏移*/, 116*SIZE, 34*SIZE);
		if (t == 'hide') 	ctx.drawImage(SOURCE_IMAGE, 1, 108, 117, 34 , x-116*SIZE/2, HEIGHT-y-2*HEIGHT/782/*平台像素的偏移*/, 116*SIZE, 34*SIZE);
		if (t == 'break') 	ctx.drawImage(SOURCE_IMAGE, 1, 145, 124, 33 , x-124*SIZE/2, HEIGHT-y-3*HEIGHT/703/*平台像素的偏移*/, 124*SIZE, 33*SIZE);
		if (t == 'burn') 	ctx.drawImage(SOURCE_IMAGE, 1, 367, 117, 32 , x-116*SIZE/2, HEIGHT-y-2*HEIGHT/703/*平台像素的偏移*/, 116*SIZE, 32*SIZE);
	}
}

function drawPlatForms()//1,117,2,32
{
	for (var i in PLATFORM)
	{
		if (PLATFORM[i].y>0&&PLATFORM[i].y<HEIGHT+50)
		drawOnePlatForm(PLATFORM[i]);
	}
	for (var i = PLATFORM.length-1; i>=0; i--)
	{
		if (PLATFORM[i].y<0)
			PLATFORM.splice(i,1);
	}
}

function drawOneBullet(p)
{
	ctx.drawImage(BULLET_IMAGE,0,0,22,22,p.x,HEIGHT-p.y-130*SIZE,22*SIZE,22*SIZE);
}

function drawBullets()
{
	for (var p in BULLET)
	{
		drawOneBullet(BULLET[p]);
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

function drawScore()//     38 84
{
	var u = [640, 660, 694, 723, 749, 781, 812, 842, 872, 898, 930];
	var t = floor(SCORE) + '';
	var offset = 0;
	for (i in t)
	{
		var s = t[i]-'0';
		if (s==0) s+=10;
		ctx.drawImage(HEAD_IMAGE,u[s-1],38,u[s]-u[s-1],46,(30+offset/1.3)*SIZE,5*SIZE,(u[s]-u[s-1])/1.3*SIZE,46/1.3*SIZE);
		offset += u[s]-u[s-1];
	}
}

function drawAll()
{
	drawBackground();
	drawPlatForms();
	drawDoodle();
	drawBullets();
	drawBottom();
	drawHead();
	drawScore();
	
	//以下测试用
	
	ctx.moveTo(0,HEIGHT/2+90*HEIGHT / 1024);
	ctx.lineTo(10000,HEIGHT/2+90*HEIGHT / 1024);
	ctx.moveTo(0,HEIGHT/2);
	ctx.lineTo(10000,HEIGHT/2);
	ctx.moveTo(0,HEIGHT*7/8);
	ctx.lineTo(10000,HEIGHT*7/8);
	ctx.stroke();
	
	/*
	var yy = HEIGHT-MOUSEY;
	if (yy>HEIGHT/2-90*HEIGHT / 1024) yy = HEIGHT/8;
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2+90*HEIGHT/782,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2+180*HEIGHT/782,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2+270*HEIGHT/703,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2+360*HEIGHT/782,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2-90*HEIGHT/782,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2-180*HEIGHT/782,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2-270*HEIGHT/782,y:yy,t:'std'});
	drawOnePlatForm({x:MOUSEX-(SCREEN_WIDTH-WIDTH)/2-360*HEIGHT/703,y:yy,t:'std'});
	*/
}

/*计算位置、移动等*/
function findPlat()
{
	var x = DOODLE.x;
	var y = DOODLE.y;
	var maxy = -0;
	var maxyt = -1;
	for (var i in PLATFORM)
	{
		if (abs(x-PLATFORM[i].x)<60*HEIGHT/703&&PLATFORM[i].y<y&&PLATFORM[i].y>maxy)
		{
			maxy=PLATFORM[i].y;
			maxyt=i;
		}
	}
	PLAT.y = maxy;
}

function createPlatform(x,y,type,speed,frame)
{
	return {x:x,y:y,t:type,speed:speed,f:frame};
}

function createBullet(x,y)
{
	BULLET.push({x:x,y:y,speed:25,frame:0});
}

function changeBulletPosition()
{
	for (var p in BULLET)
	{
		BULLET[p].y += BULLET[p].speed;
		BULLET[p].frame++;
		BULLET[p].frame%=8; 
	}
}

function doodleReflect(posy)
{
	DOODLE_JUMP_CLOCK = 12;//跳的状态维持12帧
	with(DOODLE)
	{
		y=posy;
		vy = sqrt((HEIGHT*3/8-90*HEIGHT/1024)*2*(-DOODLE.ay));//*1.732;
	//	console.log(vy);
	}
}

function rollScreen(posy)
{
	var u = DOODLE.y - posy;//所有元素都向下移动u个像素
	DOODLE.y -= u;
	SCORE += u/(HEIGHT*3/8-90*HEIGHT / 1024)*180
	//if (PLATFORM.length<5)
		PLATFORM.push(createPlatform(WIDTH/2+ran(-175,175),HEIGHT,PLATFORM_TYPE[ranInt(0,5)],ran(80,260),0));
	for (var p in PLATFORM)
	{
		PLATFORM[p].y -= u;
	}
	for (var p in BULLET)
	{
		BULLET[p].y -= u;
	}
}

function changeDoodlePosition()//决定使用endless sea小鱼的运动模型...
{
	with(DOODLE)
	{
		var mx = MOUSEX - (SCREEN_WIDTH-WIDTH)/2;
		var u1=6;//u1 u2是两个阻尼值
		var u2=80;
	//	if (mx<0) mx += x;
	//	if (mx>WIDTH) mx += x - WIDTH;
		ax = mx - x - vx/u1;
		vx += ax;
		x += vx/u2;
		while (x<0) x += WIDTH;
		while (x>WIDTH) x -= WIDTH;
	
		vy += ay;
		y += vy;
		var u = PLAT.y;
		if (y<u) 
		{			
			doodleReflect(u);
		}

		var v = HEIGHT/2-90*HEIGHT/1024;
		if (y>v)
		{
			rollScreen(v);
		}

		//var t = ['l','ls','r','rs','u','us'];
		if (vx>10&&status!='u'&&status!='us') status = 'r';
		if (vx<-10&&status!='u'&&status!='us') status = 'l';
	}
}

function computeNextFrame()
{
	changeDoodlePosition();
	changeBulletPosition();
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
	BULLET_IMAGE.src = 'img/bullet.png';
	with(DOODLE_IMAGE) {
		l.src = sr + 'l.png';
		ls.src = sr + 'ls.png';
		r.src = sr + 'r.png';
		rs.src = sr + 'rs.png';
		u.src = sr + 'u.png';
		us.src = sr + 'us.png';
	}
	var count = 11;
	IMAGE_LOADED = 0;
	BACKGROUND_IMAGE.onload=SOURCE_IMAGE.onload=BOTTOM_IMAGE.onload=HEAD_IMAGE.onload=BULLET_IMAGE.onload=DOODLE_IMAGE.l.onload=DOODLE_IMAGE.ls.onload=DOODLE_IMAGE.u.onload=DOODLE_IMAGE.us.onload=DOODLE_IMAGE.r.onload=DOODLE_IMAGE.rs.onload=function(){
		IMAGE_LOADED++;
		if (IMAGE_LOADED == count)
			runNewGame();
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
		MOUSEY = e.y;
		//if (HEIGHT-e.y<HEIGHT/2-90*HEIGHT / 1024) plat = HEIGHT - e.y;
		//else plat = HEIGHT/8;
	});
	document.addEventListener('mousedown',function(e)
	{
		DOODLE.status = 'u';
		createBullet(DOODLE.x,DOODLE.y);
		//DOODLE.y = HEIGHT-e.y;
		//DOODLE.vy = 0;
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
		if (DOODLE_JUMP_CLOCK > 0) 
		{
			DOODLE_JUMP_CLOCK --;
		}
		drawAll();
		computeNextFrame();
		findPlat();

//		if (CLOCK % 60 == 0) 	PLATFORM.push({x:WIDTH/2+ran(-170,170),y:HEIGHT,t:PLATFORM_TYPE[ranInt(0,5)],frame:0});

	}, 1000/FPS);
}

/*运行游戏*/
function runNewGame()
{
	addEvent();
	addTimer();
}

init(true);