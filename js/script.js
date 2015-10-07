//global constants
var context;                // Variable to hold the entire game context

//specifying the width and height of our game area, we'll use the complete canvas in this case
var width = 300;
var height = 400;

//specify the initial game configuration
var snakeLength = 3;        // initial length of snake is set to 3
var level = 1;              // start from level 1
var sqSize = 10; //khoi cua snake           // step size is 10px. Also size of single body unit

/* *************************** /
 * specify the initial snake alignment and direction of movement
 * Snake is starts horizontal moving towards its right
 * *************************** */
var bodyX = new Array(150, 150-sqSize, 150-2*sqSize); //vi tri ban dau cua snake  //array to manage X coordinates for snake body
var bodyY = new Array(200, 200, 200);                   //array to manage Y coordinates for snake body

var vX = new Array(1, 1, 1);    //array to manage horizontal velocity for snake body
var vY = new Array(0, 0, 0);    //array to manage vertical velocity for snake body

//variables used to put rats on the canvas
var rX;
var rY;

//keeping the scores
var score = 0;
var scoreDiv;                // to hold the context of div used to display score and level

var eaten = true;               // to check if new rat needs to be placed
var gameOver = false;           // to check if the game is over and enable control to restart the game

var controlsDiv;                // to hold the context of div used to display game controls

//wall size and start point
var wallHeight = 30;
var wallWidth = 40;

var wall1X = 100;
var wall1Y = 100;

var wall2X = 150;
var wall2Y = 250;

//stage
var stage = 0;
/* *************************** /
 * Initialize the game variables and the game context
 * and then sends the game to the main game loop
 * *************************** */
function init()
{
    // Get game context
    context = document.getElementById("canvas").getContext("2d");
    
    //make play button became restart button
    document.getElementById("playBtn").removeEventListener("click",init,true);
    document.getElementById("playBtn").addEventListener("click",restart,true);

    //draws the canvas
    drawCanvasBoundary();
    
    //draws snake
    drawSnake();
    
    //setTimeout calls the game loop i.e. gameProcess function after the specified time
    intervalId = setTimeout(gameProcess, 1000/6);
    
    //get handle to the div containing our score and level details
    scoreDiv = document.getElementById("score");
    
    //get handle to the div containing our score and level details
    controlDiv = document.getElementById("control");
    
    //specify the function to handle the keypress
    window.onkeydown = keydown;
}

/* *************************** /
 * Clears the canvas to empty for redrawing
 * not an ideal way but then this is a HTML5 Games 101
 * ************************** */
function clear()
{
    context.clearRect(0,0,width,height);
}

/* *************************** /
 * Restart the game
 * ************************** */
function restart()
{
    bodyX = new Array(150, 150-sqSize, 150-2*sqSize);
    bodyY = new Array(200, 200, 200);
    
    vX = new Array(1, 1, 1);
    vY = new Array(0, 0, 0);
    
    snakeLength = 3;
    
    score = 0;
    level  = 1;
    
    eaten = true;
    
    scoreDiv.innerHTML = "Score: " +score+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Level: "+level;
    controlDiv.innerHTML = "Controls: W = Up; A = Left; S = Down; D = Right";
    clearTimeout(intervalId);
    intervalId = setTimeout(gameProcess, 1000/6);
    
}

/* *************************** /
 * Handles keyboard events to control snake
 * It only acknowledges the arrow keys and ignores the remaining
 * Calculate the new valid direction for snake head
 * for instance - if snake is moving right, it cannot move left even if left arrow is pressed
 * ************************** */
function keydown(e)
{
    if(e.keyCode == 37 && vX[0] != 1)       //left arrow - Changed to 'a'
    {
        vX[0] = -1;
        vY[0] = 0;
    }
    else if (e.keyCode == 38 && vY[0] != 1) //up arrow - changed to 'w'
    {
        vY[0] = -1;
        vX[0] = 0;
    }
    else if (e.keyCode == 39 && vX[0] != -1) //right arrow - changed to 'd'
    {
        vX[0] = 1;
        vY[0] = 0;
    }
    else if (e.keyCode == 40 && vY[0] != -1) //down arrow - changed to 's'
    {
        vY[0] = 1;
        vX[0] = 0;
    }
    else if (e.keyCode == 13  && gameOver == true)
    {
        gameOver = false;
        restart();
    }
}

/* *************************** /
 * Initially it was meant to mark the canvas boundary
 * but this take the background color of the page (black for my blog) so now am filling canvas white
 * ************************** */
function drawCanvasBoundary()
{
    context.fillStyle="#19DB5A";           //set canvas color to be white
    context.fillRect(0,0,width,height); //draws a rectangle of canvas size filled with white color. This serves as our background
    //context.fill();

    /* */
    //context.beginPath();
    context.strokeStyle="#000";
    context.strokeRect(0,0,width,height);
    //context.closePath();
    //context.fill();
    /* */
}

/* *************************** /
 * Draws each body part of the snake
 * x, y = provides the body position
 * ************************** */
function drawPoint(x,y)
{
    // First draw a square for size "sqSize" filled with black
    context.fillStyle = "#000";
    context.fillRect(x,y,sqSize, sqSize);
    context.fill();
    
    // Then draw the square boundary in white
    context.strokeStyle="#FFFFFF";
    context.strokeRect(x,y,sqSize, sqSize);
}

//draw wall
function setStage(st){
    stage = st;
}

function drawWall(){
    stage = stage;
    if (stage == 1){
        for(i = wall1X; i < wall1X + wallWidth; i += sqSize)
            for(j = wall1Y; j < wall1Y + wallHeight; j += sqSize){
                drawPoint(i,j)
            }
    }

    if (stage == 2){
        for(i = wall1X; i < wall1X + wallWidth; i += sqSize)
            for(j = wall1Y; j < wall1Y + wallHeight; j += sqSize){
                drawPoint(i,j)
            }

        for(i = wall2X; i < wall2X + wallWidth; i += sqSize)
            for(j = wall2Y; j < wall2Y + wallHeight; j += sqSize){
                drawPoint(i,j)
            }
    }
}

/* *************************** /
 * Draws snake by calling the helper drawPoint function
 * ************************** */
function drawSnake()
{
    for(var i=0; i < snakeLength; i++)
        drawPoint(bodyX[i],bodyY[i]);
}

/* *************************** /
 * Checks snake colliding with the boundary walls
 * Snake can collide with itself only if its length is 5
 * else if condition checks for snake length and calls for self collision check
 * ************************** */
function checkCollision()
{
    if(bodyX[0] >= width || bodyX[0] < 0 || bodyY[0] < 0 || bodyY[0] >= height)
    {
        scoreDiv.innerHTML = "Score: " +score+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Level: "+level+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Game Over</b>";
        controlDiv.innerHTML = "Press \"Enter\" to restart"; 
        gameOver = true;
        clearTimeout(intervalId);
    }
    else if(snakeLength > 4)
        {
            if(checkSelfCollision(bodyX[0],bodyY[0]))
            {
                scoreDiv.innerHTML = "Score: " +score+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Level: "+level+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Game Over</b>";
                controlDiv.innerHTML = "Press \"Enter\" to restart";
                gameOver = true;
                clearTimeout(intervalId);
            }
        }
    else if(checkSnakeHitWall(bodyX[0], bodyY[0])){
        scoreDiv.innerHTML = "Score: " +score+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Level: "+level+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Game Over</b>";
        controlDiv.innerHTML = "Press \"Enter\" to restart";
        gameOver = true;
        clearTimeout(intervalId);   
    }
}

/* *************************** /
 * Iterates through all body parts starting from 5
 * and compares their x & y coordinates with that of head sent as the parameter(x & y)
 * ************************** */
function checkSelfCollision(x, y)
{
    for (var i = 4; i < snakeLength; i++)
        if(x == bodyX[i] && y == bodyY[i])
        {
            return true;
        }
    return false;
}

//Check if snake hit wall
function checkSnakeHitWall(x,y){
    switch(stage){
        case 1:
            if (x >= wall1X && x <= (wall1X + wallWidth))
                if (y >= wall1Y && y <= (wall1Y + wallHeight)){
                    return true;
                }
            break;
        case 2:
            if (x >= wall1X && x <= (wall1X + wallWidth)){
                if (y >= wall1Y && y <= (wall1Y + wallHeight)){
                    return true;
                }
            }
            else if (x >= wall2X && x <= (wall2X + wallWidth))
                if (y >= wall2Y && y <= (wall2Y + wallHeight)){
                    return true;
                }
            break;
        default:
            return false;
    }
}

/* *************************** /
 * Iterates through all body parts and compares their x & y coordinates
 * with those of new Rat location sent as the parameter(x & y)
 * ************************** */
function checkFoodCollision(x, y)
{
    for (var i = 0; i < snakeLength; i++)
        if(x == bodyX[i] && y == bodyY[i])
        {
            return true;
        }
    return false;
}


//Check if rat inside wall
function checkRatInsideWall(x,y){
    switch(stage){
        case 1:
            if (x >= wall1X && x <= (wall1X + wallWidth))
                if (y >= wall1Y && y <= (wall1Y + wallHeight)){
                    return true;
                }
            break;
        case 2:
            if (x >= wall1X && x <= (wall1X + wallWidth)){
                if (y >= wall1Y && y <= (wall1Y + wallHeight)){
                    return true;
                }
            }
            else if (x >= wall2X && x <= (wall2X + wallWidth))
                if (y >= wall2Y && y <= (wall2Y + wallHeight)){
                    return true;
                }
            break;
        default:
            return false;
    }
}
/* *************************** /
 * If the rat was eaten, calculates new rat coordinates,
 * check for collision with snake body and place it on canvas
 * ************************** */
function placeRat()
{
    if(eaten)
    {
        rX = Math.floor(width*Math.random()/sqSize)*sqSize;
        rY = Math.floor(height*Math.random()/sqSize)*sqSize;
        while(checkRatInsideWall(rX,rY)){
            rX = Math.floor(width*Math.random()/sqSize)*sqSize;
            rY = Math.floor(height*Math.random()/sqSize)*sqSize;
        }
        if(checkFoodCollision(rX,rY))
            placeRat();
        else
            eaten = false;
    }
    drawPoint(rX, rY);
}

/* *************************** /
 * If the rat was eaten, it calculates new rat coordinates,
 * check for collision with snake body and places new rat on canvas
 * ************************** */
function moveSnake()
{
    for(var i=0; i < snakeLength; i++)
    {
        bodyX[i] += (vX[i]*sqSize);
        bodyY[i] += (vY[i]*sqSize);
    }
    
    for(var i=snakeLength-1; i>0; i--)
    {
        vX[i] = vX[i-1];
        vY[i] = vY[i-1];
    }
    eatRat();
}



/* *************************** /
 * Checks whether the head has reached the rat
 * in case its true, sets flag for calculation of new Rat location
 * and calculates and add a body part at the tail increasing the snakeLength
 * Thereafter, it increments score and check if level needs to be incremented
 * ************************** */
function eatRat()
{
    if(bodyX[0] == rX && bodyY[0] == rY)
    {
        eaten = true;
        // calculate the new X & Y location for tail
        var newX = bodyX[snakeLength-1]-vX[snakeLength-1]*sqSize;
        var newY = bodyY[snakeLength-1]-vY[snakeLength-1]*sqSize;
        
        //Add the new tail part in respective arrays
        bodyX.push(newX);
        bodyY.push(newY);
        
        //Initial velocity of the new part will be same as that of old tail
        //so just copy from last part
        vX.push(vX[snakeLength-1]);
        vY.push(vY[snakeLength-1]);

        snakeLength++;      // increment the snakelength
        
        score += 10;        // increment score
        
        // check and increment level
        if((score%100) == 0)
            level++;
        
        // update score on webpage
        scoreDiv.innerHTML = "Score: " +score+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Level: "+level;
    }
}

//Wall

/* *************************** /
 * The update and draw game loop
 * ************************** */
function gameProcess()
{
    // Sets the interval for next refresh. Game level defines the rate of refresh and thereby increase speed with level
    intervalId = setTimeout(gameProcess, 1000/(6*level));   
    console.log(intervalId);
    clear();
    drawCanvasBoundary();
    
    drawWall();

    placeRat();
    
    moveSnake();
    
    checkCollision();
    
    drawSnake();
}

$(document).ready(function(){
    $("#gameModal").on('shown.bs.modal', function(){
        document.getElementById("playBtn").addEventListener("click",init,true);
    });
});
