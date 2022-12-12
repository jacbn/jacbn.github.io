/**
 * Draws a circle.
 * @param {Number} x x-coordinate of the circle.
 * @param {Number} y y-coordinate of the circle.
 * @param {Number} r Radius of the circle.
 * @param {string} col The colour, as a hex string. Include the hash. Defaults to white.
 */
export function drawCircle(ctx, x, y, r, col='#fff', fill=false) {
    ctx.beginPath();
    ctx.arc(x, y, Math.abs(r), 0, 2 * Math.PI);
    ctx.strokeStyle = col;
    if (fill) {
        ctx.fillStyle = col;
        ctx.fill();
    } else {
        ctx.stroke();
    }
    
}


/**
 * Draws a shape using a set of coordinates.
 * @param {any} ctx The canvas context.
 * @param {Array} path Coordinates of the corners of the shape. Given in the form [[x1, y1], [x2, y2], ...].
 * @param {Boolean} closed Whether to close the shape or not. Defaults to true.
 * @param {string} col Colour of the shape, given in hex.
 */
export function drawShape(ctx, path, closed=true, col="#fff") {
    ctx.beginPath();
    for (var i of path) {
        ctx.lineTo(i[0], i[1]);
    }
    if (closed) {
        ctx.closePath();
    }
    ctx.strokeStyle = col;
    ctx.stroke();
}