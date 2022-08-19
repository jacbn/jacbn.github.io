/// <reference path="../../typings/globals/jquery/index.d.ts" />

var input = document.getElementById('entry1');
var output = document.getElementById("output1");

const canvas = getTextWidth.canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

const phaseColors = {
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
    Q, by itself
*/

var textWidth;
var regexpResults = [];
var fontSize = 48;
const targetHeight = $('#card1').height() - 20 - $('#card1top').height();
var lineBreak = false;

$('#entry1').on('input', e => {colorInput(e);});
colorInput(1);

function colorInput(e) {
    var num = (typeof e == "number") ? e : ((e) ? $(e.target).prop('id').substring(5) : 1);
    
    const output = $('#output' + num);
    output.html(splitInput($('#entry' + num), num));
    var boxWidth = $('#card' + num).width();

    fontSize = 48;
    output.css('font-size', '48pt');

    while (output.height() > targetHeight) {
        output.css('padding-top', '60px');
        fontSize -= 2;
        output.css('font-size', fontSize.toString() + 'pt');
    }

    if (fontSize == 48) {
        if (boxWidth > 0 && (textWidth > boxWidth || lineBreak)) { // if there's a line break on the card. > 0 check for uninitialised weirdness
            output.css('padding-top', '60px');
            output.css('font-size', '48pt');
        } else {
            output.css('padding-top', '80px');
            output.css('font-size', '48pt');
        }
    }
}

function splitInput(entryBox, cardIndex) {
    input = entryBox.val().trim();
    if (input == '') {
        const txt = "Enter text...";
        textWidth = getTextWidth(txt, cardIndex);
        return $("<span>").text(txt).css({color: "#bbb"});
    }
    splits = [];
    index = 0;
    var inputToProcess = input.toLowerCase();
    textWidth = getTextWidth(inputToProcess, cardIndex)
    genRegexpResults(inputToProcess);
    var _breakExists = false
    while (inputToProcess.length > 0) {
        var g = takeGrapheme(inputToProcess, index);
        if (g[0] == '\n') {
            splits.push("<br>");
            _breakExists = true;
            lineBreak = true;
        } else {
            splits.push(constructSpan(input.substring(index, index+g[1]), phaseColors[g[2]]));
        }
        inputToProcess = inputToProcess.substring(g[1]);
        index += g[1];
    }
    if (!_breakExists) lineBreak = false;
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

function constructSpan(text, color) {
    return $("<span>").text(text).css({color: color});
}

function getTextWidth(text, cardIndex) {
    context.font = getCanvasFont($('#card' + cardIndex));
    const metrics = context.measureText(text);
    return metrics.width;
}

function getCanvasFont(card) {
    return `${card.css('font-weight')} 48pt ${card.css('font-family')}`;
}