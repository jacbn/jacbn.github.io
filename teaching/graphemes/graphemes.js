/// <reference path="../../typings/globals/jquery/index.d.ts" />

const canvas = getTextWidth.canvas = document.createElement("canvas");
const context = canvas.getContext("2d");

class Grapheme {
    constructor(value, phase) {
        this.value = value;
        this.phase = phase;
        this.length = value.length;
    }
}

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
    cat
    brochure
    school
    Q, by itself

TODO:
    above
    allow multiple newlines
*/

var textWidth;
var fontSize = 48;
const targetHeight = $('#card1').height() - 40 - $('#card1top').height();
var lineBreaks = 0;

var cardStrings = [''];

//$('#output1').on('input', e => {colorInput(e);});
document.getElementById("output1").addEventListener("input", e => {colorInput(e)}, false);
colorInput(1);

function colorInput(e) {
    var num = (typeof e == "number") ? e : ((e) ? $(e.target).prop('id').substring(6) : 1);
    const output = $('#output' + num);

    const htmlEl = document.getElementById("output" + num);
    const caretIndex = getCaretIndex(htmlEl);
    
    // we use a zero-width space (\u200b) to allow newlines to propagate, such that when you press enter it actually shows a new line.
    // it's a little problematic in other areas (see other comments), but the best of bad options
    var inputText = output.prop('innerText');
    inputText = inputText.replace('\u200b', '');
    if (inputText.trim() == '') {
        output.html('');
        setTextSize(num);
        output.css('font-size', '48pt');
        output.css('padding-top', '80px');
        return;
    }
    while (inputText.includes('\n\n')) {
        inputText = inputText.replace('\n\n', '\n');
    }
    inputText += '\u200b'

    if (e.inputType == "deleteContentBackward") {
        if (caretIndex == inputText.length) {
            // then we're supposed to be deleting the last character, but thanks to \u200b we'll have deleted that instead
            // so delete the now-last character in addition
            inputText = inputText.substring(0, inputText.length-1);
        }
        // else, the user will have selected a character to delete, so all we need to do is set the caret to the right place
    }

    

    const newText = splitInput(inputText, num);
    if (typeof newText == 'str' && newText.trim() == '') return;
    output.html(newText);

    setCaretIndex(htmlEl, caretIndex);

    setTextSize(num);
}

function setTextSize(cardNum) {
    const output = $('#output' + cardNum);
    const boxWidth = $('#card' + cardNum).width();
    fontSize = 48;
    output.css('font-size', '48pt');
    output.css('padding-top', '80px');

    while (output.height() > targetHeight) {
        output.css('padding-top', '60px');
        fontSize -= 2;
        output.css('font-size', fontSize.toString() + 'pt');
    }

    if (fontSize == 48) {
        if ((boxWidth > 0 && (textWidth > boxWidth)) || output.prop('innerText').includes('\n')) {
            // i.e. if there's a line break on the card. > 0 check for uninitialised weirdness
            output.css('padding-top', '60px');
            output.css('font-size', '48pt');
        } else {
            output.css('padding-top', '80px');
            output.css('font-size', '48pt');
        }
    }

    output.css('padding-bottom', Math.min(100, 200-output.height()));
}

function splitInput(entryBox, cardIndex) {
    input = entryBox;
    if (input.trim() == '') {
        return '';
    }
    
    // console.log("WHOLE INPUT: " + input.split('').map((e) => e.charCodeAt(0)).join(','));

    splits = [];
    index = 0;

    const original = input.toLowerCase();
    var inputToProcess = input.toLowerCase();
    textWidth = getTextWidth(inputToProcess, cardIndex)
    
    while (inputToProcess.length > 0) {
        const grapheme = takeGrapheme(original, inputToProcess, index);
        // console.log(grapheme.value + ": " + grapheme.value.charCodeAt(0) + "; " + '\n'.charCodeAt(0));
        if (grapheme.value == '\n') {
            splits.push($("<span>").html("<br>"));
        } else {
            for (char of input.substring(index, index+grapheme.length)) {
                splits.push(constructSpan(char, phaseColors[grapheme.phase]));
            }
        }
        // console.log("grapheme " + grapheme.value + " length: " + grapheme.length);
        inputToProcess = inputToProcess.substring(grapheme.length);
        index += grapheme.length;
    }

    return splits;
}

// compare then take the superior grapheme match (standard / regex).
// @return value of the form [grapheme, length, phase]
function takeGrapheme(original, string, index) {
    var standard = takeStandard(string);
    var regexp = takeRegexp(original, index);
    // prioritise by phase, or take regexp if equal
    return (regexp.phase >= standard.phase && regexp.phase != 0) ? regexp : standard;
}

// take the best standard grapheme match from the string
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
        if (string.charAt(0) == '\n' && string.length >= 2 && string.charAt(1) == '\n') {
            bestMatch = '\n\n';
        } else {
            bestMatch = string.charAt(0);
        }
    }
    return new Grapheme(bestMatch, phase);
}

// take the best regexp match from the string at the given index
function takeRegexp(string, index) {
    var bestMatch = '';
    var phase = 0;
    const regexpResults = genRegexpResults(string); // see ./phases.js
    for (result of regexpResults) {
        if (index == result.index && result.phase > phase) {
            bestMatch = result[0];
            phase = result.phase;
        }
    }
    
    return new Grapheme(bestMatch, phase);
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

//modified from https://discourse.mozilla.org/t/how-to-get-the-caret-position-in-contenteditable-elements-with-respect-to-the-innertext/91068
function getCaretIndex(element) {
    let position = 0;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
            const _range = document.getSelection().getRangeAt(0); 
            if (!_range.collapsed) { 
                return null; 
            } 
            const range = _range.cloneRange(); 
            const temp = document.createTextNode("\0"); 
            range.insertNode(temp); 
            const caretposition = element.innerText.indexOf("\0"); 
            temp.parentNode.removeChild(temp); 
            return Math.max(0, caretposition);          
        }
    }    
    
    return position;
}

function setCaretIndex(element, index) {
    var range = document.createRange();
    var selection = window.getSelection();

    try {
        range.setStart(element, index);
        range.collapse(true);
    } catch (e) {
        range.setStart(element, element.children.length);
        range.collapse(true);
    }
    
    
    selection.removeAllRanges();
    selection.addRange(range);
}