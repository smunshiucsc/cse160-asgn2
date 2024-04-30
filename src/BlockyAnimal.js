// ColoredPoints.js
// Shaun

var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
}`

 
var FSHADER_SOURCE = `
precision mediump float;
uniform vec4 u_FragColor;
void main(){
    gl_FragColor = u_FragColor;
} `

let canvas;
let gl;
let u_Size;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix

var leg_1_angle = 0;
var shake = 0;
var g_tails_animation =0;
var leg_2_angle = 0;
var shift_case = false;

function main() {
    
    setupWebGL();
    connectVariableToGLSL();
    addActionForHtmlUI();
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    var currentAngle = [gaX,gaY];
    initEventHandlers(canvas, currentAngle);
    requestAnimationFrame(tick)
}

let gaX = 0;
let gaY = 0;
let gaZ = 0;

let animate = false;
let gTail = false;


function addActionForHtmlUI() {
    document.getElementById('DimX').addEventListener(('mousemove'),function (){gaX = this.value; renderScene();})
    document.getElementById('DimY').addEventListener(('mousemove'),function (){gaY = this.value; renderScene();})
    document.getElementById('DimZ').addEventListener(('mousemove'),function (){gaZ = this.value; renderScene();})

    

    document.getElementById('Leg').addEventListener('mousemove', function () { leg_1_angle = this.value; renderScene(); });
    document.getElementById('Hoof').addEventListener('mousemove', function () {leg_2_angle = this.value; renderScene();});
    document.getElementById('HeadShake').addEventListener('mousemove', function () {shake = this.value; renderScene();});

    document.getElementById('Crawl_On_Button').onclick = function(){animate = true}
    document.getElementById('Crawl_Off_Button').onclick = function(){animate = false}
    document.getElementById('Wagging_Tails_On').onclick = function(){gTail = true}
    document.getElementById('Wagging_Tails_Off').onclick = function(){gTail = false}
}

function setupWebGL() {
    canvas = document.getElementById("webgl");
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log("Falied to get the rendering context for WebGL ")
    }
    gl.enable(gl.DEPTH_TEST)
}

function connectVariableToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix,false, identityM.elements);
}


var sT =  performance.now()/1000.0;
var seconds = performance.now()/1000.0-sT

function tick(){
    seconds = performance.now()/1000.0-sT;
    if (gTail){
        g_tails_animation = 20 * Math.sin(seconds);
    }

    if(animate){
        leg_1_angle = 20 * Math.sin(seconds);
        shake = 20 * Math.sin(seconds);

        g_tails_animation = 20 * Math.sin(seconds);
        leg_2_angle = 3 * Math.sin(seconds);
    } 
    renderScene();
    requestAnimationFrame(tick);
}

function renderScene() {
    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(gaX,1,0,0)
    globalRotMat.rotate(gaY,0,1,0);
    globalRotMat.rotate(gaZ,0,0,1);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix,false,globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.clear(gl.COLOR_BUFFER_BIT);

    renderMinecraftPig();

    var duration = performance.now() - startTime;
    SendTextToHTML(  " ms:" + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "fps");
}

function SendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    htmlElm.innerHTML = text;
}

function initEventHandlers(canvas, currentAngle) {
    var dragging = false;
    var lastX = -1, lastY = -1;
    canvas.onmousedown = function(ev) {
        var x = ev.clientX, y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            lastX = x; lastY = y;
            dragging = true;
        }
    };
    canvas.onmouseup = function() { dragging = false;}; 
    canvas.onmousemove = function(ev) { 
        var x = ev.clientX
        var y = ev.clientY;
        if (dragging) {
            var factor = 100/canvas.height;
            var dx = factor * (x - lastX);
            var dy = factor * (y - lastY);
            currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
            currentAngle[1] = currentAngle[1] + dx;
            gaX = -currentAngle[0];
            gaY = -currentAngle[1];

        }
        lastX = x, lastY = y;
    };
}

function pigWink(){
    canvas.addEventListener('click', (event) => {
        // Check if the Shift key was pressed during the click event
        if (event.shiftKey) {
            shift_case = true;
        }
    });
}

function renderMinecraftPig() {
    pigWink();
    var light_pink = [1.0, 0.6, 0.6, 1];
    var dark_pink = [0.8, 0.4, 0.4, 1];
    var pork_belly = new Cube();
    var pig_head = new Cube();
    var pig_face = new Cube();
    var eye_white_left = new Cube();
    var eye_black_left = new Cube();
    var eye_white_right = new Cube();
    var eye_black_right = new Cube();
    var snout = new Cube();
    var leg_front_left = new Cube();
    var leg_back_left = new Cube();
    var leg_back_right = new Cube();
    var foot_front_left = new Cube();
    var foot_front_right = new Cube();
    var foot_back_left = new Cube();
    var foot_back_right = new Cube();

    
    pork_belly.color = dark_pink;
    pork_belly.matrix.scale(.4, .4, .4);
    pork_belly.matrix.translate(-0.5, -0, -0.5);
    pork_belly.render();

    
    pig_head.color = light_pink;
    pig_head.matrix.rotate(shake/2, 0.5, 1, 1);
    pig_head.matrix.scale(0.4, 0.4, 0.4);
    pig_head.matrix.translate(-0.5, 0.65, -1.5);
    pig_head.render();

    
    pig_face.color = light_pink;
    pig_face.matrix.rotate(shake/2, 0.5, 1, 1);
    pig_face.matrix.scale(0.4, 0.4, 0.03);
    pig_face.matrix.translate(-0.5, 0.65, -21);
    pig_face.render();


    
    eye_white_left.color = [1, 1, 1, 1];
    eye_white_left.matrix.rotate(shake/2, 0.5, 1, 1);
    eye_white_left.matrix.scale(0.1, 0.058, 0.04);
    eye_white_left.matrix.translate(-2, 8, -16.2);
    eye_white_left.render();

    
    eye_black_left.color = [0, 0, 0, 1];
    eye_black_left.matrix.rotate(shake/2, 0.5, 1, 1);
    eye_black_left.matrix.scale(0.05, 0.058, 0.04);
    eye_black_left.matrix.translate(-3, 8, -16.5);
    eye_black_left.render();

    
    eye_white_right.color = [1, 1, 1, 1];
    eye_white_right.matrix.rotate(shake/2, 0.5, 1, 1);
    eye_white_right.matrix.scale(0.1, 0.058, 0.04);
    eye_white_right.matrix.translate(1, 8, -16.2);
    eye_white_right.render();

    if(shift_case == true){
        eye_white_right.color = [0,0,0,0];
        eye_white_right.matrix.rotate(shake/2, 0.5, 1, 1);
        eye_white_right.matrix.scale(0.1, 0.058, 0.04);
        eye_white_right.matrix.translate(1, 8, -16.2);
        eye_white_right.render();
        setTimeout(() => {
            //console.log('Animation delay: 2 seconds.');
        }, 2000);

        eye_white_right.color = [1, 1, 1, 1];
        eye_white_right.matrix.rotate(shake/2, 0.5, 1, 1);
        eye_white_right.matrix.scale(0.1, 0.058, 0.04);
        eye_white_right.matrix.translate(1, 8, -16.2);
        eye_white_right.render();

    }

    
    eye_black_right.color = [0, 0, 0, 1];
    eye_black_right.matrix.rotate(shake/2, 0.5, 1, 1);
    eye_black_right.matrix.scale(0.05, 0.058, 0.04);
    eye_black_right.matrix.translate(3, 8, -16.5);
    eye_black_right.render();

    
    snout.color = [0.2, 0.1, 0.05, 1.0];
    snout.matrix.rotate(0, 1, 0, 0);
    snout.matrix.rotate(shake/2, 0.5, 1, 1);
    snout.matrix.scale(0.1, 0.1, 0.04);
    snout.matrix.translate(-0.5, 3, -17);
    snout.render()


    
    leg_front_left.color = light_pink;
    leg_front_left.matrix.setTranslate(0,0, 0);
    leg_front_left.matrix.rotate(-leg_1_angle/6,0.2,0,0); // Joint 1
    var frontleftlegCoord = new Matrix4(leg_front_left.matrix);
    leg_front_left.matrix.scale(0.1, -0.25, 0.1);
    leg_front_left.matrix.translate(-1.7, 0, -2);
    leg_front_left.render();

    var frontrightleg = new Cube();
    frontrightleg.color = light_pink;
    frontrightleg.matrix.setTranslate(0, 0, 0);
    frontrightleg.matrix.rotate(leg_1_angle/6,1,0,0); // Joint 1
    var frontrightlegCoord = new Matrix4(frontrightleg.matrix);
    frontrightleg.matrix.scale(0.1, -0.25, 0.1);
    frontrightleg.matrix.translate(0.8, 0, -2);
    frontrightleg.render();

    
    leg_back_left.color = light_pink;
    leg_back_left.matrix.setTranslate(0, 0, 0);
    leg_back_left.matrix.rotate(-leg_1_angle/6, 1, 0, 0);
    var backleftlegsCoord = new Matrix4(leg_back_left.matrix);
    leg_back_left.matrix.scale(0.1, -0.25, 0.1);
    leg_back_left.matrix.translate(-1.7, 0, 1);
    leg_back_left.render();

    
    leg_back_right.color = light_pink;
    leg_back_right.matrix.setTranslate(0, 0, 0);
    leg_back_right.matrix.rotate(leg_1_angle/6, 1, 0, 0); 
    var backrightCoord = new Matrix4(leg_back_right.matrix);
    leg_back_right.matrix.scale(0.1, -0.25, 0.1);
    leg_back_right.matrix.translate(.8, 0, 1);
    leg_back_right.render();

    
    foot_front_left.color = dark_pink;
    foot_front_left.matrix = frontleftlegCoord;
    foot_front_left.matrix.rotate(-leg_2_angle/6, 1, 0, 0);
    foot_front_left.matrix.scale(0.1, 0.1, 0.1);
    foot_front_left.matrix.translate(-1.7, -3,-2.6);
    foot_front_left.render();

    
    foot_front_right.color = dark_pink;
    foot_front_right.matrix = frontrightlegCoord;
    foot_front_right.matrix.rotate(leg_2_angle/6, 1, 0, 0);
    foot_front_right.matrix.scale(0.1, 0.1, 0.1);
    foot_front_right.matrix.translate(0.8, -3, -2.4);
    foot_front_right.render();

    
    foot_back_left.color = dark_pink;
    foot_back_left.matrix = backleftlegsCoord;
    foot_back_left.matrix.rotate(-leg_2_angle/6, 1, 0, 0);
    foot_back_left.matrix.scale(0.1, 0.1, 0.1);
    foot_back_left.matrix.translate(-1.7, -3, 0.5);
    foot_back_left.render();

    
    foot_back_right.color = dark_pink;
    foot_back_right.matrix = backrightCoord;
    foot_back_right.matrix.rotate(leg_2_angle/6, 1, 0, 0);
    foot_back_right.matrix.scale(0.1, 0.1, 0.1);
    foot_back_right.matrix.translate(0.8, -3, 0.5);
    foot_back_right.render();

    var tails = new Cylinder();
    tails.color = [1.0, 0.6, 0.6, 1];
    tails.matrix.setTranslate(0, 0, 0);
    tails.matrix.rotate(-g_tails_animation/6, -0.5, -0.5, 0)
    tails.matrix.scale(0.1, 0.1, 0.2)
    tails.matrix.translate(-0.3, 2, 1)
    tails.render();




}

