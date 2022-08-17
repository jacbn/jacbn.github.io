const p2 = "s a t p i m n d g o c k ck e u r h b f l".split(' ');
const p3 = "j v w x z zz qu ch sh th ng ai ee oa oo ar or ur ow oi igh ear air ure".split(' ');
const p5 = "ay ou ie ea oy ir eu aw ey wh ph ew oe au ould oup slow cc".split(' ');
const p3regexps_r = [/\by/g, /er\b/g];
const p5regexps = "a.e e.e i.e o.e u[^r]e (?<=a)ti(?=on|a) (?<=gr|l)ow(?!l) (?<=nd|sh|t)ow (?<=b)ow(?=l)".split(' ');
const p5regexps_r = [/er\B/g, /\By/g, /\buni/g, /(\b|[aeiou])c[aeiouy]/g, /mb\b/g];

var graphemes = new Map();
var graphemeRegexps = new Map();
p2.map((x) => graphemes.set(x, 2));
p3.map((x) => graphemes.set(x, 3));
p5.map((x) => graphemes.set(x, 5));
p3regexps_r.map((x) => graphemeRegexps.set(x, 3));
p5regexps.map((x) => graphemeRegexps.set(new RegExp(x, "g"), 5));
p5regexps_r.map((x) => graphemeRegexps.set(x, 5));