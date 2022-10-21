/// <reference path="../../typings/globals/jquery/index.d.ts" />

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
var lineBreaks = 0;
var isNewLine = 0;

//$('#output1').on('input', e => {colorInput(e);});
document.getElementById("output1").addEventListener("input", e => {colorInput(e)}, false);
colorInput(1);

function colorInput(e) {
    var num = (typeof e == "number") ? e : ((e) ? $(e.target).prop('id').substring(6) : 1);
    
    const output = $('#output' + num);
    const htmlEl = document.getElementById("output" + num);

    // console.log($(output.target));

    //find output.target and replace the below innertext bit with the text in that

    const caretIndex = getCaretIndex(htmlEl);

    const newText = splitInput(output.prop('innerText'), num);
    if (typeof newText == 'str' && newText.trim() == '') return;
    output.html(newText);

    console.log(isNewLine);
    setCaretIndex(htmlEl, caretIndex + isNewLine);


    var boxWidth = $('#card' + num).width();
    fontSize = 48;
    output.css('font-size', '48pt');
    output.css('padding-top', '80px');

    while (output.height() > targetHeight) {
        output.css('padding-top', '60px');
        fontSize -= 2;
        output.css('font-size', fontSize.toString() + 'pt');
    }

    if (fontSize == 48) {
        if (boxWidth > 0 && (textWidth > boxWidth || lineBreaks > 0)) { // if there's a line break on the card. > 0 check for uninitialised weirdness
            output.css('padding-top', '60px');
            output.css('font-size', '48pt');
        } else {
            output.css('padding-top', '80px');
            output.css('font-size', '48pt');
        }
    }
}

function splitInput(entryBox, cardIndex) {
    input = entryBox;
    if (input.trim() == '') {
        return '';
    }

    isNewLine = 0;
    console.log(input.slice(-1));
    if (input.slice(-1) == '\n') {
        isNewLine = 1;
    }

    splits = [];
    index = 0;
    var inputToProcess = input.toLowerCase();
    textWidth = getTextWidth(inputToProcess, cardIndex)
    genRegexpResults(inputToProcess);
    var _breakExists = false;
    lineBreaks = 0;
    while (inputToProcess.length > 0) {
        var g = takeGrapheme(inputToProcess, index);
        if (g[0] == '\n') {
            splits.push("<br>");
            _breakExists = true;
            lineBreaks++;
        } else {
            for (char of input.substring(index, index+g[1])) {
                splits.push(constructSpan(char, phaseColors[g[2]]));
            }
        }
        inputToProcess = inputToProcess.substring(g[1]);
        index += g[1];
    }
    if (!_breakExists) lineBreaks = 0;
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

//courtesy of https://javascript.plainenglish.io/how-to-find-the-caret-inside-a-contenteditable-element-955a5ad9bf81
function getCaretIndex(element) {
    let position = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
            const range = window.getSelection().getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            position = preCaretRange.toString().length;
        }
    }
    return position;
}

function setCaretIndex(element, index) {
    var range = document.createRange();
    var selection = window.getSelection();

    const breaks = $(element).children().slice(0,index).filter('br');
    
    range.setStart(element, index+breaks.length);
    range.collapse(true)
    
    selection.removeAllRanges();
    selection.addRange(range);
}