class RNG {

    constructor(seed = 1) {

        this.seed = seed >>> 0;

    }

    next() {

        let x = this.seed;

        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;

        this.seed = x >>> 0;

        return this.seed / 4294967296;

    }

    int(min, max) {

        return Math.floor(
            this.next() * (max - min + 1)
        ) + min;

    }

}

window.RNG = RNG;