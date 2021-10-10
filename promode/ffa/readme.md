# PROMODE (Re)ReReVisited (a.k.a. KDP New Promode ffa edition)

Hi guys!

As you read in the previous readme file, you can find here my version of Webliero Promode ReRevisited Mod, reworked to make it suitable for FFA (free for all) games. The mod is based on the latest version of original Promode ReRevisited, i.e. 1.3.2. BETA. It is also recommended to use original Promode ReReviisted sprites while playing this mod (you can find the wlsprt file in the official Promode ReRevisited repository on gitlab).

Basically, all changes I made - comparing to Promode ReRevisited original settings - refer only to some weapons (the gravity or other main "physics" parameters of the gameplay, which you can find in part "contants" and "textures", remains unchanged). Here you can find the full list of aforementioned changes:


NEW SETTINGS               ORIGINAL SETTINGS
------------------------   ------------------------
***weapon***
name: "MORTAR"             name: "MORTAR"
loadingTime: 360,          loadingTime: 300,
***wobject***
blowaway: 0,               blowaway: 0.1,   // mortar pulling effect removed
createonexp: 22,           createonexp: 27,
splinterAmount: 20,        splinterAmount: 120,  // mortar splinter delayer
splinterType: 21,          splinterType: 4,

***weapon***
name: "GRENADE"            name: "GRENADE"
loadingTime: 250,          loadingTime: 200,
***wobject***
splinterType: 5,           splinterType: 4,
***nobject***
speed: 4,                  speed: 4.5,
speedV: 3,                 speedV: 3.5,
hitDamage: 3,              hitDamage: 4.2
bloodOnHit: 6,             bloodOnHit: 8,
timeToExplo: 12,           timeToExplo: 15,
timeToExploV: 5            timeToExploV: 7

***weapon***
name: "FLAK CANNON"        name: "FLAK CANNON"
loadingTime: 480,          loadingTime: 510,
***nobject***
hitDamage: 3,              hitDamage: 4,
timeToExplo: 12,           timeToExplo: 15,
timeToExploV: 5            timeToExploV: 7

***weapon***
name: "WINCHESTER"         name: "WINCHESTER"
loadingTime: 320,          loadingTime: 400,
delay: 20,                 delay: 22,
***wobject***
blowAway: 0.2,             blowAway: 0.7,

***weapon***
name: "GRN LAUNCHER"       name: "GRN LAUNCHER"  // under construction
bulletSpeed: 3.5,          bulletSpeed: 3,
loadingTime: 380,          loadingTime: 400,
***wobject***
blowAway: 0.05,            blowAway: 0.3,
gravity: 0.04983642578125, gravity: 0.01983642578125,
bounce: 0.5,               bounce: 0.4,
hitDamage: 6,              hitDamage: 4,
timeToExplo: 130,          timeToExplo: 140,

***weapon***
name: "FLAMER"             name: "FLAMER"
fireCone: 4,               fireCone: 20,
launchSound: 12,           launchSound: -1,

***weapon***
name: "RIFLE"              name: "RIFLE"
loadingTime: 250,          loadingTime: 280,
*wobject***
hitDamage: 34,             hitDamage: 32, // make rifle great again!

***weapon***
name: "ACID FAN"           name: "ACID FAN"
ammo: 150,                 ammo: 140,
loadingTime: 275,          loadingTime: 300,

***weapon***
name: "CHAINGUN"           name: "CHAINGUN"
loadingTime: 350,          loadingTime: 299,
fireCone: 2,               fireCone: 6,

***weapon***
name: "SCATTERGUN"         name: "SCATTERGUN"
loadingTime: 370,          loadingTime: 375,
fireCone: 2,               fireCone: 6,

***weapon***
name: "MINIGUN"            name: "MINIGUM"
loadingTime: 330,          loadingTime: 360,

***weapon***
name: "DARTGUN"            name: "DARTGUN"
loadingTime: 280,          loadingTime: 217,  // it was absurdly low...

***weapon***
name: "LASER"              name: "LASER"
launchSound: 27,           launchSound: -1,

***weapon***
name: "MINI NUKE"          name: "MINI NUKE"
delay: 45,                 delay: 30,

***weapon***
name: "ZIMM"               name: "ZIMM"
loadingTime: 500,          loadingTime: 540,

***weapon***
name: "MISSILE"            name: "MISSILE"
loadingTime: 420,          loadingTime: 480,

***roo***
