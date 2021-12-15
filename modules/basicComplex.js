export default class Complex {
    constructor(inp, im=0) {
        if (Array.isArray(inp)) {
            //then input given as [re, im]
            this.re = inp[0];
            this.im = inp[1];
        } else {
            //otherwise, assume re/im were given separately
            this.re = inp;
            this.im = im;
        }
    }
    
    add(a) {
        if (a instanceof Complex) {
            return new Complex(this.re+a.re, this.im+a.im);
        } else {
            return new Complex(this.re+a, this.im);
        }
    }

    sub(a) {
        if (a instanceof Complex) {
            return new Complex(this.re-a.re, this.im-a.im);
        } else {
            return new Complex(this.re-a, this.im);
        }   
    }

    multiply(a) {
        return new Complex(this.re*a.re-this.im*a.im, this.re*a.im+this.im*a.re);
    }

    scale(a) {
        return new Complex(this.re*a, this.im*a);
    }

    /**
     * Return the (principal [+ve real part]) square root of a given complex number. Use Complex.nsqrt for the secondary root.
     * @param {Complex} a The value to square root.
     * @returns {Complex} sqrt(a)
     */
    static sqrt(a) {
        if (a.im == 0) {
            return (a.re >= 0) ? new Complex(Math.sqrt(a.re), 0) : new Complex(0, Math.sqrt(-a.re));
        } else {
            const r = a.abs;
            const x = a.add(r);
            return x.scale(Math.sqrt(r)/(x.abs));
        }
    }

    /**
     * Return the (secondary [-ve real part]) square root of a given complex number. Use Complex.sqrt for the principal root.
     * @param {Complex} a The value to square root.
     * @returns {Complex} sqrt(a)
     */
    static nsqrt(a) {
        const z = new Complex(0, 0);
        return z.sub(Complex.sqrt(a));
    }

    get sqabs() {
        return this.re*this.re + this.im*this.im;
    }

    get abs() {
        return Math.sqrt(this.sqabs);
    }

    get arg() {
        return Math.atan2(this.re, this.im);
    }

    get conjugate() {
        return new Complex(this.re, -this.im);
    }
}