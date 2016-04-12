/*  MondriPong
    Version 1.6
    Copyright 2016 K.M. Hansen
    http://www.kmhcreative.com
    
    GitHub Contributors:
    @kmhcreative
    @salty-horse
    @gvorob
    
    Based on "Pong" Tutorial by Mailson
    http://blog.mailson.org/2013/02/simple-pong-game-using-html5-and-canvas/
    
    Scroll down to Main Game Variables to update the version number and/or
    contributor list on the game front-end.
*/


function Game() {
    var canvas = document.getElementById('game');
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.top = 0;     // top wall in relation to game border
    this.bottom = 0;  // bottom wall in relation to game border
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "white";
    this.keys = new KeyListener();
    this.context.scale(1,1);
    this.back = ["none"];	// game element background image
    
    this.p1 = new Paddle(20, 0, "red");
    this.p1.y = this.height/2 - this.p1.height/2;
 	this.display1 = new Display(this.width/4, 25,"red");
    this.p2 = new Paddle(this.width - 74 - 2, 0, "blue");
    this.p2.y = this.height/2 - this.p2.height/2;
    this.display2 = new Display(this.width*3/4, 25,"blue");
    this.stuck = 0;
    
    this.ball = new Ball(0, 0, "yellow");
    this.ball.x = this.width/2;
    this.ball.y = this.height/2;
    this.ball.vy = Math.floor(Math.random()*12 - 6);
    this.ball.vx = 7 - Math.abs(this.ball.vy);    
}

Game.prototype.draw = function()
{
	this.context.clearRect(0, 0, this.width, this.height);

	this.ball.draw(this.context);

	this.p1.draw(this.context);
	this.p2.draw(this.context);

	this.display1.draw(this.context);
	this.display2.draw(this.context);
	
//	console.log(this.p2.voffSet);
};
 
Game.prototype.update = function() 
{
    if (this.paused)
        return;
    
    // if the ESCAPE key is pressed exit game
    if (this.keys.isPressed(27)) {
    	this.paused = true;
    	toggleScreen('splash');
    }
    
	// Ball "Spin" Range (reduces ball exactly returninging along same angle)		
    var minimum = -2;
    var maximum = 2;
    var spin = (Math.floor(Math.random() * (maximum - minimum + 1)) + minimum);
    // Shake stuck ball loose
    if (this.stuck > 6) {
    	this.stuck = 0;		// reset stuck counter
    	this.ball.vx+=spin;	// SLAM!
    	this.ball.vy+=spin;
    };
    
    this.ball.update();
    this.display1.value = this.p1.score;
    this.display2.value = this.p2.score;
     
    // To which Y direction the paddle is moving
    if (this.keys.isPressed(90) || ui.p1dn.clicked ) { // DOWN
        this.p1.y = Math.min( (this.height-this.bottom) - this.p1.height, this.p1.y + 4);
    } else if (this.keys.isPressed(65) || ui.p1up.clicked ) { // UP
        this.p1.y = Math.max(this.top, this.p1.y - 4);
    }
    // Only let keyboard move Paddle 2 if there is a human player
	if (players == 2) {
		if (this.keys.isPressed(40) || ui.p2dn.clicked ) { // DOWN
			this.p2.y = Math.min( (this.height-this.bottom) - this.p2.height, this.p2.y + 4);
		} else if (this.keys.isPressed(38) || ui.p2up.clicked ) { // UP
			this.p2.y = Math.max(this.top, this.p2.y - 4);
		}
    }
    
    // If this is a 1 player game, get computer paddle movements
    if (players==1) {
    	this.computer();
    }

    if (this.ball.vx > 0) {
		//If I overshot
        if (this.p2.x <= this.ball.x + this.ball.width &&
				//And had not overshot last frame (i.e. only test once)
                this.p2.x > this.ball.x - this.ball.vx + this.ball.width) {

			//X-distance by which I overshot
            var collisionDiff = this.ball.x + this.ball.width - this.p2.x;

			//Percentage of timestep by which I overshot
            var k = collisionDiff/this.ball.vx;

			var inv_k = 1 - k; //percentage of timestep I should have travelled

			//y-distance by which I overshot 
			var last_frame_y = this.ball.y - this.ball.vy

			//y when I collided
			//start of last frame + distance I should have travelled
            var collide_y = last_frame_y  + (this.ball.vy * inv_k);

			var collided = collide_y + this.ball.height >= this.p2.y &&  //below top of paddle
			               collide_y  <= this.p2.y + this.p2.height;     //above bottom of paddle

            if (collided) {
                // collides with right paddle
                this.ball.x = this.p2.x - this.ball.width+spin;
                this.ball.y = Math.floor(collide_y)-spin;
                this.ball.vx = -this.ball.vx;
				sfx('bounce2');
				this.stuck++;
            }
        }
    } else {
		//If I overshot
        if (this.p1.x + this.p1.width >= this.ball.x &&
				//And had not overshot last frame (i.e. only test once)
                this.p1.x + this.p1.width < this.ball.x - this.ball.vx) {

			//X-distance by which I overshot
            var collisionDiff = (this.p1.x + this.p1.width) - this.ball.x;

			//Percentage of timestep by which I overshot
            var k = collisionDiff/this.ball.vx;

			var inv_k = 1 - k; //percentage of timestep I should have travelled

			//y-distance by which I overshot 
			var last_frame_y = this.ball.y - this.ball.vy

			//y when I collided
			//start of last frame + distance I should have travelled
            var collide_y = last_frame_y  + (this.ball.vy * inv_k);

			var collided = collide_y + this.ball.height >= this.p1.y &&  //below top of paddle
			               collide_y  <= this.p1.y + this.p1.height;     //above bottom of paddle

            if (collided) {
                // collides with right paddle
                this.ball.x = this.p1.x + this.p1.width-spin;
                this.ball.y = Math.floor(collide_y)+spin;
                this.ball.vx = -this.ball.vx;
				sfx('bounce1');
				this.stuck++;
            }
        }
    }
 
    // Top and bottom collision
    if ((this.ball.vy < this.top && this.ball.y < this.top) ||
        (this.ball.vy > 0 && (this.ball.y + this.ball.height) > (this.height-this.bottom) )) {
        this.ball.vy = -this.ball.vy;
		sfx('wallbounce');
		this.stuck = 0;
    }
    
    if (this.ball.x >= this.width) {
		sfx('overshot');
        this.score(this.p1);
        this.stuck = 0;
    } else if (this.ball.x + this.ball.width <= 0) {
        sfx('overshot');
        this.score(this.p2);
        this.stuck = 0;
    }
	
	// End Game when one side gets 11 points
	if (this.p1.score == 11 || this.p2.score == 11) {
		if (this.p1.c.match('#') || this.p1.c.match('rgb')) {
			var player1 = "Left Player";
		} else {
			var player1 = this.p1.c.toUpperCase();
		}
		if (this.p2.c.match('#') || this.p2.c.match('rgb')) {
			var player2 = "Right Player";
		} else {
			var player2 = this.p2.c.toUpperCase();
		}	
		if (numgames == 1) {
			ui.notice.innerHTML = "Game Over!";
			clearTimeout(loop);loop=null;
			this.paused = true;
			if ( this.p1.score > this.p2.score) {
				ui.winbox.className = "player1color";
				ui.winbox.innerHTML = player1+" WINS!!";
			} else if ( this.p2.score > this.p1.score) {
				ui.winbox.className = "player2color";
				ui.winbox.innerHTML = player2+" WINS!!";
			}
			sfx('gamestart');
			ui.gameover.style.display = "block";
		} else {
			rounds++;
			this.paused = true;
			ai = (ai < 9) ? ai++ : 8;	// improve AI player each round, up to speed 8
			if ( this.p1.score > this.p2.score ) {
				ui.winbox.className = "player1color";
				ui.winbox.innerHTML = player1+" WINS ROUND "+rounds;
				tournament.p1.push(this.p1.score-1);
			} else {
				ui.winbox.className = "player2color";
				ui.winbox.innerHTML = player2+" WINS ROUND "+rounds;
				tournament.p2.push(this.p2.score-1);
			}
			if (rounds == numgames) {
				rounds = 0;
				ui.notice.innerHTML = "Game Over!";
				if (tournament.p1.length > tournament.p2.length) {
					ui.winbox.className = "player1color";
					ui.winbox.innerHTML = player1+" WINS!!";
				} else {
					ui.winbox.className = "player2color";
					ui.winbox.innerHTML = player2+" WINS!!";
				}
				ui.continuegame.style.display = "none";
				ui.playagain.style.display = "block";
			} else {
				ui.notice.innerHTML = "Tournament";
				this.p1.score = 0;
				this.p2.score = 0;
				tournament.p1.length = 0;
				tournament.p1.length = 0;
			}
			sfx('gamestart');
			ui.gameover.style.display = "block";
		}
	}

};

Game.prototype.score = function(p)
{
    // player scores
    p.score++;
    var player = p == this.p1 ? 0 : 1;
 
    // set ball position
    this.ball.x = this.width/2;
    this.ball.y = p.y + p.height/2;
 
    // set ball velocity
    this.ball.vy = Math.floor(Math.random()*12 - 6);
    this.ball.vx = 7 - Math.abs(this.ball.vy);
    if (player == 1)
        this.ball.vx *= -1;
};

var ai = 4;			  // AI start speed (4 = same as human player)
var prev;			  // variable to hold previous ball.y coordinate
Game.prototype.computer = function() {
	/* AI "Intelligence" is based on how far across the field it is "looking"
	   before it starts to react to the ball's position, it starts looking when
	   the ball crosses the centerline; it re-evaluates its choice ~3/4 across
       (from the left); and again when the ball is even closer to the paddle.
       However, it can't move it's paddle any faster than the human player,
       it doesn't actually know which direction the ball is headed, but does
       compare the last Y position of the ball to the current position and in
       tournaments it increases responsiveness (paddle speed) each round for up
       to four rounds.
       
       So, yeah, it's pretty dumb.  If someone knows how to make this smarter
       please DO!  Just don't make it so smart it kills us all, okay?
	*/
  if (!prev) { prev = this.ball.y;}
  if ( (this.ball.x > this.width/2   && this.ball.x < this.width/1.5)  || 
       (this.ball.x > this.width/1.5 && this.ball.x < this.width/1.75) || 
        this.ball.x > this.width/1.75) {
	  if(this.ball.y > this.height/2 && this.ball.y > prev) {
		this.p2.y = Math.min( (this.height-this.bottom) - this.p2.height, this.p2.y + ai);
	  } else if (this.ball.y < this.height/2 && this.ball.y < prev) {
		this.p2.y = Math.max(this.top, this.p2.y - ai);
	  } else {};
  };
  prev = this.ball.y;
};

function Rect(x, y, c, lineWidth, vlineWidth, hlineWidth, linecolor) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.lineWidth = lineWidth;
    this.vlineWidth = vlineWidth;
    this.hlineWidth = hlineWidth;
    this.linecolor = linecolor;
}

Rect.prototype.draw = function(p)
{
    p.fillStyle = this.c;
	p.beginPath();
	p.rect(this.x, this.y, this.width, this.height);
	p.fill();
	p.lineWidth = this.lineWidth;
	p.strokeStyle = this.linecolor;
	p.stroke();
	p.hlineWidth = this.hlineWidth;
	p.fillStyle = this.linecolor;
    if (this.hlineWidth >= this.lineWidth) {
    	this.hoffSet = parseInt( (this.hlineWidth - this.lineWidth) + this.hlineWidth/2 );
    } else {
    	this.hoffSet = parseInt(this.lineWidth - this.hlineWidth);
    }
	p.fillRect(0, this.y-this.hoffSet, p.canvas.width, this.hlineWidth);
    p.fillRect(0, this.y+(this.height-this.hoffSet), p.canvas.width, this.hlineWidth);
    p.vlineWidth = this.vlineWidth;
    if (this.vlineWidth >= this.lineWidth) {
    	this.voffSet = parseInt( (this.vlineWidth - this.lineWidth) + this.vlineWidth/2 );
    } else {
    	this.voffSet = parseInt(this.lineWidth - this.vlineWidth);
    }
    p.fillRect(this.x-this.voffSet, 0, this.vlineWidth, p.canvas.height);
    p.fillRect(this.x+(this.width-this.voffSet), 0, this.vlineWidth, p.canvas.height);
};

// PADDLE
function Paddle(x,y,c,lw,vl,hl,lc) {
    Rect.call(this, x, y, c, lw, vl, hl, lc);
    this.width = 54;
    this.height = 160;
    this.score = 0;
    this.lineWidth =  lw || 1;
    this.vlineWidth = vl || 3;
    this.hlineWidth = hl || 3;
    this.linecolor = lc || "black";
}

Paddle.prototype = Object.create(Rect.prototype);

// BALL
function Ball(x,y,c,lw,vl,hl, lc) {
    Rect.call(this, x, y, c, lw, vl, hl, lc);
    this.vx = 0;
    this.vy = 0;
    this.width = 58;
    this.height = 44;
    this.lineWidth  = lw || 1;
    this.vlineWidth = vl || 3;
    this.hlineWidth = hl || 3;
    this.linecolor = lc || "black";
}

Ball.prototype = Object.create(Rect.prototype);
 
Ball.prototype.update = function()
{
    this.x += this.vx;
    this.y += this.vy;
};

// NON-COLLIDING OBJECTS
function Square(x,y,c,lw,vl,hl,lc) {
	Rect.call(this, x, y, c, lw, vl, hl, lc);
	this.width = 0;
	this.height = 0;
	this.c = c || "transparent";
	this.lineWidth  = lw || 0;
	this.vlineWidth = vl || 0;
	this.hlineWidth = hl || 0;
	this.linecolor  = lc || "transparent";
}

Square.prototype = Object.create(Rect.prototype);	


//DISPLAY
function Display(x, y, c) {
    this.x = x;
    this.y = y;
    this.value = 0;
    this.c = c;
}
 
Display.prototype.draw = function(d)
{
    d.fillStyle = this.c;
    d.fillText(this.value, this.x, this.y);
    d.font = "1em Impact";
};


// KEY LISTENER
function KeyListener() {
    this.pressedKeys = [];
 
    this.keydown = function(e) {
        this.pressedKeys[e.keyCode] = true;
    };
 
    this.keyup = function(e) {
        this.pressedKeys[e.keyCode] = false;
    };
 
    document.addEventListener("keydown", this.keydown.bind(this));
    document.addEventListener("keyup", this.keyup.bind(this));
}
 
KeyListener.prototype.isPressed = function(key)
{
    return this.pressedKeys[key] ? true : false;
};
 
KeyListener.prototype.addKeyPressListener = function(keyCode, callback)
{
    document.addEventListener("keypress", function(e) {
        if (e.keyCode == keyCode)
            callback(e);
    });
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/* =========================================
	       MAIN GAME VARIABLES
   ========================================= 
*/
var v = "1.6"		  // Version Number
/* if you contributed code that got merged on
   GitHub feel free to add your handle to the
   list below and it will appear on the "About"
   screen within the game.
*/
var contributors = [
    "@kmhcreative",
    "@salty-horse",
    "@gvorob"	
];					  

var game = new Game();// Initialize our game instance
game.paused = true;	  // start paused
var mode = {};		  // Game Modes Object
var speed  = 30; 	  // 30fps
var xspeed = 0;   	  // increase increment
var loop = null;	  // loop handle
var players = 2;	  // number of players
var rounds = 0;		  // round tracker
var numgames = 5;	  // number of games
var tournament = {};  // tournament wins
	tournament.p1 = [];
	tournament.p2 = [];
var mobile = false;	  // assume desktop
var mute   = false;	  // assume sound is on
/* Get DOM UI elements
   (this isn't really necessary, it just give a nice
   shorthand way of targeting UI elements by id.  Use
   ui.idname or ui['idname'])
*/
var ui = {};
var ids = function() {
	var el = document.querySelectorAll('[id]');
	for (var x=0; x < el.length; x++) {
		var id = el[x].id;
		ui[''+id+''] = el[x];
	}
}();
ui.version.innerHTML = v;
var clist = "";
for (var c=0; c < contributors.length; c++) {
	clist += '<p>'+contributors[c]+'</p>';
}
ui.team.innerHTML = clist;
// set CSS3 FX Support  - Usage xxample: element.style[cssTransform] = "rotate(90deg)";
function getsupportedprop(proparray){
    var root=document.documentElement //reference root element of document
    for (var i=0; i<proparray.length; i++){ //loop through possible properties
        if (typeof root.style[proparray[i]]=="string"){ //if the property value is a string (versus undefined)
            return proparray[i]; //return that string
        }
    }
}
var cssTransform=getsupportedprop(['transform', 'MozTransform', 'WebkitTransform', 'msTransform', 'OTransform']);
var cssTransitionDelay=getsupportedprop(['transitionDelay', 'MozTransitionDelay', 'WebkitTransitionDelay', 
'msTransitionDelay','OTransitionDelay']);
var cssTransformOrigin=getsupportedprop(['transform-orign','MozTransformOrigin','msTransformOrigin','WebkitTransformOrigin']);
var cssTransitionProperty=getsupportedprop(['transition-property','MozTransitionProperty','msTransitionProperty','WebkitTransitionProperty']);
var cssTransitionDuration=getsupportedprop(['transitionDuration','MozTransitionDuration','WebkitTransitionDuration','msTransitionDuration','OTransitionDuration']);
var cssBorderRadius=getsupportedprop(['borderRadius','MozBorderRadius','WebkitBorderRadius']);
var cssPerspective = getsupportedprop(['perspective','MozPerspective','WebkitPerspective','msPerspective','OPerspective']);
var cssOverflowScrolling = getsupportedprop(['overflowScrolling','WebkitOverflowScrolling']);
var cssBackgroundSize = getsupportedprop(['backgroundSize','WebkitBackgroundSize','MozBackgroundSize','msBackgroundSize','OBackgroundSize']);	

// set for mouse or touch
if ('ontouchstart' in document.documentElement) {
	var iClick = "touchstart";
	var iDown = "touchstart";
	var iUp = "touchend";
	var iMove = "touchmove";
	var iOver = "touchstart";
	var iOut = "touchend";
} else {
	var iClick = "click";
	var iDown = "mousedown";
	var iUp = "mouseup";
	var iMove = "mousemove";
	var iOver = "mouseover";
	var iOut = "mouseout";
}
// simple screen toggler
function toggleScreen(screen) {
	var screens = ['splash','options','about','gameover','ready'];
	for (var s=0; s < screens.length; s++) {
		if (screens[s] == screen) {
			ui[''+screens[s]+''].style.display = "block";
		} else {
			ui[''+screens[s]+''].style.display = "none";
		}
	}
}
// Splash Screen
ui.playnow.addEventListener(iClick,function(){play();},true);
ui.opt_screen.addEventListener(iClick,function(){toggleScreen('options');},true);
ui.about_screen.addEventListener(iClick,function(){toggleScreen('about');},true);
// Back Buttons
var backbuttons = document.querySelectorAll('button.back');
	backbuttons[0].addEventListener(iClick,function(){toggleScreen('splash');},true);
	backbuttons[1].addEventListener(iClick,function(){toggleScreen('splash');},true);
// Options Screen
ui.views.addEventListener('change',function(){setTimeout(scaleGame,500);},true);
ui.bezel.addEventListener('change',function(){ui.bezelmask.style.opacity=ui.bezel.value;},true);
// On-screen buttons each need two handlers for up/down = false/true
// Player 1 controls
ui.p1up.addEventListener(iDown,function(){ui.p1up.clicked=true;},true);
ui.p1up.addEventListener(iUp,function(){ui.p1up.clicked=false;} ,true);
ui.p1dn.addEventListener(iDown,function(){ui.p1dn.clicked=true;},true);
ui.p1dn.addEventListener(iUp,function(){ui.p1dn.clicked=false;} ,true);
// Player 2 controls
ui.p2up.addEventListener(iDown,function(){ui.p2up.clicked=true;},true);
ui.p2up.addEventListener(iUp,function(){ui.p2up.clicked=false;} ,true);
ui.p2dn.addEventListener(iDown,function(){ui.p2dn.clicked=true;},true);
ui.p2dn.addEventListener(iUp,function(){ui.p2dn.clicked=false;} ,true);
// Game Over UI Buttons
ui.continuegame.getElementsByTagName('button')[0].addEventListener(iClick,function(){readySetGo();},true);
ui.playagain.getElementsByTagName('button')[0].addEventListener(iClick,function(){ui.gameover.style.display='none';play();},true);
ui.quitgame.getElementsByTagName('button')[0].addEventListener(iClick,function(){rounds=0;ui.gameover.style.display='none';ui.splash.style.display='block';},true);

/* MAIN LOOP uses combo of setTimeout and requestAnimationFrame */
function MainLoop() {
	speed = speed+xspeed;
	clearTimeout(loop);loop=null;
    loop = setTimeout(function() {
        game.update();
        game.draw();
		MainLoop();
    }, 1000/speed);
}

// Ready Set Go! Delay so players can get ready (yes, this is a crazy nested setTimeout)
function readySetGo() {
//	game.soundfx.src = game.gamestart;
	ui.gameover.style.display = "none";
	ui.ready.style.display = "block";
	setTimeout(function(){
		ui.ready.innerHTML = "Ready..."
		sfx('gamestart');
		setTimeout(function() {
			ui.ready.innerHTML = "Set...";
			setTimeout(function(){
				ui.ready.innerHTML = "Go!";
				setTimeout(function(){
					ui.ready.innerHTML = "";
					ui.ready.style.display = "none";
					// reset loop speed @ game start
					speed    = parseFloat(ui.startspeed.value);
					xspeed   = parseFloat(ui.difficulty.value);
					game.paused = false;
				},1000);
			},1000);
		},1000);
	},1000);
}

function play(modename) {
	// zero out scores
	game.p1.score = 0;
	game.p2.score = 0;
	tournament.p1.length = 0;
	tournament.p2.length = 0;
	game.stuck = 0;
	// get game options
	players  = ui.numplayers.value;
	numgames = ui.playrounds.value;
	if (numgames == 1) {
		ui.continuegame.style.display="none";
		ui.playagain.style.display = "block";
	} else { 
		ui.continuegame.style.display="block";
		ui.playagain.style.display = "none";
	}
	// get/set game mode
	if (!modename) {
		modename = ui.gamemode.value;
	}
	mode[''+modename+'']();
	// if audio disabled mute players
	if (ui.muteaudio.checked) {
		mute = true;
	} else {
		mute = false;
	}
	// set background
	if (ui.realart.checked && game.back.length > 1) {
		ui.game.style.backgroundImage = "url('images/"+game.back[1]+"')";
	} else {
		ui.game.style.backgroundImage = "url('images/"+game.back[0]+"')";
	}
	// clear splash
	ui.splash.style.display = "none";
	// start loop
	readySetGo();
	MainLoop();		// just to set up field
}

function gameSize(w,h) {
	if (!h || h > 400) { h = 400;}
	if (!w || w > 640) { w = 640;}
	// set new height & width for game
	game.canvas.width = w;
	game.canvas.height = h;
	game.width = w;
	game.height = h;
	// set new height, width, and margins for canvas
	ui.game.style.height = h+"px";
	ui.game.style.marginTop = "-"+parseInt(h/2)+"px";
	ui.game.style.width = w+"px";
	ui.game.style.marginLeft = "-"+parseInt(w/2)+"px";
}
/* Toggle Full Screen for more of an App Experience
   src = https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
*/
function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    ui.fullscreen.innerHTML = "Exit Fullscreen";
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    ui.fullscreen.innerHTML = "Enter Fullscreen";
  }
}
/* Delay Game Resize for Mobile Devices
   ====================================
   Mobile browser orientation change can reflow slower
   than desktop browser resize so we need to delay it
   or it may grab the wrong window size values.  Below
   a 300ms delay should be enough, but resize animation
   is 1s anyway so padded it to 500ms which should also
   help lower powered mobile devices.  This, however,
   assumes the browser supports CSS3 Transform Scale.   
*/
var scaleGame = function() {
	var portW  = document.documentElement.clientWidth
	  , portH = document.documentElement.clientHeight;
	var gameW = document.getElementById('gamebox').offsetWidth
	  , gameH = document.getElementById('gamebox').offsetHeight;
  		var factorW = portW / gameW;
  		var factorH = portH / gameH;	
  	if ( (portW < gameW || portH < gameH) && ui.views.value == 0) {
  		// if viewport is too small to show game at actual size
  		ui.views.value = 1;	// auto-switch to "Fit if too Small"
  		// now remove the option that can't be selected:
  		ui.views.removeChild(ui.views.getElementsByTagName('option')[0]);
  	}
  		if (ui.views.value==3) {
  			ui.gamebox.style[cssTransform] = 'scale('+factorW+','+factorH+')';
  		} else if ( ui.views.value == 1 || ui.views.value == 2 ) {	// scale game up or down
			if (portH < gameH && portW >= gameW) {
				document.getElementById('gamebox').style[cssTransform] = 'scale('+factorH+','+factorH+')';
			} else if (portH >= gameH && portW < gameW) {
				document.getElementById('gamebox').style[cssTransform] = 'scale('+factorW+','+factorW+')';
			} else if (portH < gameH && portW < gameW) {
					if (factorH < factorW) { var factor = portH/gameH;} else { var factor = portW/gameW;}
					document.getElementById('gamebox').style[cssTransform] = 'scale('+factor+','+factor+')';
			} else if (portH > gameH && portW > gameW) {
				if (ui.views.value == 2) {
					if (factorH < factorW) { var factor = portH/gameH;} else { var factor = portW/gameW;};
					document.getElementById('gamebox').style[cssTransform] = 'scale('+factor+','+factor+')';
				} else {
					ui.gamebox.style[cssTransform] = '';
				}	
			} else {
				// do nothing
			}
		} else {
			ui.gamebox.style[cssTransform] = '';			
		}

};
// Scale up for iPad and Android tablets
if (navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i)) {
	mobile = true;
	ui.views.value = 2;
	setTimeout(scaleGame,500);
} else {
	mobile = false;
	setTimeout(scaleGame,500);
}
// iDevices do not support the fullscreen toggle so hide it from options
if (navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) {
	mobile = true;
	ui.togglefs.style.display = "none";
}
/* Mobile Devices only allow ONE audio stream so we need to use audio sprites for them
   but Desktops can use multiple audio streams so swap out the correct audio scheme
*/
var audiosprite = {
	'bounce1'	: [0, 0.1],
	'bounce2'	: [0.5 , 0.6],
	'wallbounce': [1.0 , 1.1],
	'overshot'  : [1.5 , 2.0],
	'gamestart' : [2.5 , 4]
	},
	end = 0;
if (mobile==true) {
	var audioElement = document.createElement('audio');
		audioElement.src = "sounds/gamesounds.wav";
		audioElement.id = "soundfx";
		audioElement.setAttribute('preload','true');
		document.body.appendChild(audioElement);
		ui.soundfx = audioElement;
		ui.soundfx.addEventListener('timeupdate', function(e) {
			if (ui.soundfx.currentTime > end) {
				ui.soundfx.pause();
			}
		},false);
} else {
	for (var a=0; a < Object.keys(audiosprite).length; a++) {
		var audioElement = document.createElement('audio');
			audioElement.src = "sounds/"+Object.keys(audiosprite)[a]+".wav";
			audioElement.id  = Object.keys(audiosprite)[a];
			audioElement.setAttribute('preload','true');
			document.body.appendChild(audioElement);
			ui[''+Object.keys(audiosprite)[a]+''] = audioElement;
	}
};
/* SFX (Sound Effects) function resolves audio call to correct stream
   or pauses and mutes audio if sound is turned off.
*/
function sfx(sound) {
	if (mute==true) {
		if (mobile==true) {
			ui.soundfx.paused = true;
			ui.soundfx.muted  = true;
		} else {
			for (var a=0; a < Object.keys(audiosprite).length; a++) {
				ui[''+Object.keys(audiosprite)[a]+''].paused = true;
				ui[''+Object.keys(audiosprite)[a]+''].muted = true;
			}
		}

	} else {
		if (mobile==true) { // mobile, so use audiosprite
			ui.soundfx.paused = false;
			ui.soundfx.muted = false;
			if ( audiosprite[sound]) {
				ui.soundfx.currentTime = audiosprite[sound][0];
				end = audiosprite[sound][1];
				ui.soundfx.play();
			}
		} else {	// desktop so use multitrack
			ui[''+sound+''].paused = false;
			ui[''+sound+''].muted  = false;
			ui[''+sound+''].play();
		}
	}
}
/* GAME MODES
   "custard" is based on the original Mondrian Pong GIF from 2010
   "happytoast" is based on the Mondrian Pong GIF from 2016
   
   Feel free to add more game definitions!  You just need to
   adjust the size, position, and color of the elements
   and backgrounds should be SVG images so they scale without
   looking blurry and use preserveAspectRatio="none" in the SVG
   code or it will scale maintaining aspect ratio!
*/

mode.custard = function() {
	game.back = ["none"];
	if (players==1) {
		ui.gamebox.className = "game_a _1player";
	} else {
		ui.gamebox.className = "game_a _2player";
	}
	gameSize(400,400);
	game.top = 0;
	game.bottom = 0;
    game.ball.c = "yellow"
    game.ball.x = game.width/2;
    game.ball.y = game.height/2;
    game.ball.width = 58;
    game.ball.height = 44;
    game.ball.lineWidth  = 1;
    game.ball.vlineWidth = 3;
    game.ball.hlineWidth = 3;
    game.ball.linecolor = "black";
    
	game.display1.x = game.width/4;
	game.display1.y = 25;
	game.display1.c = "red";
	game.display2.x = game.width*3/4;
	game.display2.y = 25;
	game.display2.c = "blue";

	game.p1.c = "red";
    game.p1.width = 54;
    game.p1.height = 160;
	game.p1.y = game.height/2 - game.p1.height/2;
	game.p1.x = 20;
    game.p1.lineWidth =  1;
    game.p1.vlineWidth = 3;
    game.p1.hlineWidth = 3;
    game.p1.linecolor = "black";

	game.p2.c = "blue";
    game.p2.width = 54;
    game.p2.height = 160;
	game.p2.y = game.height/2 - game.p2.height/2;
	game.p2.x = game.width - 74 - 2;
    game.p2.lineWidth =  1;
    game.p2.vlineWidth = 3;
    game.p2.hlineWidth = 3;	
    game.p2.linecolor = "black";

}

mode.happytoast = function() {
	game.back = ["pongdrian.svg"];
	if (players==1) {
		ui.gamebox.className = "game_b _1player";
	} else {
		ui.gamebox.className = "game_b _2player";
	}
	gameSize(640,400);
	game.top = 21;
	game.bottom = 28;
	game.context.clearRect(0, 0, game.width, game.height);	
	game.ball.c = "black";
	game.ball.height = 32;
	game.ball.width = 28;
	game.ball.linewidth  = 0;
	game.ball.vlineWidth = 0;
	game.ball.hlineWidth = 0;
	game.ball.linecolor = "transparent";
	
	game.display1.x = 148;
	game.display1.y = 14;
	game.display1.c = "red";
	game.display2.x = 475;
	game.display2.y = 14;
	game.display2.c = "white";
	
	game.p1.c = "red";
	game.p1.width = 44;
	game.p1.height = 88;
	game.p1.y = game.height/2 - game.p1.height/2;
	game.p1.x = 40;
	game.p1.hlineWidth = 0;
	game.p1.vlineWidth = 0;
	game.p1.lineWidth = 6;
	game.p1.linecolor = "black";
	
	game.p2.c = "blue";
	game.p2.width = 44;
	game.p2.height = 88;
	game.p2.y = game.height/2 - game.p2.height/2;
	game.p2.x = game.width - 81;
	game.p2.hlineWidth = 0;
	game.p2.vlineWidth = 0;
	game.p2.lineWidth = 6;
	game.p2.linecolor = "black";
}

mode.composition_10 = function() {
	game.back = ["comp_10.svg","comp_10.jpg"];
	if (players==1) {
		ui.gamebox.className = "comp_10 _1player";
	} else {
		ui.gamebox.className = "comp_10 _2player";
	}
	gameSize(358,400);
	game.top = 0;
	game.bottom = 0;
	game.context.clearRect(0, 0, game.width, game.height);	
	game.ball.c = "#c2100b";
	game.ball.height = 25;
	game.ball.width = 28;
	game.ball.lineWidth = 0;
	game.ball.vlineWidth = 0;
	game.ball.hlineWidth = 0;
	game.ball.linecolor = "transparent";
	
	game.display1.x = 90;
	game.display1.y = 25;
	game.display1.c = "blue";
	game.display2.x = game.width-100;
	game.display2.y = 25;
	
	game.p1.c = "blue";
	game.p1.width = 34;
	game.p1.height = 87;
	game.p1.y = 0;
	game.p1.x = -6;
	game.p1.hlineWidth = 0;
	game.p1.vlineWidth = 0;
	game.p1.lineWidth = 6;
	game.p1.linecolor = "black";
	
	game.p2.c = "red";
	game.p2.width = 18;
	game.p2.height = 92;
	game.p2.y = game.height/2 - game.p2.height/2;
	game.p2.x = game.width - 12;
	game.p2.hlineWidth = 0;
	game.p2.vlineWidth = 0;
	game.p2.lineWidth = 6;
	game.p2.linecolor = "black";
}

mode.composition_a = function() {
	game.back = ["comp_a.svg","comp_a.jpg"];
	if (players==1) {
		ui.gamebox.className = "comp_a _1player";
	} else {
		ui.gamebox.className = "comp_a _2player";
	}
	gameSize(411,400);
	game.top = 0;
	game.bottom = 0;
	game.context.clearRect(0, 0, game.width, game.height);	
	game.ball.c = "#5846b4";
	game.ball.height = 20;
	game.ball.width = 20;
	game.ball.lineWidth =  3;
	game.ball.vlineWidth = 0;
	game.ball.hlineWidth = 0;
	game.ball.linecolor = "#666";
	
	game.display1.x = 110;
	game.display1.y = 35;
	game.display1.c = "black";
	game.display2.x = game.width-100;
	game.display2.y = 35;
	game.display2.c = "yellow";
	
	game.p1.c = "black";
	game.p1.width = 26;
	game.p1.height = 92;
	game.p1.y = 0;
	game.p1.x = -3;
	game.p1.hlineWidth = 0;
	game.p1.vlineWidth = 0;
	game.p1.lineWidth = 3;
	game.p1.linecolor = "#666";
	
	game.p2.c = "yellow";
	game.p2.width = 51;
	game.p2.height = 92;
	game.p2.y = 0;
	game.p2.x = game.width - 48;
	game.p2.hlineWidth = 0;
	game.p2.vlineWidth = 0;
	game.p2.lineWidth = 3;
	game.p2.linecolor = "#666";
}

mode.composition_r_b_y_g = function() {
	game.back = ["comp_RBYG.svg","comp_RBYG.jpg"];
	if (players==1) {
		ui.gamebox.className = "comp_rbyg _1player";
	} else {
		ui.gamebox.className = "comp_rbyg _2player";
	}
	gameSize(334,400);
	game.top = 0;
	game.bottom = 0;
	game.context.clearRect(0, 0, game.width, game.height);
	game.ball.c = "#bab3b7";
	game.ball.height = 47;
	game.ball.width = 30;
	game.ball.lineWidth =  3;
	game.ball.vlineWidth = 0;
	game.ball.hlineWidth = 0;
	game.ball.linecolor = "#333";
	
	game.display1.x = 38;
	game.display1.y = 20;
	game.display1.c = "#dce4e6";
	game.display2.x = game.width/2+25;
	game.display2.y = 20;
	game.display2.c = "#e7af32";
	
	game.p1.c = "#dce4e6";
	game.p1.width = 34;
	game.p1.height = 97;
	game.p1.y = 0;
	game.p1.x = -3;
	game.p1.hlineWidth = 0;
	game.p1.vlineWidth = 0;
	game.p1.lineWidth = 3;
	game.p1.linecolor = "#333";
	
	game.p2.c = "#e7af32";
	game.p2.width = 30;
	game.p2.height = 97;
	game.p2.y = 0;
	game.p2.x = game.width - 25;
	game.p2.hlineWidth = 0;
	game.p2.vlineWidth = 0;
	game.p2.lineWidth = 3;
	game.p2.linecolor = "#333";
}

mode.b_r_y_lithograph = function() {
	game.back = ["comp_BRY_Litho.svg","comp_BRY_Litho.jpg"];
	if (players==1) {
		ui.gamebox.className = "bry_litho _1player";
	} else {
		ui.gamebox.className = "bry_litho _2player";
	}
	gameSize(339,400);
	game.top = 0;
	game.bottom = 0;
	game.context.clearRect(0, 0, game.width, game.height);
	game.ball.c = "black";
	game.ball.height = 20;
	game.ball.width = 20;
	game.ball.lineWidth =  0;
	game.ball.vlineWidth = 0;
	game.ball.hlineWidth = 0;
	game.ball.linecolor = "black";
	
	game.display1.x = 38;
	game.display1.y = 25;
	game.display1.c = "#cea92e";
	game.display2.x = game.width-50;
	game.display2.y = 18;
	game.display2.c = "black";
	
	game.p1.c = "#cea92e";
	game.p1.width = 25;
	game.p1.height = 64;
	game.p1.y = 0;
	game.p1.x = -3;
	game.p1.hlineWidth = 0;
	game.p1.vlineWidth = 0;
	game.p1.lineWidth = 8;
	game.p1.linecolor = "black";
	
	game.p2.c = "#a2987e";
	game.p2.width = 30;
	game.p2.height = 65;
	game.p2.y = game.height-game.p2.height-36;
	game.p2.x = game.width - 32;
	game.p2.hlineWidth = 0;
	game.p2.vlineWidth = 0;
	game.p2.lineWidth = 8;
	game.p2.linecolor = "black";
}

var buildModeList = function() {
	for (var m=0; m < Object.keys(mode).length; m++) {
		var opt = document.createElement('option');
			opt.value = Object.keys(mode)[m];
		var objname = Object.keys(mode)[m].replace(/_|-/g,' ');
			objname = objname.split(' ');
		var nicename = '';
			for (var n=0; n < objname.length; n++) {
				nicename += objname[n].capitalize()+' ';
			}
			opt.innerHTML = nicename.trim();
		ui.gamemode.appendChild(opt);
	}
}();

