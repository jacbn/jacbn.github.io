import * as bc from '../../modules/basicCanvas.js'

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = ctx.canvas.height = Math.min(window.innerWidth/1.5, window.innerHeight/1.5);
ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);

const speedSlider = document.getElementById("speedSlider");
speedSlider.oninput = function(event) {
    fullReset(event.target.value/10);
};
$(document).ready(function() {
    $('#addCircle').click(function () {addCircle()});
    $('#removeCircle').click(function () {removeCircle()});
    $('#changeRollType').click(function() {changeRollType()});
    $('#examples').val('empty');
    $('#examples').change(function(event) {setExample(event.target.value)});
})
const circlesOptionsDiv = $('#circlesOptions');
const circlesOptionsDivInitial = circlesOptionsDiv.html();

var circleRadii = [0]; // pointer
var circleSpeeds = [4];
var path = [];
var pathComplete = false;
var angle = 0;
var baseSpeed = speedSlider.value/10;
var speedsHcf = 1;
var rollType = 0;

addCircle(80, 0, true);

render();

function fullReset(speed=baseSpeed, exampleName='empty') {
    path = [];
    pathComplete = false;
    angle = 0;
    baseSpeed = speed;

    $('#examples').val(exampleName);

    //recalculate hcf (needed to only draw the path once)
    const arr = circleSpeeds.filter(x => x != 0).map(x => Math.abs(x));
    speedsHcf = hcf(arr);
    reset();
}

function reset() {
    //clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);
}

function render() {
    reset();
    var tx = 0;
    var ty = 0;
    var prevR = circleRadii[0];
    bc.drawCircle(ctx, tx, ty, prevR, "#666");

    for (var i = 1; i < circleRadii.length; i++) {
        tx += (prevR+circleRadii[i]*rollType) * Math.sin(angle*baseSpeed*circleSpeeds[i]);
        ty += (prevR+circleRadii[i]*rollType) * Math.cos(angle*baseSpeed*circleSpeeds[i]);
        bc.drawCircle(ctx, tx, ty, circleRadii[i], "#666");
        if (!pathComplete && i == circleRadii.length - 1) {
            path.push([tx, ty]);
        }
        prevR = circleRadii[i];
    }
    angle += Math.PI/180; // the angle, uncorrected for speed;
    // the "true" pointer angle is angle * simulation speed * pointer speed:
    //console.log(angle*baseSpeed*circleSpeeds[circleSpeeds.length-1]);
    
    if (angle*baseSpeed > 2*Math.PI / speedsHcf) {
        angle = 0;
        pathComplete = true;
        path.push(path[0]);
    }
    bc.drawShape(ctx, path, false);
    bc.drawCircle(ctx, tx, ty, 2, "#f00", true);
    requestAnimationFrame(render);
}

function addCircle(rad=40, spe=2, initial=false) {
    const ptrRad = circleRadii.pop();
    const ptrSpe = circleSpeeds.pop();
    circleRadii.push(rad, ptrRad);
    circleSpeeds.push(spe, ptrSpe);
    fullReset();
    
    const li = $('<li>').prop('id', 'circleOptions' + circleRadii.length).addClass('radialsListEntry');

    
    if (initial) {
        li.append(makeSizeInput(circleRadii.length - 2), makeEmptySpace()); // -1 for 0-indexing, -1 for the pointer
        circlesOptionsDiv.append(li);
    } else {
        li.append(makeSizeInput(circleRadii.length - 2), makeSpeedInput(circleRadii.length - 2));
        $('#circleOptionsPtr').replaceWith(li);
    } 

    makePointerOptions();
}

function makePointerOptions() {
    const ptr = $('<li>').prop('id', 'circleOptionsPtr').addClass('radialsListEntry');
    ptr.append(makeEmptySpace(), makeSpeedInput(circleRadii.length - 1));
    circlesOptionsDiv.append(ptr);
}

function makeSizeInput(index) {
    return $('<input>').addClass('radialsNumericalInput').prop('type', 'number').prop('value', circleRadii[index]).prop('min', 0).prop('max', 100).prop('step', 10).on('input', function(event) {
        circleRadii[index] = parseInt(event.target.value);
        fullReset();
    });
}

function makeSpeedInput(index) {
    return $('<input>').addClass('radialsNumericalInput').prop('type', 'number').prop('value', circleSpeeds[index]).prop('min', -10).prop('max', 10).prop('step', 1).on('input', function(event) {
        circleSpeeds[index] = parseInt(event.target.value);
        fullReset();
    });
}

function makeEmptySpace() {
    return $('<input>').addClass('radialsEmptyInput').attr("disabled", true);
}

function removeCircle() {
    if (circleRadii.length > 2) {
        const ptrSpe = circleSpeeds.pop();
        const ptrRad = circleRadii.pop();
        circleSpeeds.pop();
        circleRadii.pop();
        circleRadii.push(ptrRad);
        circleSpeeds.push(ptrSpe);

        // removing a circle changes the index of the pointer in the circleSpeeds array, so remake to update
        $('#circleOptionsPtr').remove();
        makePointerOptions();
        $('#circleOptions' + (circleRadii.length+1)).remove();

        fullReset();
    }
}

function changeRollType(val=rollType) {
    if (val == rollType) {
        rollType = (rollType + 2) % 3 - 1;
    } else {
        rollType = val;
    }
    fullReset();
}

function setExample(example) {
    circlesOptionsDiv.html(circlesOptionsDivInitial);
    switch (example) {
        case "3clover":
            circleRadii = [0];
            circleSpeeds = [8];
            addCircle(80, 0, true)
            addCircle(20, 2);
            changeRollType(1);
            break;
        case "triangle":
            circleRadii = [0];
            circleSpeeds = [4];
            addCircle(80, 0, true)
            addCircle(20, -2);
            changeRollType(1);
            break;
        case "club":
            circleRadii = [0];
            circleSpeeds = [8];
            addCircle(70, 0, true);
            addCircle(60, -2);
            addCircle(40, 6);
            changeRollType(0);
            break;
        case "powersOfTwo":
            circleRadii = [0];
            circleSpeeds = [128];
            addCircle(128, 0, true);
            addCircle(64, 1);
            addCircle(32, 2);
            addCircle(16, 4);
            addCircle(8, 8);
            addCircle(4, 16);
            addCircle(2, 32);
            addCircle(1, 64);
            changeRollType(0);
            break;
    }
    fullReset(baseSpeed, example);
}

function hcf(arr) {
    return arr.reduce(function(a,b) {
        if (!b) return a;
        return hcf([b, a % b]);
    });
}

/*
cool ones:

heart:
    80 100 13
       -6 -4  6

5-side flower:
    80 40
       -3  2

3-leaf clover:
    80 20
       2  8

triangle:
80 20
-2 4

club:
    70 60 40
       -2  6  8

self-similar:
    128  64  32  16  8   4   2   1
         1   2   4   8   16  32  64 128
*/
