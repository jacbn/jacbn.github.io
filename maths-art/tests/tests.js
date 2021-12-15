import * as vec2 from '../../modules/vec2.js';
import * as cc from '../../modules/colourConversions.js';
import * as bc from '../../modules/basicCanvas.js'
import Complex from '../../modules/basicComplex.js'

const canvas = document.getElementById("mainCanvas");
const ctx = canvas.getContext("2d");
ctx.setTransform(1, 0, 0, -1, canvas.width/2, canvas.height/2);

