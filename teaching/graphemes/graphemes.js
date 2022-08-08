/// <reference path="../../typings/globals/jquery/index.d.ts" />

var input = document.getElementById('main-entry');
var output = document.getElementById("output");

const canvas = getTextWidth.canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

var textWidth;

const phaseColours = {
    0 : "#000",
    2 : "#fc0",
    3 : "#c9f",
    4 : "#0f0",
    5 : "#c06",
    6 : "#f00",
}

/*
WORDS TO FIX BEFORE RELEASE:
    brochure
    school
*/

var regexpResults = [];
const targetHeight = 220;
var fontSize = 48;
colourInput();


if (input.addEventListener) {
    input.addEventListener('input', function() {colourInput();}, false);
} else if (input.attachEvent) {
    input.attachEvent('onpropertychange', function() {colourInput();});
}

function colourInput() {
    const output = $('#output')
    output.html(splitInput($('#main-entry').val()));
    const boxWidth = $('#card1').width();

    fontSize = 48;
    output.css('font-size', '48pt');

    while (output.outerHeight() > targetHeight) {
        console.log("YEE");
        output.css('padding', '2.5vw 0 0 0');
        fontSize -= 2;
        output.css('font-size', fontSize.toString() + 'pt');
    }

    if (fontSize == 48) {
        if (textWidth > boxWidth) {
            output.css('padding', '2.5vw 0 0 0');
            output.css('font-size', '48pt');
        } else {
            output.css('padding', '4vw 0 1vw 0');
            output.css('font-size', '48pt');
        }
    }
}

function splitInput(input) {
    input = input.trim();
    if (input == '') {
        const txt = "Enter text above...";
        textWidth = getTextWidth(txt);
        return $("<span>").text(txt).css({color: "#aaa"});
    }
    splits = [];
    index = 0;
    var inputToProcess = input.toLowerCase();
    textWidth = getTextWidth(inputToProcess)
    genRegexpResults(inputToProcess);
    while (inputToProcess.length > 0) {
        var g = takeGrapheme(inputToProcess, index);
        splits.push(constructSpan(input.substring(index, index+g[1]), phaseColours[g[2]]));
        inputToProcess = inputToProcess.substring(g[1]);
        index += g[1];
    }
    return splits;
}

function takeGrapheme(string, index) {
    var standard = takeStandard(string);
    var regexp = takeRegexp(index);
    // prioritise by phase, or take regexp if equal
    return (regexp[2] >= standard[2] && regexp[2] != 0) ? regexp : standard;
}

function takeStandard(string) {
    var bestMatch = '';
    var phase = 0;
    graphemes.forEach((v, k) => {
        if (string.startsWith(k) && (v > phase || (v == phase && k.length > bestMatch.length))) {
            bestMatch = k;
            phase = v;
        }
    });
    if (bestMatch == '') {
        bestMatch = string[0];
    }
    return [bestMatch, bestMatch.length, phase];
}

function genRegexpResults(original) {
    regexpResults = [];
    var result = [];
    var matchIndex = 0;
    for (pair of graphemeRegexps) {
        var copy = original;
        var match = copy.match(pair[0]);
        var removedChars = 0;
        for (_ in match) {
            result = pair[0].exec(copy);
            result.index += removedChars;
            result.phase = pair[1];
            regexpResults.push(result);

            pair[0].lastIndex = 0;
            matchIndex = copy.indexOf(match[0]);
            copy = copy.substring(0, matchIndex).concat(copy.substring(matchIndex + match[0].length));
            removedChars += match[0].length;
        }
    }
}

function takeRegexp(index) {
    var bestMatch = '';
    var phase = 0;
    for (result of regexpResults) {
        if (index == result.index && result.phase > phase) {
            bestMatch = result[0];
            phase = result.phase;
        }
    }
    
    return [bestMatch, bestMatch.length, phase];
}

function constructSpan(text, colour) {
    return $("<span>").text(text).css({color: colour});
}


function getTextWidth(text) {
    context.font = getCanvasFont();
    const metrics = context.measureText(text);
    return metrics.width;
}

function getCanvasFont(el = $('#output')) {
  return `${el.css('font-weight')} 48pt ${el.css('font-family')}`;
}