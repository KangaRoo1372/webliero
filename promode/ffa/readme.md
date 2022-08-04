# PROMODE (Re)ReReVisited (a.k.a. KO New Promode) ffa edition

Hi guys!

As you read in the previous readme file, you can find here my version of Webliero Promode ReRevisited Mod, reworked to make it suitable for FFA (free for all) games. The mod is based on the latest version of original Promode ReRevisited, i.e. 1.3.2. BETA. It is also recommended to use original Promode ReRevisited sprites while playing this mod (you can find the wlsprt file in the [official Promode ReRevisited repository on gitlab](https://gitlab.com/webliero/webliero-mods/-/tree/master/Jerac/ReRevisited)).

Basically, all changes I made - comparing to Promode ReRevisited original settings - refer only to some weapons (the gravity or other main "physics" parameters of the gameplay, which you can find in "constans" and "textures", remain unchanged). The most significant changes were made to MORTAR, GRENADE, MINI NUKE, FLAK CANNON, DARTGUN and PROXY MINE, because those weapons were just too op and overused on ffa.

Here you can find the full list of aforementioned changes:


|  NEW SETTINGS         |      ORIGINAL SETTINGS
|---------------------- | ------------------------
|***weapon***           
|name: "MORTAR"         |   name: "MORTAR"
|loadingTime: 360,      |   loadingTime: 300,
|***wobject***          
|blowaway: 0,           |    blowaway: 0.1,
|createonexp: 22,       |    createonexp: 27,
|splinterAmount: 20,    |    splinterAmount: 120,
|splinterType: 21,      |    splinterType: 4,
|***sobject***
|detectRange: 18        |    detectRange: 20
|damage: 45             |    damage: 60
|***weapon***           
|name: "GRENADE"        |    name: "GRENADE"
|loadingTime: 250,      |    loadingTime: 200,
|***nobject***
|speed: 4,              |    speed: 4.5,
|speedV: 3,             |    speedV: 3.5,
|hitDamage: 2,          |    hitDamage: 4.2
|bloodOnHit: 6,         |    bloodOnHit: 8,
|timeToExplo: 12,       |    timeToExplo: 15,
|timeToExploV: 5        |    timeToExploV: 7
|***weapon***           
|name: "FLAK CANNON"    |    name: "FLAK CANNON"
|loadingTime: 480,      |    loadingTime: 510,
|***nobject***
|hitDamage: 3,          |    hitDamage: 4,
|timeToExplo: 12,       |    timeToExplo: 18,
|timeToExploV: 5        |    timeToExploV: 5
|***weapon***
|name: "WINCHESTER"     |    name: "WINCHESTER"
|loadingTime: 340,      |    loadingTime: 400,
|delay: 20,             |    delay: 22,
|***wobject***
|blowAway: 0.2,         |    blowAway: 0.7,
|***weapon***
|name: "GRN LAUNCHER"   |    name: "GRN LAUNCHER"
|bulletSpeed: 3.5,      |    bulletSpeed: 3,
|loadingTime: 380,      |    loadingTime: 400,
|***wobject***
|blowAway: 0.05,        |    blowAway: 0.3,
|gravity: 0.04983642578125,| gravity: 0.01983642578125,
|bounce: 0.5,           |    bounce: 0.4,
|hitDamage: 6,          |    hitDamage: 4,
|timeToExplo: 130,      |    timeToExplo: 140,
|***weapon***
|name: "FLAMER"         |    name: "FLAMER"
|fireCone: 4,           |    fireCone: 20,
|launchSound: 12,       |    launchSound: -1,
|***weapon***
|name: "RIFLE"          |    name: "RIFLE"
|loadingTime: 280,      |    loadingTime: 250,
|***wobject***
|hitDamage: 34,         |    hitDamage: 32,
|***weapon***
|name: "CHAINGUN"       |    name: "CHAINGUN"
|loadingTime: 350,      |    loadingTime: 299,
|fireCone: 2,           |    fireCone: 6,
|***weapon***
|name: "SCATTERGUN"     |    name: "SCATTERGUN"
|loadingTime: 370,      |    loadingTime: 375,
|fireCone: 2,           |    fireCone: 6,
|***weapon***
|name: "MINIGUN"        |    name: "MINIGUM"
|loadingTime: 330,      |    loadingTime: 360,
|***weapon***
|name: "DARTGUN"        |    name: "DARTGUN"
|loadingTime: 280,      |   loadingTime: 217,
|***weapon***
|name: "LASER"          |    name: "LASER"
|launchSound: 27,       |    launchSound: -1,
|***weapon***
|"MINI NUKE"            |    name: "MINI NUKE"
|delay: 45,             |    delay: 30,
|loadingTime: 480,      |    loadingTime: 450,
|***weapon***
|name: "ZIMM"           |    name: "ZIMM"
|loadingTime: 500,      |    loadingTime: 540,
|***weapon***
|name: "MISSILE"        |    name: "MISSILE"
|loadingTime: 420,      |    loadingTime: 480,
|***weapon***
|name: "PROXY MINE"     |    name: "PROXY MINE"
|***wobject***
|detectDistance: 6,     |    detectdistance: 8,
|mutlSpeed: 0.95,       |    multSpeed: 0.98,
|***sobject***
|detectDistance: 21,    |    detectDistance: 26,
|damage: 45,            |    damage: 50,
|***weapon***
|name: "THROW KNIFE"    |    name: "THROW KNIFE"
|playReloadSound: false,|    playReloadSound: true,
|***weapon***
|name: "GAUSS GUN"      |    name: "GAUSS GUN"
|loadingTime: 380,      |    loadingTime: 400,
|***weapon***
|name: "SOLAR SCORCH"   |    name: "SOLAR SCORCH"
|loadingTime: 360,      |    loadingTime: 400,

***roo***
