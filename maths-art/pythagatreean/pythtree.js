import * as bc from '../../modules/basicCanvas.js'

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
ctx.canvas.width = ctx.canvas.height = Math.min(window.innerWidth/1.5, window.innerHeight/1.5);
ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);

ITERATIONS = 10;
ANGLE = 30;
BASE_LENGTH = 100;
SECOND_LENGTH = 20;

$(document).ready(function() {
    $('#iterationsSlider').click(function (e) {
        ITERATIONS = e.value;
        render()
    });
})


function drawSquare(ctx, x1, y1, x2, y2, col="#fff") {
    drawShape(ctx, [[x1, y1], [x2, y1], [x2, y2], [x1, y2]], true, col);
}

function render() {
    
}