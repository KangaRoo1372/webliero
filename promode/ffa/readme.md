# PROMODE (Re)ReReVisited (a.k.a. KDP New Promode ffa edition)

Hi guys!

As you read in the previous readme file, you can find here my version of Webliero Promode ReRevisited Mod, reworked to make it suitable for FFA (free for all) games. The mod is based on the latest version of original Promode ReRevisited, i.e. 1.3.2. BETA. It is also recommended to use original Promode ReReviisted sprites while playing this mod (you can find the wlsprt file in the official Promode ReRevisited repository on gitlab).

Basically, all changes I made - comparing to Promode ReRevisited original settings - refer only to some weapons (the gravity or other main "physics" parameters of the gameplay, which you can find in part "contants" and "textures", remains unchanged). Here you can find the full list of aforementioned changes:


|  NEW SETTINGS         |      ORIGINAL SETTINGS
|----------------------  ------------------------
|***weapon***           
|name: "MORTAR"         |   name: "MORTAR"
|loadingTime: 360,      |   loadingTime: 300,
|***wobject***
|blowaway: 0,           |    blowaway: 0.1,   // mortar pulling effect removed
|createonexp: 22,       |    createonexp: 27,
|splinterAmount: 20,    |    splinterAmount: 120,  // mortar splinter delayer
|splinterType: 21,      |    splinterType: 4,

12. ***weapon***
13. name: "GRENADE"            name: "GRENADE"
14. loadingTime: 250,          loadingTime: 200,
15. ***wobject***
16. splinterType: 5,           splinterType: 4,
17. ***nobject***
18. speed: 4,                  speed: 4.5,
19. speedV: 3,                 speedV: 3.5,
20. hitDamage: 3,              hitDamage: 4.2
21. bloodOnHit: 6,             bloodOnHit: 8,
22. timeToExplo: 12,           timeToExplo: 15,
23. timeToExploV: 5            timeToExploV: 7

25. ***weapon***
26. name: "FLAK CANNON"        name: "FLAK CANNON"
27. loadingTime: 480,          loadingTime: 510,
28. ***nobject***
29. hitDamage: 3,              hitDamage: 4,
30. timeToExplo: 12,           timeToExplo: 15,
31. timeToExploV: 5            timeToExploV: 7

33. ***weapon***
34. name: "WINCHESTER"         name: "WINCHESTER"
35. loadingTime: 320,          loadingTime: 400,
36. delay: 20,                 delay: 22,
37. ***wobject***
38. blowAway: 0.2,             blowAway: 0.7,

40. ***weapon***
41. name: "GRN LAUNCHER"       name: "GRN LAUNCHER"  // under construction
42. bulletSpeed: 3.5,          bulletSpeed: 3,
43. loadingTime: 380,          loadingTime: 400,
44. ***wobject***
45. blowAway: 0.05,            blowAway: 0.3,
46. gravity: 0.04983642578125, gravity: 0.01983642578125,
47. bounce: 0.5,               bounce: 0.4,
48. hitDamage: 6,              hitDamage: 4,
49. timeToExplo: 130,          timeToExplo: 140,
 
51. ***weapon***
52. name: "FLAMER"             name: "FLAMER"
53. fireCone: 4,               fireCone: 20,
54. launchSound: 12,           launchSound: -1,
 
56. ***weapon***
57. name: "RIFLE"              name: "RIFLE"
58. loadingTime: 250,          loadingTime: 280,
59. *wobject***
60. hitDamage: 34,             hitDamage: 32, // make rifle great again!

62. ***weapon***
63. name: "ACID FAN"           name: "ACID FAN"
64. ammo: 150,                 ammo: 140,
65. loadingTime: 275,          loadingTime: 300,
 
67. ***weapon***
68. name: "CHAINGUN"           name: "CHAINGUN"
69. loadingTime: 350,          loadingTime: 299,
70. fireCone: 2,               fireCone: 6,
 
72. ***weapon***
73. name: "SCATTERGUN"         name: "SCATTERGUN"
74. loadingTime: 370,          loadingTime: 375,
75. fireCone: 2,               fireCone: 6,

77. ***weapon***
78. name: "MINIGUN"            name: "MINIGUM"
79. loadingTime: 330,          loadingTime: 360,
 
81. ***weapon***
82. name: "DARTGUN"            name: "DARTGUN"
83. loadingTime: 280,          loadingTime: 217,  // it was absurdly low...

85. ***weapon***
86. name: "LASER"              name: "LASER"
87. launchSound: 27,           launchSound: -1,

89. ***weapon***
90. name: "MINI NUKE"          name: "MINI NUKE"
91. delay: 45,                 delay: 30,
 
93. ***weapon***
94. name: "ZIMM"               name: "ZIMM"
95. loadingTime: 500,          loadingTime: 540,

97. ***weapon***
98. name: "MISSILE"            name: "MISSILE"
99. loadingTime: 420,          loadingTime: 480,

***roo***
