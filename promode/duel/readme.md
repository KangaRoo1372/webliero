# PROMODE (Re)ReReVisited 1v1 (duel) edition

Hi guys!

As you read in the previous readme file, you can find here my version of Webliero Promode ReRevisited Mod, reworked to make it suitable for duels (1v1 games). The mod is based on the latest version of original Promode ReRevisited, i.e. 1.3.2. BETA. It is also recommended to use original Promode ReRevisited sprites while playing this mod (you can find the wlsprt file in the [official Promode ReRevisited repository on gitlab).](https://gitlab.com/webliero/webliero-mods/-/tree/master/ReRevisited).

Basically, all changes I made - comparing to Promode ReRevisited original settings - refer only to some weapons (the gravity or other main "physics" parameters of the gameplay, which you can find in part "contants" and "textures", remains unchanged).

Firstly, only two weapons were changed: PROXY MINE and SUPER SHOTGUN. After many months of observations of the duels played at Promode Rerevisited, it turned out that these two weapons are the most abused by players. That was actually quite understandable - they turned out to be very strong and easy to use. For this reason, I have significantly remodeled these two weapons, nerfing them a lot. Unfortunately, most players did not like these changes, especially SUPER SHOTGUN - I reduced the ammo count from 2 to 1. For this reason, some people said that SUPER SHOTGUN had completely lost its spirit. Therefore, two alternative versions of this weapon were created - hence in this repo you can find two json files that differ from each other only within this one weapon. So, duel1.json5 has got SUPER SHOTGUN with 1 ammo and duel2.json with 2 rounds. You can see the list of changes made to SUPER SHOTGUN below (also showing how it looked in original Promode ReRevisited v. 1.3.2.):


|  DUEL 1               |      DUEL 2               |     ORIGINAL SETTINGS  |
|---------------------- | ------------------------  | ---------------------  |
|***weapon***           |                           |                        |
|name: "SUPER SHOTGUN"  | name: "SUPER SHOTGUN"     | name: "SUPER SHOTGUN   |
|***wobject***          |                           |                        |
|ammo: 1,               | ammo: 2,                  | ammo: 2,               |
|delay: 0,              | delay: 80,                | delay: 20,             |
|loading time: 320,     | loading time: 450,        | loading time: 400,     |


Lately, I made also further changes to many other weapons. Here you can find the full list of changes:

/under construction/

***roo***
