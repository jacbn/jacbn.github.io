//hsl-rgb conversions created by mjijackson: 
//https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c


/**
 * Converts from the HSL colour space to RGB.
 * @param {Number} h Hue, 0-359
 * @param {Number} s Saturation, 0-1
 * @param {Number} l Lightness, 0-1
 * @returns [r, g, b], each ranging 0-255.
 */
export function hslToRgb(h, s, l){
    var r, g, b;
    h /= 360;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts from the RGB colour space to HSL.
 * @param {Number} r red, 0-255
 * @param {Number} g green, 0-255
 * @param {Number} b blue, 0-255
 * @returns [h, s, l] with h ranging from 0-359, s and l ranging from 0-1.
 */
export function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

//hex conversions my own

/**
 * Convert from a hex representation of the RGB colour space to HSL.
 * @param {string} col Hex valued colour. Includes the hash.
 * @returns [h, s, l] with h ranging from 0-359, s and l ranging from 0-1.
 */
export function hexToHsl(col) {
    return rgbToHsl(
        parseInt('0x' + col.charAt(1) + col.charAt(2)),
        parseInt('0x' + col.charAt(3) + col.charAt(4)),
        parseInt('0x' + col.charAt(5) + col.charAt(6))
    );
}

/**
 * Converts from the HSL colour space to a hex representation of RGB.
 * @param {Number} h Hue, 0-359
 * @param {Number} s Saturation, 0-1
 * @param {Number} l Lightness, 0-1
 * @returns {string} Hex representation (of RGB). Includes the hash.
 */
export function hslToHex(h, s, l) {
    const [r, g, b] = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
}

/**
 * Converts from RGB to hex.
 * @param {Number} r red, 0-255
 * @param {Number} g green, 0-255
 * @param {Number} b blue, 0-255
 * @returns {string} Hex representation. Includes the hash.
 */
export function rgbToHex(r, g, b) {
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
}