Hello guys!

In this repository you can find a small Webliero mod called simply "detonator mod". As the name suggests, the aim of this mod was to create a special weapon - currently a bomb which would explode on remote detonation. I was sure that it's impossible to create such type of weapon in Webliero, but then I hit upon a great idea to use... booby trap special facility in this purpose.

Maybe you know or not, but booby trap (or sctrictly speaking - a wobject 34) has one special feature, regarding the "affectbyexplosion" parameter. Generally, this parameter decides whether the object is affected by explosions' push force. That means, if it is set "true", then the object will be pushed away on sobject's explosion (vide the parameter "blowaway" in sobject), if set "false" - not. But, there is one exception from this rule: it works differently on wobject 34. So, if you set "true" on wobject 34, then the object won't be pushed away, but it will explode. This is hardcoded which means that it works like this only with wid 34. That's because wobject 34 was originally (in liero 1.33) a booby trap, to make it behave like bonuses (bonuses explode on sobject's explosion).

So, I used wid34 to make a weapon (called REMOTE BOMB), which doesn't explode on worm touch or ground touch. It explodes only in 2 cases: spontaneously after some time, or when u use DETONATOR. It was kindy tricky to make it work in that way (the DETONATOR creates one 1 sobject with very small dmg but with over 1000 range), so I had to make a lot of changes regarding blood (I had to make blood particle - nid6 - invisible and remove blood trail from it... since in webliero, when worm is in the range of sobject's explosion,   it bleeds... so, if I didn't remove blood, the worm would bleed every time when using detonator). Also, to make this mod fun to play, I decided to make totally 5 weapons. Generally, the idea was to create 3 types of bombs (which would work differently), 1 detonator to detonate the REMOTE BOMB, and... acid fan to move all bombs. Here is the full weapon list:

1. REMOTE BOMB - explodes spontaneously after some time & when you use DETONATOR.
2. NORMAL BOMB - explodes spontanteously after some time & on worm touch.
3. GRAVITY BOMB - explodes spontaneously after some time & on worm touch  (with very big push back).
4. DETONATOR - used to detonate REMOTE BOMB.
5. ACID FAN - used to move all types of bombs on the map.

Since the wobject 34 creates only one sobject on explosion when it is "detonated", I had to use bigger sprites for its explosion (credits: big thanks to dsds who gave me this idea!). Currently, I used sprites taken from Daro's WA mod for that case.

***roo***
