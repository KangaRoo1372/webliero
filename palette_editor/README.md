# (Web)Liero Palette Editor

A simple, browser-based tool for viewing, editing and converting WebLiero palette files. It runs entirely in your browser: no installation, no server, and your files never leave your computer.

**Usage**

- Open the index.html file in a modern browser (palette-editor.js must be placed in the same folder).
- Load a palette. Pick a file in the Palette 1 and/or Palette 2 panel. Two palettes can be open at once.
- Click any cell in the 16×16 grid to select a colour. The editor below shows its index and type (e.g. dirt, rock, worm, background).
- To edit the colour, change the R/G/B values (0–255) or use the colour picker. The grid updates in real time.
- You can copy colours between palettes; to do that, just drag a cell with the left mouse button and drop it onto any cell of the other palette (dropping within the same palette duplicates the colour). The copied colour is selected, so you can fine-tune it right away.
- Use the "Save palette" buttons to export the palette in any supported format and save it on your HDD.

**Supported formats**

|Format	| Load	| Save | Notes
|-------|-------|------|------
|.json	|✔	    |✔	  |Flat array of 768 numbers (256 × R, G, B)
|.lpl	|✔	    |✔	  |Raw binary, 768 bytes
|.gpl	|✔	    |✔	  |GIMP palette; export adds the colour type as a 4th column
|.png	|✔	    |✔	  |Indexed (palette-based) PNG only

Every palette must contain exactly 256 colours. Anything else is rejected with an error message.

**PNG side notes**

- Only indexed PNGs are accepted. Truecolour/RGB images are rejected with a message.
- On export you get a 256×1, 8-bit indexed PNG in which pixel i has index i. Colour 0 is marked as transparent.

**Output files**

Saved files are named palette1_modified.<ext> or palette2_modified.<ext>, depending on which panel they come from. Your original files are never overwritten.

***roo***