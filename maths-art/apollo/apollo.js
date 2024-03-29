import * as bc from '../../modules/basicCanvas.js';
import Complex from '../../modules/basicComplex.js';

var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");
ctx.canvas.width = ctx.canvas.height = Math.min(window.innerWidth/1.5, window.innerHeight/1.5);
ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);

document.getElementById("ratioSlider").oninput = function() {init()};
document.getElementById("offsetSlider").oninput = function() {init()};
document.getElementById("rotationSlider").oninput = function() {init()};
document.getElementById("iterationSlider").oninput = function() {init()};


const OUTER_CIRCLE_SIZE = -240; 
var RATIO = 0.5; //these can be considered constants for the duration of one render, but might change between renders
var OFFSET = 180;
var ROTATION = 0;
var ITERATIONS = 8;

/*
some things to improve the program:

    - balance the detail on all sides -- i.e. don't continue recursing
      past a certain depth until everywhere in the shape has reached said
      depth
    - detail limits

*/

class Circle {
    /**
     * Defines a circle on the complex plane.
     * @param {Complex} centre The centre of the circle.
     * @param {Number} r The radius of the circle. Negative for the surrounding circle.
     * @param {Boolean} initial True if the circle is one of the three starting circles.
     */
    constructor(centre, r, initial=false) {
        this.x = centre.re;
        this.y = centre.im;
        this.exists = false;

        this.id = cantorPairing(Math.round(this.x), Math.round(this.y));
        if (this.id in circles) {
            /*sometimes we generate a circle we have already made. we try to avoid this
            as much as possible, but a few can still slip through. this deletes them
            to avoid wasted memory where possible.*/

            //console.log("REPEAT CIRCLE: ", this.x, this.y);
            delete this;
            return;
        }

        this.exists = true;
        this.centre = centre;
        this.r = r;
        this.c = 1/r;
    }

    draw() {
        bc.drawCircle(ctx, this.x, this.y, this.r);
    }
}

var START_SIZE = -OUTER_CIRCLE_SIZE*RATIO; //can be considered constant for one render
var circles = {};

init();

function reset() {
    //clear canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgb(21, 24, 26)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);

    //update "const"s
    RATIO = parseFloat(document.getElementById("ratioSlider").value)/100;
    OFFSET = 180-parseFloat(document.getElementById("offsetSlider").value);
    ROTATION = parseFloat(document.getElementById("rotationSlider").value);
    ITERATIONS = parseFloat(document.getElementById("iterationSlider").value);
    //parseFloat technically only required on rotation (there's a `rotation+{an int}` later,
    //(which JS treats as string concatenation? wild)), but this is just making explicit
    //what would be done implicitly anyway
}

function init() {
    reset();

    START_SIZE = -OUTER_CIRCLE_SIZE*RATIO;
    circles = {};
    /*
        circles {}:
            key is a pairing (cantorPairing) of a circle's x and y coordinate.
            (rounded, to allow for slight floating point error)
    
            contains a mapping from one circle to the three circles it is 
            (originally) generated by.
    
            used for:
                - when deciding which circles to use to generate a fourth,
                  consider only sets of three circles that have at least one 
                  circle from the most recent generation. use 
    */
    
    
    
    
    //radius of the outer circle                        is     (-) OUTER_CIRCLE_SIZE
    //radius of the circle we control the radius of     is     START_SIZE
    //radius of the circle we control the offset of     is     (OFFSET/180) * (-OUTER_CIRCLE_SIZE-START_SIZE)
    

    const [sin, cos] = getCircleOrient(315);
    const [sin2, cos2] = getCircleOrient(0); //admittedly could just use 0 and 1 but it's more understandable
    const tx = (cos - sin)/Math.SQRT2;
    const ty = (sin + cos)/Math.SQRT2;
    /*tx and ty are part of a rotation matrix for rotating the initial circles*/
    
    const x = ((START_SIZE+(OFFSET/180) * (-OUTER_CIRCLE_SIZE-START_SIZE))*(START_SIZE+(OFFSET/180) * (-OUTER_CIRCLE_SIZE-START_SIZE)) - (-OUTER_CIRCLE_SIZE-(OFFSET/180) * (-OUTER_CIRCLE_SIZE-START_SIZE))*(-OUTER_CIRCLE_SIZE-(OFFSET/180) * (-OUTER_CIRCLE_SIZE-START_SIZE)) - (-OUTER_CIRCLE_SIZE-START_SIZE)*(-OUTER_CIRCLE_SIZE-START_SIZE))/(2*(-OUTER_CIRCLE_SIZE-START_SIZE));
    var tempY = Math.sqrt((-OUTER_CIRCLE_SIZE-(OFFSET/180) * (-OUTER_CIRCLE_SIZE-START_SIZE))*(-OUTER_CIRCLE_SIZE-(OFFSET/180) * (-OUTER_CIRCLE_SIZE-START_SIZE)) - x*x);
    const y = tempY || 0; //if y undefined just use 0. fixes problems with sqrt and tiny negatives from floating point errors
    /*x and y are the positions of the third circle given the initial conditions
    and the other two circles -- see https://www.desmos.com/calculator/akeggyb7gn
    for the maths involved. (nb: r3 is equivalent to an unscaled OFFSET)*/
    const x2 = (START_SIZE+OUTER_CIRCLE_SIZE)
    
    const a = new Circle(new Complex(0, 0), OUTER_CIRCLE_SIZE);
    //const b = new Circle(new Complex((START_SIZE+OUTER_CIRCLE_SIZE)*tx,(START_SIZE+OUTER_CIRCLE_SIZE)*ty), START_SIZE);
    const b = new Circle(new Complex(x2*cos2, x2*sin2), START_SIZE);
    const c = new Circle(new Complex(x*cos2 - y*sin2, x*sin2 + y*cos2), (OFFSET/180) * (-OUTER_CIRCLE_SIZE-START_SIZE));
    
    a.draw();
    b.draw();
    c.draw();
    
    const origCircles = [a,b,c];
    circles[a.id] = [b, c];
    circles[b.id] = [a, c];
    circles[c.id] = [a, b];
    
    
    iterate(ITERATIONS, origCircles);
}




/**
 * Applies the Cantor Pairing function to a given (integer) input point. Maps inputs to the positive plane beforehand, so works for negative points also.
 * @param {Number} x The x-coordinate
 * @param {Number} y The y-coordinate
 * @returns {Number} The unique natural number representing the 2D input.
 */
function cantorPairing(x, y) {
    const a = (x < 0) ? -2*x - 1 : 2*x;
    const b = (y < 0) ? -2*y - 1 : 2*y;
    return Math.floor(0.5*(a+b)*(a+b+1)+b);
}

/**
 * Returns the rotation matrix of the given angle plus the original ROTATION.
 * @param {Number} angle Angle to rotate by, given in degrees.
 * @returns 2x1 matrix, [sin, cos].
 */
function getCircleOrient(angle) {
    return [Math.sin(toRadians(ROTATION+angle)), Math.cos(toRadians(ROTATION+angle))];
}

/**
 * Converts from degrees to radians.
 * @param {Number} angle Angle in degrees.
 * @returns {Number} Angle in radians.
 */
function toRadians(angle) {
    return angle*Math.PI/180;
}

/**
 * Given three circles, calculate the position(s) of and return the fourth bounding circle(s).
 * @param {Circle} circle1 First circle.
 * @param {Circle} circle2 Second circle.
 * @param {Circle} circle3 Third circle.
 * @param {Boolean} getBoth True if both circles should be found; false if only the positive should be returned.
 * @returns {[Circle, Circle]} A pair of Circles. Second is undefined if getBoth is false.
 */
function getBoundingCircles(circle1, circle2, circle3, getBoth=false) {
  
    const r4 = calcRadius(circle1.c, circle2.c, circle3.c, getBoth);
    const [c1p1, c2p2, c3p3] = [circle1.centre.scale(circle1.c), circle2.centre.scale(circle2.c), circle3.centre.scale(circle3.c)];
    const [L, R] = 
    [
        c1p1.add(c2p2).add(c3p3), 
        Complex.sqrt(c1p1.multiply(c2p2.add(c3p3)).add(c2p2.multiply(c3p3))).scale(2)
    ];

    if (getBoth) {
        const p4 = calcWhichPoint(L, R, r4[0], false);
        const p5 = calcWhichPoint(L, R, r4[1], true);

        const out = [new Circle(p4, r4[0]), new Circle(p5, r4[1])];
        circles[out[0].id] = [circle1, circle2, circle3];
        circles[out[1].id] = [circle1, circle2, circle3];
        return out;
    } 

    else {
        const p4 = calcWhichPoint(L, R, r4, false); 

        const out = new Circle(p4, r4);
        circles[out.id] = [circle1, circle2, circle3];
        return out;
    }

}

/**
 * Calculate the position of the fourth circle.
 * @param {Number} L c1p1+c2p2+c3p3
 * @param {Number} R 2sqrt(c1p1*c2p2 + c2p2*c3p3 + c3p3*c3p1)
 * @param {Number} r Radius of the fourth circle.
 * @param {Boolean} reverse True to return the negative output.
 * @returns {Complex} Position of the centre of the fourth circle.
 */
function calcWhichPoint(L, R, r, reverse) {
    const pos = L.add(R).scale(r);
    const neg = L.sub(R).scale(r);
    return (reverse) ? ((pos.sqabs <= neg.sqabs) ? pos : neg) : ((pos.sqabs > neg.sqabs) ? pos : neg);
}

/**
 * Applies Descartes' Theorem: given the curvatures of three kissing circles, returns the radius of the fourth bounding it.
 * @param {Number} c1 Curvature (1/r) of the first circle.
 * @param {Number} c2 Curvature (1/r) of the second circle.
 * @param {Number} c3 Curvature (1/r) of the third circle.
 * @param {Boolean} getBoth If true, will return both possible radii; if false, will return the positive only.
 * @returns {Number} Radius (Radii) of the fourth kissing circle(s).
 */
function calcRadius(c1, c2, c3, getBoth=false) {
    /*formula is 1/(c1 + c2 + c3 +/- 2 * math.sqrt(abs(c1*c2 + c2*c3 + c3*c1)));
    the negative form is used for circles with larger radii than the three given.*/
    const [L, R] = [c1+c2+c3, 2*Math.sqrt(Math.abs(c1*(c2+c3)+c2*c3))];

    return (getBoth) ? [1/(L+R), 1/(L-R)] : 1/(L+R);
}

/**
 * Used for calling getBoundingCircles. Determines if getBoth is required of not.
 * @param {Circle} circle1 First circle.
 * @param {Circle} circle2 Second circle.
 * @param {Circle} circle3 Third circle.
 * @returns {[Circle, Circle]} Pair of the two circles bounding the given three.
 */
function generate(circle1, circle2, circle3) {
    var first, second;
    if (circle1.r < 0 || circle2.r < 0 || circle3.r < 0) {
        //call with getBoth
        [first, second] = getBoundingCircles(circle1, circle2, circle3, true);
        first.draw();
        second.draw();
    } else {
        //call without getBoth (so as not to generate a circle we already have)
        first = getBoundingCircles(circle1, circle2, circle3);
        first.draw();
    }
    return [first, second];
}

/**
 * Completes one iteration, i.e., calls generate on all circle triplets with at least one made in the previous generation.
 * @param {Number} iters Number of iterations to process.
 * @param {Array} newCirclesFromLastIteration Array of all circles generated by the previous generation.
 */
function iterate(iters, newCirclesFromLastIteration) {
    if (iters > 0) {
        var connections = [];
        var newCircles = [];
        var processed = [];
        for (var c of newCirclesFromLastIteration) {
            connections = difference(circles[c.id], processed);
            const pairs = getPairs(connections);
            for (var pair of pairs) {
                const gen = generate(c, pair[0], pair[1]);
                //console.log(gen);
                for (var g of gen) {
                    if (g !== undefined && g.exists) {
                        newCircles.push(g);
                    }
                }
            }
            processed.push(c);
        }
        //console.log("ITERATION " + (ITERATIONS - iters + 1) + ": ", newCircles)

        iterate(iters-1, newCircles);
    }

}

/**
 * Returns an array containing all permutations of length two of the input array.
 * @param {Array} l An array.
 * @returns {Array} Array of arrays containing all unique pairs.
 */
function getPairs(l) {
    var out = [];
    for (var i = 0; i < l.length; i++) {
        for (var j = i+1; j < l.length; j++) {
            out.push([l[i], l[j]]);
        }
    }
    return out;
}

/**
 * Returns the set difference between two arrays.
 * @param {Array} a First input array.
 * @param {Array} b Second input array
 * @returns {Array} The set difference.
 */
function difference(a, b) {
    return a.filter(function(i) {return b.indexOf(i) < 0;});
}