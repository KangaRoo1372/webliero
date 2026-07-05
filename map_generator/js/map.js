class MapModel {

    constructor(width, height) {

        this.width = width;
        this.height = height;

        this.pixels = new Uint8Array(width * height);

    }

    clear(value = 164) {

        this.pixels.fill(value);

    }

    getIndex(x, y) {

        return y * this.width + x;

    }

    set(x, y, value) {

        if (
            x < 0 ||
            y < 0 ||
            x >= this.width ||
            y >= this.height
        ) {
            return;
        }

        this.pixels[this.getIndex(x, y)] = value;

    }

}

window.MapModel = MapModel;