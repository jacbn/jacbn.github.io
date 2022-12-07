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
    brochure
    school
    Q, by itself
*/

var textWidth;
var fontSize = 48;
const targetHeight = $('#card1').height() - 20 - $('#card1top').height();
var lineBreaks = 0;

var cardStrings = [''];

//$('#output1').on('input', e => {colorInput(e);});
document.getElementById("output1").addEventListener("input", e => {colorInput(e)}, false);
colorInput(1);

function colorInput(e) {
    var num = (typeof e == "number") ? e : ((e) ? $(e.target).prop('id').substring(6) : 1);
    
    const output = $('#output' + num);
    const htmlEl = document.getElementById("output" + num);

    // console.log($(output.target));

    // find output.target and replace the below innertext bit with the text in that

    const caretIndex = getCaretIndex(htmlEl);
    
    // if (e.data != undefined) {
    //     console.log("LETTER: " + e.data + "; INDEX: " + caretIndex);
    //     cardStrings[num-1] = cardStrings[num-1].substring(0, caretIndex-1) + e.data + cardStrings[num-1].substring(caretIndex-1);
    //     console.log(cardStrings);
    //     $('#entry1').val(cardStrings[num-1]);
    // } else {
    //     console.log("backspace; INDEX: " + caretIndex);
    // }
    

    const newText = splitInput(output.prop('innerText'), num);
    if (typeof newText == 'str' && newText.trim() == '') return;
    output.html(newText);

    setCaretIndex(htmlEl, caretIndex);


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

    input = input.replace('\u200b', '');
    while (input.includes('\n\n')) {
        input = input.replace('\n\n', '\n');
    }
    input += '\u200b'

    console.log("WHOLE INPUT: " + input.split('').map((e) => e.charCodeAt(0)).join(','));

    splits = [];
    index = 0;
    lineBreaks = 0;
    var _breakExists = false;

    var inputToProcess = input.toLowerCase();
    textWidth = getTextWidth(inputToProcess, cardIndex)
    
    while (inputToProcess.length > 0) {
        const grapheme = takeGrapheme(inputToProcess, index);
        // console.log(grapheme.value + ": " + grapheme.value.charCodeAt(0) + "; " + '\n'.charCodeAt(0));
        if (grapheme.value == '\n') {
            splits.push($("<span>").html("<br>"));
            _breakExists = true;
            lineBreaks++;
            // if (lineBreaks == 0) {
            //     splits.push($("<span>").html("<br>"));
            // }
        } else {
            for (char of input.substring(index, index+grapheme.length)) {
                splits.push(constructSpan(char, phaseColors[grapheme.phase]));
            }
        }
        inputToProcess = inputToProcess.substring(grapheme.length);
        index += grapheme.length;
    }
    if (!_breakExists) lineBreaks = 0;

    return splits;
}

// compare then take the superior grapheme match (standard / regex).
// @return value of the form [grapheme, length, phase]
function takeGrapheme(string, index) {
    var standard = takeStandard(string);
    var regexp = takeRegexp(string, index);
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
    index
    const children = $(element).children().toArray();
    const breaks = Math.max(0, children.filter((el) => el.innerHTML == '<br>').length-1);
    console.log(children);
    
    // range.setStart(element, index+breaks);
    // range.collapse(true);

    // console.log("text: " + $(element).text());

    // l = $(element).text().length;
    l = $(element).prop('childNodes').length;

    range.setStart(element, l);
    range.collapse(true);
    
    selection.removeAllRanges();
    selection.addRange(range);
}