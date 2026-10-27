# WebLiero Map Generator

A single-file, offline procedural map generator for [WebLiero](https://www.webliero.com/) and [Liero](https://liero.be/). Open the HTML file in a modern browser (Chrome, Edge, Firefox or Safari) and click Generate map. Every click produces a completely new random map.

The program was created with help of [Claude AI](https://claude.ai/new), which generated 100% of the code.

**How it works**

The map is made of a background (palette indices 160–163) with random filled shapes on top. Terrain coverage is random each time, and the actual percentage is shown in the status line under the controls.

**Options**

Map width / height: default 504×350, the standard Liero size.

Shapes: choose any combination of rectangles, squares, triangles, trapezoids and circles. At least one must be selected.

**Effects**

Dirt only: shapes use DIRT colors instead of ROCK colors.
Level borders: adds a 1-pixel frame around the map in color 19.
Plain shapes: each shape is a single flat color, with no pixel shading.
Uni color: all shapes on the map share the same color.

Palette: the default Liero palette is built in. You can load your own palette in .gpl, .lpl, .json or .png format. It must contain exactly 256 colors.

Palette and editing tools (right side)
The 16×16 grid shows the current palette. Click a color to select it. The info line shows its index, its type (ROCK, DIRT, BACKGROUND, SEE SHADOW, WORM or UNDEFINED) and its RGB value.
Brush: draws with the selected color. Sizes are 1, 2, 4, 8 and 12 px.
Eraser: restores the background.
Pick color: click the map to select the color under the cursor.
Undo / Redo: Ctrl+Z / Ctrl+Y, up to 50 steps. History resets when a new map is generated.
Saving
Save indexed PNG: 8-bit indexed PNG with the current palette, typically 20–25 KB.
Save LEV map: classic .lev file, raw palette indices (504×350).
Save as powerlevel: .lev with the current palette embedded (default palette if you didn’t load one).

All exports include your manual edits. If the map is not 504×350, you’ll be warned before saving a .lev or powerlevel file.

***roo***