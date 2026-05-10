// Commento generale file: logica principale dello script.
// ============================================================
// SELVA OSCURA Logica principale
// Strategia animazione: swap di immagini 
// ============================================================

'use strict';
function getCoreRuntime() {
    return window.GameCore || null;
}
const CURRENT_CIRCLE_KEY = getCoreRuntime()?.keys?.currentCircle || 'cerchio_corrente';
const TARGET_CIRCLE_KEY = getCoreRuntime()?.keys?.targetCircle || 'cerchio_destinazione';
const CURRENT_MAP_KEY = getCoreRuntime()?.keys?.currentMap || 'mappa_corrente';
const ROSTER_KEY = getCoreRuntime()?.keys?.roster || 'dannato_schierato';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

// ============================================================
// VIEWPORT
// ============================================================

const BASE_WIDTH  = 1920;
const BASE_HEIGHT = 1080;
const GROUND_SCREEN_RATIO = 0.30;

let viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.max(1, window.devicePixelRatio || 1),
    scale: 1,
    visibleWorldWidth:  BASE_WIDTH,
    visibleWorldHeight: BASE_HEIGHT,
};

function updateViewportMetrics() {
    viewport.width  = Math.max(1, Math.floor(window.innerWidth));
    viewport.height = Math.max(1, Math.floor(window.innerHeight));
    viewport.dpr    = Math.max(1, window.devicePixelRatio || 1);
    viewport.scale  = Math.max(viewport.width / BASE_WIDTH, viewport.height / BASE_HEIGHT);
    viewport.visibleWorldWidth  = viewport.width  / viewport.scale;
    viewport.visibleWorldHeight = viewport.height / viewport.scale;
}

function resizeCanvas() {
    updateViewportMetrics();
    canvas.width  = Math.floor(viewport.width  * viewport.dpr);
    canvas.height = Math.floor(viewport.height * viewport.dpr);
    canvas.style.width  = viewport.width  + "px";
    canvas.style.height = viewport.height + "px";
    ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
}

resizeCanvas();
window.addEventListener("resize",            resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);
window.addEventListener("fullscreenchange",  resizeCanvas);

// ============================================================
// CARICAMENTO IMMAGINI
// ============================================================

function loadImage(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = () => { console.warn("Immagine non trovata:", src); resolve(null); };
        img.src = src;
    });
}

// ============================================================
// CONFIGURAZIONE ANIMAZIONI 
// ============================================================

// Dante: idle=12 frame, left=6 frame, right=6 frame
const DANTE_ANIM = {
    idle:  { folder: 'assets/img/personaggi/dante_spritesheet/Dante_idle_frames/',  count: 12 },
    left:  { folder: 'assets/img/personaggi/dante_spritesheet/Dante_left_frames/',  count: 6  },
    right: { folder: 'assets/img/personaggi/dante_spritesheet/Dante_right_frames/', count: 6  },
};

// Virgilio: solo idle=12 frame
const VIRGILIO_ANIM = {
    idle: { folder: 'assets/img/personaggi/virgilio_spritesheet/Virgilio_idle_frames/', count: 12 },
};

// Dati dannati
let DANNATI_DATA = {
    leone: {
        nome:       'Leone',
        tipo:       'leone',
        imgPath:    'assets/img/bestie/leone_idle_frames/frame_000.png',
        maxHP:      150,
        hp:         150,
        attacco:    17,
        skill:      'Ruggito Terrificante',
        descrizione:'Un leone feroce che blocca il cammino. Simbolo della violenza.',
    },
    lonza: {
        nome:       'Lonza',
        tipo:       'lonza',
        imgPath:    'assets/img/bestie/lonza_idle_frames/frame_000.png',
        maxHP:      135,
        hp:         135,
        attacco:    17,
        skill:      'Salto Agile',
        descrizione:'Una lonza veloce e ingannevole. Simbolo della lussuria.',
    },
    lupa: {
        nome:       'Lupa',
        tipo:       'lupa',
        imgPath:    'assets/img/bestie/lupa_idle_frames/frame_000.png',
        maxHP:      145,
        hp:         145,
        attacco:    18,
        skill:      'Morso Avvelenato',
        descrizione:'Una lupa famelica che tutto divora. Simbolo dell\'avarizia.',
    },
};

let DANNATI_DATA_EN = {
    leone: {
        nome: 'Lion',
        tipo: 'leone',
        imgPath: 'assets/img/bestie/leone_idle_frames/frame_000.png',
        maxHP: 150,
        hp: 150,
        attacco: 17,
        skill: 'Terrifying Roar',
        descrizione: 'A fierce lion that blocks the path. Symbol of violence.'
    },
    lonza: {
        nome: 'Leopard',
        tipo: 'lonza',
        imgPath: 'assets/img/bestie/lonza_idle_frames/frame_000.png',
        maxHP: 135,
        hp: 135,
        attacco: 17,
        skill: 'Agile Leap',
        descrizione: 'A swift and deceptive leopard. Symbol of lust.'
    },
    lupa: {
        nome: 'Wolf',
        tipo: 'lupa',
        imgPath: 'assets/img/bestie/lupa_idle_frames/frame_000.png',
        maxHP: 145,
        hp: 145,
        attacco: 18,
        skill: 'Poisoned Bite',
        descrizione: 'A ravenous she-wolf that devours everything. Symbol of greed.'
    }
};

let STARTER_DATA_RUNTIME = null;

async function waitForCoreRuntime(maxMs = 1600) {
    const begin = performance.now();
    while (performance.now() - begin < maxMs) {
        const core = getCoreRuntime();
        if (core) {
            return core;
        }
        await new Promise((resolve) => setTimeout(resolve, 30));
    }
    return null;
}

async function hydrateSelvaStarterDataFromCatalog() {
    // Allinea i dati mostrati e salvati nella Selva al catalogo unificato.
    const core = getCoreRuntime();
    let catalog = null;

    try {
        if (core?.units?.loadCatalog) {
            catalog = await core.units.loadCatalog();
        }
    } catch {
        catalog = null;
    }

    if (!catalog) {
        try {
            const res = await fetch('assets/data/combat_data/units_catalog.json', { cache: 'no-store' });
            if (res.ok) {
                catalog = await res.json();
            }
        } catch {
            catalog = null;
        }
    }

    if (!catalog) {
        STARTER_DATA_RUNTIME = null;
        return;
    }

    const starters = ['leone', 'lonza', 'lupa'];
    const byLang = (lang) => {
        const out = {};
        starters.forEach((specie) => {
            const raw = catalog?.starters?.[specie] || {};
            const i18n = raw?.i18n?.[lang] || {};
            const maxHP = Number(raw.maxHP || 100);
            const attacco = Number(raw.attacco || 10);
            const attaccoSpeciale = Number(raw.attaccoSpeciale || Math.round(attacco * 1.4));
            out[specie] = {
                nome: i18n.nome || raw.nome || specie,
                tipo: raw.specie || specie,
                imgPath: raw.imgPath || `assets/img/bestie/${specie}_idle_frames/frame_000.png`,
                maxHP,
                hp: maxHP,
                attacco,
                attaccoSpeciale,
                skill: i18n.speciale || raw.speciale || raw.skill || 'Speciale',
                descrizione: i18n.descrizione || raw.descrizione || ''
            };
        });
        return out;
    };

    STARTER_DATA_RUNTIME = {
        it: byLang('it'),
        en: byLang('en')
    };
}
const SELVA_POPUP_I18N = {
    it: {
        chosen: 'Hai scelto: ',
        hp: 'HP',
        attack: 'Attacco',
        skill: 'Skill',
        ready: "Preparati... il viaggio nell'Inferno inizia."
    },
    en: {
        chosen: 'You chose: ',
        hp: 'HP',
        attack: 'Attack',
        skill: 'Skill',
        ready: 'Prepare yourself... the journey into Hell begins.'
    }
};

function getLinguaCorrente() {
    return localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
}

function getDannatoData(tipo) {
    const lingua = getLinguaCorrente();
    if (STARTER_DATA_RUNTIME && STARTER_DATA_RUNTIME[lingua]?.[tipo]) {
        return STARTER_DATA_RUNTIME[lingua][tipo];
    }
    const source = lingua === 'en' ? DANNATI_DATA_EN : DANNATI_DATA;
    return source[tipo];
}

// ============================================================
// STATO GLOBALE
// ============================================================

// Configurazione frame bestie e porta (12 frame ciascuno)
const BESTIE_ANIM = {
    leone: { folder: 'assets/img/bestie/leone_idle_frames/', count: 12 },
    lonza: { folder: 'assets/img/bestie/lonza_idle_frames/', count: 12 },
    lupa:  { folder: 'assets/img/bestie/lupa_idle_frames/',  count: 12 },
};
const PORTA_ANIM = { folder: 'assets/img/oggetti/porta_inferno_frames/', count: 12 };

const BESTIE_FALLBACK = {
    leone: 'assets/img/bestie/leone.png',
    lonza: 'assets/img/bestie/lonza.png',
    lupa:  'assets/img/bestie/lupa.png',
};
const PORTA_FALLBACK = 'assets/img/oggetti/porta_inferno.png';

let assets = {
    forest:   null,
    leoneFr:  [], lonzaFr: [], lupaFr: [], portaFr: [],
    danteFrames:    { idle: [], left: [], right: [] },
    virgilioFrames: { idle: [] },
};

let camera = { x: 0, y: 0 };

let dante = {
    x: 2000, y: 2025,
    w: 80,
    speed: 5,
    state: 'idle',   // 'idle' | 'left' | 'right'
    frame: 0,
    frameTimer: 0,
    frameDuration: 80, // ms per frame
};

let virgilio = {
    x: 2720, y: 2025,
    w: 80,
    state: 'idle',
    frame: 0,
    frameTimer: 0,
    frameDuration: 100,
};

const PORTA = {
    x: 2770,
    y: 1738,
    w: 400
};

// Collisione Virgilio
const VIRGILIO_COLLIDE_RADIUS = 60; // pixel-mondo

let virgilioDialogMostrato = false;
let dialogAperto           = false;
let gameBloccato           = false;

let keys = { left: false, right: false };

let lastTime = 0;

// Tile mappa di sfondo
const TILE_W = 1920;
const TILE_H = 1080;

// Posizioni bestie key corrisponde a assets.[key]Fr
const BEASTS = [
    { key: 'leone', frKey: 'leoneFr', x: 1400, y: 1918, w: 120 },
    { key: 'lonza', frKey: 'lonzaFr', x: 1250, y: 1942, w: 120 },
    { key: 'lupa',  frKey: 'lupaFr',  x: 1100, y: 1913, w: 120 },
];

// Barriera invisibile davanti alla lupa (lato di arrivo di Dante).
const LUPA_WALL_X = 1540;

// Stato animazione condiviso per bestie e porta (stessa velocita).
let beastFrame = 0;
let beastFrameTimer = 0;
const BEAST_FRAME_DURATION = 120; // ms per frame

let portaFrame = 0;
let portaFrameTimer = 0;
const PORTA_FRAME_DURATION = 120;

// ============================================================
// CARICAMENTO FRAME 
// ============================================================

async function loadFrames(animCfg) {
    const frames = [];
    for (let i = 0; i < animCfg.count; i++) {
        // Formato: frame_000.png, frame_001.png, ...
        const src = animCfg.folder + 'frame_' + String(i).padStart(3, '0') + '.png';
        const img = await loadImage(src);
        frames.push(img);
    }
    return frames;
}

// Carica frame con fallback a immagine statica se la cartella non esiste
async function loadFramesWithFallback(animCfg, fallbackSrc) {
    // Prova il primo frame: se esiste carica tutto, altrimenti usa fallback statico
    const testSrc = animCfg.folder + 'frame_000.png';
    const test = await loadImage(testSrc);
    if (test) {
        const arr = [test];
        for (let i = 1; i < animCfg.count; i++) {
            arr.push(await loadImage(animCfg.folder + 'frame_' + String(i).padStart(3, '0') + '.png'));
        }
        return arr;
    }
    // Fallback: array di 1 immagine statica, simula 1 frame
    const fallback = await loadImage(fallbackSrc);
    return fallback ? [fallback] : [];
}

async function loadAssets() {
    assets.forest = await loadImage("assets/img/mappe/selva_oscura.png");

    // Bestie animate
    assets.leoneFr = await loadFramesWithFallback(BESTIE_ANIM.leone, BESTIE_FALLBACK.leone);
    assets.lonzaFr = await loadFramesWithFallback(BESTIE_ANIM.lonza, BESTIE_FALLBACK.lonza);
    assets.lupaFr  = await loadFramesWithFallback(BESTIE_ANIM.lupa,  BESTIE_FALLBACK.lupa);

    // Porta animata
    assets.portaFr = await loadFramesWithFallback(PORTA_ANIM, PORTA_FALLBACK);

    // Frame Dante
    assets.danteFrames.idle  = await loadFrames(DANTE_ANIM.idle);
    assets.danteFrames.left  = await loadFrames(DANTE_ANIM.left);
    assets.danteFrames.right = await loadFrames(DANTE_ANIM.right);

    // Frame Virgilio
    assets.virgilioFrames.idle = await loadFrames(VIRGILIO_ANIM.idle);
}

// ============================================================
// INPUT
// ============================================================

document.addEventListener("keydown", e => {
    if (gameBloccato) return;
    if (window.GameCore?.ui?.pause?.isPaused()) return;
    if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") keys.left  = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft"  || e.key === "a" || e.key === "A") keys.left  = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
});


// ============================================================
// UPDATE
// ============================================================

function update(dt) {
    if (gameBloccato) return;

    // Movimento Dante
    let moved = false;
    if (keys.left) {
        const nextX = dante.x - dante.speed;
        // Blocca il passaggio oltre il muro invisibile vicino alle bestie.
        dante.x = Math.max(LUPA_WALL_X, nextX);
        dante.state = 'left';
        moved       = true;
    } else if (keys.right) {
        dante.x    = Math.min(PORTA.x + PORTA.w + 100, dante.x + dante.speed);
        dante.state = 'right';
        moved       = true;
    } else {
        dante.state = 'idle';
    }

    // Aggiorna frame Dante
    dante.frameTimer += dt;
    if (dante.frameTimer >= dante.frameDuration) {
        dante.frameTimer = 0;
        const frameCount = assets.danteFrames[dante.state].length || 1;
        dante.frame = (dante.frame + 1) % frameCount;
    }
    // Reset frame quando si cambia stato (evita out-of-bounds)
    const dFrameCount = assets.danteFrames[dante.state].length || 1;
    if (dante.frame >= dFrameCount) dante.frame = 0;

    // Aggiorna frame Virgilio (solo idle)
    virgilio.frameTimer += dt;
    if (virgilio.frameTimer >= virgilio.frameDuration) {
        virgilio.frameTimer = 0;
        const vFrameCount = assets.virgilioFrames.idle.length || 1;
        virgilio.frame = (virgilio.frame + 1) % vFrameCount;
    }

    // Aggiorna frame bestie
    beastFrameTimer += dt;
    if (beastFrameTimer >= BEAST_FRAME_DURATION) {
        beastFrameTimer = 0;
        // usa la lunghezza del primo set caricato come riferimento
        const n = assets.leoneFr.length || 1;
        beastFrame = (beastFrame + 1) % n;
    }

    // Aggiorna frame porta
    portaFrameTimer += dt;
    if (portaFrameTimer >= PORTA_FRAME_DURATION) {
        portaFrameTimer = 0;
        const n = assets.portaFr.length || 1;
        portaFrame = (portaFrame + 1) % n;
    }

    // Camera
    camera.x = dante.x - viewport.visibleWorldWidth  / 2;
    camera.y = dante.y - viewport.visibleWorldHeight / 2;

    // Collisione con Virgilio
    if (!virgilioDialogMostrato && !dialogAperto) {
        const dx = dante.x - virgilio.x;
        const dy = dante.y - virgilio.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < VIRGILIO_COLLIDE_RADIUS) {
            virgilioDialogMostrato = true;
            mostraDialogDannato();
        }
    }
}

// ============================================================
// DISEGNO
// ============================================================

function drawTiledBackground() {
    if (!assets.forest) return;
    const startX = Math.floor(camera.x / TILE_W) - 1;
    const startY = Math.floor(camera.y / TILE_H) - 1;
    const endX   = startX + Math.ceil(viewport.visibleWorldWidth  / TILE_W) + 3;
    const endY   = startY + Math.ceil(viewport.visibleWorldHeight / TILE_H) + 3;

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            ctx.drawImage(assets.forest, x * TILE_W, y * TILE_H, TILE_W, TILE_H);
        }
    }
}

function drawSprite(img, worldX, worldY, targetW) {
    if (!img) return;
    const scale   = targetW / img.width;
    const targetH = img.height * scale;
    ctx.drawImage(img, worldX, worldY, targetW, targetH);
}

function drawCharacter(frames, frameIdx, worldX, worldY, targetW) {
    if (!frames || frames.length === 0) return;
    const safeIdx = Math.min(frameIdx, frames.length - 1);
    const img     = frames[safeIdx];
    if (!img) return;
    const scale   = targetW / img.width;
    const targetH = img.height * scale;
    // Ancora in basso al centro
    ctx.drawImage(img, worldX - targetW / 2, worldY - targetH, targetW, targetH);
}

function draw() {
    ctx.setTransform(viewport.dpr, 0, 0, viewport.dpr, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    ctx.save();
    ctx.scale(viewport.scale, viewport.scale);
    const groundOffset = viewport.visibleWorldHeight * GROUND_SCREEN_RATIO;
    ctx.translate(-camera.x, -camera.y + groundOffset);

    // Sfondo tiled
    drawTiledBackground();

    // Bestie animate
    BEASTS.forEach(b => {
        const fr = assets[b.frKey];
        if (fr && fr.length > 0) {
            const idx = beastFrame % fr.length;
            drawSprite(fr[idx], b.x, b.y, b.w);
        }
    });

    // Porta animata
    if (assets.portaFr && assets.portaFr.length > 0) {
        const idx = portaFrame % assets.portaFr.length;
        drawSprite(assets.portaFr[idx], PORTA.x, PORTA.y, PORTA.w);
    }

    // Y-sort: Dante e Virgilio
    const chars = [
        { type: 'dante',    y: dante.y    },
        { type: 'virgilio', y: virgilio.y },
    ];
    chars.sort((a, b) => a.y - b.y);

    for (const c of chars) {
        if (c.type === 'dante') {
            const frames = assets.danteFrames[dante.state];
            drawCharacter(frames, dante.frame, dante.x, dante.y, dante.w);
        } else {
            const frames = assets.virgilioFrames.idle;
            drawCharacter(frames, virgilio.frame, virgilio.x, virgilio.y, virgilio.w);
        }
    }

    ctx.restore();
}

// ============================================================
// DIALOG SCELTA DANNATO
// ============================================================

function mostraDialogDannato() {
    dialogAperto  = true;
    gameBloccato  = true;
    keys.left     = false;
    keys.right    = false;

    const overlay = document.getElementById('dialog-overlay');
    overlay.classList.remove('nascosto');

    // Popola immagini e statistiche bestie nel dialog usando i dati unificati.
    Object.keys(DANNATI_DATA).forEach((key) => {
        const dati = getDannatoData(key);
        const card = document.getElementById('card-' + key);
        if (!card || !dati) {
            return;
        }

        const img = card.querySelector('img');
        if (img) {
            img.src = dati.imgPath;
        }

        const hpNode = card.querySelector('.stat.hp');
        const atkNode = card.querySelector('.stat.atk');
        if (hpNode) {
            hpNode.textContent = 'HP ' + Number(dati.maxHP || dati.hp || 0);
        }
        if (atkNode) {
            atkNode.textContent = 'ATK ' + Number(dati.attacco || 0);
        }
    });
}
function selezionaDannato(tipo) {
    const dati = getDannatoData(tipo);
    if (!dati) return;
    const lingua = getLinguaCorrente();
    const testi = SELVA_POPUP_I18N[lingua];

    let unita = {
        nome: dati.nome,
        specie: dati.tipo,
        imgPath: dati.imgPath,
        maxHP: dati.maxHP,
        hp: dati.hp,
        attacco: dati.attacco,
        speciale: dati.skill,
        attaccoSpeciale: Number(dati.attaccoSpeciale || Math.round(dati.attacco * 1.4)),
        descrizione: dati.descrizione
    };
    const core = getCoreRuntime();
    if (core?.units?.normalize) {
        unita = core.units.normalize(unita);
    }

    if (core?.units?.saveRoster) {
        core.units.saveRoster([unita]);
    } else {
        sessionStorage.setItem(ROSTER_KEY, JSON.stringify([unita]));
    }

    // Nuova partita: assegna monete iniziali e azzera inventario/escape.
    localStorage.setItem('inferno_coins', '10');
    localStorage.setItem('inferno_inventory', JSON.stringify({}));
    sessionStorage.removeItem('combat_escape_used');

    // Feedback visivo
    const overlay = document.getElementById('dialog-overlay');
    const contenuto = overlay.querySelector('.dialog-box');
    contenuto.innerHTML = `
        <div class="dialog-conferma">
            <img src="${dati.imgPath}" alt="${dati.nome}" class="conferma-img">
            <h2 class="conferma-titolo">${testi.chosen}${dati.nome.toUpperCase()}</h2>
            <p class="conferma-desc">${dati.descrizione}</p>
            <div class="conferma-stats">
                <span>${testi.hp}: ${dati.hp}</span>
                <span>${testi.attack}: ${dati.attacco}</span>
                <span>${testi.skill}: ${dati.skill}</span>
            </div>
            <p class="conferma-attesa">${testi.ready}</p>
        </div>
    `;

    // Transizione dopo 3 secondi
    setTimeout(() => {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 1s ease';
        setTimeout(() => {
            // Reset progressione: una nuova partita riparte dalla Selva (livello 0).
            localStorage.setItem(CURRENT_CIRCLE_KEY, '0');
            localStorage.removeItem(TARGET_CIRCLE_KEY);
            localStorage.removeItem(CURRENT_MAP_KEY);
            if (core?.nav?.goWithLoading) {
                core.nav.goWithLoading('porta.html', { profile: 'generic', from: 'selva_oscura.html' });
            } else {
                window.location.href = 'porta.html';
            }
        }, 1000);
    }, 3000);
}

// ============================================================
// LOOP PRINCIPALE
// ============================================================

function loop(timestamp) {
    const dt = Math.min(timestamp - lastTime, 100); // max 100ms delta
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

async function start() {
    await waitForCoreRuntime();

    const coreGuide = getCoreRuntime();
    if (coreGuide?.ui?.guideOnce) {
        coreGuide.ui.guideOnce({
            id: 'guida_selva_modal_v1',
            title: { it: 'Guida Selva Oscura', en: 'Dark Forest Guide' },
            lines: {
                it: ['Usa A/D o frecce sinistra/destra per muovere Dante.'],
                en: ['Use A/D or left/right arrows to move Dante.']
            },
            button: { it: 'Iniziamo', en: "Let's start" }
        });
    }

    await hydrateSelvaStarterDataFromCatalog();
    await loadAssets();
    lastTime = performance.now();
    requestAnimationFrame(loop);
}

start();













