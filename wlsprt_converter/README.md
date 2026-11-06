# WLSPRT → LIERO.CHR sprite converter

A small browser tool that converts WebLiero sprite files (`.wlsprt`) into the classic Liero 1.33 format (`LIERO.CHR`). It also lets you preview sprites and export the palette.

## Requirements

None. Keep `index.html`, `app.js` and `formats.js` in the same folder and open `index.html` in any modern browser. Everything runs locally: no installation, no server, no internet connection, and no files are uploaded anywhere.

## How to use

1. Drop a `.wlsprt` file onto the **.wlsprt file** box, or click the box to choose one.
2. *(Optional)* Load a `LIERO.CHR` file to preview it or compare it with the result.
3. Read the **Sanity checks** panel. Red messages mean the file cannot be converted as it is. You can often fix that by editing the sprite list (see below).
4. Click **Convert to CHR**, then **Download LIERO.CHR**.
5. If you need the palette, use the **Palette** buttons (PNG, JSON, LPL, PAL 6-bit).

## Liero limits

Liero has a fixed sprite layout and WebLiero does not, so the converter checks the following:

| Sprites | Slot size | Count |
|---|---|---|
| #0–#109 | 16×16 | 110 |
| #110–#239 | 7×7 | 130 |
| #240–#265 | 4×4 | 26 |
| **Total** | | **266** |

Conversion is **refused** in these cases:

- the file does not contain exactly 266 sprites;
- a sprite is larger than its slot;
- a sprite's offset pushes it outside its slot. Enable **Auto-fit** to shift such sprites inside the slot instead. You will get a warning, because the sprite may then appear slightly off its original position in game.

Click any message that refers to a sprite to jump to that sprite.

## Editing the sprite list

You can rearrange the sprites in the **WLSPRT** tab before converting, for example to fit a WebLiero mod into Liero's 266 slots.

- **Select:** click a sprite. **Ctrl**+click adds to the selection, **Shift**+click selects a range, **Ctrl+A** selects all, and **Esc** clears the selection.
- **Reorder:** drag the selected sprites onto another sprite. A yellow line shows where they will land. Dropping on the empty area of a block puts them at the end of that block. To move sprites far, type a number in **Move to #** and click **Move**.
- **Delete:** press **Del** or click **Delete**.
- **Insert empty:** adds a blank sprite before the selection, which is useful for keeping the numbering of the following sprites.
- **Undo / Redo** (Ctrl+Z / Ctrl+Y) and **Reset** (back to the file as loaded).
- **Save edited .wlsprt** saves the current list as a new WebLiero file.

Deleting, inserting or moving a sprite renumbers every sprite after it. A small `←N` label shows each sprite's position in the original file. The sanity checks re-run after every change, so click **Convert to CHR** again when you are done.

## Viewing sprites

- **WLSPRT**: the source sprites, cropped, at their actual size.
- **Result CHR**: the converted sprites in full slot cells.
- **Loaded CHR**: the optional CHR file you loaded.

Hover over a sprite to see its size, offset and any issues. Red frames mark errors, yellow frames mark warnings, and blue frames mark differences from the loaded CHR. Use **only sprites with problems/differences** to filter the grid. All messages also appear in the browser console (F12).

## Palette

`LIERO.CHR` does **not** store a palette, because Liero keeps it in `LIERO.EXE`. If the mod uses custom colours, export the palette and apply it with your mod editor.

| Format | Contents |
|---|---|
| PNG | 256×1 indexed image; pixel *i* = colour *i*; index 0 is transparent |
| JSON | flat array of 768 numbers `[r,g,b, …]`, values 0–255 |
| LPL | LieroKit palette: 768 bytes raw RGB, values 0–255 |
| PAL (6-bit) | 768 bytes raw RGB, values 0–63 (the VGA format used in `LIERO.EXE`) |

## Notes

- The last 4 slots of the 4×4 block in `LIERO.CHR` (#266–#269) are not used by WebLiero, so they are filled with zeros.
- The converter places each sprite in its slot using a table of anchor points worked out from a matching CHR/WLSPRT pair. Mods whose `.wlsprt` files use unusual offsets may need a quick visual check in the **Result CHR** tab.
