// Commento generale file: logica principale dello script.
'use strict';

// Configurazione principale della tilemap.
const TILE_SIZE = 32;
const MAP_W = 64;
const MAP_H = 64;
const MAP_PX_W = MAP_W * TILE_SIZE;
const MAP_PX_H = MAP_H * TILE_SIZE;

// Parametri di movimento e inseguimento.
const BASE_FRAME_MS = 1000 / 60;
const MOVE_SPEED = 2.2;
const FOLLOW_SPEED = 2.1;
const FOLLOW_DELAY_POINTS = 34;
const MINIMAP_REFRESH_MS = 90;
const DANTE_INTERACTION_Y_OFFSET = 22;
const DANTE_INTERACTION_RADIUS = 14;
// Fattore di scala globale del trigger incontro (riduci/aumenta facilmente da qui).
const ENCOUNTER_RADIUS_SCALE = 0.50;

// Parametri mappa configurabili via game_rules.json.
const MAP_RULES_DEFAULT = {
    collisionRadius: 6,
    enemyFrameCount: 12,
    enemyAnimStepMs: 200,
    encounterTransitionMs: 120,
    enemyCount: 3,
    enemySpawnMode: 'fixed'
};

let MAP_COLLISION_RADIUS = MAP_RULES_DEFAULT.collisionRadius;
let MAP_ENEMY_FRAME_COUNT = MAP_RULES_DEFAULT.enemyFrameCount;
let MAP_ENEMY_ANIM_STEP_MS = MAP_RULES_DEFAULT.enemyAnimStepMs;
let MAP_ENCOUNTER_TRANSITION_MS = MAP_RULES_DEFAULT.encounterTransitionMs;
let MAP_ENEMY_COUNT = MAP_RULES_DEFAULT.enemyCount;
let MAP_ENEMY_SPAWN_MODE = MAP_RULES_DEFAULT.enemySpawnMode;

// -----------------------------------------------------------------------------
// BLOCCHI DA MODIFICARE VELOCEMENTE (lasciati in alto apposta per editing manuale)
// -----------------------------------------------------------------------------

// Spawn Dante/Virgilio per ogni mappa: ora entrambi a (0,0) come richiesto.
const PLAYER_SPAWN_BY_MAP = {
    map_1: { dante: { x: 30, y: 23 }, virgilio: { x: 30, y: 21 } },
    map_2: { dante: { x: 12, y: 10 }, virgilio: { x: 12, y: 8 } },
    map_3: { dante: { x: 16, y: 28 }, virgilio: { x: 16, y: 26 } },
    map_4: { dante: { x: 32, y: 16 }, virgilio: { x: 32, y: 14 } },
    map_5: { dante: { x: 18, y: 18 }, virgilio: { x: 18, y: 16 } },
    map_6: { dante: { x: 22, y: 20 }, virgilio: { x: 22, y: 18 } },
    map_7: { dante: { x: 17, y: 27 }, virgilio: { x: 17, y: 25 } },
    map_8: { dante: { x: 32, y: 38 }, virgilio: { x: 32, y: 36 } },
    map_9: { dante: { x: 17, y: 21 }, virgilio: { x: 17, y: 19 } }
};

// Posizioni dannati per mappa: placeholder random iniziale; puoi editarle dopo.
const ENEMY_SPAWN_BY_MAP = {
    // Coordinate fisse dei dannati per mappa in TILE (tx, ty).
    // Il motore converte automaticamente in pixel con TILE_SIZE.
    // Cerchi 1-8: 3 dannati. Cerchio 9: 1 boss.
    map_1: [
        { id: 0, tx: 25, ty: 32 },
        { id: 1, tx: 27, ty: 44 },
        { id: 2, tx: 46, ty: 42 }
    ],
    map_2: [
        { id: 0, tx: 46, ty: 9 },
        { id: 1, tx: 19, ty: 53 },
        { id: 2, tx: 51, ty: 53 }
    ],
    map_3: [
        { id: 0, tx: 24, ty: 47 },
        { id: 1, tx: 49, ty: 45 },
        { id: 2, tx: 44, ty: 21 }
    ],
    map_4: [
        { id: 0, tx: 17, ty: 23 },
        { id: 1, tx: 32, ty: 36 },
        { id: 2, tx: 36, ty: 50 }
    ],
    map_5: [
        { id: 0, tx: 48, ty: 16 },
        { id: 1, tx: 26, ty: 44 },
        { id: 2, tx: 54, ty: 29 }
    ],
    map_6: [
        { id: 0, tx: 43, ty: 50 },
        { id: 1, tx: 25, ty: 47 },
        { id: 2, tx: 46, ty: 23 }
    ],
    map_7: [
        { id: 0, tx: 48, ty: 27 },
        { id: 1, tx: 48, ty: 45 },
        { id: 2, tx: 16, ty: 34 }
    ],
    map_8: [
        { id: 0, tx: 30, ty: 49 },
        { id: 1, tx: 30, ty: 13 },
        { id: 2, tx: 39, ty: 36 }
    ],
    map_9: [
        { id: 0, tx: 31, ty: 33 }
    ]
};

// Configurazione mappe attive: 9 mappe complete.
const MAP_CONFIG = {
    map_1: { image: 'assets/img/mappe/mappe_gioco/mappa_1.png', json: 'assets/data/mappe/mappa_1.json', circle: 1 },
    map_2: { image: 'assets/img/mappe/mappe_gioco/mappa_2.png', json: 'assets/data/mappe/mappa_2.json', circle: 2 },
    map_3: { image: 'assets/img/mappe/mappe_gioco/mappa_3.png', json: 'assets/data/mappe/mappa_3.json', circle: 3 },
    map_4: { image: 'assets/img/mappe/mappe_gioco/mappa_4.png', json: 'assets/data/mappe/mappa_4.json', circle: 4 },
    map_5: { image: 'assets/img/mappe/mappe_gioco/mappa_5.png', json: 'assets/data/mappe/mappa_5.json', circle: 5 },
    map_6: { image: 'assets/img/mappe/mappe_gioco/mappa_6.png', json: 'assets/data/mappe/mappa_6.json', circle: 6 },
    map_7: { image: 'assets/img/mappe/mappe_gioco/mappa_7.png', json: 'assets/data/mappe/mappa_7.json', circle: 7 },
    map_8: { image: 'assets/img/mappe/mappe_gioco/mappa_8.png', json: 'assets/data/mappe/mappa_8.json', circle: 8 },
    map_9: { image: 'assets/img/mappe/mappe_gioco/mappa_9.png', json: 'assets/data/mappe/mappa_9.json', circle: 9 }
};

// Idle sprite per specie dannati usati in mappa.
const MAP_ENEMY_IDLE_FOLDER = {
    limbo: 'assets/img/dannati/Cerchio_1/cerchio_1_pagano_idle_frames/',
    lussurioso: 'assets/img/dannati/Cerchio_2/cerchio_2__lussurioso_idle_frames/',
    goloso: 'assets/img/dannati/Cerchio_3/cerchio_3_goloso_idle_frames/',
    avaro: 'assets/img/dannati/Cerchio_4/01_Avaro/cerchio_4_avaro_idle_frames/',
    prodigo: 'assets/img/dannati/Cerchio_4/02_Prodigo/cerchio_4_prodigo_idle_frames/',
    iracondo: 'assets/img/dannati/Cerchio_5/01_Iracondi/cerchio_5_iracondo_idle_frames/',
    accidioso: 'assets/img/dannati/Cerchio_5/02_Accidiosi/cerchio_5_accidioso_idle_frames/',
    eretico: 'assets/img/dannati/Cerchio_6/cerchio_6_eretico_idle_frames/',
    violenza_altri: 'assets/img/dannati/Cerchio_7/01_violenza_contro_altri/cerchio_7_violenza_altri_idle_frames/',
    violenza_se: 'assets/img/dannati/Cerchio_7/02_violenza_contro_se/cerchio_7_violenza_se_idle_frames/',
    violenza_dio: 'assets/img/dannati/Cerchio_7/03_violenza_contro_dio/cerchio_7_violenza_dio_idle_frames/',
    fraudolento: 'assets/img/dannati/Cerchio_8/cerchio_8_fraudolento_idle_frames/',
    traditore: 'assets/img/dannati/Cerchio_9/cerchio_9_traditori_idle_frames/'
};
// Altezza render dei dannati in mappa (px): puoi regolare liberamente specie per specie.
const ENEMY_HEIGHT_BY_SPECIES = {
    limbo: 90,
    lussurioso: 90,
    goloso: 77,
    avaro: 105,
    prodigo: 92,
    iracondo: 80,
    accidioso: 120,
    eretico: 115,
    violenza_altri: 100,
    violenza_se: 125,
    violenza_dio: 90,
    fraudolento: 110,
    traditore: 150
};

// Informazioni testuali dei cerchi per HUD.
let CERCHIO_INFO = {};
let CERCHIO_INFO_EN = {};

// Varianti per i cerchi con specie multiple.
const CIRCLE_MULTI_VARIANTS = {
    4: ['avaro', 'prodigo'],
    5: ['iracondo', 'accidioso'],
    7: ['violenza_altri', 'violenza_se', 'violenza_dio']
};

let CIRCLE_DEFAULT_SPECIES = {
    1: 'limbo',
    2: 'lussurioso',
    3: 'goloso',
    4: 'avaro',
    5: 'iracondo',
    6: 'eretico',
    7: 'violenza_altri',
    8: 'fraudolento',
    9: 'traditore'
};

function pickEnemySpeciesForCircle(circle) {
    const pool = CIRCLE_MULTI_VARIANTS[circle];
    if (!Array.isArray(pool) || pool.length === 0) {
        return CIRCLE_DEFAULT_SPECIES[circle] || 'lussurioso';
    }
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
}

function getMapKeyFromCircle(circle) {
    const safe = Math.max(1, Math.min(9, Number(circle) || 1));
    return `map_${safe}`;
}

function randomEnemySpawns(count) {
    const list = [];
    for (let i = 0; i < count; i += 1) {
        list.push({
            id: i,
            x: Math.floor((6 + Math.random() * 50) * TILE_SIZE),
            y: Math.floor((6 + Math.random() * 50) * TILE_SIZE)
        });
    }
    return list;
}

async function loadUnitCatalogForMappa() {
    // Sincronizza specie di default dal catalogo centrale.
    if (!CORE?.units?.loadCatalog || !CORE?.units?.getTemplateBySpecies) {
        return;
    }

    try {
        const catalog = await CORE.units.loadCatalog();
        const mapFromCatalog = catalog?.circleDefaultSpecies || null;
        if (mapFromCatalog && typeof mapFromCatalog === 'object') {
            CIRCLE_DEFAULT_SPECIES = {};
            Object.keys(mapFromCatalog).forEach((k) => {
                CIRCLE_DEFAULT_SPECIES[Number(k)] = String(mapFromCatalog[k]);
            });
        }
    } catch {
        // Fallback su mapping locali.
    }
}const CORE = window.GameCore || null;

const canvasMap = document.getElementById('canvas-mappa');
const ctxMap = canvasMap.getContext('2d');
const canvasSprite = document.getElementById('canvas-sprite');
const ctxSprite = canvasSprite.getContext('2d');
const mini = document.getElementById('minimappa');
const miniCtx = mini.getContext('2d');

const overlay = document.getElementById('overlay-combattimento');
const modal = document.getElementById('encounter-modal');
const btnCombat = document.getElementById('btn-fight-combat');
const btnQuestion = document.getElementById('btn-fight-question');
const coinBox = document.getElementById('coin-box');
const coinImage = document.getElementById('coin-image');
const coinResult = document.getElementById('coin-result');
const titoloHud = document.getElementById('titolo-hud');
const backpackBtn = document.getElementById('btn-backpack');
const backpackModal = document.getElementById('backpack-modal');
const backpackClose = document.getElementById('backpack-close');
const backpackList = document.getElementById('backpack-list');
const backpackDetail = document.getElementById('backpack-detail');
const backpackItems = document.getElementById('backpack-items');
const backpackGuide = document.getElementById('backpack-guide');
const codexMapBtn = document.getElementById('btn-codex-map');
const COMBAT_FIRST_TURN_KEY = 'combat_first_turn';
let MAPPA_I18N = { it: {}, en: {} };

function langMappa() {
    return localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
}

function tMappa(key, fallback) {
    const lang = langMappa();
    return MAPPA_I18N[lang]?.[key] || fallback;
}
async function loadMappaTexts() {
    // Carica tutte le stringhe UI della mappa da JSON.
    try {
        const response = await fetch('assets/data/mappa_texts.json', { cache: 'no-store' });
        if (!response.ok) {
            return;
        }
        const json = await response.json();
        if (json && typeof json === 'object') {
            MAPPA_I18N = {
                it: json.it || {},
                en: json.en || {}
            };
        }
    } catch {
        // Fallback: stringhe inline passate a tMappa(..., fallback)
    }
}
async function loadCirclesCatalog() {
    // Carica nomi cerchi IT/EN da JSON per evitare hardcode nel file JS.
    try {
        const response = await fetch('assets/data/circles_catalog.json', { cache: 'no-store' });
        if (!response.ok) {
            return;
        }

        const json = await response.json();
        if (!json || typeof json !== 'object') {
            return;
        }

        const itMap = {};
        const enMap = {};
        Object.keys(json).forEach((key) => {
            const idx = Number(key);
            const row = json[key];
            if (Number.isNaN(idx) || !row) {
                return;
            }
            itMap[idx] = { roman: String(row.roman || ''), nome: String(row.name_it || '') };
            enMap[idx] = { roman: String(row.roman || ''), nome: String(row.name_en || '') };
        });

        if (Object.keys(itMap).length > 0) {
            CERCHIO_INFO = itMap;
        }
        if (Object.keys(enMap).length > 0) {
            CERCHIO_INFO_EN = enMap;
        }
    } catch {
        // Fallback ai testi locali.
    }
}

const state = {
    vw: window.innerWidth,
    vh: window.innerHeight,
    camera: { x: 0, y: 0 },
    keys: new Set(),
    mapImage: null,
    mapKey: 'map_1',
    confine: new Set(),
    canMove: true,
    inTransition: false,
    pendingEnemy: null,
    lastTime: 0,
    crumbs: [],
    enemyFrame: 0,
    enemyTimer: 0,
    coinAnimTimer: null,
    miniMapTimer: 0,
    defeatedSet: new Set(),
    // Copia locale dello stato nemici: "alive" cambia durante la partita.
    enemies: [],
    dante: {
        x: 0,
        y: 0,
        w: 48,
        anim: 'idle',
        lastDir: 'down',
        frame: 0,
        timer: 0,
        frameDuration: 85
    },
    virgilio: {
        x: 0,
        y: 0,
        w: 48,
        anim: 'idle',
        lastDir: 'down',
        frame: 0,
        timer: 0,
        frameDuration: 100,
        waitMs: 400,
        elapsedMs: 0,
        vx: 0,
        vy: 0
    },
    frames: {
        dante: { idle: [], left: [], right: [], up: [], down: [] },
        virgilio: { idle: [], left: [], right: [], up: [], down: [] },
        enemyBySpecies: {}
    }
};


function toPixelEnemySpawn(entry, fallbackId = 0) {
    // Converte coordinate tile (tx,ty) in pixel (x,y).
    const src = entry && typeof entry === 'object' ? entry : {};
    const id = Number.isFinite(Number(src.id)) ? Number(src.id) : fallbackId;

    if (Number.isFinite(Number(src.tx)) && Number.isFinite(Number(src.ty))) {
        return {
            id,
            x: Number(src.tx) * TILE_SIZE,
            y: Number(src.ty) * TILE_SIZE
        };
    }

    return {
        id,
        x: Number(src.x || 0),
        y: Number(src.y || 0)
    };
}
function buildEnemiesFromRules() {
    const cerchio = getActiveCircleNumber();
    const mapKey = getMapKeyFromCircle(cerchio);

    // Nel nono cerchio lasciamo un solo incontro: Lucifero.
    if (cerchio >= 9) {
        const fixedBoss = Array.isArray(ENEMY_SPAWN_BY_MAP[mapKey]) ? ENEMY_SPAWN_BY_MAP[mapKey] : [];
        const one = fixedBoss.length > 0 ? toPixelEnemySpawn(fixedBoss[0], 0) : { id: 0, x: 32 * TILE_SIZE, y: 22 * TILE_SIZE };
        state.enemies = [{
            ...one,
            id: 0,
            alive: true,
            specie: 'traditore',
            frames: state.frames.enemyBySpecies?.traditore || []
        }];
        return;
    }

    // Da qui in poi usiamo SOLO coordinate fisse definite in ENEMY_SPAWN_BY_MAP.
    const requestedCount = Math.max(1, Math.min(3, MAP_ENEMY_COUNT));
    const fixed = Array.isArray(ENEMY_SPAWN_BY_MAP[mapKey]) ? ENEMY_SPAWN_BY_MAP[mapKey] : [];
    const fallback = Array.isArray(ENEMY_SPAWN_BY_MAP.map_1) ? ENEMY_SPAWN_BY_MAP.map_1 : [];
    const source = fixed.length > 0 ? fixed : fallback;
    const pool = source.slice(0, requestedCount).map((entry, idx) => toPixelEnemySpawn(entry, idx));

    state.enemies = pool.map((enemy, idx) => {
        const specie = pickEnemySpeciesForCircle(cerchio);
        return {
            ...enemy,
            id: idx,
            alive: true,
            specie,
            frames: state.frames.enemyBySpecies?.[specie] || []
        };
    });
}

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

// Carica una sequenza frame_000.png, frame_001.png, ...
async function loadFrames(folder, max = 12) {
    const frames = [];
    for (let i = 0; i < max; i += 1) {
        const frame = await loadImage(`${folder}frame_${String(i).padStart(3, '0')}.png`);
        if (!frame) {
            break;
        }
        frames.push(frame);
    }
    return frames;
}

function resizeCanvas() {
    // Adattamento dinamico canvas alla dimensione finestra.
    state.vw = Math.max(1, window.innerWidth);
    state.vh = Math.max(1, window.innerHeight);
    canvasMap.width = state.vw;
    canvasMap.height = state.vh;
    canvasSprite.width = state.vw;
    canvasSprite.height = state.vh;
}

function getDefeatedSaveKey() {
    const cerchio = getActiveCircleNumber();
    return 'mappa_defeated_' + state.mapKey + '_c' + cerchio;
}


function getDefeatedStorage() {
    // Salvataggio solo per la sessione corrente: evita nemici mancanti dopo riavvii.
    return sessionStorage;
}
function getActiveCircleNumber() {
    // Restituisce il cerchio attualmente estratto dal portale.
    const targetKey = CORE?.keys?.targetCircle || 'cerchio_destinazione';
    const num = Number(localStorage.getItem(targetKey) || 1);
    if (Number.isNaN(num) || num < 1) {
        return 1;
    }
    return num;
}
function updateHudTitle() {
    // Titolo HUD sincronizzato con il cerchio scelto nel portale.
    const targetKey = CORE?.keys?.targetCircle || 'cerchio_destinazione';
    const numeroCerchio = getActiveCircleNumber();
    const lingua = localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
    const infoMap = lingua === 'en' ? CERCHIO_INFO_EN : CERCHIO_INFO;
    const info = infoMap[numeroCerchio] || { roman: 'I', nome: 'Limbo' };
    titoloHud.textContent = `${tMappa('hudPrefix', 'INFERNO - CERCHIO')} ${info.roman}: ${info.nome.toUpperCase()}`;
}

function loadMapKey() {
    // Mappa determinata dal cerchio corrente (1..9).
    const cerchio = getActiveCircleNumber();
    const byCircle = getMapKeyFromCircle(cerchio);
    if (MAP_CONFIG[byCircle]) {
        return byCircle;
    }
    return 'map_1';
}

function extractConfineFromLayer(layer, width, height) {
    // Converte il layer "confine" in Set di celle bloccate (x,y).
    if (!layer || !Array.isArray(layer.data)) {
        return new Set();
    }

    const confine = new Set();
    for (let i = 0; i < layer.data.length; i += 1) {
        if (layer.data[i] <= 0) {
            continue;
        }
        const x = i % width;
        const y = Math.floor(i / width);
        confine.add(`${x},${y}`);
    }
    return confine;
}

// Legge il layer "confine" dalla mappa json.
async function loadConfine() {
    const primaryPath = MAP_CONFIG[state.mapKey].json;
    const fallbackPath = 'assets/data/mappe/mappa_1.json';
    const paths = [primaryPath, fallbackPath];

    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                continue;
            }
            const json = await response.json();
            const layer = Array.isArray(json.layers)
                ? json.layers.find((item) => item.name === 'confine' && item.type === 'tilelayer')
                : null;

            if (layer) {
                state.confine = extractConfineFromLayer(layer, json.width || MAP_W, json.height || MAP_H);
                if (state.confine.size > 0) {
                    return;
                }
            }
        } catch {
            // Fallback automatico nel loop.
        }
    }

    const border = new Set();
    for (let y = 0; y < MAP_H; y += 1) {
        for (let x = 0; x < MAP_W; x += 1) {
            if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) {
                border.add(`${x},${y}`);
            }
        }
    }
    state.confine = border;
}

function tileBlocked(x, y, margin = 11) {
    // Collisione semplificata: controlla 4 punti attorno al personaggio.
    const points = [
        [x - margin, y - margin],
        [x + margin, y - margin],
        [x - margin, y + margin],
        [x + margin, y + margin]
    ];

    for (const [px, py] of points) {
        const tx = Math.floor(px / TILE_SIZE);
        const ty = Math.floor(py / TILE_SIZE);
        if (state.confine.has(`${tx},${ty}`)) {
            return true;
        }
    }

    return false;
}

function setCamera() {
    // Camera centrata su Dante, limitata ai bordi della mappa.
    state.camera.x = Math.max(0, Math.min(state.dante.x - state.vw / 2, MAP_PX_W - state.vw));
    state.camera.y = Math.max(0, Math.min(state.dante.y - state.vh / 2, MAP_PX_H - state.vh));
}

function currentAnimDirection(dx, dy, fallback) {
    // Determina la direzione dominante da usare per l'animazione.
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            return 'right';
        }
        if (dx < 0) {
            return 'left';
        }
    }

    if (Math.abs(dy) > 0.05) {
        if (dy > 0) {
            return 'down';
        }
        if (dy < 0) {
            return 'up';
        }
    }

    return fallback;
}

function updateFrames(actor, frameSet, dt) {
    // Avanzamento frame con timer per mantenere animazioni fluide.
    const key = actor.anim;
    const list = frameSet[key] && frameSet[key].length > 0 ? frameSet[key] : frameSet.idle;
    actor.timer += dt;
    if (actor.timer >= actor.frameDuration) {
        actor.timer = 0;
        actor.frame = (actor.frame + 1) % Math.max(1, list.length);
    }
}

// Salva tracce di Dante per evitare il path "a scorciatoia" di Virgilio.
function pushCrumb() {
    const last = state.crumbs[state.crumbs.length - 1];
    const dx = last ? state.dante.x - last.x : 99;
    const dy = last ? state.dante.y - last.y : 99;

    if (!last || Math.hypot(dx, dy) > 2.2) {
        state.crumbs.push({ x: state.dante.x, y: state.dante.y, dir: state.dante.lastDir });
    }

    if (state.crumbs.length > 420) {
        state.crumbs.splice(0, state.crumbs.length - 420);
    }
}

function updateDante(dt) {
    // Movimento giocatore (WASD/frecce) con normalizzazione diagonale e scaling su dt.
    if (!state.canMove) {
        return;
    }

    const frameScale = Math.max(0.5, Math.min(2, dt / BASE_FRAME_MS));

    let dx = 0;
    let dy = 0;

    if (state.keys.has('w') || state.keys.has('arrowup')) {
        dy -= MOVE_SPEED * frameScale;
    }
    if (state.keys.has('s') || state.keys.has('arrowdown')) {
        dy += MOVE_SPEED * frameScale;
    }
    if (state.keys.has('a') || state.keys.has('arrowleft')) {
        dx -= MOVE_SPEED * frameScale;
    }
    if (state.keys.has('d') || state.keys.has('arrowright')) {
        dx += MOVE_SPEED * frameScale;
    }

    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }

    if (dx !== 0 || dy !== 0) {
        const nextAnim = currentAnimDirection(dx, dy, state.dante.lastDir);
        state.dante.anim = nextAnim;
        state.dante.lastDir = nextAnim;
    } else {
        state.dante.anim = 'idle';
    }

    const nx = state.dante.x + dx;
    const ny = state.dante.y + dy;

    if (!tileBlocked(nx, state.dante.y)) {
        state.dante.x = nx;
    }
    if (!tileBlocked(state.dante.x, ny)) {
        state.dante.y = ny;
    }

    state.dante.x = Math.max(16, Math.min(MAP_PX_W - 16, state.dante.x));
    state.dante.y = Math.max(16, Math.min(MAP_PX_H - 16, state.dante.y));

    if (dx !== 0 || dy !== 0) {
        pushCrumb();
    }
    updateFrames(state.dante, state.frames.dante, dt);
}

function updateVirgilio(dt) {
    // Virgilio segue la scia con smorzamento per ridurre jitter e angoli bruschi.
    state.virgilio.elapsedMs += dt;
    if (state.virgilio.elapsedMs < state.virgilio.waitMs) {
        state.virgilio.anim = 'idle';
        state.virgilio.vx *= 0.72;
        state.virgilio.vy *= 0.72;
        updateFrames(state.virgilio, state.frames.virgilio, dt);
        return;
    }

    if (state.crumbs.length <= FOLLOW_DELAY_POINTS) {
        state.virgilio.anim = 'idle';
        state.virgilio.vx *= 0.72;
        state.virgilio.vy *= 0.72;
        updateFrames(state.virgilio, state.frames.virgilio, dt);
        return;
    }

    const frameScale = Math.max(0.5, Math.min(2, dt / BASE_FRAME_MS));
    const idx = Math.max(0, state.crumbs.length - 1 - FOLLOW_DELAY_POINTS);
    const baseTarget = state.crumbs[idx];
    const lookahead = state.crumbs[Math.min(state.crumbs.length - 1, idx + 2)] || baseTarget;
    if (!baseTarget) {
        return;
    }

    const targetX = (baseTarget.x + lookahead.x) * 0.5;
    const targetY = (baseTarget.y + lookahead.y) * 0.5;
    const dx = targetX - state.virgilio.x;
    const dy = targetY - state.virgilio.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 4) {
        state.virgilio.vx *= 0.62;
        state.virgilio.vy *= 0.62;
        state.virgilio.anim = 'idle';
        updateFrames(state.virgilio, state.frames.virgilio, dt);
        return;
    }

    const speed = FOLLOW_SPEED * frameScale * (dist < 16 ? dist / 16 : 1);
    const desiredVx = (dx / dist) * speed;
    const desiredVy = (dy / dist) * speed;

    state.virgilio.vx += (desiredVx - state.virgilio.vx) * 0.24;
    state.virgilio.vy += (desiredVy - state.virgilio.vy) * 0.24;

    state.virgilio.x += state.virgilio.vx;
    state.virgilio.y += state.virgilio.vy;

    const nextAnim = currentAnimDirection(state.virgilio.vx, state.virgilio.vy, state.virgilio.lastDir);
    state.virgilio.anim = nextAnim;
    state.virgilio.lastDir = nextAnim;

    updateFrames(state.virgilio, state.frames.virgilio, dt);
}
function enemyAlive(id) {
    // Un nemico e vivo se non risulta gia sconfitto in questa mappa.
    return !state.defeatedSet.has(id);
}

function syncEnemiesFromDefeated() {
    // Sincronizza lo stato "alive" dei nemici con l'archivio sconfitte.
    state.enemies.forEach((enemy) => {
        enemy.alive = enemyAlive(enemy.id);
    });
}

function saveDefeatedSet() {
    // Persistenza locale delle sconfitte per mappa.
    const key = getDefeatedSaveKey();
    getDefeatedStorage().setItem(key, JSON.stringify(Array.from(state.defeatedSet)));
}

function loadDefeatedSet() {
    // Carica l'elenco sconfitte (se presente) per non respawnare i nemici battuti.
    const key = getDefeatedSaveKey();
    try {
        const raw = getDefeatedStorage().getItem(key);
        if (!raw) {
            state.defeatedSet = new Set();
            return;
        }
        const parsed = JSON.parse(raw);
        state.defeatedSet = new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
        state.defeatedSet = new Set();
    }
}

function handleReturnFromBattle() {
    // Al rientro da combat/question consumiamo solo i flag risultato.
    // In questa fase i dannati in mappa non devono sparire dopo gli incontri.
    const resultKey = CORE?.keys?.result || 'encounter_result';
    const defeatedKey = CORE?.keys?.defeated || 'encounter_enemy_id';

    sessionStorage.removeItem(resultKey);
    sessionStorage.removeItem(defeatedKey);
}

function createEnemyUnit(enemyId) {
    // Crea i dati completi del dannato da passare alla scena di scontro.
    const numeroCerchio = getActiveCircleNumber();
    const enemyRef = state.enemies.find((e) => Number(e.id) === Number(enemyId)) || null;

    // Nel nono cerchio compare solo Lucifero.
    if (numeroCerchio >= 9) {
        const boss = CORE?.units?.getTemplateBySpecies
            ? CORE.units.getTemplateBySpecies('traditore')
            : null;
        const unitBoss = {
            nome: boss?.nome || 'Lucifero',
            specie: 'traditore',
            imgPath: 'assets/img/dannati/Cerchio_9/cerchio_9_traditori_idle_frames/frame_000.png',
            maxHP: Number(boss?.maxHP || 220),
            hp: Number(boss?.maxHP || 220),
            attacco: Number(boss?.attacco || 20),
            speciale: boss?.speciale || 'Gelo di Cocito',
            attaccoSpeciale: Number(boss?.attaccoSpeciale || 28),
            descrizione: boss?.descrizione || 'Signore del nono cerchio, ultimo ostacolo del viaggio.',
            isBoss: true
        };
        return CORE?.units?.normalize ? CORE.units.normalize(unitBoss) : unitBoss;
    }

    const fallbackSpecie = CIRCLE_DEFAULT_SPECIES[numeroCerchio] || 'lussurioso';
    const pickedSpecies = enemyRef?.specie || fallbackSpecie;
    const template = CORE?.units?.getTemplateBySpecies
        ? CORE.units.getTemplateBySpecies(pickedSpecies)
        : null;

    const unit = {
        nome: template?.nome || pickedSpecies,
        specie: pickedSpecies,
        imgPath: `${MAP_ENEMY_IDLE_FOLDER[pickedSpecies] || MAP_ENEMY_IDLE_FOLDER.lussurioso}frame_000.png`,
        maxHP: Number(template?.maxHP || 95),
        hp: Number(template?.maxHP || 95),
        attacco: Number(template?.attacco || 18),
        speciale: template?.speciale || 'Maledizione Oscura',
        attaccoSpeciale: Number(template?.attaccoSpeciale || 24),
        descrizione: template?.descrizione || `Creatura del ${pickedSpecies} che vaga senza pace.`
    };

    return CORE?.units?.normalize ? CORE.units.normalize(unit) : unit;
}


function playCoinFrames(side) {
    // Animazione moneta: 12 frame, poi stop sull'ultimo frame.
    return new Promise((resolve) => {
        if (!coinImage) {
            resolve();
            return;
        }

        const baseFolder = side === 'head'
            ? 'assets/img/oggetti/coin_head_frames/'
            : 'assets/img/oggetti/coin_cross_frames/';

        let frame = 0;
        const total = 12;
        const stepMs = 80;

        if (state.coinAnimTimer) {
            clearInterval(state.coinAnimTimer);
            state.coinAnimTimer = null;
        }

        state.coinAnimTimer = setInterval(() => {
            coinImage.src = baseFolder + 'frame_' + String(frame).padStart(3, '0') + '.png';
            frame += 1;

            if (frame >= total) {
                clearInterval(state.coinAnimTimer);
                state.coinAnimTimer = null;
                // Fissa esplicitamente l'ultimo frame.
                coinImage.src = baseFolder + 'frame_011.png';
                resolve();
            }
        }, stepMs);
    });
}

function openCoinBox() {
    if (!coinBox) {
        return;
    }
    coinBox.classList.remove('non-visibile');
}

function closeCoinBox() {
    if (!coinBox) {
        return;
    }
    coinBox.classList.add('non-visibile');
    if (state.coinAnimTimer) {
        clearInterval(state.coinAnimTimer);
        state.coinAnimTimer = null;
    }
}

async function prepareCombatFirstTurnFromMappa() {
    // In mappa decidiamo gia il primo turno e lo passiamo a combat via sessionStorage.
    const playerStarts = Math.random() < 0.5;
    const side = playerStarts ? 'head' : 'cross';
    sessionStorage.setItem(COMBAT_FIRST_TURN_KEY, playerStarts ? 'player' : 'enemy');

    if (coinImage) {
        await playCoinFrames(side);
    }

    if (coinResult) {
        coinResult.textContent = playerStarts
            ? (langMappa() === 'en' ? 'Head: you start first.' : 'Testa: inizi tu.')
            : (langMappa() === 'en' ? 'Cross: enemy starts first.' : 'Croce: inizia il nemico.');
    }

    // Richiesta: fermo sull'ultimo frame per 2 secondi.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return playerStarts;
}
function startEncounter(mode) {
    // Avvia la transizione verso combat.html o question.html.
    if (!state.pendingEnemy || state.inTransition) {
        return;
    }

    state.inTransition = true;
    state.canMove = false;
    overlay.classList.add('attivo');

    try {
        const encounterPayload = {
            enemyId: state.pendingEnemy.id,
            mapKey: state.mapKey,
            enemy: createEnemyUnit(state.pendingEnemy.id)
        };

        const encounterKey = CORE?.keys?.encounter || 'encounter_context';
        sessionStorage.setItem(encounterKey, JSON.stringify(encounterPayload));
    } catch (error) {
        console.error('Errore creazione encounter:', error);
        state.inTransition = false;
        state.canMove = true;
        overlay.classList.remove('attivo');
        CORE?.ui?.toast?.(tMappa('encounterError', langMappa() === 'en' ? 'Encounter error' : 'Errore incontro')); 
        return;
    }

    const cerchio = getActiveCircleNumber();
    const forcedMode = cerchio >= 9 ? 'combat' : mode;
    const target = forcedMode === 'question' ? 'question.html' : 'combat.html';
    setTimeout(() => {
        if (CORE?.nav?.goWithLoading) {
            const profile = forcedMode === 'question' ? 'quiz' : 'battle';
            CORE.nav.goWithLoading(target, { profile, from: 'mappa.html' });
        } else {
            window.location.href = target;
        }
    }, MAP_ENCOUNTER_TRANSITION_MS);
}

function openEncounterChoice(enemy) {
    // Mostra il modal di scelta quando Dante tocca un dannato.
    if (!enemy || state.inTransition) {
        return;
    }

    state.pendingEnemy = enemy;
    closeCoinBox();
    state.canMove = false;

    const cerchio = getActiveCircleNumber();
    if (cerchio >= 9) {
        // Boss finale: forziamo il duello diretto.
        btnQuestion.style.display = 'none';
        CORE?.ui?.toast?.(tMappa('finalDuelToast', langMappa() === 'en' ? 'Final duel: Satan awaits.' : 'Duello finale: Satana ti attende.')); 
    } else {
        btnQuestion.style.display = '';
    }

    modal.classList.remove('non-visibile');
    CORE?.ui?.toast?.(tMappa('chooseTrial', 'Scegli la prova: combattimento o domande'));
}


function getDanteInteractionPoint() {
    // Punto centro interazione di Dante (evita mismatch piede-centro sprite).
    return {
        x: Number(state.dante.x),
        y: Number(state.dante.y) - DANTE_INTERACTION_Y_OFFSET
    };
}

function getEnemyInteractionRadius(enemy) {
    // Raggio dal centro immagine nemico: deriva dall''altezza sprite configurata.
    const specieKey = String(enemy?.specie || '').toLowerCase();
    const h = Number(ENEMY_HEIGHT_BY_SPECIES[specieKey] || 110);
    return Math.max(14, Math.round(h * 0.24));
}
function checkEnemyCollision() {
    // Trigger di incontro: cerchi centrati sulle sprite (centro Dante vs centro nemico).
    if (!state.canMove || state.inTransition) {
        return;
    }

    const danteCenter = getDanteInteractionPoint();

    for (const enemy of state.enemies) {
        if (!enemy.alive) {
            continue;
        }

        const dx = danteCenter.x - Number(enemy.x);
        const dy = danteCenter.y - Number(enemy.y);
        const baseRadius = DANTE_INTERACTION_RADIUS + getEnemyInteractionRadius(enemy) + MAP_COLLISION_RADIUS;
        const triggerRadius = Math.max(12, Math.round(baseRadius * ENCOUNTER_RADIUS_SCALE));

        if (Math.hypot(dx, dy) <= triggerRadius) {
            openEncounterChoice(enemy);
            return;
        }
    }
}

function drawMap() {
    // Disegna la porzione di mappa visibile in camera.
    ctxMap.clearRect(0, 0, state.vw, state.vh);
    ctxMap.fillStyle = '#0a0000';
    ctxMap.fillRect(0, 0, state.vw, state.vh);

    if (state.mapImage && state.mapImage.complete) {
        const sx = state.camera.x;
        const sy = state.camera.y;
        const sw = Math.min(state.vw, MAP_PX_W - sx);
        const sh = Math.min(state.vh, MAP_PX_H - sy);
        ctxMap.drawImage(state.mapImage, sx, sy, sw, sh, 0, 0, sw, sh);
        return;
    }

    const startX = Math.floor(state.camera.x / TILE_SIZE);
    const startY = Math.floor(state.camera.y / TILE_SIZE);
    const endX = Math.min(MAP_W, startX + Math.ceil(state.vw / TILE_SIZE) + 2);
    const endY = Math.min(MAP_H, startY + Math.ceil(state.vh / TILE_SIZE) + 2);

    for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
            const sx = x * TILE_SIZE - state.camera.x;
            const sy = y * TILE_SIZE - state.camera.y;
            const blocked = state.confine.has(`${x},${y}`);
            ctxMap.fillStyle = blocked ? '#2e0909' : '#200f08';
            ctxMap.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
        }
    }
}

function drawCharacter(actor, frameSet, fallbackColor, label) {
    // Disegno personaggio con fallback grafico se i frame mancano.
    const sx = Math.round(actor.x - state.camera.x);
    const sy = Math.round(actor.y - state.camera.y);

    const key = actor.anim;
    const list = frameSet[key] && frameSet[key].length > 0 ? frameSet[key] : frameSet.idle;
    const frame = list[actor.frame % Math.max(1, list.length)];

    if (frame) {
        const scale = actor.w / frame.width;
        const h = frame.height * scale;
        ctxSprite.drawImage(frame, sx - actor.w / 2, sy - h, actor.w, h);
        return;
    }

    ctxSprite.fillStyle = fallbackColor;
    ctxSprite.fillRect(sx - 10, sy - 24, 20, 24);
    ctxSprite.fillStyle = '#e8b870';
    ctxSprite.fillRect(sx - 7, sy - 36, 14, 12);
    ctxSprite.fillStyle = '#fff';
    ctxSprite.font = '8px "VCR OSD Mono", monospace';
    ctxSprite.textAlign = 'center';
    ctxSprite.fillText(label, sx, sy - 40);
}

function drawEnemy(enemy) {
    // Disegno dannato (sprite animata o fallback rettangolo).
    const sx = Math.round(enemy.x - state.camera.x);
    const sy = Math.round(enemy.y - state.camera.y);
    const frames = enemy.frames || [];

    if (frames.length > 0) {
        const frame = frames[state.enemyFrame % frames.length];
                const specieKey = String(enemy.specie || '').toLowerCase();
        const targetH = Number(ENEMY_HEIGHT_BY_SPECIES[specieKey] || 110);
        const h = targetH;
        const w = Math.max(40, (frame.width / frame.height) * h);
        ctxSprite.drawImage(frame, sx - w / 2, sy - h / 2, w, h);
        return;
    }

    ctxSprite.fillStyle = '#8a1a1a';
    ctxSprite.fillRect(sx - 35, sy - 60, 70, 70);
}

function drawScene(dt) {
    // Rendering principale: mappa, animazioni e ordinamento per profondita Y.
    drawMap();

    ctxSprite.clearRect(0, 0, state.vw, state.vh);

    state.enemyTimer += dt;
    if (state.enemyTimer > MAP_ENEMY_ANIM_STEP_MS) {
        state.enemyTimer = 0;
        const loopSize = Math.max(1, MAP_ENEMY_FRAME_COUNT);
        state.enemyFrame = (state.enemyFrame + 1) % loopSize;
    }

    const entities = [
        ...state.enemies.filter((enemy) => enemy.alive).map((enemy) => ({ type: 'enemy', y: enemy.y, ref: enemy })),
        { type: 'virgilio', y: state.virgilio.y, ref: state.virgilio },
        { type: 'dante', y: state.dante.y, ref: state.dante }
    ];

    entities.sort((a, b) => a.y - b.y);

    for (const entity of entities) {
        if (entity.type === 'enemy') {
            drawEnemy(entity.ref);
        }
        if (entity.type === 'dante') {
            drawCharacter(entity.ref, state.frames.dante, '#334488', 'DANTE');
        }
        if (entity.type === 'virgilio') {
            drawCharacter(entity.ref, state.frames.virgilio, '#2a5a2a', 'VIRGILIO');
        }
    }
}

function drawMiniMap() {
    // Minimap di supporto: camera, Dante, Virgilio e nemici vivi.
    const scale = mini.width / MAP_PX_W;

    miniCtx.clearRect(0, 0, mini.width, mini.height);
    miniCtx.fillStyle = '#0d0000';
    miniCtx.fillRect(0, 0, mini.width, mini.height);

    miniCtx.fillStyle = 'rgba(255, 100, 0, 0.12)';
    miniCtx.fillRect(state.camera.x * scale, state.camera.y * scale, state.vw * scale, state.vh * scale);

    miniCtx.fillStyle = '#44aaff';
    miniCtx.fillRect(state.dante.x * scale - 1, state.dante.y * scale - 1, 3, 3);

    miniCtx.fillStyle = '#44ff88';
    miniCtx.fillRect(state.virgilio.x * scale - 1, state.virgilio.y * scale - 1, 2, 2);

    miniCtx.fillStyle = '#ff2200';
    for (const enemy of state.enemies) {
        if (!enemy.alive) {
            continue;
        }
        miniCtx.fillRect(enemy.x * scale - 1, enemy.y * scale - 1, 3, 3);
    }
}

function loop(timestamp) {
    // Game loop: update -> collisioni -> render -> prossimo frame.
    if (CORE?.ui?.pause?.isPaused()) {
        state.lastTime = timestamp;
        requestAnimationFrame(loop);
        return;
    }
    const dt = Math.min(100, timestamp - state.lastTime);
    state.lastTime = timestamp;

    updateDante(dt);
    updateVirgilio(dt);
    setCamera();
    checkEnemyCollision();
    drawScene(dt);
    state.miniMapTimer += dt;
    if (state.miniMapTimer >= MINIMAP_REFRESH_MS) {
        state.miniMapTimer = 0;
        drawMiniMap();
    }

    requestAnimationFrame(loop);
}

function loadRosterForBackpack() {
    // Legge la squadra dal sistema condiviso o dalla sessione locale.
    if (CORE?.units?.loadRoster) {
        return CORE.units.loadRoster();
    }
    try {
        const raw = sessionStorage.getItem('dannato_schierato');
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return [];
    }
}

function saveRosterForBackpack(roster) {
    // Salva la squadra aggiornando l'ordine di schieramento.
    if (CORE?.units?.saveRoster) {
        CORE.units.saveRoster(roster);
        return;
    }
    sessionStorage.setItem('dannato_schierato', JSON.stringify(roster));
}

function renderBackpackDetail(unit) {
    if (!backpackDetail) {
        return;
    }
    if (!unit) {
        backpackDetail.innerHTML = '<p>Seleziona un dannato per vedere i dettagli.</p>';
        return;
    }

    const isEn = langMappa() === 'en';
    const specie = String(unit.specie || '').toLowerCase();
    const hp = Number(unit.hp || unit.maxHP || 0);
    const maxHP = Number(unit.maxHP || 0);
    const atk = Number(unit.attacco || 0);
    const spAtk = Number(unit.attaccoSpeciale || 0);
    const nome = unit.nome || '-';
    const speciale = unit.speciale || '-';
    const descrizione = unit.descrizione || '-';

    backpackDetail.innerHTML =
        '<div class="bp-detail-row"><span class="bp-detail-label">' + (isEn ? 'Name' : 'Nome') + ':</span> ' + nome + '</div>' +
        '<div class="bp-detail-row"><span class="bp-detail-label">' + (isEn ? 'Specie' : 'Specie') + ':</span> ' + specie + '</div>' +
        '<div class="bp-detail-row"><span class="bp-detail-label">HP:</span> ' + hp + ' / ' + maxHP + '</div>' +
        '<div class="bp-detail-row"><span class="bp-detail-label">' + (isEn ? 'Base ATK' : 'Danno base') + ':</span> ' + atk + '</div>' +
        '<div class="bp-detail-row"><span class="bp-detail-label">' + (isEn ? 'Special Skill' : 'Speciale') + ':</span> ' + speciale + ' (' + spAtk + ')</div>' +
        '<div class="bp-detail-row bp-detail-desc"><span class="bp-detail-label">' + (isEn ? 'Description' : 'Descrizione') + ':</span> ' + descrizione + '</div>';
}

function getBackpackInventoryState() {
    // Legge inventario oggetti dal salvataggio locale.
    try {
        const raw = localStorage.getItem('inferno_inventory');
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function renderBackpackItemsPanel() {
    // Mostra monete e oggetti con tooltip descrittivi.
    if (!backpackItems) {
        return;
    }

    const inv = getBackpackInventoryState();
    const coins = Number(localStorage.getItem('inferno_coins') || 0);
    const lang = langMappa();
    const defs = [
        { id: 'hp_potion', icon: 'assets/img/oggetti/shop_item/health_potion.png', it: 'Pozione Vita +30 HP', en: 'HP Potion +30 HP' },
        { id: 'energy_potion', icon: 'assets/img/oggetti/shop_item/energy_potion.png', it: 'Pozione Energia +33% energia', en: 'Energy Potion +33% energy' },
        { id: 'revive_totem', icon: 'assets/img/oggetti/shop_item/totem.png', it: 'Totem Immortalità: revive al 50% HP + scudo entro 3 turni', en: 'Revive Totem: revive at 50% HP + shield within 3 turns' },
        { id: 'power_drink', icon: 'assets/img/oggetti/shop_item/power_potion.png', it: 'Bevanda Potenza +30% danno (3 turni)', en: 'Power Drink +30% damage (3 turns)' },
        { id: 'shield_drink', icon: 'assets/img/oggetti/shop_item/sheild_potion.png', it: 'Bevanda Scudo +1 scudo', en: 'Shield Drink +1 shield' }
    ];

    const parts = [];
    parts.push('<h3>' + (lang === 'en' ? 'Items and Coins' : 'Oggetti e Monete') + '</h3>');
    parts.push('<div class="backpack-coins" title="' + (lang === 'en' ? 'Available coins' : 'Monete disponibili') + '"><img src="assets/img/oggetti/coin.png" alt="coin"><strong>' + coins + '</strong></div>');
    parts.push('<div class="backpack-items-grid">');

    defs.forEach((item) => {
        const qty = Number(inv[item.id] || 0);
        const tip = lang === 'en' ? item.en : item.it;
        const cls = qty > 0 ? 'inv-slot' : 'inv-slot is-empty';
        parts.push('<div class="' + cls + '" title="' + tip + '"><img src="' + item.icon + '" alt="' + item.id + '"><span>x' + qty + '</span></div>');
    });

    parts.push('</div>');
    backpackItems.innerHTML = parts.join('');
}
function renderBackpack() {
    if (!backpackList) {
        return;
    }

    const roster = loadRosterForBackpack();
    renderBackpackItemsPanel();
    backpackList.innerHTML = '';

    if (!Array.isArray(roster) || roster.length === 0) {
        backpackList.innerHTML = '<p>Nessun dannato disponibile.</p>';
        renderBackpackDetail(null);
        return;
    }

    let dragFrom = -1;

    const moveRoster = (fromIdx, toIdx) => {
        if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= roster.length || toIdx >= roster.length) {
            return;
        }
        const copy = [...roster];
        const moved = copy[fromIdx];
        copy.splice(fromIdx, 1);
        copy.splice(toIdx, 0, moved);
        saveRosterForBackpack(copy);
        renderBackpack();
        CORE?.ui?.toast?.(langMappa() === 'en' ? 'Formation order updated.' : 'Ordine di schieramento aggiornato.');
    };

    roster.forEach((unit, idx) => {
        const card = document.createElement('article');
        card.className = 'backpack-card' + (idx === 0 ? ' is-lead' : '');
        card.draggable = true;
        card.dataset.index = String(idx);

        card.innerHTML =
            '<div class="backpack-order">#' + (idx + 1) + '</div>' +
            '<img src="' + (unit.imgPath || 'assets/img/bestie/leone_idle_frames/frame_000.png') + '" alt="' + (unit.nome || 'Dannato') + '">' +
            '<p class="drag-tip">Trascina per riordinare</p>';

        card.addEventListener('click', () => {
            renderBackpackDetail(unit);
        });

        card.addEventListener('dragstart', () => {
            dragFrom = idx;
            card.classList.add('is-dragging');
        });

        card.addEventListener('dragend', () => {
            dragFrom = -1;
            card.classList.remove('is-dragging');
            backpackList.querySelectorAll('.is-drop-target').forEach((el) => el.classList.remove('is-drop-target'));
        });

        card.addEventListener('dragover', (event) => {
            event.preventDefault();
            card.classList.add('is-drop-target');
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('is-drop-target');
        });

        card.addEventListener('drop', (event) => {
            event.preventDefault();
            card.classList.remove('is-drop-target');
            moveRoster(dragFrom, idx);
        });

        backpackList.appendChild(card);
    });

    renderBackpackDetail(roster[0]);
}


function openBestiarioFromMap() {
    // Apertura robusta del bestiario: attende il modulo se non è ancora pronto.
    const tryOpen = () => {
        if (window.Bestiario && typeof window.Bestiario.open === 'function') {
            window.Bestiario.open(0);
            return true;
        }
        return false;
    };

    if (tryOpen()) {
        return;
    }

    let attempts = 0;
    const timer = setInterval(() => {
        attempts += 1;
        if (tryOpen() || attempts >= 20) {
            clearInterval(timer);
            if (attempts >= 20) {
                CORE?.ui?.toast?.(langMappa() === 'en' ? 'Bestiary not ready.' : 'Bestiario non pronto.');
            }
        }
    }, 80);
}

function showBackpackGuideOnce() {
    // Mostra solo la prima volta una guida rapida per il riordino squadra.
    if (!backpackGuide) {
        return;
    }

    const key = 'mappa_backpack_guide_seen_v1';
    if (localStorage.getItem(key) === '1') {
        backpackGuide.classList.add('non-visibile');
        return;
    }

    const isEn = langMappa() === 'en';
    backpackGuide.textContent = isEn
        ? 'Tip: drag the cards to change the entry order before battle.'
        : 'Suggerimento: trascina le carte per cambiare l\'ordine di ingresso prima dello scontro.';
    backpackGuide.classList.remove('non-visibile');
    localStorage.setItem(key, '1');

    setTimeout(() => {
        backpackGuide.classList.add('non-visibile');
    }, 6500);
}
function openBackpack() {
    if (!backpackModal || state.inTransition) {
        return;
    }
    renderBackpack();
    backpackModal.classList.remove('non-visibile');
    showBackpackGuideOnce();
    state.canMove = false;
}

function closeBackpack() {
    if (!backpackModal) {
        return;
    }
    backpackModal.classList.add('non-visibile');
    if (!modal || modal.classList.contains('non-visibile')) {
        state.canMove = true;
    }
}
function bindInput() {
    // Binding input tastiera, resize e bottoni del modal di incontro.
    window.addEventListener('keydown', (event) => {
        if (CORE?.ui?.pause?.isPaused()) { return; }
        if (event.key.toLowerCase() === 'b') {
            event.preventDefault();
            if (backpackModal && backpackModal.classList.contains('non-visibile')) {
                openBackpack();
            } else {
                closeBackpack();
            }
            return;
        }

        if (event.key === 'Escape') {
            closeBackpack();
            return;
        }

        const key = event.key.toLowerCase();
        state.keys.add(key);
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
            event.preventDefault();
        }
    });

    window.addEventListener('keyup', (event) => {
        state.keys.delete(event.key.toLowerCase());
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
        setCamera();
    });

    backpackBtn?.addEventListener('click', () => {
        openBackpack();
    });

    codexMapBtn?.addEventListener('click', () => {
        openBestiarioFromMap();
    });

    backpackClose?.addEventListener('click', () => {
        closeBackpack();
    });

    backpackModal?.addEventListener('click', (event) => {
        if (event.target === backpackModal) {
            closeBackpack();
        }
    });

    btnCombat.addEventListener('click', async () => {
        openCoinBox();
        await prepareCombatFirstTurnFromMappa();
        closeCoinBox();
        startEncounter('combat');
    });
    btnQuestion.addEventListener('click', () => {
        sessionStorage.removeItem(COMBAT_FIRST_TURN_KEY);
        closeCoinBox();
        startEncounter('question');
    });
}
function applyConfiguredSpawns() {
    // Applica spawn Dante/Virgilio della mappa corrente (config in testa al file).
    const spawnCfg = PLAYER_SPAWN_BY_MAP[state.mapKey] || PLAYER_SPAWN_BY_MAP.map_1;
    const d = spawnCfg?.dante || { x: 0, y: 0 };
    const v = spawnCfg?.virgilio || { x: 0, y: 0 };

    state.dante.x = Number(d.x) * TILE_SIZE + 16;
    state.dante.y = Number(d.y) * TILE_SIZE + 16;
    state.virgilio.x = Number(v.x) * TILE_SIZE + 16;
    state.virgilio.y = Number(v.y) * TILE_SIZE + 16;
}

async function loadEnemyFramesForCurrentCircle() {
    // Carica idle frame per le specie che possono comparire nel cerchio corrente.
    const cerchio = getActiveCircleNumber();
    const species = new Set();
    if (cerchio >= 9) {
        species.add('traditore');
    } else {
        const pool = CIRCLE_MULTI_VARIANTS[cerchio];
        if (Array.isArray(pool) && pool.length > 0) {
            pool.forEach((s) => species.add(s));
        } else {
            species.add(CIRCLE_DEFAULT_SPECIES[cerchio] || 'lussurioso');
        }
    }

    const entries = [...species];
    for (const specie of entries) {
        if (state.frames.enemyBySpecies[specie]) {
            continue;
        }
        const folder = MAP_ENEMY_IDLE_FOLDER[specie] || MAP_ENEMY_IDLE_FOLDER.lussurioso;
        state.frames.enemyBySpecies[specie] = await loadFrames(folder, MAP_ENEMY_FRAME_COUNT);
    }
}
async function loadAssets() {
    // Carica mappa, sprites e confini logici da JSON.
    state.mapKey = loadMapKey();
    if (!MAP_CONFIG[state.mapKey]) {
        state.mapKey = 'map_1';
    }

    state.mapImage = await loadImage(MAP_CONFIG[state.mapKey].image);

    state.frames.dante.idle = await loadFrames('assets/img/personaggi/dante_spritesheet/Dante_idle_frames/', 12);
    state.frames.dante.left = await loadFrames('assets/img/personaggi/dante_spritesheet/Dante_left_frames/', 6);
    state.frames.dante.right = await loadFrames('assets/img/personaggi/dante_spritesheet/Dante_right_frames/', 6);
    state.frames.dante.up = await loadFrames('assets/img/personaggi/dante_spritesheet/Dante_up_frames/', 12);
    state.frames.dante.down = await loadFrames('assets/img/personaggi/dante_spritesheet/Dante_down_frames/', 12);

    state.frames.virgilio.idle = await loadFrames('assets/img/personaggi/virgilio_spritesheet/Virgilio_idle_frames/', 12);
    state.frames.virgilio.left = await loadFrames('assets/img/personaggi/virgilio_spritesheet/Virgilio_left_frames/', 6);
    state.frames.virgilio.right = await loadFrames('assets/img/personaggi/virgilio_spritesheet/Virgilio_right_frames/', 6);
    state.frames.virgilio.up = await loadFrames('assets/img/personaggi/virgilio_spritesheet/Virgilio_up_frames/', 12);
    state.frames.virgilio.down = await loadFrames('assets/img/personaggi/virgilio_spritesheet/Virgilio_down_frames/', 12);

    await loadEnemyFramesForCurrentCircle();
    applyConfiguredSpawns();

    await loadConfine();
}

function initCrumbs() {
    // Inizializza una coda iniziale per un follow naturale di Virgilio.
    state.crumbs = [];
    for (let i = 0; i < FOLLOW_DELAY_POINTS + 30; i += 1) {
        state.crumbs.push({
            x: state.dante.x,
            y: state.dante.y - (FOLLOW_DELAY_POINTS + 30 - i) * 1.8,
            dir: 'down'
        });
    }
}

async function init() {
    // Bootstrap scena mappa: setup, caricamenti, sincronizzazione stato e avvio loop.
    if (CORE?.rules?.loadRemote) {
        await CORE.rules.loadRemote();
        MAP_COLLISION_RADIUS = Math.max(10, Number(CORE.rules.get('mappaCollisionRadius', MAP_RULES_DEFAULT.collisionRadius)) || MAP_RULES_DEFAULT.collisionRadius);
        MAP_ENEMY_FRAME_COUNT = Math.max(1, Number(CORE.rules.get('mappaEnemyFrameCount', MAP_RULES_DEFAULT.enemyFrameCount)) || MAP_RULES_DEFAULT.enemyFrameCount);
        MAP_ENEMY_ANIM_STEP_MS = Math.max(40, Number(CORE.rules.get('mappaEnemyAnimStepMs', MAP_RULES_DEFAULT.enemyAnimStepMs)) || MAP_RULES_DEFAULT.enemyAnimStepMs);
        MAP_ENCOUNTER_TRANSITION_MS = Math.max(120, Number(CORE.rules.get('mappaEncounterTransitionMs', MAP_RULES_DEFAULT.encounterTransitionMs)) || MAP_RULES_DEFAULT.encounterTransitionMs);
        MAP_ENEMY_COUNT = Math.max(1, Number(CORE.rules.get('mappaEnemyCount', MAP_RULES_DEFAULT.enemyCount)) || MAP_RULES_DEFAULT.enemyCount);
        MAP_ENEMY_SPAWN_MODE = String(CORE.rules.get('mappaEnemySpawnMode', MAP_RULES_DEFAULT.enemySpawnMode) || MAP_RULES_DEFAULT.enemySpawnMode);
    }
    resizeCanvas();
    bindInput();

    if (CORE?.ui?.guideOnce) {
        CORE.ui.guideOnce({
            id: 'guida_mappa_modal_v1',
            title: { it: 'Guida Mappa', en: 'Map Guide' },
            lines: {
                it: ['Usa WASD o frecce per muovere Dante.', 'Avvicinati ai dannati per iniziare incontro.', 'Puoi aprire lo zaino con il tasto B.'],
                en: ['Use WASD or arrows to move Dante.', 'Approach damned enemies to start encounters.', 'Open backpack with key B.']
            },
            button: { it: 'Capito', en: 'Got it' }
        });
    }

    await loadUnitCatalogForMappa();
    await loadCirclesCatalog();
    await loadMappaTexts();
    await loadAssets();
    buildEnemiesFromRules();
    loadDefeatedSet();
    handleReturnFromBattle();
    // Manteniamo tutti i dannati visibili dopo ogni scontro in questa versione.
    state.enemies.forEach((enemy) => { enemy.alive = true; });
    initCrumbs();
    setCamera();
    updateHudTitle();
    state.lastTime = performance.now();
    requestAnimationFrame(loop);
}

init();





















































































