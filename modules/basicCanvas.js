/**
 * Draws a circle.
 * @param {Number} x x-coordinate of the circle.
 * @param {Number} y y-coordinate of the circle.
 * @param {Number} r Radius of the circle.
 * @param {string} col The colour, as a hex string. Include the hash. Defaults to white.
 */
export function drawCircle(ctx, x, y, r, col='#fff') {
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(r), 0, 2 * Math.PI);
    ctx.strokeStyle = col;
    ctx.stroke();
}


/**
 * Draws a closed shape using a set of coordinates.
 * @param {string} col Colour of the shape, given in hex.
 * @param {...any} args Coordinates of the corners of the shape. Given in the form [x1, y1], [x2, y2]... 
 */
export function drawClosedShape(ctx, col, ...args) {
    ctx.beginPath();
    for (var i of args) {
        ctx.lineTo(i[0], i[1]);
    }
    ctx.closePath();
    ctx.strokeStyle = col;
    ctx.stroke();
}