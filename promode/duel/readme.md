# PROMODE (Re)ReReVisited 1v1 (duel) edition

Hi guys!

As you read in the previous readme file, you can find here my version of Webliero Promode ReRevisited Mod, reworked to make it suitable for duels (1v1 games). The mod is based on the latest version of original Promode ReRevisited, i.e. 1.3.2. BETA. It is also recommended to use original Promode ReRevisited sprites while playing this mod (you can find the wlsprt file in the [official Promode ReRevisited repository on gitlab](https://gitlab.com/webliero/webliero-mods/-/tree/master/Jerac/ReRevisited)).

Basically, all changes I made - comparing to Promode ReRevisited original settings - refer only to some weapons (the gravity or other main "physics" parameters of the gameplay, which you can find in "constans" and "textures", remain unchanged).

In the first version of this mod, only two weapons were changed: PROXY MINE and SUPER SHOTGUN. After many months of observations of the duels played with Promode Rerevisited mod, it turned out that these two weapons are the most abused by players. That was actually quite understandable - they turned out to be too op (very strong and easy to use). For this reason, I have significantly remodeled these two weapons, nerfing them a lot.

Unfortunately, most players did not like these changes, especially SUPER SHOTGUN - I reduced ammo ammount from 2 to 1. For this reason, some people said that SUPER SHOTGUN had completely lost its spirit. Therefore, two alternative versions of this weapon were created - hence in this repo you can find two json files that differ from each other only by this one weapon. So, duel1.json5 has got SUPER SHOTGUN with 1 ammo and duel2.json with 2 rounds. You can see the list of changes made to SUPER SHOTGUN below (also showing how it looked in original Promode ReRevisited 1.3.2.):


|  DUEL 1               |      DUEL 2               |     ORIGINAL SETTINGS  |
|---------------------- | ------------------------  | ---------------------  |
|***weapon***           |                           |                        |
|name: "SUPER SHOTGUN"  | name: "SUPER SHOTGUN"     | name: "SUPER SHOTGUN"  |
|parts: 50,             | parts: 45,                | parts: 48,
|***wobject***          |                           |                        |
|ammo: 1,               | ammo: 2,                  | ammo: 2,               |
|delay: 0,              | delay: 60,                | delay: 20,             |
|loadingTime: 320,      | loadingTime: 400,         | loadingTime: 400,      |


Lately, I made also further changes to many other weapons. Here you can find the full list of changes:


|  DUEL 1 & 2           |      ORIGINAL SETTINGS
|---------------------- | ------------------------
|***weapon***
|name: "PROXY MINE"     |    name: "PROXY MINE"
|loadingTime: 430,      |    loadingTime: 400,
|delay: 50,             |    delay: 20,
|ammo: 2,               |    ammo: 1,
|***wobject***
|multSpeed: 0.95,       |    multSpeed: 0.98,
|detectDistance: 6,     |    detectDistance: 8,
|timeToExplo: 350,      |    timeToExplo: 250,
|blowAway: 0,           |    blowAway: 0.22,
|***sobject***
|damage: 45,            |    damage: 50,
|***weapon***
|name: "DOOMSDAY"       |    name: "DOOMSDAY"
|bulletSpeed: 3.5,      |    bulletSpeed: 2.1,
|ammo: 10,              |    ammo: 8,
|delay: 8,              |    delay: 11,
|fireCone: 4,           |    fireCone: 8,
|***wobject***
|distribution: 0.050517578125,| distribution: 0.030517578125,
|blowAway: 0,           |   blowAway: 0.15,
|***weapon***
|name: "WINCHESTER"     |    name: "WINCHESTER"
|loadingTime: 380,      |    loadingTime: 400,
|***wobject***
|blowAway: 0.2,         |    blowAway: 0.7,
|***weapon***
|name: "GRN LAUNCHER"   |    name: "GRN LAUNCHER"
|bulletSpeed: 3.5,      |    bulletSpeed: 3,
|ammo: 6,               |    ammo: 5,
|***wobject***
|detectDistance: 2,     |    detectDistance: 1,
|blowAway: 0.15,        |    blowAway: 0.3,
|gravity: 0.04983642578125,| gravity: 0.01983642578125,
|bounce: 0.5,           |    bounce: 0.4,
|timeToExplo: 130,      |    timeToExplo: 140,
|***weapon***           |
|name: "GRENADE"        |    name: "GRENADE",
|loadingTime: 230,      |    loadingTime: 200,
|bulletType: 36,        |    bulletType: 40,
|***nobject***
|hitDamage: 4,          |    hitDamage: 4.2,
|bloodOnHit: 6,         |    bloodOnHit: 8,
|***weapon***           |
|name: "MORTAR"         |    name: "MORTAR",
|***nobject***
|hitDamage: 4,          |    hitDamage: 4.2,
|bloodOnHit: 6,         |    bloodOnHit: 8,
|***weapon***
|name: "FLAMER"         |    name: "FLAMER"
|ammo: 60,              |    ammo: 50,
|fireCone: 4,           |    fireCone: 20,
|launchSound: 12,       |    launchSound: -1,
|***wobject***
|timetoExplo: 35,       |    timeToExplo: 25,
|***weapon***
|name: "AUTO SHOTGUN"   |    name: "AUTO SHOTGUN"
|ammo: 4,               |    ammo: 8,
|delay: 25,             |    delay: 28,
|loadingTime: 200,      |    loadingTime: 400,
|***weapon***
|name: "CLUSTER POD"    |    name: "CLUSTER POD"
|ammo: 2,               |    ammo: 1,
|delay: 40,             |    delay: 0,
|loadingTime: 440,      |    loadingTime: 400, 
|***wobject***
|timeToExplo: 30,       |    timeToExplo: 40,
|***weapon***
|name: "TUPOLEV"        |    name: "TUPOLEV"
|loadingTime: 450,      |    loadingTime: 400,
|***wobject***
|hitDamage: 10,         |    hitDamage: 0,
|timeToExplo: 120,      |    timeToExplo: 105,
|partTrailDelay: 6,     |    partTrailDelay: 10,
|***nobject***
|gravity: 0.080517578125, |  gravity: 0.030517578125,
|***weapon***
|name: "ACID FAN"       |    name: "ACID FAN"
|ammo: 150,             |    ammo: 140,
|***weapon***
|name: "CHAINGUN"       |    name: "CHAINGUN"
|loadingTime: 330,      |    loadingTime: 299,
|fireCone: 2,           |    fireCone: 6,
|***weapon***
|name: "SCATTERGUN"     |    name: "SCATTERGUN"
|loadingTime: 370,      |    loadingTime: 375,
|fireCone: 2,           |    fireCone: 6,
|ammo: 30,              |    ammo: 36,
|***wobject***
|hitDamage: 4,          |    hitDamage: 3,
|***weapon***
|name: "MINIGUN"        |    name: "MINIGUM"
|loadingTime: 350,      |    loadingTime: 360,
|parts: 2,              |    parts: 1,
|ammo: 70,              |    ammo: 80,
|recoil: 0.05,          |    recoil" 0.06,
|***wobject***
|hitDamage: 1.5,        |    hitDamage: 2,
|***weapon***
|name: "DARTGUN"        |    name: "DARTGUN"
|loadingTime: 320,      |    loadingTime: 217,
|bulletSpeed: 2.9,      |    bulletSpeed: 2.75,
|delay: 15,             |    delay: 18,
|ammo: 7,               |    ammo: 6,
|***wobject***
|timetoExplo: 600,      |    timeToExplo: 300,
|hitDamage: 10,         |    hitDamage: 9,
|distribution: 0.03288818359375,| distribution: 0.02288818359375,
|***weapon***
|name: "LASER"          |    name: "LASER"
|ammo: 180,             |    ammo: 140,
|***weapon***
|"MINI NUKE"            |    name: "MINI NUKE"
|loadingTime: 420,      |    loadingTime: 450,
|bulletSpeed: 2.1,      |    bulletSpeed: 1.8,
|***wobject***
|timeToEplo: 35,        |    timeToExplo: 50,
|timeToExploV: 0,       |    timeToExplo: 4,
|splinterAmount: 9,     |    splinterAmount: 8,
|***nobject***
|TimeToExplo: 140,      |    TimeToExplo: 80,
|***weapon***
|name: "ZIMM"           |    name: "ZIMM"
|loadingTime: 500,      |    loadingTime: 540,
|delay: 60,             |    delay: 90,
|***wobject***
|timeToExplo: 270,      |    timeToExplo: 140,
|hitDamage: 50,         |    hitDamage: 49,
|***weapon***
|name: "LIGHTNING GUN"  |    name: "LIGHTNING GUN"
|ammo: 120,             |    ammo: 60,
|***wobject***
|hitDamage: 2,          |    hitDamage: 1.8,
|***weapon***
|name: "SPIKEBALLS"     |    name: "SPIKEBALLS"
|parts: 8,              |    parts: 7,
|***wobject***
|timeToExplo: 350,      |    timeToExplo: 230,
|hitDamage: 10,         |    hitDamage: 9,
|***weapon***
|name: "FLAK CANNON"    |    name: "FLAK CANNON"
|loadingTime: 530,      |    loadingTime: 510,
|***nobject***
|hitDamage: 3,          |    hitDamage: 4,
|***weapon***
|name: "THROW KNIFE"    |    name: "THROW KNIFE"
|playReloadSound: false,|    playReloadSound: true,
|***wobject***
|hitDamage: 25,         |    hitDamage: 24,
|***weapon***
|name: "GAUSS GUN"      |    name: "GAUSS GUN"
|loadingTime: 360,      |    loadingTime: 400,
|***weapon***
|name: "RIFLE"          |    name: "RIFLE"
|loadingTime: 300,      |    loadingTime: 250,
|***weapon***
|name: "MISSILE"        |    name: "MISSILE"
|loadingTime: 460,      |    loadingTime: 480,

Special thanks to worms kami and Piotr for their ideas, insight and contributions in creating this version of the mod (some changes were directly taken or inspired by kami's version of Promode ReRevisited mod duel edition). Cheers guys! ;)

***roo***
