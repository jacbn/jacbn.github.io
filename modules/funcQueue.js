export default class Queue {
    constructor(items = []) {
        this.top = items;
        this.bottom = [];
    }

    push(i) {
        this.bottom.push(i);
        this.swapIfEmpty();
    }

    pop() {
        const i = this.top.pop();
        this.swapIfEmpty();
        return i;
    }

    swapIfEmpty() {
        if (this.top.length == 0) {
            this.top = this.bottom.reverse();
            this.bottom = [];
        }
    }

    get length() {
        return this.top.length + this.bottom.length;
    }
}