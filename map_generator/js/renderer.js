class Renderer {

    constructor(canvas, palette) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.palette = palette;

    }

    resize(w, h) {

        this.canvas.width = w;
        this.canvas.height = h;

    }

    render(map) {

        const img =
            this.ctx.createImageData(
                map.width,
                map.height
            );

        const data = img.data;

        for (let i = 0; i < map.pixels.length; i++) {

            const rgb =
                this.palette.get(
                    map.pixels[i]
                );

            const p = i * 4;

            data[p] = rgb[0];
            data[p + 1] = rgb[1];
            data[p + 2] = rgb[2];
            data[p + 3] = 255;

        }

        this.ctx.putImageData(img, 0, 0);

    }

}

window.Renderer = Renderer;