**JSON to LWP Converter by KangaRoo (current version: 0.48)**
---------------------------------------------------

0. [LICENCE](#0-licence)
1. [INTRODUCTION](#1-introduction)
2. [HOW TO USE IT](#2-how-to-use-it)
3. [LIMITATIONS](#3-limitations)
4. [CREDITS](#4-credits)
5. [CHANGELOG](#5-changelog)
6. [TODO](#6-todo)
7. [CONTACT](#7-contact)

## *0. LICENCE*

JSON to LWP Converter is a FREEWARE program, which means you are free to distribute it, but you can't do it for cash or other valuables. You are not allowed to modify it and distribute as your own program; you can use any extracted part of the code or even modify it on your own but with appropriate notification about its origin.

The program was created with help of [ChatGPT](https://openai.com/blog/chatgpt), which generated circa 80% of the code.

## *1. INTRODUCTION*

JSON to LWP Converter is a simple program that converts WebLiero mods into Liero Weapon Plugins, written in HTML and JavaScript. The program contains 4 files:

a) index.html (script used to display the "layout" of the program: name, buttons etc.)

b) converter.js (main script of the program)

c) json5.min.js (javascript library used to convert JSON5 files)

d) readme.md (this file you're reading right now xD)

**1.1 What are Liero and WebLiero?**

[Liero](http://liero.be/) is a classic freeware 1998 DOS game, a 2D arena top-down shooter in which you control a worm armed with 5 guns and a ninja rope.

[WebLiero](https://www.webliero.com/) is a browser-based online-multiplayer clone of Liero.

**1.1.1. What is WebLiero mod?**

WebLiero allows users to create their own modifications (a.k.a. "mods"). Every WebLiero modification contains two files:

a) mod.json (the game supports also .json5 format) - this file contains "logic" part of the mod, i.e. definitions for weapons, game entities (worm, bonuses, rope etc.) and other things;

b) sprites.wlsprt - this file contains the GFX part of the mod, i.e. sprites and palette.

Custom mods can be loaded in-game as the server-admin, using the chat command /loadmod; the browser will present a file dialog from which the mod files can be selected together or loaded/reloaded seperately as needed; WebLiero also supports direct loading of zipped mods containing both files, named as above.

To learn more about WebLiero mods, check & read the (un)official [WebLiero Mod Guide](https://gitlab.com/webliero/webliero-mods/-/blob/master/mod%20guide.md).

**1.1.2. What is Liero Weapon Plugin?**

The Liero Weapon Plugin is something similar to WebLiero mods. It is a single text file (made in custom .lwp format) that can contain information on all Liero objects used in weapons, i.e. weapon objects, non-weapon objects and special objects. When activated (with a special program - see information below), the information in the .lwp file overwrites a part of the Liero.exe code of your choice (i.e. only one single object or even all objects).

## *2. HOW TO USE IT*

To use the converter, you must:

- download all the files and put them in the same directory
- right-mouse click the "index.html" file and open it with Internet browser (e.g. Chrome or Firefox)
- click the "browse file" button and choose the file from your HDD
- mark the "order weapons alphabetically" option if you want to have weapons sorted alphabetically in the game menu after conversion (recommended)
- click the "Convert" button
- if the conversion is successful, you will see the message "Conversion successful!" and a download link (+ the converted file will appear on the print-preview window on the right side)
- you can modify vaules of every property on the print-preview window manually, however such manual changes will not affect the converted file (so if you want to save your changes, you need to copy the whole content from the preview window and paste it into the empty .lwp file)
- you can unmark the "order weapons alphabetically" option and click the "Convert" button again to generate converted file again, but in such case the weapons will not be sorted alphabetically by names in the game menu
- click the download link ("Download converted file"); the converted file will be saved on your HDD
- if the conversion fails, you will see the message "Error converting file" (in some cases there will be no message printed; in that case, you can open the console by pressing F12 to check errors)

To implement your .lwp file in Liero, you must activate it with [LieroM8](https://liero.nl/download/286/lm8v192.zip), that is:

- make a back-up copy of your Liero.exe file (the converted file replaces all objects, even special objects)
- put the converted file into your Liero folder
- open LieroM8.exe file
- set your Liero path (select Liero.exe which you want to hack)
- double-click your converted LWP file on the list in LieroM8
- select "yes" option on the pop-up window

## *3. LIMITATIONS*

- the program converts only "logic" part of the mod (JSON/JSON5 file); it does not convert sprites, so that might cause some unexpected effects in the game regarding how the objects look (especially when WebLiero mod contains more than 265 sprites)
- original Liero has got fixed hardcoded amount of weapon objects (40), non-weapon objects (24) and special objects (14). The converter can convert WebLiero mods with more than 40 weapons etc., but such converted file will not be implemented into Liero properly
- the only one known program with which you can activate converted LWP file is LieroM8 (the other popular Liero tool - LieroKit - somehow does not support LWP files created with this converter; I didn't check other Liero tools)
- in WebLiero almost all properties can use rational numbers for their values (unlike in Liero where you can use only positive integers). That's why some WL weapons / objects would work differently after conversion to Liero
- some object parameters in Liero are hardcoded and cannot be modified using even dedicated tools, i.e. they have either fixed values (e.g. repeat) or are assigned to only specific objects (e.g. laserBeam). In WebLiero though, all object parameters are fully moddable. This means that some WL weapons / objects would work differently after conversion to Liero
- unlike in classic Liero, in WebLiero you can edit or modify dirt effects ("textures" array) in any way you want. This is another reason why some WL weapons / objects would work differently after conversion to Liero
- in classic Liero, sprites were split into 3 categories: big sprites (16x16 size), medium sprites (7x7 size) and small sprites (4x4 size), whereas only "medium sprites" could be used as startFrame for weapon objects and non-weapon objects. In WebLiero though, you can choose any sprite you want as startFrame for weapon and non-weapon objects. That's why some weapons / objects would look and work differently after conversion to Liero
- there are some issues with some properties in special objects after implementing converted LWP file via LieroM8 (propably due to some bugs in LieroM8). Currently known bugs: wrong values of blowAway parameter in sobject1 (Large explosion), sobject3 (small explosion) and sobject4 (hellraider smoke). It is recommended to change them manually in [LieroKit](https://liero.nl/download/295/lierokit16b2.zip) after activating your converted file with LieroM8 (somehow LieroM8 cannot do this... don't ask why, I just dunno xD)
- the program also converts [WebLiero Extended](https://www.vgm-quiz.com/dev/webliero/extended) mods, however since WebLiero Extended uses some special parameters which changes the game & weapons logic significantly. That's why WL Extended mods would not work properly after conversion to Liero mods

**_So, if you want to have no issues after converting your WL mod to LWP, then follow these instructions:_**

- set "laserBeam: true" only for wObject 28 (the other weapon must have this property value "false");
- do not make a mod with more than 40 weapons, 24 nObjects and 14 sObjects;
- set fixed values for "repeat" property depending on shotType, i.e.:
- for shotType: 0,1,2,3 = set "repeat": 1;
- for shotType: 4 = set "repeat": 1000 for wObject 28;
- for shotType: 4 = set "repeat": 8 for any other wObjects;
- do not set negative values for any properties (except for gravity);
- do not set rational numbers as values for any properties (use only integers);
- do not modify "textures" array in any way;
- use original spritesheet (or at least do not add more sprites to the spritesheet or make sprites bigger than their fixed size);
- set only "medium sprites" (110-239) as startFrame for wObjects and nObjects;
- do not add any WebLiero Extended properties;
- after conversion, don't forget to change manually values of blowAway property for sid1, sid3 and sid4 in LieroKit.

## *4. CREDITS*

As it was written before, the code of this program was created with help of ChatGPT (which generated circa 80% of the code), so big thanks for ChatGPT engineers and creators.

Big thanks also goes to:

- Joosa Riekkinen (for creating Liero, the best game ever)
- Basro (for creating WebLiero, the best clone of the best game ever xD)
- ZanderZ (for creating LieroM8)
- Gliptic (for creating LieroKit and inventing Liero Weapon Plugin format)
- dsds💚[ASS] (for some ideas, testing, adding JSON5 library to the program, fixing bugs and improving the converter a lot)
- wgetch, Larcelo and Ophi (for testing & some ideas)

## *5. CHANGELOG*

07.04.2023 - version 0.48 (thx dsds!)
- fix weapon "order" bug
- clean some part of the code in converter.js file
- improve "index.html" file (better layout + added new functions)

07.04.2023 - version 0.47
- fix weapon index bug
- changed the conversion factor for "recoil" property to prevent bugs
- remove unnecessary toString() method from weaponIdex variable
- rename some variables & clean the code

04.04.2023 - version 0.46
- added WebLiero Extended parameters to the "if" condition to exclude them in conversion

04.04.2023 - version 0.45 (thx dsds!)
- added javascript library to support JSON5 files

04.04.2023 - version 0.44
- fixed the wrong ORDER of non-weapon objects and special objects
- improved functions to recalculate some values of some properties

03.04.2023 - version 0.42
- fixed the 'for' loop for generating weapon/order numbers of objects
- improved "index.html" file (better layout)

03.04.2023 - version 0.38
- added special objects array to convert

03.04.2023 - version 0.37 alpha
- added non-weapon objects array to convert
- miscellaneous fixes & improvements

02.04.2023 - version 0.13
- added functions to recalculate values of some properties of weapon objects

02.04.2023 - version 0.11
- initial commit

## *6. TODO*

- add some sanity checks / console logs about errors etc.
- add some warning messages displayed when WL mod will not be suitable to Liero.exe after conversion
- add option to modify the converted file in the print-preview window & make it impact the converted file when downloading
- full code review & clean it up

## *7. CONTACT*

You can contact me for any suggestions, ideas or any bugs you may find.
I will try to improve the converter in the future, however I hope you'll like my program anyway :) Enjoy!

**_roo_**
