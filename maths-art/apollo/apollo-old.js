import * as bc from '../../modules/basicCanvas.js';
import Complex from '../../modules/basicComplex.js';

var canvas = document.getElementById("mainCanvas");
var ctx = canvas.getContext("2d");
ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);

const OUTER_CIRCLE_SIZE = -60;
const RATIO = 0.5;


const START_SIZE = -OUTER_CIRCLE_SIZE*RATIO;
var circles = {};
/*
    circles {}:
        key is a pairing (cantorPairing) of a circle's x and y coordinate.

        contains a mapping from one circle to the three circles it is 
        generated by.

        used for:
            - when deciding which circles to use to generate a fourth,
              consider only sets of three circles, one of which from 
              the most recent generation.
                - i.e. iterate through all pairs of the most recent 
                  generation's connections, gen circle with the new one
                  and each pair. note that each time we do this, one of
                  the generated circles will be the 4th that we didn't
                  pick -- ignore.
*/


class Circle {
    /**
     * Defines a circle on the complex plane.
     * @param {Complex} centre The centre of the circle.
     * @param {Number} r The radius of the circle.
     */
    constructor(centre, r) {
        this.x = centre.re;
        this.y = centre.im;
        this.exists = false;

        this.id = cantorPairing(Math.round(this.x), Math.round(this.y));
        if (this.id in circles) {
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



//const a = new Circle(new Complex(OUTER_CIRCLE_SIZE+START_SIZE, 0), START_SIZE);
//const b = new Circle(new Complex(START_SIZE, 0), -OUTER_CIRCLE_SIZE-START_SIZE);
//const c = new Circle(new Complex(0, 0), OUTER_CIRCLE_SIZE);

//const a = new Circle(new Complex(-40, 30), 50);
//const b = new Circle(new Complex(4.323758872438418, 81.61224384175775), 18.045290840985853);
//const c = new Circle(new Complex(0, 0), -100);

const a = new Circle(new Complex(-50, 0), 50);
//const b = new Circle(new Complex(50, 0), 50);
//const b = new Circle(new Complex(0, -66.66666666666), 33.3333333333);
const b = new Circle(new Complex(-50, -66.66666666666), 16.666666666666);
const c = new Circle(new Complex(0, 0), -100);

a.draw();
b.draw();
c.draw();

const origCircles = [a,b,c];


circles[a.id] = [b, c];
circles[b.id] = [a, c];
circles[c.id] = [a, b];

iterate(3, origCircles);

function cantorPairing(x, y) {
    const a = (x < 0) ? -2*x - 1 : 2*x;
    const b = (y < 0) ? -2*y - 1 : 2*y;
    return Math.floor(0.5*(a+b)*(a+b+1)+b);
}

function getPosition(circle1, circle2, circle3, getBoth=false) {
    //if (circle1.r == OUTER_CIRCLE_SIZE) {circle1.r = -OUTER_CIRCLE_SIZE;}
    //if (circle2.r == OUTER_CIRCLE_SIZE) {circle2.r = -OUTER_CIRCLE_SIZE;}
    //if (circle3.r == OUTER_CIRCLE_SIZE) {circle3.r = -OUTER_CIRCLE_SIZE;}
    var reverse = true;
    //const maxR = Math.max(circle1.r, circle2.r, circle3.r);
    const minR = Math.min.apply(null, [circle1.r, circle2.r, circle3.r].filter(function(i) {return i > 0}));
    const r4 = calcRadius(circle1.c, circle2.c, circle3.c, getBoth);

    //console.log(minR);
    //console.log("---", r4, circle1.r, circle2.r, circle3.r, "---")
    //if (reverse && Math.max.apply(r4) < Math.max(circle1.r, circle2.r, circle3.r)) {
    //    reverse = false;
    //}

    //if (Math.round(Math.max.apply(null, r4)) >= Math.round(maxR)) {
    if (Math.round(Math.max.apply(null, r4)) < Math.round(minR)) {
    //if (Math.max.apply(null, r4) > minR) {
        console.log("YEP");
        reverse = false;
    /*if (circle1.r < 0 || circle2.r < 0 || circle3.r < 0) {
        console.log("one of: ", circle1.r, circle2.r, circle3.r);
        reverse = false;
        //the two generated outputs flip if either of the circles we create
        //are larger than the inputs
    }*/
    }
    //reverse = true;

    const [c1p1, c2p2, c3p3] = [circle1.centre.scale(circle1.c), circle2.centre.scale(circle2.c), circle3.centre.scale(circle3.c)];
    
    const [L, R] = 
    [
        c1p1.add(c2p2).add(c3p3), 
        Complex.sqrt(c1p1.multiply(c2p2.add(c3p3)).add(c2p2.multiply(c3p3))).scale(2)
    ];

    var p4pos, p4neg;

    if (reverse) {
        p4pos = L.add(R).scale(r4[1]);
        p4neg = L.sub(R).scale(r4[0]);
    } else {
        p4pos = L.add(R).scale(r4[0]);
        p4neg = L.sub(R).scale(r4[1]); //is this definitely r4[1]??
    }

    

    if (getBoth) {
        if (reverse) {
            return [new Circle(p4pos, r4[1]), new Circle(p4neg, r4[0])];
        } else {
            return [new Circle(p4pos, r4[0]), new Circle(p4neg, r4[1])];
        }
        
    } else {
        return [new Circle((p4pos.sqabs > p4neg.sqabs) ? p4pos : p4neg, r4[0])];
    }

}


function calcRadius(c1, c2, c3, getBoth) {
    //formula is 1/(c1 + c2 + c3 +/- 2 * math.sqrt(abs(c1*c2 + c2*c3 + c3*c1)));
    //the negative form is used for circles with larger radii than the three given.
    const [L, R] = [c1+c2+c3, 2*Math.sqrt(Math.abs(c1*(c2+c3)+c2*c3))];
    return (getBoth) ? [1/(L+R), 1/(L-R)] : [1/(L+R), null];
}


function iterate(iters, newCirclesFromLastIteration) {
    var connections = [];
    var newCircles = [];
    var processed = [];
    for (var c of newCirclesFromLastIteration) {
        connections = difference(circles[c.id], processed);
        const pairs = getPairs(connections);
        for (var pair of pairs) {
            const positions = getPosition(c, pair[0], pair[1], true);
            for (var circle of positions) {
                if (circle.exists) {
                    circle.draw();
                    circles[circle.id] = [c, pair[0], pair[1]];
                    newCircles.push(circle);
                }
            }
        }
        processed.push(c);
    }

    if (iters > 1) {
        iterate(iters-1, newCircles);
    }

    console.log(circles);
    

    /*
    we have a number of ways of approximating if the largest circle has been found, eg:

    if the largest non-MAX_CIRCLE_SIZE circle's radius > MAX_CIRCLE_SIZE/2
    then we have found the largest circle,

    but this won't work for 3 circles in a triangle shape as the inits.
    as such, rather than approximate in the current iteration:

    at the end of the current iteration, get the max of the radii of all
    circles generated. if this is smaller than the max of last generation,
    the largest has been found.

    this has a delay of knowing when largest has been found of one generation,
    but at least it's 100% accurate.
    */
}

//might just be better to output the 6 pairs directly rather than calculate
//them each time? idk
function getPairs(l) {
    var out = [];
    for (var i = 0; i < l.length; i++) {
        for (var j = i+1; j < l.length; j++) {
            out.push([l[i], l[j]]);
        }
    }
    return out;
}


/*function intersect (a, b) {
    var ai=0, bi=0;
    var result = [];

    while (ai < a.length && bi < b.length) {
        if      (a[ai] < b[bi] ){ ai++; }
        else if (a[ai] > b[bi] ){ bi++; }
        else {
            result.push(a[ai]);
            ai++;
            bi++;
        } 
    }

    return result;
}*/

function difference(a, b) {
    return a.filter(function(i) {return b.indexOf(i) < 0;});
}


