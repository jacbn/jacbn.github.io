import * as vec2 from '../../modules/vec2.js';
import * as cc from '../../modules/colourConversions.js';
import * as bc from '../../modules/basicCanvas.js'

var SYMCOUNT = 12;   //n>8 for proper patterns, 12 gives perfect squares
var ITERATIONS = 8;  //these can be considered const for the runtime of one iteration
var STARTSIZE = 30;
const COLOURREPEATS = 2;
var ANGLE = 2*Math.PI/SYMCOUNT;

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = ctx.canvas.height = Math.min(window.innerWidth/1.5, window.innerHeight/1.5);
ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);

document.getElementById("sizeSlider").oninput = function() {init()};
document.getElementById("symcountSlider").oninput = function() {init()};
document.getElementById("iterationSlider").oninput = function() {init()};



init();

function reset() {
    //clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);

    //reset "const"s
    STARTSIZE = parseFloat(document.getElementById("sizeSlider").value)
    SYMCOUNT = parseFloat(document.getElementById("symcountSlider").value)
    ITERATIONS = parseFloat(document.getElementById("iterationSlider").value)
    ANGLE = 2*Math.PI/SYMCOUNT;
}

/**
 * Draw the Lotfollah Mosque dome pattern
 */
function init() {
    reset();
    const intersectR = getCircleIntersection([0, STARTSIZE], rotateAboutOrigin([0, STARTSIZE], 3*ANGLE), STARTSIZE);
    iterate(intersectR, ITERATIONS);
}


/**
 * Locates the intersection point of two circles. Returns the one furthest from the origin.
 * @param {vec2} P Coordinates of the centre of the first circle.
 * @param {vec2} Q Coordinates of the centre of the second circle.
 * @param {Number} r Radii of the circles (circles must be the same size).
 * @returns {vec2} out
 */
function getCircleIntersection(P, Q, r) {
    const [a1, b1] = P;
    const [a2, b2] = Q;

    if (Math.abs(b1 - b2) < 0.001) {
        const x = (a1 + a2) / 2;
        const s = Math.sqrt(r*r - ((a2 - a1)/2)**2);
        const y1 = b1 + s;
        const y2 = b1 - s;
        
        return (Math.abs(y1) > Math.abs(y2)) ? [x, y1] : [x, y2];
    }
    
    
    const m = (a1 - a2)/(b2 - b1);
    const c = (b1 + b2 - m*(a1 + a2))/2;
    //y=mx+c is the perpendicular line through the midpoint of the two circles

    const A = m * m + 1;
    const B = 2 * (m * (c - b1) - a1);
    const C = a1 * a1 + b1 * b1 + c * c - 2 * b1 * c - r * r;

    const sqrt_discrim = Math.sqrt(B*B - 4*A*C);
    if (B*B - 4*A*C < 0) {
        console.log("FATAL: negative value applied to sqrt");
        console.log(P, Q, b1, b2, r);
        return;
    }

    const x1 = (-B + sqrt_discrim)/(2*A);
    const x2 = (-B - sqrt_discrim)/(2*A);

    const y1 = m*x1 + c;
    const y2 = m*x2 + c;

    return (x1*x1 + y1*y1 > x2*x2 + y2*y2) ? [x1, y1] : [x2, y2];
}

function calculateColour(squareNum, layer) {
    return cc.hslToHex((Math.floor(360/SYMCOUNT)*COLOURREPEATS*(squareNum+2*layer))%360, 1, 0.75);
}

/**
 * Iterate through a layer of squares.
 * @param {vec2} centre Any centre of the next layer of circles -- also the right- or left-intersection of any of the previous layer.
 * @param {Number} iters The number of iterations still to perform.
 * @param {Boolean} firstIter Flag set only on first iteration.
 */

function iterate(centre, iters, firstIter = true) {
    var centres = [
        centre, 
        rotateAboutOrigin(centre, ANGLE), 
        rotateAboutOrigin(centre, ANGLE*2), 
        rotateAboutOrigin(centre, ANGLE*3), 
        rotateAboutOrigin(centre, ANGLE*4)
    ];

    const circleSize = hypot(centres[0][0] - centres[2][0], centres[0][1] - centres[2][1]);
    
    const intersectT = getCircleIntersection(centres[1], centres[3], circleSize);
    const intersectB = getCircleIntersection(centres[0], centres[4], circleSize);
    const intersectL = getCircleIntersection(centres[0], centres[3], circleSize);
    const intersectR = getCircleIntersection(centres[1], centres[4], circleSize);


    for (var i = 0; i < SYMCOUNT; i++) {
        bc.drawShape(ctx, 
            [
                rotateAboutOrigin(intersectT, i*ANGLE),
                rotateAboutOrigin(intersectL, i*ANGLE),
                rotateAboutOrigin(intersectB, i*ANGLE),
                rotateAboutOrigin(intersectR, i*ANGLE)
            ], 
            true, calculateColour(i, ITERATIONS-iters),
        );
    }
    
    if (firstIter) {bc.drawCircle(ctx, 0, 0, hypot(intersectB[0], intersectB[1]));}
    
    if (iters > 1) {iterate(intersectR, iters-1, false);}

}


/**
 * Shorthand for vec2.rotate() about the origin.
 * @param {vec2} point The point to rotate.
 * @param {Number} angle The angle to rotate by (in radians).
 * @returns {vec2} out
 */
function rotateAboutOrigin(point, angle) {
    var a = vec2.create();
    vec2.rotate(a, point, [0, 0], angle);
    return a;
}

/**
 * Returns the absolute distance from the origin of a point.
 * @param {Number} x x-coordinate
 * @param {Number} y y-coordinate
 * @returns {Number} out
 */
function hypot(x, y) {
    return Math.sqrt(x*x + y*y);
}
