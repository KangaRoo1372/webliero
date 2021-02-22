const baseURL = "https://webliero.gitlab.io/webliero-maps/"

let pool = [];
let currentMapIdx = 0;

export async function setPool(poolUrl) {
    pool = await (await fetch(baseURL + poolUrl)).json();
    if (!Array.isArray(pool)) {
        throw new Error("Pool should be an array.");
    }
    currentMapIdx = 0;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function shuffle() {
    shuffleArray(pool);
}

export async function loadNextMap(wlRoom) {
    let mapUrl = pool[currentMapIdx++];
    if ( currentMapIdx >= pool.length ) currentMapIdx = 0;
    try {
        let mapData = await (await fetch(baseURL + mapUrl)).arrayBuffer();
        if (mapUrl.split('.').pop()=="png") {    
            wlRoom.loadPNGLevel(mapUrl, mapData);
        } else {
            wlRoom.loadLev(mapUrl, mapData);
        }
    }catch(e) {
        console.log("Failed to load map: " + mapUrl);
        wlRoom.restartGame();
    }
}