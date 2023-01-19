// SELECT CVS
const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

// GAME VARS AND CONSTS
let lives = 3;
let frames = 0;
let level = 1;
let pipeNumber = 0;
const DEGREE = Math.PI/180;

// LOAD SPRITE IMAGE
const sprite = new Image();
sprite.src = "./sprite.png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "./sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "./sfx_flap.wav";

const HIT = new Audio();
HIT.src = "./sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "./sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "./sfx_die.wav";

// GAME STATE
const state = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

// START BUTTON COORD
const startBtn = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

// CONTROLS THE GAME
cvs.addEventListener("click", function(evt){
    switch(state.current){
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            if(bird.y - bird.radius <= 0) return;
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            
            // THIS CHECKS IF WE CLICK ON THE START BUTTON
            if(clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h){
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});

// BACKGROUND
const bg = {
    sX : 0,
    sY : 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

// FOREGROUND
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    
    dx : 2,
    
    draw : function(){
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    update: function(){
        if(state.current == state.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }
}

// LIVES
const renderLives = {
    sX: 276,
    sY: 139,
    w: 34,
    h: 24,
    x: 10,
    y: 40,
    draw : function(){
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + (i * this.w), this.y, this.w, this.h);
    }
}
}

// BIRD
const bird = {
    animation : [
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,
    
    radius : 12,
    
    frame : 0,
    
    gravity : 0.25,
    jump : 4.6,
    speed : 0,
    rotation : 0,
    
    draw : function(){
        let bird = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap : function(){
        this.speed = - this.jump;
    },
    
    update: function(){
        // IF THE GAME STATE IS SET TO GET READY STATE, THE BIRD MUST FLAP SLOWLY
        this.period = state.current == state.getReady ? 10 : 5;
        // WE INCREMENT THE FRAME BY 1, EACH PERIOD
        this.frame += frames%this.period == 0 ? 1 : 0;
        // FRAME GOES FROM 0 To 4, THEN AGAIN TO 0
        this.frame = this.frame%this.animation.length;
        
        if(state.current == state.getReady){
            this.y = 150; // RESETS POSITION OF THE BIRD AFTER GAME OVER STATE
            this.rotation = 0 * DEGREE;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            
            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y = cvs.height - fg.h - this.h/2;
                if(state.current == state.game){
                    state.current = state.over;
                    DIE.play();
                    if(lives == 0) {
                        checkpoint = 0;
                        lives = 3;
                    } else {
                        lives--;
                    }
                }
            }
            
            // IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            }else{
                this.rotation = -25 * DEGREE;
            }
        }
        
    },
    speedReset : function(){
        this.speed = 0;
    }
}

// GET READY MESSAGE
const getReady = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,
    
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
    
}

// GAME OVER MESSAGE
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,
    
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

//CHECKPOINT SYSTEM
var checkpoint = 0;
var checkpoint_position = {x:0, y:0};

function updateCheckpoint() {
    if (score.value >= checkpoint + 5) {
        checkpoint = score.value;
        checkpoint_position = pipes.position[0];
    }
}

function restart() {
    score.value = checkpoint;
    for (let i = 0; i < pipes.position.length; i++) {
        pipes.position[i].x += 5;
    }
}

// PIPES
const pipes = {
    position : [],
    
    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },
    
    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,
    
    draw : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            // top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);  
            
            // bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    update: function(){
        if(state.current !== state.game) return;
        
        if(frames%100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * ( Math.random() + 1)
            })
            pipeNumber++;
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            // COLLISION DETECTION
            // TOP PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h){
                HIT.play();
                state.current = state.over;
                if(pipeNumber % 3 == 0){
                    alert("custom death alert 1");
                }
                if(pipeNumber % 3 == 1){
                    alert("custom death alert 2");
                }
                if(pipeNumber % 3 == 2){
                    alert("Custom death alert 3");
                }
                if(lives == 0) {
                    checkpoint = 0;
                    lives = 3;
                } else {
                    lives--;
                }
                
            }
            // BOTTOM PIPE
            if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h){
                HIT.play();
                state.current = state.over;
                if(pipeNumber % 3 == 0){
                    alert("custom death alert 1");
                }
                if(pipeNumber % 3 == 1){
                    alert("custom death alert 2");
                }
                if(pipeNumber % 3 == 2){
                    alert("Custom death alert 3");
                }
                if(lives == 0) {
                    checkpoint = 0;
                    lives = 3;
                } else {
                    lives--;
                }
            }
            
            // MOVE THE PIPES TO THE LEFT
            p.x -= this.dx;
            
            // IF THE PIPES GO BEYOND THE CANVAS, WE DELETE THEM FROM THE ARRAY
            if(p.x + this.w <= 0){
                this.position.shift();
                score.value += 1;
                SCORE_S.play();
                updateCheckpoint();
                if (score.value % 20 == 0 && score.value !== 0) {
                    level++;
                    if(level >5) level=5;
                    lives = 3;
                }
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },
    
    reset : function(){
        this.position = [];
    }
    
}

// SCORE
const score= {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    
    draw : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(state.current == state.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
            
        }else if(state.current == state.over){
            // SCORE VALUE
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    
    reset : function(){
        this.value = 0;
        restart();
    }
}

// DRAW
function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    renderLives.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// UPDATE
function update(){
    bird.update();
    fg.update();
    pipes.update();
}

// LOOP
function loop(){
    update();
    draw();
    frames++;
    
    requestAnimationFrame(loop);
}
loop();