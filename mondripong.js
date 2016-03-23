/*  MondriPong
    Version 1.2
    Copyright 2016 K.M. Hansen
    http://www.kmhcreative.com
    
    GitHub Contributors:
    @kmhcreative
    @salty-horse
    @gvorob
    
    Based on "Pong" Tutorial by Maison
    http://blog.mailson.org/2013/02/simple-pong-game-using-html5-and-canvas/
*/
function Game() {
    var canvas = document.getElementById("game");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "white";
    this.keys = new KeyListener();
    
    this.p1 = new Paddle(20, 0, "red");
    this.p1.y = this.height/2 - this.p1.height/2;
 	this.display1 = new Display(this.width/4, 25,"red");
    this.p2 = new Paddle(this.width - 74 - 2, 0, "blue");
    this.p2.y = this.height/2 - this.p2.height/2;
    this.display2 = new Display(this.width*3/4, 25,"blue");
    
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
};
 
Game.prototype.update = function() 
{
    if (this.paused)
        return;
    
    this.ball.update();
    this.display1.value = this.p1.score;
    this.display2.value = this.p2.score;
 
    // To which Y direction the paddle is moving
    if (this.keys.isPressed(90)) { // DOWN
        this.p1.y = Math.min(this.height - this.p1.height, this.p1.y + 4);
    } else if (this.keys.isPressed(65)) { // UP
        this.p1.y = Math.max(0, this.p1.y - 4);
    }
 
    if (this.keys.isPressed(40)) { // DOWN
        this.p2.y = Math.min(this.height - this.p2.height, this.p2.y + 4);
    } else if (this.keys.isPressed(38)) { // UP
        this.p2.y = Math.max(0, this.p2.y - 4);
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

			console.log(collide_y, collided);

            if (collided) {
                // collides with right paddle
                this.ball.x = this.p2.x - this.ball.width;
                this.ball.y = Math.floor(collide_y);
                this.ball.vx = -this.ball.vx;
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
                this.ball.x = this.p1.x + this.p1.width;
                this.ball.y = Math.floor(collide_y);
                this.ball.vx = -this.ball.vx;
            }
        }
    }
 
    // Top and bottom collision
    if ((this.ball.vy < 0 && this.ball.y < 0) ||
            (this.ball.vy > 0 && this.ball.y + this.ball.height > this.height)) {
        this.ball.vy = -this.ball.vy;
    }
    
    if (this.ball.x >= this.width)
        this.score(this.p1);
    else if (this.ball.x + this.ball.width <= 0)
        this.score(this.p2);
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

function Rect(x, y, c) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.lineWidth = 3;
}

Rect.prototype.draw = function(p)
{
    p.fillStyle = this.c;
    p.fillRect(this.x, this.y, this.width, this.height);
    p.strokeRect(this.x, this.y, this.width, this.height);
    p.lineWidth = this.lineWidth;
    p.fillStyle = "black";
    p.fillRect(0, this.y-2, p.canvas.width, this.lineWidth);
    p.fillRect(0, this.y+this.height-1, p.canvas.width, this.lineWidth);
    p.fillRect(this.x-2, 0, this.lineWidth, p.canvas.height);
    p.fillRect(this.x+this.width-1, 0, this.lineWidth, p.canvas.height);
};



// PADDLE
function Paddle(x,y,c) {
    Rect.call(this, x, y, c);
    this.width = 54;
    this.height = 160;
    this.score = 0;
}

Paddle.prototype = Object.create(Rect.prototype);

// BALL
function Ball(x,y,c) {
    Rect.call(this, x, y, c);
    this.vx = 0;
    this.vy = 0;
    this.width = 58;
    this.height = 44;
}

Ball.prototype = Object.create(Rect.prototype);
 
Ball.prototype.update = function()
{
    this.x += this.vx;
    this.y += this.vy;
};


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
    d.font = "24px Impact";
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


// Initialize our game instance
var game = new Game();
 
function MainLoop() {
    game.update();
    game.draw();
    // Call the main loop again at a frame rate of 30fps
    setTimeout(MainLoop, 33.3333);
}
 
// Start the game execution
MainLoop();
