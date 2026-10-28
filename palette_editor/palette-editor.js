const editorDiv = document.getElementById("editor");
const rInput = document.getElementById("r");
const gInput = document.getElementById("g");
const bInput = document.getElementById("b");
const colorPicker = document.getElementById("colorPicker");
const colorIndexSpan = document.getElementById("colorIndex");

// Status of both palettes + information which one is currently being edited
const slots = [];
let activeSlot = null;

document.querySelectorAll(".panel").forEach((panel, slotIndex) => {
    const slot = {
        data: [],
        selectedIndex: null,
        panel,
        paletteDiv: panel.querySelector(".palette"),
        fileInput: panel.querySelector(".file-input"),
        saveJsonBtn: panel.querySelector(".save-json"),
        saveLplBtn: panel.querySelector(".save-lpl"),
        saveGplBtn: panel.querySelector(".save-gpl"),
        savePngBtn: panel.querySelector(".save-png")
    };
    slots.push(slot);

    slot.fileInput.addEventListener("change", e => handleFile(e, slotIndex));
    slot.saveJsonBtn.addEventListener("click", () => saveAsJson(slotIndex));
    slot.saveLplBtn.addEventListener("click", () => saveAsLpl(slotIndex));
    slot.saveGplBtn.addEventListener("click", () => saveAsGpl(slotIndex));
    slot.savePngBtn.addEventListener("click", () => saveAsPng(slotIndex));
});

[rInput, gInput, bInput].forEach(input =>
    input.addEventListener("input", () => updateColor("rgb"))
);

colorPicker.addEventListener("input", () => updateColor("picker"));

function getColorType(index) {
    if (
        index === 0 ||
        (index >= 3 && index <= 11) ||
        (index >= 39 && index <= 54) ||
        (index >= 62 && index <= 76) ||
        (index >= 80 && index <= 81) ||
        (index >= 104 && index <= 119) ||
        (index >= 126 && index <= 129) ||
        (index >= 131 && index <= 159) ||
        (index >= 168 && index <= 255)
    ) return "undefined";
    if (
        (index >= 19 && index <= 29) ||
        (index >= 59 && index <= 61) ||
        (index >= 85 && index <= 87) ||
        (index >= 91 && index <= 93) ||
        (index >= 123 && index <= 125)
    ) return "rock";
    if (
        (index >= 12 && index <= 18) ||
        (index >= 55 && index <= 58) ||
        (index >= 82 && index <= 84) ||
        (index >= 88 && index <= 90) ||
        (index >= 94 && index <= 97) ||
        (index >= 98 && index <= 103) ||
        (index >= 120 && index <= 122) ||
        (index >= 177 && index <= 180)
    ) return "dirt";
    if (index >= 30 && index <= 38) return "worm";
    if (index === 130 || (index >= 164 && index <= 167)) return "background";
    if (index >= 160 && index <= 163) return "see shadow";
    if (
        (index >= 1 && index <= 2) ||
        (index >= 77 && index <= 79)
    ) return "background dirt";
    return "unknown";
}

function handleFile(event, slotIndex) {
    const file = event.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    if (ext === "json") {
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                validateAndLoad(data, slotIndex);
            } catch {
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
    }

    else if (ext === "lpl") {
        reader.onload = () => {
            const bytes = new Uint8Array(reader.result);
            validateAndLoad(Array.from(bytes), slotIndex);
        };
        reader.readAsArrayBuffer(file);
    }

    else if (ext === "gpl") {
        reader.onload = () => {
            const lines = reader.result.split(/\r?\n/);
            const colors = [];

            for (const line of lines) {
                const trimmed = line.trim();

                if (
                    trimmed === "" ||
                    trimmed.startsWith("#") ||
                    trimmed.startsWith("GIMP") ||
                    trimmed.startsWith("Name:") ||
                    trimmed.startsWith("Columns:")
                ) continue;

                const parts = trimmed.split(/\s+/);
                if (parts.length >= 3) {
                    colors.push(
                        parseInt(parts[0], 10),
                        parseInt(parts[1], 10),
                        parseInt(parts[2], 10)
                    );
                }
            }

            validateAndLoad(colors, slotIndex);
        };
        reader.readAsText(file);
    }

    else if (ext === "png") {
        reader.onload = () => {
            const result = readPngPalette(new Uint8Array(reader.result));
            if (result.error) {
                alert(result.error);
                return;
            }
            validateAndLoad(result.palette, slotIndex);
        };
        reader.readAsArrayBuffer(file);
    }

    else {
        alert("Supported file formats: .json, .lpl, .gpl, .png");
    }
}

// Reading the palette from an indexed PNG (color type 3) – read the PLTE chunk directly.
function readPngPalette(bytes) {
    const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    if (bytes.length < 8 || signature.some((v, i) => bytes[i] !== v)) {
        return { error: "Invalid PNG palette file." };
    }

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let pos = 8;
    let colorType = null;
    let plte = null;

    while (pos + 8 <= bytes.length) {
        const length = view.getUint32(pos);
        const type = String.fromCharCode(
            bytes[pos + 4], bytes[pos + 5], bytes[pos + 6], bytes[pos + 7]
        );
        const bodyStart = pos + 8;
        if (bodyStart + length > bytes.length) break;

        if (type === "IHDR") {
            colorType = bytes[bodyStart + 9];
        } else if (type === "PLTE") {
            plte = bytes.subarray(bodyStart, bodyStart + length);
        } else if (type === "IEND") {
            break;
        }

        pos = bodyStart + length + 4; // dane + CRC
    }

    if (colorType !== 3) {
        return {
            error: "Only indexed PNG files (with a color palette) are supported. " +
                   "This file is not indexed."
        };
    }

    if (!plte) {
        return { error: "An indexed PNG does not contain a palette (lack of a PLTE chunk)." };
    }

    if (plte.length !== 768) {
        return {
            error: `A PNG palette must contain exactly 256 colors (this file has ${Math.floor(plte.length / 3)}).`
        };
    }

    return { palette: Array.from(plte) };
}

function validateAndLoad(data, slotIndex) {
    if (!Array.isArray(data) || data.length !== 768) {
        alert("The palette must contain exactly 768 values (256 RGB).");
        return;
    }

    const slot = slots[slotIndex];
    slot.data = data;
    buildPalette(slotIndex);

    slot.saveJsonBtn.disabled = false;
    slot.saveLplBtn.disabled = false;
    slot.saveGplBtn.disabled = false;
    slot.savePngBtn.disabled = false;
}

function buildPalette(slotIndex) {
    const slot = slots[slotIndex];
    slot.paletteDiv.innerHTML = "";
    slot.selectedIndex = null;

    // If a color from this palette has been edited, hide the editor
    if (activeSlot === slotIndex) {
        activeSlot = null;
        editorDiv.style.display = "none";
    }

    for (let i = 0; i < 256; i++) {
        const cell = document.createElement("div");
        cell.className = "color-cell";
        cell.draggable = true;
        cell.style.backgroundColor = cssColor(slot.data, i);

        cell.addEventListener("click", () => selectColor(slotIndex, i));

        // Dragging (copying color)
        cell.addEventListener("dragstart", e => {
            e.dataTransfer.effectAllowed = "copy";
            e.dataTransfer.setData("text/plain", `${slotIndex}:${i}`);
        });

        cell.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            cell.classList.add("drop-target");
        });

        cell.addEventListener("dragleave", () => {
            cell.classList.remove("drop-target");
        });

        cell.addEventListener("drop", e => {
            e.preventDefault();
            cell.classList.remove("drop-target");
            handleDrop(e.dataTransfer.getData("text/plain"), slotIndex, i);
        });

        slot.paletteDiv.appendChild(cell);
    }
}

function cssColor(data, index) {
    return `rgb(${data[index * 3]},${data[index * 3 + 1]},${data[index * 3 + 2]})`;
}

function handleDrop(payload, targetSlotIndex, targetIndex) {
    const [srcSlotStr, srcIndexStr] = payload.split(":");
    const srcSlotIndex = parseInt(srcSlotStr, 10);
    const srcIndex = parseInt(srcIndexStr, 10);

    if (
        Number.isNaN(srcSlotIndex) || Number.isNaN(srcIndex) ||
        !slots[srcSlotIndex] || slots[srcSlotIndex].data.length !== 768
    ) return;

    if (srcSlotIndex === targetSlotIndex && srcIndex === targetIndex) return;

    const src = slots[srcSlotIndex].data;
    const target = slots[targetSlotIndex];

    for (let c = 0; c < 3; c++) {
        target.data[targetIndex * 3 + c] = src[srcIndex * 3 + c];
    }

    target.paletteDiv.children[targetIndex].style.backgroundColor =
        cssColor(target.data, targetIndex);

    // Select the copied color so that you can refine it right away
    selectColor(targetSlotIndex, targetIndex);
}

function selectColor(slotIndex, index) {
    // Deselect in both palettes (the editor works on one color at a time)
    slots.forEach(s => {
        Array.from(s.paletteDiv.children).forEach(c => c.classList.remove("selected"));
        s.selectedIndex = null;
    });

    const slot = slots[slotIndex];
    slot.paletteDiv.children[index].classList.add("selected");
    slot.selectedIndex = index;
    activeSlot = slotIndex;

    const r = slot.data[index * 3];
    const g = slot.data[index * 3 + 1];
    const b = slot.data[index * 3 + 2];

    rInput.value = r;
    gInput.value = g;
    bInput.value = b;
    colorPicker.value = rgbToHex(r, g, b);

    colorIndexSpan.textContent =
        `Palette ${slotIndex + 1}, ${index} (${getColorType(index)})`;
    editorDiv.style.display = "block";
}

function updateColor(source) {
    if (activeSlot === null) return;

    const slot = slots[activeSlot];
    const index = slot.selectedIndex;
    if (index === null) return;

    let r, g, b;

    if (source === "picker") {
        ({ r, g, b } = hexToRgb(colorPicker.value));
        rInput.value = r;
        gInput.value = g;
        bInput.value = b;
    } else {
        r = clamp(+rInput.value);
        g = clamp(+gInput.value);
        b = clamp(+bInput.value);
        colorPicker.value = rgbToHex(r, g, b);
    }

    slot.data[index * 3] = r;
    slot.data[index * 3 + 1] = g;
    slot.data[index * 3 + 2] = b;

    slot.paletteDiv.children[index].style.backgroundColor = `rgb(${r},${g},${b})`;
}

function clamp(value) {
    return Math.max(0, Math.min(255, value));
}

function rgbToHex(r, g, b) {
    const toHex = v => clamp(v).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return {
        r: parseInt(clean.substring(0, 2), 16),
        g: parseInt(clean.substring(2, 4), 16),
        b: parseInt(clean.substring(4, 6), 16)
    };
}

function saveAsJson(slotIndex) {
    const blob = new Blob(
        [JSON.stringify(slots[slotIndex].data)],
        { type: "application/json" }
    );
    download(blob, `palette${slotIndex + 1}_modified.json`);
}

function saveAsLpl(slotIndex) {
    const bytes = new Uint8Array(slots[slotIndex].data);
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    download(blob, `palette${slotIndex + 1}_modified.lpl`);
}

function saveAsGpl(slotIndex) {
    const data = slots[slotIndex].data;

    let content = "";
    content += "GIMP Palette\n";
    content += "Name: Liero Palette (exported)\n";
    content += "Columns: 16\n";
    content += "#\n";

    for (let i = 0; i < 256; i++) {
        const r = data[i * 3];
        const g = data[i * 3 + 1];
        const b = data[i * 3 + 2];
        const type = getColorType(i);

        content += `${r}\t${g}\t${b}\t${type}\n`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    download(blob, `palette${slotIndex + 1}_modified.gpl`);
}

// ---- PNG encoding: 256x1 image, 8-bit, indexed; a pixel at position $i$ has index $i$ ----
const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) {
        c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
}

function adler32(bytes) {
    let a = 1, b = 0;
    for (let i = 0; i < bytes.length; i++) {
        a = (a + bytes[i]) % 65521;
        b = (b + a) % 65521;
    }
    return ((b << 16) | a) >>> 0;
}

function pngChunk(type, data) {
    const out = new Uint8Array(12 + data.length);
    const view = new DataView(out.buffer);
    view.setUint32(0, data.length);
    for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
    out.set(data, 8);
    view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
    return out;
}

function saveAsPng(slotIndex) {
    const data = slots[slotIndex].data;

    // IHDR: 256 x 1, 8-bit depth, color type 3 (indexed)
    const ihdr = new Uint8Array(13);
    const ihdrView = new DataView(ihdr.buffer);
    ihdrView.setUint32(0, 256);
    ihdrView.setUint32(4, 1);
    ihdr[8] = 8;
    ihdr[9] = 3;

    // PLTE: 256 RGB colours
    const plte = Uint8Array.from(data);

    // tRNS: color 0 transparent, the rest opaque
    const trns = new Uint8Array(256).fill(255);
    trns[0] = 0;

    // Image data: filter byte (0) + pixels 0..255 (each pixel = its own index)
    const raw = new Uint8Array(257);
    for (let i = 0; i < 256; i++) raw[1 + i] = i;

    // zlib: header + one uncompressed deflate block + Adler-32 checksum
    const zlib = new Uint8Array(2 + 5 + raw.length + 4);
    const zView = new DataView(zlib.buffer);
    zlib[0] = 0x78;
    zlib[1] = 0x01;
    zlib[2] = 0x01;                       // BFINAL=1, BTYPE=00 (stored)
    zView.setUint16(3, raw.length, true); // LEN
    zView.setUint16(5, ~raw.length & 0xFFFF, true); // NLEN
    zlib.set(raw, 7);
    zView.setUint32(7 + raw.length, adler32(raw));

    const signature = Uint8Array.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const parts = [
        signature,
        pngChunk("IHDR", ihdr),
        pngChunk("PLTE", plte),
        pngChunk("tRNS", trns),
        pngChunk("IDAT", zlib),
        pngChunk("IEND", new Uint8Array(0))
    ];

    const blob = new Blob(parts, { type: "image/png" });
    download(blob, `palette${slotIndex + 1}_modified.png`);
}

function download(blob, filename) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}
