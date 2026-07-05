const canvas =
    document.getElementById("canvas");

const palette =
    new Palette();

const renderer =
    new Renderer(
        canvas,
        palette
    );

function generate() {

    const width =
        parseInt(
            document.getElementById("mapWidth").value
        );

    const height =
        parseInt(
            document.getElementById("mapHeight").value
        );

    const seed =
        parseInt(
            document.getElementById("seed").value
        );

    const rng =
        new RNG(seed);

    const map =
        new MapModel(
            width,
            height
        );

    map.clear(164);

    for (let i = 0; i < 30; i++) {

        const x =
            rng.int(0, width - 80);

        const y =
            rng.int(0, height - 20);

        const w =
            rng.int(20, 80);

        const h =
            rng.int(3, 8);

        for (let yy = y; yy < y + h; yy++) {

            for (let xx = x; xx < x + w; xx++) {

                map.set(xx, yy, 80);

            }

        }

    }

    renderer.resize(
        width,
        height
    );

    renderer.render(map);

}

document
    .getElementById("generate")
    .onclick = generate;

generate();