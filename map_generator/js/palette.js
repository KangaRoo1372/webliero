class Palette {

    constructor() {

        this.colors = [];

        for (let i = 0; i < 256; i++) {

            this.colors.push([
                i,
                i,
                i
            ]);

        }

    }

    get(index) {

        return this.colors[index];

    }

}

window.Palette = Palette;