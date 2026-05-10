// Commento generale file: logica principale dello script.
'use strict';

// Chiavi condivise tra le scene per lo stato di partita.
const STORAGE_KEYS = {
    roster: 'dannato_schierato',
    encounter: 'encounter_context',
    result: 'encounter_result',
    defeated: 'encounter_enemy_id',
    summary: 'combat_summary'
};

let DEFAULT_PLAYER = {
    nome: 'Leone',
    specie: 'leone',
    imgPath: 'assets/img/bestie/leone_idle_frames/frame_000.png',
    maxHP: 150,
    hp: 150,
    attacco: 17,
    speciale: 'Ruggito Terrificante',
    attaccoSpeciale: 22,
    descrizione: 'Compagno affidabile nelle battaglie infernali.'
};

let DEFAULT_ENEMY = {
    nome: 'Dannato Errante',
    specie: 'dannato',
    imgPath: 'assets/img/dannati/dannato_girone1_idle_frames/frame_000.png',
    maxHP: 118,
    hp: 118,
    attacco: 14,
    speciale: 'Maledizione Oscura',
    attaccoSpeciale: 19,
    descrizione: 'Anima perduta che difende questo cerchio.'
};

// Mappa delle idle frames per i dannati alleati.
const PLAYER_IDLE_MAP = {
    leone: 'assets/img/bestie/leone_idle_frames/',
    lonza: 'assets/img/bestie/lonza_idle_frames/',
    lupa: 'assets/img/bestie/lupa_idle_frames/'
};


// Configurazione sprite completi per i dannati alleati.
const PLAYER_SPRITE_MAP = {
    leone: { idle: 'assets/img/bestie/leone_idle_frames/', attack: 'assets/img/bestie/leone_attack_frames/', hurt: 'assets/img/bestie/leone_hurt_frames/', death: 'assets/img/bestie/leone_death_frames/' },
    lonza: { idle: 'assets/img/bestie/lonza_idle_frames/', attack: 'assets/img/bestie/lonza_attack_frames/', hurt: 'assets/img/bestie/lonza_hurt_frames/', death: 'assets/img/bestie/lonza_death_frames/' },
    lupa: { idle: 'assets/img/bestie/lupa_idle_frames/', attack: 'assets/img/bestie/lupa_attack_frames/', hurt: 'assets/img/bestie/lupa_hurt_frames/', death: 'assets/img/bestie/lupa_death_frames/' }
};
const CIRCLE_BACKGROUND_MAP = {
    // Placeholder temporaneo: alternanza tra due sfondi finche non arrivano quelli dedicati.
    1: 'assets/img/mappe/background1.png',
    2: 'assets/img/mappe/background2.png',
    3: 'assets/img/mappe/background1.png',
    4: 'assets/img/mappe/background2.png',
    5: 'assets/img/mappe/background1.png',
    6: 'assets/img/mappe/background2.png',
    7: 'assets/img/mappe/background1.png',
    8: 'assets/img/mappe/background2.png',
    9: 'assets/img/mappe/background1.png'
};

// Configurazione sprite per i dannati per cerchio/specie.
const ENEMY_SPRITE_MAP = {
    limbo: { idle: 'assets/img/dannati/Cerchio_1/cerchio_1_pagano_idle_frames/', attack: 'assets/img/dannati/Cerchio_1/cerchio_1_pagano_attack_frames/', hurt: 'assets/img/dannati/Cerchio_1/cerchio_1_pagano_hurt_frames/', death: 'assets/img/dannati/Cerchio_1/cerchio_1_pagano_death_frames/' },
    lussurioso: { idle: 'assets/img/dannati/Cerchio_2/cerchio_2__lussurioso_idle_frames/', attack: 'assets/img/dannati/Cerchio_2/cerchio_2__lussurioso_attack_frames/', hurt: 'assets/img/dannati/Cerchio_2/cerchio_2__lussurioso_hurt_frames/', death: 'assets/img/dannati/Cerchio_2/cerchio_2__lussurioso_death_frames/' },
    goloso: { idle: 'assets/img/dannati/Cerchio_3/cerchio_3_goloso_idle_frames/', attack: 'assets/img/dannati/Cerchio_3/cerchio_3_goloso_attack_frames/', hurt: 'assets/img/dannati/Cerchio_3/cerchio_3_goloso_hurt_frames/', death: 'assets/img/dannati/Cerchio_3/cerchio_3_goloso_death_frames/' },
    avaro: { idle: 'assets/img/dannati/Cerchio_4/01_Avaro/cerchio_4_avaro_idle_frames/', attack: 'assets/img/dannati/Cerchio_4/01_Avaro/cerchio_4_avaro_attack_frames/', hurt: 'assets/img/dannati/Cerchio_4/01_Avaro/cerchio_4_avaro_hurt_frames/', death: 'assets/img/dannati/Cerchio_4/01_Avaro/cerchio_4_avaro_death_frames/' },
    prodigo: { idle: 'assets/img/dannati/Cerchio_4/02_Prodigo/cerchio_4_prodigo_idle_frames/', attack: 'assets/img/dannati/Cerchio_4/02_Prodigo/cerchio_4_prodigo_attack_frames/', hurt: 'assets/img/dannati/Cerchio_4/02_Prodigo/cerchio_4_prodigo_hurt_frames/', death: 'assets/img/dannati/Cerchio_4/02_Prodigo/cerchio_4_prodigo_death_frames/' },
    iracondo: { idle: 'assets/img/dannati/Cerchio_5/01_Iracondi/cerchio_5_iracondo_idle_frames/', attack: 'assets/img/dannati/Cerchio_5/01_Iracondi/cerchio_5_iracondo_attack_frames/', hurt: 'assets/img/dannati/Cerchio_5/01_Iracondi/cerchio_5_iracondo_hurt_frames/', death: 'assets/img/dannati/Cerchio_5/01_Iracondi/cerchio_5_iracondo_death_frames/' },
    accidioso: { idle: 'assets/img/dannati/Cerchio_5/02_Accidiosi/cerchio_5_accidioso_idle_frames/', attack: 'assets/img/dannati/Cerchio_5/02_Accidiosi/cerchio_5_accidioso_attack_frames/', hurt: 'assets/img/dannati/Cerchio_5/02_Accidiosi/cerchio_5_accidioso_hurt_frames/', death: 'assets/img/dannati/Cerchio_5/02_Accidiosi/cerchio_5_accidioso_death_frames/' },
    eretico: { idle: 'assets/img/dannati/Cerchio_6/cerchio_6_eretico_idle_frames/', attack: 'assets/img/dannati/Cerchio_6/cerchio_6_eretico_attack_frames/', hurt: 'assets/img/dannati/Cerchio_6/cerchio_6__eretico_hurt_frames/', death: 'assets/img/dannati/Cerchio_6/cerchio_6__eretico_death_frames/' },
    violenza_altri: { idle: 'assets/img/dannati/Cerchio_7/01_violenza_contro_altri/cerchio_7_violenza_altri_idle_frames/', attack: 'assets/img/dannati/Cerchio_7/01_violenza_contro_altri/cerchio_7_violenza_altri_attack_frames/', hurt: 'assets/img/dannati/Cerchio_7/01_violenza_contro_altri/cerchio_7_violenza_altri_hurt_frames/', death: 'assets/img/dannati/Cerchio_7/01_violenza_contro_altri/cerchio_7_violenza_altri_death_frames/' },
    violenza_se: { idle: 'assets/img/dannati/Cerchio_7/02_violenza_contro_se/cerchio_7_violenza_se_idle_frames/', attack: 'assets/img/dannati/Cerchio_7/02_violenza_contro_se/cerchio_7_violenza_se_attack_frames/', hurt: 'assets/img/dannati/Cerchio_7/02_violenza_contro_se/cerchio_7_violenza_se_hurt_frames/', death: 'assets/img/dannati/Cerchio_7/02_violenza_contro_se/cerchio_7_violenza_se_death_frames/' },
    violenza_dio: { idle: 'assets/img/dannati/Cerchio_7/03_violenza_contro_dio/cerchio_7_violenza_dio_idle_frames/', attack: 'assets/img/dannati/Cerchio_7/03_violenza_contro_dio/cerchio_7_violenza_dio_attack_frames/', hurt: 'assets/img/dannati/Cerchio_7/03_violenza_contro_dio/cerchio_7_violenza_dio_hurt_frames/', death: 'assets/img/dannati/Cerchio_7/03_violenza_contro_dio/cerchio_7_violenza_dio_death_frames/' },
    fraudolento: { idle: 'assets/img/dannati/Cerchio_8/cerchio_8_fraudolento_idle_frames/', attack: 'assets/img/dannati/Cerchio_8/cerchio_8_fraudolento_attack1_frames/', hurt: 'assets/img/dannati/Cerchio_8/cerchio_8_fraudolento_hurt_frames/', death: 'assets/img/dannati/Cerchio_8/cerchio_8_fraudolento_death_frames/' },

    traditore: { idle: 'assets/img/dannati/Cerchio_9/cerchio_9_traditori_idle_frames/', attack: 'assets/img/dannati/Cerchio_9/cerchio_9_traditori_attack_frames/', hurt: 'assets/img/dannati/Cerchio_9/cerchio_9_traditori_hurt_frames/', death: 'assets/img/dannati/Cerchio_9/cerchio_9_traditori_death_frames/' }
};

const CORE = window.GameCore || null;
async function hydrateDefaultUnitsFromCatalog() {
    // Sincronizza i default locali con il catalogo centrale delle unita.
    try {
        if (CORE?.units?.loadCatalog) {
            await CORE.units.loadCatalog();
        }
        if (CORE?.units?.getTemplateBySpecies) {
            DEFAULT_PLAYER = CORE.units.getTemplateBySpecies('leone');
            const enemyBase = CORE.units.getTemplateBySpecies('limbo');
            DEFAULT_ENEMY = {
                ...enemyBase,
                nome: enemyBase.nome || 'Dannato Errante',
                specie: enemyBase.specie || 'dannato'
            };
        }
    } catch {
        // Fallback ai default locali gia presenti.
    }
}

function getCoreRuntime() {
    // Recupera GameCore a runtime per evitare race con script defer.
    return window.GameCore || CORE || null;
}
// Mappa effetti: prima versione del sistema abilita tattica per specie.
const SKILL_EFFECTS = {
    lussurioso: 'charm',
    avaro: 'shield',
    iracondo: 'bleed',
    goloso: 'lifesteal',
    eretico: 'bleed',
    violento: 'bleed',
    fraudolento: 'charm',

    traditore: 'boss_combo',
    leone: 'shield',
    lonza: 'bleed',
    lupa: 'lifesteal'
};
const TARGET_CIRCLE_KEY = CORE?.keys?.targetCircle || 'cerchio_destinazione';
const CURRENT_CIRCLE_KEY = CORE?.keys?.currentCircle || 'cerchio_corrente';
const STANDARD_SPRITE_FRAMES = 12;
const BASE_FRAME_MS = 200;
const ATTACK_FRAME_MS = 160;

const TURN_FLOW_STEPS = ['bleed', 'action', 'hit', 'check-ko'];
const TURN_OVERLAY_MS = 1200;
const COMBAT_FIRST_TURN_KEY = 'combat_first_turn';
const COMBAT_ESCAPE_USED_KEY = 'combat_escape_used';
const COINS_KEY = 'inferno_coins';
const INVENTORY_KEY = 'inferno_inventory';

function getStepLabel(step) {
    const it = { bleed: 'stati', action: 'azione', hit: 'impatto', 'check-ko': 'KO check' };
    const en = { bleed: 'status', action: 'action', hit: 'impact', 'check-ko': 'KO check' };
    const map = currentLang() === 'en' ? en : it;
    return map[step] || step;
}


const state = {
    busy: false,
    ended: false,
    selectingReserve: false,
    playerAttacking: false,
    enemyAttacking: false,
    roster: [],
    encounter: null,
    player: null,
    enemy: null,
    playerEnergy: null,
    enemyEnergy: null,
    effects: {
        player: { charmTurns: 0, shieldHits: 0, bleedTurns: 0, bleedDamage: 0 },
        enemy: { charmTurns: 0, shieldHits: 0, bleedTurns: 0, bleedDamage: 0 }
    },
    turn: {
        number: 1,
        actor: 'player',
        phase: 'attesa comando',
        note: 'Ordine: attacco -> danno -> risposta nemica'
    },
    battleStats: {
        playerDamageDone: 0,
        enemyDamageDone: 0
    },
    rules: {
        critChance: 0.05,
        critBonus: 0.5,
        switchUsed: false
    },
    bossPhase: {
        phase: 1,
        transitioned: false
    },
    anim: {
        playerIdle: [],
        playerAttack: [],
        playerHurt: [],
        playerDeath: [],
        enemyIdle: [],
        enemyAttack: [],
        enemyHurt: [],
        enemyDeath: [],
        playerFrame: 0,
        enemyFrame: 0,
        playerTimer: 0,
        enemyTimer: 0,
        playerPlayingDeath: false,
        playerHurtPlaying: false,
        enemyHurtPlaying: false,
        enemyDead: false,
        enemyPlayingDeath: false,
        playerLastHitAt: 0,
        enemyLastHitAt: 0
    }
};

let MAX_ROSTER_SIZE = 6;
let I18N = {};
let EFFECT_META = {};
let CIRCLE_LORE = { it: {}, en: {} };

function currentLang() {
    return localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
}

async function loadI18n() {
    try {
        const response = await fetch(`assets/data/lingue/${currentLang()}.json`);
        I18N = await response.json();
    } catch {
        I18N = {};
    }
}

async function loadCombatEffectsMeta() {
    // Carica descrizioni effetti da JSON per ridurre stringhe hardcoded nel codice.
    try {
        const response = await fetch('assets/data/combat_data/combat_effects.json', { cache: 'no-store' });
        if (!response.ok) {
            return;
        }
        const json = await response.json();
        if (json && typeof json === 'object') {
            EFFECT_META = json;
        }
    } catch {
        // Fallback: si usano descrizioni locali.
    }
}

async function loadCircleLore() {
    // Carica le descrizioni narrative per specie da JSON esterno.
    try {
        const response = await fetch('assets/data/combat_data/circle_lore.json', { cache: 'no-store' });
        if (!response.ok) {
            return;
        }
        const json = await response.json();
        if (json && typeof json === 'object') {
            CIRCLE_LORE = {
                it: json.it || {},
                en: json.en || {}
            };
        }
    } catch {
        // Fallback alle stringhe locali hardcoded.
    }
}
function tC(key, fallback, vars = {}) {
    const base = I18N[key] || fallback;
    return Object.keys(vars).reduce((acc, name) => acc.replace(`{${name}}`, String(vars[name])), base);
}

const dom = {
    battleArena: document.getElementById('battle-arena'),
    enemyName: document.getElementById('enemy-name'),
    enemyKind: document.getElementById('enemy-kind'),
    enemyHP: document.getElementById('enemy-hp'),
    enemyHPText: document.getElementById('enemy-hp-text'),
    enemyEnergy: document.getElementById('enemy-energy'),
    enemyEnergyText: document.getElementById('enemy-energy-text'),
    enemySprite: document.getElementById('enemy-sprite'),
    playerName: document.getElementById('player-name'),
    playerKind: document.getElementById('player-kind'),
    playerHP: document.getElementById('player-hp'),
    playerHPText: document.getElementById('player-hp-text'),
    playerEnergy: document.getElementById('player-energy'),
    playerEnergyText: document.getElementById('player-energy-text'),
    playerSprite: document.getElementById('player-sprite'),
    turnActor: document.getElementById('turn-actor'),
    turnPhase: document.getElementById('turn-phase'),
    turnNote: document.getElementById('turn-note'),
    statusPlayer: document.getElementById('status-player'),
    statusEnemy: document.getElementById('status-enemy'),
    statusPlayerInline: document.getElementById('player-status-inline'),
    statusEnemyInline: document.getElementById('enemy-status-inline'),
    turnFlow: document.getElementById('turn-flow'),
    battleLog: document.getElementById('battle-log'),
    battleActions: document.getElementById('battle-actions'),
    recruitActions: document.getElementById('recruit-actions'),
    endActions: document.getElementById('end-actions'),
    rosterPanel: document.getElementById('roster-panel'),
    reserveModal: document.getElementById('reserve-modal'),
    reserveTitle: document.getElementById('reserve-title'),
    reserveSubtitle: document.getElementById('reserve-subtitle'),
    reserveList: document.getElementById('reserve-list'),
    gameoverOverlay: document.getElementById('gameover-overlay'),
    unitModal: document.getElementById('unit-modal'),
    unitModalClose: document.getElementById('unit-modal-close'),
    unitModalImage: document.getElementById('unit-modal-image'),
    unitModalTitle: document.getElementById('unit-modal-title'),
    unitModalBody: document.getElementById('unit-modal-body'),
    specialButton: document.querySelector('button[data-action="speciale"]'),
    playerCard: document.querySelector('.player-card'),
    enemyCard: document.querySelector('.enemy-card'),
    coinOverlay: document.getElementById('coin-overlay'),
    coinImage: document.getElementById('coin-image'),
    coinResult: document.getElementById('coin-result'),
    turnOverlay: document.getElementById('turn-overlay'),
    turnOverlayText: document.getElementById('turn-overlay-text'),
    inventoryHud: document.getElementById('inventory-hud')
};

function loadJSON(key, fallback = null) {
    if (CORE?.storage?.session?.getJSON) {
        return CORE.storage.session.getJSON(key, fallback);
    }

    try {
        const raw = sessionStorage.getItem(key);
        if (!raw) {
            return fallback;
        }
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

function getCoinsValue() {
    const n = Number(localStorage.getItem(COINS_KEY) || 0);
    return Number.isNaN(n) ? 0 : n;
}

function addCoins(amount) {
    const safe = Math.max(0, Number(amount) || 0);
    localStorage.setItem(COINS_KEY, String(getCoinsValue() + safe));
}

function getEscapeUsed() {
    const n = Number(sessionStorage.getItem(COMBAT_ESCAPE_USED_KEY) || 0);
    return Number.isNaN(n) ? 0 : n;
}

function setEscapeUsed(value) {
    sessionStorage.setItem(COMBAT_ESCAPE_USED_KEY, String(Math.max(0, Math.floor(value))));
}

function getEscapeLeft() {
    return Math.max(0, 3 - getEscapeUsed());
}

function refreshEscapeButtonLabel() {
    const btn = document.querySelector('button[data-action="fuga"]');
    if (!btn) {
        return;
    }
    const left = getEscapeLeft();
    btn.textContent = currentLang() === 'en' ? `Run (${left})` : `Fuga (${left})`;
    btn.disabled = left <= 0 || state.busy || state.ended;
    updateEscapeHint();
}

function updateEscapeHint() {
    // Tooltip della fuga: mostra tentativi residui e conseguenza.
    const btn = document.querySelector('button[data-action="fuga"]');
    if (!btn) {
        return;
    }

    const left = getEscapeLeft();
    if (currentLang() === 'en') {
        btn.title = `Run attempts left: ${left}/3. Running returns you to previous circle.`;
    } else {
        btn.title = `Tentativi fuga rimasti: ${left}/3. La fuga ti riporta al cerchio precedente.`;
    }
}

function confirmRunFromBattle() {
    // Popup di conferma fuga per evitare click accidentali.
    return new Promise((resolve) => {
        openUnitModal(
            currentLang() === 'en' ? 'Confirm Run' : 'Conferma Fuga',
            dom.playerSprite?.src || '',
            currentLang() === 'en' ? 'Leave this battle and go back one circle?' : 'Vuoi fuggire e tornare indietro di un cerchio?'
        );

        const container = document.createElement('div');
        container.className = 'inventory-modal-grid';
        container.style.marginTop = '12px';

        const yesBtn = document.createElement('button');
        yesBtn.type = 'button';
        yesBtn.textContent = currentLang() === 'en' ? 'Run' : 'Fuggi';

        const noBtn = document.createElement('button');
        noBtn.type = 'button';
        noBtn.textContent = currentLang() === 'en' ? 'Stay' : 'Resta';

        container.appendChild(yesBtn);
        container.appendChild(noBtn);
        dom.unitModalBody.parentElement.appendChild(container);

        const cleanup = () => {
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            dom.unitModalClose.removeEventListener('click', onNo);
            dom.unitModal.removeEventListener('click', onBackdrop);
            if (container.parentElement) {
                container.parentElement.removeChild(container);
            }
            closeUnitModal();
        };

        const onYes = () => { cleanup(); resolve(true); };
        const onNo = () => { cleanup(); resolve(false); };
        const onBackdrop = (event) => { if (event.target === dom.unitModal) { onNo(); } };

        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
        dom.unitModalClose.addEventListener('click', onNo);
        dom.unitModal.addEventListener('click', onBackdrop);
    });
}
function runFromBattle() {
    const left = getEscapeLeft();
    if (left <= 0) {
        emitCombatFeedback('action', currentLang() === 'en' ? 'No run attempts left.' : 'Nessun tentativo di fuga rimasto.', '', 'player');
        refreshEscapeButtonLabel();
        return;
    }

    setEscapeUsed(getEscapeUsed() + 1);
    refreshEscapeButtonLabel();

    const current = Number(localStorage.getItem(CURRENT_CIRCLE_KEY) || 1);
    const target = Math.max(1, current - 1);
    localStorage.setItem(CURRENT_CIRCLE_KEY, String(target));
    localStorage.setItem(TARGET_CIRCLE_KEY, String(target));

    emitCombatFeedback('action', currentLang() === 'en' ? 'You escaped. Returning to previous circle.' : 'Sei fuggito. Ritorno al cerchio precedente.', '', 'player');
    setTimeout(() => {
        leaveBattle();
    }, 500);
}
function saveRoster() {
    if (CORE?.units?.saveRoster) {
        CORE.units.saveRoster(state.roster);
        return;
    }

    if (state.roster.length === 1) {
        sessionStorage.setItem(STORAGE_KEYS.roster, JSON.stringify(state.roster[0]));
        return;
    }

    sessionStorage.setItem(STORAGE_KEYS.roster, JSON.stringify(state.roster));
}

function swapRosterUnits(a, b) {
    const tmp = state.roster[a];
    state.roster[a] = state.roster[b];
    state.roster[b] = tmp;
}

function promoteFirstAliveToFront() {
    const aliveIndex = state.roster.findIndex((unit) => Number(unit.hp) > 0);
    if (aliveIndex <= 0) {
        return aliveIndex === 0;
    }
    swapRosterUnits(0, aliveIndex);
    saveRoster();
    return true;
}

function getAliveReserveIndexes() {
    const indexes = [];
    for (let i = 1; i < state.roster.length; i += 1) {
        if (Number(state.roster[i].hp) > 0) {
            indexes.push(i);
        }
    }
    return indexes;
}

function normalizeUnit(unit, fallback) {
    if (CORE?.units?.normalize) {
        return CORE.units.normalize(unit, fallback);
    }

    const source = unit && typeof unit === 'object' ? unit : fallback;
    return {
        nome: source.nome || fallback.nome,
        specie: source.specie || source.tipo || fallback.specie,
        imgPath: source.imgPath || fallback.imgPath,
        maxHP: Number(source.maxHP ?? fallback.maxHP),
        hp: Number(source.hp ?? source.maxHP ?? fallback.maxHP),
        attacco: Number(source.attacco ?? fallback.attacco),
        speciale: source.speciale || source.skill || fallback.speciale,
        attaccoSpeciale: Number(source.attaccoSpeciale ?? fallback.attaccoSpeciale),
        descrizione: source.descrizione || source.description || fallback.descrizione
    };
}

function reconcileUnitWithCatalog(unit, fallback) {
    // Allinea i numeri dell'unita al catalogo centrale in base alla specie.
    const normalized = normalizeUnit(unit, fallback);
    if (!CORE?.units?.getTemplateBySpecies) {
        return normalized;
    }
    const specieKey = String(normalized.specie || '').toLowerCase() === 'traditori' ? 'traditore' : normalized.specie;
    const tpl = CORE.units.getTemplateBySpecies(specieKey);
    if (!tpl) {
        return normalized;
    }
    return {
        ...normalized,
        nome: normalized.nome || tpl.nome,
        imgPath: normalized.imgPath || tpl.imgPath,
        maxHP: Number(tpl.maxHP),
        hp: Math.max(0, Math.min(Number(tpl.maxHP), Number(normalized.hp ?? tpl.maxHP))),
        attacco: Number(tpl.attacco),
        attaccoSpeciale: Number(tpl.attaccoSpeciale),
        speciale: normalized.speciale || tpl.speciale,
        descrizione: normalized.descrizione || tpl.descrizione
    };
}
function loadRoster() {
    if (CORE?.units?.loadRoster) {
        return CORE.units.loadRoster();
    }

    const raw = loadJSON(STORAGE_KEYS.roster, null);
    if (Array.isArray(raw)) {
        return raw.map((unit) => normalizeUnit(unit, DEFAULT_PLAYER));
    }
    if (raw && typeof raw === 'object') {
        return [normalizeUnit(raw, DEFAULT_PLAYER)];
    }
    return [normalizeUnit(DEFAULT_PLAYER, DEFAULT_PLAYER)];
}

function hpColor(percent) {
    if (percent > 50) {
        return 'var(--ok)';
    }
    if (percent > 22) {
        return 'var(--mid)';
    }
    return 'var(--low)';
}

function setLog(text) {
    dom.battleLog.textContent = text;
}

function positionCombatToastLanes(root) {
    if (!root || !dom.playerCard || !dom.enemyCard) {
        return;
    }

    const laneLeft = root.querySelector('.gc-toast-lane.left');
    const laneRight = root.querySelector('.gc-toast-lane.right');
    if (!laneLeft || !laneRight) {
        return;
    }

    const leftRect = dom.playerCard.getBoundingClientRect();
    const rightRect = dom.enemyCard.getBoundingClientRect();
    const panelRect = document.getElementById('panel')?.getBoundingClientRect();

    const topOffset = 12;
    const laneTop = Math.round(leftRect.bottom + topOffset);
    const rightLaneTop = Math.round(rightRect.bottom + topOffset);

    laneLeft.style.left = Math.round(leftRect.left) + 'px';
    laneLeft.style.top = laneTop + 'px';
    laneLeft.style.width = Math.round(leftRect.width) + 'px';

    laneRight.style.left = Math.round(rightRect.left) + 'px';
    laneRight.style.top = rightLaneTop + 'px';
    laneRight.style.width = Math.round(rightRect.width) + 'px';

    if (panelRect) {
        const maxHLeft = Math.max(80, Math.round(panelRect.top - laneTop - 8));
        const maxHRight = Math.max(80, Math.round(panelRect.top - rightLaneTop - 8));
        laneLeft.style.height = maxHLeft + 'px';
        laneRight.style.height = maxHRight + 'px';
    }
}

function resolveNonOverlapPosition(lane, toast, maxX, maxY) {
    // Evita sovrapposizione tra balloon nello stesso lato.
    const rects = Array.from(lane.querySelectorAll('.gc-toast--combat.show, .gc-toast--combat'))
        .filter((el) => el !== toast)
        .map((el) => ({
            x: parseInt(el.style.left || '0', 10) || 0,
            y: parseInt(el.style.top || '0', 10) || 0,
            w: Math.max(80, el.offsetWidth || 180),
            h: Math.max(40, el.offsetHeight || 64)
        }));

    const w = Math.max(80, toast.offsetWidth || 180);
    const h = Math.max(40, toast.offsetHeight || 64);

    let x = Math.round(Math.random() * Math.max(0, maxX));
    let y = Math.round(Math.random() * Math.max(0, maxY));

    const overlap = (a, b) => !(a.x + a.w + 8 < b.x || b.x + b.w + 8 < a.x || a.y + a.h + 8 < b.y || b.y + b.h + 8 < a.y);

    for (let i = 0; i < 22; i += 1) {
        const candidate = { x, y, w, h };
        const hit = rects.find((r) => overlap(candidate, r));
        if (!hit) {
            return { x, y };
        }

        y = hit.y + hit.h + 10;
        if (y > maxY) {
            y = Math.round(Math.random() * Math.max(0, maxY));
            x = Math.round(Math.random() * Math.max(0, maxX));
        }
    }

    return { x, y };
}

function combatToast(message, side = 'auto', durationMs = 1400) {
    if (!message) {
        return;
    }

    let root = document.getElementById('gc-toast-root');
    if (!root) {
        root = document.createElement('div');
        root.id = 'gc-toast-root';
        document.body.appendChild(root);
    }

    root.classList.add('gc-toast-root--combat');

    let laneLeft = root.querySelector('.gc-toast-lane.left');
    let laneRight = root.querySelector('.gc-toast-lane.right');
    if (!laneLeft || !laneRight) {
        root.innerHTML = '<div class="gc-toast-lane left"></div><div class="gc-toast-lane right"></div>';
        laneLeft = root.querySelector('.gc-toast-lane.left');
        laneRight = root.querySelector('.gc-toast-lane.right');
    }

    positionCombatToastLanes(root);

    const msg = String(message);
    const pickEnemy = state?.enemy?.nome && msg.includes(state.enemy.nome);
    const pickPlayer = state?.player?.nome && msg.includes(state.player.nome);

    let target = laneLeft;
    if (side === 'enemy' || pickEnemy) {
        target = laneRight;
    } else if (side === 'player' || pickPlayer) {
        target = laneLeft;
    } else {
        target = Math.random() < 0.5 ? laneLeft : laneRight;
    }

    const toast = document.createElement('div');
    toast.className = 'gc-toast gc-toast--combat';
    toast.textContent = msg;
    target.appendChild(toast);

    requestAnimationFrame(() => {
        const laneW = Math.max(80, target.clientWidth);
        const laneH = Math.max(40, target.clientHeight || 120);
        const toastW = Math.max(120, toast.offsetWidth || 180);
        const toastH = Math.max(46, toast.offsetHeight || 64);

        const maxX = Math.max(0, laneW - toastW - 6);
        const maxY = Math.max(0, laneH - toastH - 4);

        const pos = resolveNonOverlapPosition(target, toast, maxX, maxY);

        toast.style.left = pos.x + 'px';
        toast.style.top = pos.y + 'px';
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 420);
    }, Math.max(600, durationMs));
}


function spawnFloatingText(targetEl, text, type = 'damage') {
    if (!targetEl || !dom.battleArena) {
        return;
    }

    const arenaRect = dom.battleArena.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const span = document.createElement('span');
    span.className = `floating-text ${type}`;
    span.textContent = text;

    const cx = targetRect.left - arenaRect.left + targetRect.width * 0.5;
    const cy = targetRect.top - arenaRect.top + targetRect.height * 0.2;
    const jitterX = (Math.random() - 0.5) * 30;
    const jitterY = (Math.random() - 0.5) * 12;

    span.style.left = `${Math.max(8, cx + jitterX)}px`;
    span.style.top = `${Math.max(8, cy + jitterY)}px`;

    dom.battleArena.appendChild(span);
    setTimeout(() => {
        if (span.parentElement) {
            span.parentElement.removeChild(span);
        }
    }, 1800);
}
function setTurnHud(actor, phase, note = '') {
    state.turn.actor = actor;
    state.turn.phase = phase;
    state.turn.note = note || state.turn.note;

    if (!dom.turnActor || !dom.turnPhase || !dom.turnNote) {
        return;
    }

    const actorLabel = actor === 'enemy'
        ? (currentLang() === 'en' ? 'Enemy' : 'Nemico')
        : (currentLang() === 'en' ? 'Player' : 'Giocatore');

    dom.turnActor.textContent = currentLang() === 'en'
        ? `Turn ${state.turn.number} - ${actorLabel}`
        : `Turno ${state.turn.number} - ${actorLabel}`;
    dom.turnPhase.textContent = (currentLang() === 'en' ? 'Phase: ' : 'Fase: ') + phase;
    dom.turnNote.textContent = note || (currentLang() === 'en'
        ? 'Order: attack -> hit -> counter action'
        : 'Ordine: attacco -> danno -> risposta');

    if (dom.playerCard && dom.enemyCard) {
        dom.playerCard.classList.toggle('is-active-turn', actor === 'player');
        dom.enemyCard.classList.toggle('is-active-turn', actor === 'enemy');
    }
}

function effectIconPath(effectKey) {
    // Mappa icone SVG con fallback per nomi file non standard.
    const key = String(effectKey || '').toLowerCase();
    const map = {
        shield: 'assets/img/oggetti/effects/buff/sheild.svg',
        reflect: 'assets/img/oggetti/effects/buff/reflect_sheild.svg',
        true_damage: 'assets/img/oggetti/effects/buff/true_damage.svg',
        lifesteal: 'assets/img/oggetti/effects/buff/lifesteal.svg',
        sacrifice_buff: 'assets/img/oggetti/effects/buff/sacrife_buff.svg',
        dodge: 'assets/img/oggetti/effects/buff/dodge.svg',
        invincible: 'assets/img/oggetti/effects/buff/sheild.svg',
        damage_bonus: 'assets/img/oggetti/effects/buff/damage.svg',
        charm: 'assets/img/oggetti/effects/debuff/charm.svg',
        bleed: 'assets/img/oggetti/effects/debuff/bleed.svg',
        freeze: 'assets/img/oggetti/effects/debuff/freeze.svg',
        burn: 'assets/img/oggetti/effects/debuff/burn.svg',
        weaken: 'assets/img/oggetti/effects/debuff/weaken.svg',
        plague: 'assets/img/oggetti/effects/debuff/plague_mark.svg',
        energy_drain: 'assets/img/oggetti/effects/debuff/weaken.svg',
        chaos: 'assets/img/oggetti/effects/debuff/weaken.svg',
        boss_combo: 'assets/img/oggetti/effects/debuff/boss_combo.svg',
        true_strike: 'assets/img/oggetti/effects/buff/true_damage.svg',
        powerup: 'assets/img/oggetti/effects/buff/sacrife_buff.svg'
    };
    return map[key] || '';
}

function statusBadgeHtml(type, text, tooltip = '', effectKey = '') {
    const safeTip = String(tooltip || '').replace(/"/g, '&quot;');
    const icon = effectIconPath(effectKey);
    const iconHtml = icon ? `<img class="badge-icon" src="${icon}" alt="${effectKey}">` : '';
    return `<span class="badge badge--${type}" title="${safeTip}" data-tip="${safeTip}">${iconHtml}<span>${text}</span></span>`;
}

function effectBadgeTooltip(type, value = 0) {
    // Tooltip esteso per spiegare chiaramente ogni stato al passaggio del mouse.
    const isEn = currentLang() === 'en';
    const n = Number(value || 0);
    const pct = Math.round(n * 100);
    const mapIt = {
        shield: `Scudo: blocca ${n} colpo/i in arrivo.`,
        charm: `Ammalia: salta ${n} turno/i.`,
        bleed: `Sanguinamento: danno periodico per ${n} turno/i.`,
        freeze: `Gelo: salta ${n} turno/i.`,
        burn: `Bruciatura: danno periodico per ${n} turno/i.`,
        weaken: `Indebolimento: danno ridotto per ${n} turno/i.`,
        dodge: `Schivata: evita ${n} colpo/i.`,
        reflect: 'Riflesso: restituisce parte del danno ricevuto.',
        plague: `Piaga: ${n} marchio/i attivi.`,
        invincible: `Invincibile: immunità per ${n} turno/i.`,
        damage_bonus: `Danno aumentato del ${pct}%.`,
        revive: `Totem Immortalità attivo per ${n} turno/i.`,
        true_strike: `Danno puro: ignora scudo per ${n} colpo/i.`,
        powerup: `Potenziamento: prossimo colpo x${n.toFixed(2)}.`
    };
    const mapEn = {
        shield: `Shield: blocks ${n} incoming hit(s).`,
        charm: `Charm: skips ${n} turn(s).`,
        bleed: `Bleed: periodic damage for ${n} turn(s).`,
        freeze: `Freeze: skips ${n} turn(s).`,
        burn: `Burn: periodic damage for ${n} turn(s).`,
        weaken: `Weaken: reduced outgoing damage for ${n} turn(s).`,
        dodge: `Dodge: avoids ${n} hit(s).`,
        reflect: 'Reflect: returns part of incoming damage.',
        plague: `Plague: ${n} mark(s) active.`,
        invincible: `Invincible: immunity for ${n} turn(s).`,
        damage_bonus: `Damage increased by ${pct}%.`,
        revive: `Revive Totem active for ${n} turn(s).`,
        true_strike: `True strike: ignores shield for ${n} hit(s).`,
        powerup: `Power-up: next strike x${n.toFixed(2)}.`
    };
    return (isEn ? mapEn : mapIt)[type] || (isEn ? 'Active status effect.' : 'Effetto di stato attivo.');
}
function effectBadgeLabel(type, value = 0) {
    // Etichetta breve e uniforme per buff/debuff mostrati sotto le barre.
    const isEn = currentLang() === 'en';
    const n = Number(value || 0);
    const turnSuffix = isEn ? 'T' : 'T';

    const map = {
        shield: isEn ? `Shield ${n}` : `Scudo ${n}`,
        charm: isEn ? `Charm ${n}${turnSuffix}` : `Ammalia ${n}${turnSuffix}`,
        bleed: isEn ? `Bleed ${n}${turnSuffix}` : `Sanguina ${n}${turnSuffix}`,
        freeze: isEn ? `Freeze ${n}${turnSuffix}` : `Gelo ${n}${turnSuffix}`,
        burn: isEn ? `Burn ${n}${turnSuffix}` : `Bruciatura ${n}${turnSuffix}`,
        weaken: isEn ? `Weaken ${n}${turnSuffix}` : `Indebolisci ${n}${turnSuffix}`,
        dodge: isEn ? `Dodge ${n}` : `Schivata ${n}`,
        reflect: isEn ? 'Reflect' : 'Riflesso',
        plague: isEn ? `Plague ${n}` : `Piaga ${n}`,
        invincible: isEn ? `Invincible ${n}${turnSuffix}` : `Invincibile ${n}${turnSuffix}`,
        damage_bonus: isEn ? `DMG +${Math.round(n * 100)}%` : `DAN +${Math.round(n * 100)}%`,
        revive: isEn ? `REV ${n}T` : `REV ${n}T`,
        true_strike: isEn ? `True Dmg ${n}` : `Danno Puro ${n}`,
        powerup: isEn ? `Power x${n.toFixed(2)}` : `Potenza x${n.toFixed(2)}`
    };

    return map[type] || `${type}:${n}`;
}
function setTurnStep(step) {
    if (!dom.turnFlow) {
        return;
    }

    const currentIndex = Math.max(0, TURN_FLOW_STEPS.indexOf(step));
    dom.turnFlow.querySelectorAll('.flow-step').forEach((item) => {
        const itemStep = item.dataset.step;
        const itemIndex = Math.max(0, TURN_FLOW_STEPS.indexOf(itemStep));
        item.classList.remove('is-active', 'is-done', 'is-pending');

        if (itemIndex < currentIndex) {
            item.classList.add('is-done');
        } else if (itemIndex === currentIndex) {
            item.classList.add('is-active');
        } else {
            item.classList.add('is-pending');
        }

        item.textContent = getStepLabel(itemStep);
    });
}
function renderStatusBadges() {
    if (!dom.statusPlayerInline || !dom.statusEnemyInline) {
        return;
    }

    if (dom.statusEnemy) {
        dom.statusEnemy.classList.add('is-enemy');
    }

    const p = getEffects('player');
    const e = getEffects('enemy');

    const pBadges = [];
    const eBadges = [];

    const pushBadges = (arr, effects) => {
        if (effects.shieldHits > 0) { arr.push(statusBadgeHtml('shield', effectBadgeLabel('shield', effects.shieldHits), effectBadgeTooltip('shield', effects.shieldHits), 'shield')); }
        if (effects.charmTurns > 0) { arr.push(statusBadgeHtml('charm', effectBadgeLabel('charm', effects.charmTurns), effectBadgeTooltip('charm', effects.charmTurns), 'charm')); }
        if (effects.bleedTurns > 0) { arr.push(statusBadgeHtml('bleed', effectBadgeLabel('bleed', effects.bleedTurns), effectBadgeTooltip('bleed', effects.bleedTurns), 'bleed')); }
        if (effects.freezeTurns > 0) { arr.push(statusBadgeHtml('freeze', effectBadgeLabel('freeze', effects.freezeTurns), effectBadgeTooltip('freeze', effects.freezeTurns), 'freeze')); }
        if (effects.burnTurns > 0) { arr.push(statusBadgeHtml('burn', effectBadgeLabel('burn', effects.burnTurns), effectBadgeTooltip('burn', effects.burnTurns), 'burn')); }
        if (effects.weakenTurns > 0) { arr.push(statusBadgeHtml('weaken', effectBadgeLabel('weaken', effects.weakenTurns), effectBadgeTooltip('weaken', effects.weakenTurns), 'weaken')); }
        if (effects.dodgeCharges > 0) { arr.push(statusBadgeHtml('shield', effectBadgeLabel('dodge', effects.dodgeCharges), effectBadgeTooltip('dodge', effects.dodgeCharges), 'dodge')); }
        if (effects.reflectRatio > 0) { arr.push(statusBadgeHtml('shield', effectBadgeLabel('reflect', 1), effectBadgeTooltip('reflect', 1), 'reflect')); }
        if (effects.plagueMarks > 0) { arr.push(statusBadgeHtml('bleed', effectBadgeLabel('plague', effects.plagueMarks), effectBadgeTooltip('plague', effects.plagueMarks), 'plague')); }
        if (effects.invincibleTurns > 0) { arr.push(statusBadgeHtml('shield', effectBadgeLabel('invincible', effects.invincibleTurns), effectBadgeTooltip('invincible', effects.invincibleTurns), 'invincible')); }
        if (effects.damageBonus > 0) { arr.push(statusBadgeHtml('shield', effectBadgeLabel('damage_bonus', effects.damageBonus), effectBadgeTooltip('damage_bonus', effects.damageBonus), 'damage_bonus')); }
        if (effects.reviveTurns > 0 && effects.reviveCharges > 0) { arr.push(statusBadgeHtml('shield', effectBadgeLabel('revive', effects.reviveTurns), effectBadgeTooltip('revive', effects.reviveTurns), 'revive')); }
        if (effects.trueStrikeCharges > 0) { arr.push(statusBadgeHtml('shield', effectBadgeLabel('true_strike', effects.trueStrikeCharges), effectBadgeTooltip('true_strike', effects.trueStrikeCharges), 'true_strike')); }
        if (effects.nextAttackMultiplier > 1) { arr.push(statusBadgeHtml('shield', effectBadgeLabel('powerup', effects.nextAttackMultiplier), effectBadgeTooltip('powerup', effects.nextAttackMultiplier), 'powerup')); }
    };

    pushBadges(pBadges, p);
    pushBadges(eBadges, e);

    const playerHtml = pBadges.length ? pBadges.join('') : '<span class="badge">' + (currentLang() === 'en' ? 'none' : 'nessuno') + '</span>';
    const enemyHtml = eBadges.length ? eBadges.join('') : '<span class="badge">' + (currentLang() === 'en' ? 'none' : 'nessuno') + '</span>';    if (dom.statusPlayer) { dom.statusPlayer.innerHTML = playerHtml; }
    if (dom.statusEnemy) { dom.statusEnemy.innerHTML = enemyHtml; }
    if (dom.statusPlayerInline) { dom.statusPlayerInline.innerHTML = playerHtml; }
    if (dom.statusEnemyInline) { dom.statusEnemyInline.innerHTML = enemyHtml; }
}
function emitCombatFeedback(kind, text, toastText = '', toastSide = 'auto', toastDurationMs = 1600) {
    // Canale unico di feedback: log + badge + toast laterale coerente.
    setLog(text);
    renderStatusBadges();
    const msg = String(toastText || text || '').trim();
    if (msg) {
        const side = toastSide === 'auto'
            ? (state.turn.actor === 'enemy' ? 'enemy' : 'player')
            : toastSide;
        combatToast(msg, side, toastDurationMs);
    }

    if (kind === 'hit') {
        setTurnStep('hit');
        setTurnHud(state.turn.actor, currentLang() === 'en' ? 'hit confirmed' : 'colpo confermato');
    }
    if (kind === 'death') {
        setTurnStep('check-ko');
        setTurnHud(state.turn.actor, currentLang() === 'en' ? 'target defeated' : 'bersaglio sconfitto');
    }
}
function saveCombatSummary(win) {
    const summary = {
        timestamp: Date.now(),
        circle: resolveCircleNumber(),
        win,
        player: { nome: state.player.nome, specie: state.player.specie, hp: Math.round(state.player.hp) },
        enemy: { nome: state.enemy.nome, specie: state.enemy.specie, hp: Math.round(state.enemy.hp) },
        turnCount: state.turn.number,
        damage: {
            playerDone: state.battleStats.playerDamageDone,
            enemyDone: state.battleStats.enemyDamageDone
        }
    };
    sessionStorage.setItem(STORAGE_KEYS.summary, JSON.stringify(summary));
}

function resolveCircleNumber() {
    const target = Number(localStorage.getItem(TARGET_CIRCLE_KEY));
    if (!Number.isNaN(target) && target > 0) {
        return target;
    }

    const current = Number(localStorage.getItem(CURRENT_CIRCLE_KEY));
    if (!Number.isNaN(current) && current > 0) {
        return current;
    }

    return 1;
}

function applyArenaBackground() {
    // Sfondo dinamico in base al cerchio corrente.
    const circle = resolveCircleNumber();
    const image = CIRCLE_BACKGROUND_MAP[circle] || CIRCLE_BACKGROUND_MAP[1];

    dom.battleArena.style.backgroundImage = [
        'linear-gradient(180deg, rgba(5, 3, 2, .35), rgba(0, 0, 0, .45))',
        'radial-gradient(circle at 50% 68%, rgba(255, 120, 52, .2) 0%, transparent 52%)',
        `url('${image}')`
    ].join(', ');
}

function getChargeHitsNeeded(unit) {
    // Regola semplice: speciali piu forti richiedono piu attacchi di carica.
    const normal = Number(unit.attacco || 1);
    const special = Number(unit.attaccoSpeciale || normal + 1);
    const delta = Math.max(1, special - normal);

    if (delta <= 6) {
        return 2;
    }
    if (delta <= 10) {
        return 3;
    }
    return 4;
}

function buildEnergyModel(unit) {
    const hits = getChargeHitsNeeded(unit);
    return {
        current: 0,
        max: 100,
        hitsNeeded: hits,
        gainPerNormal: Math.ceil(100 / hits)
    };
}

function canUseSpecial(energyModel) {
    return !!energyModel && energyModel.current >= energyModel.max;
}

function gainEnergy(energyModel, amount) {
    if (!energyModel) {
        return;
    }
    const gain = (amount != null && amount > 0) ? amount : energyModel.gainPerNormal;
    energyModel.current = Math.min(energyModel.max, energyModel.current + gain);
}

function consumeEnergy(energyModel) {
    if (!energyModel) {
        return;
    }
    energyModel.current = 0;
}

function updateSpecialButtonState() {
    if (!dom.specialButton) {
        return;
    }

    const canUse = canUseSpecial(state.playerEnergy);
    dom.specialButton.disabled = state.busy || state.ended || state.selectingReserve || !canUse;

    const suffix = canUse
        ? tC('combat_special_ready', 'PRONTO')
        : `${state.playerEnergy?.current || 0}/${state.playerEnergy?.max || 100}`;
    dom.specialButton.textContent = `${tC('combat_action_special', 'Speciale')} [${suffix}]`;
}

function updateBars() {
    const playerPercent = Math.max(0, (state.player.hp / state.player.maxHP) * 100);
    const enemyPercent = Math.max(0, (state.enemy.hp / state.enemy.maxHP) * 100);

    dom.playerHP.style.width = `${playerPercent}%`;
    dom.enemyHP.style.width = `${enemyPercent}%`;

    dom.playerHP.style.background = hpColor(playerPercent);
    dom.enemyHP.style.background = hpColor(enemyPercent);

    dom.playerHPText.textContent = `${Math.max(0, Math.round(state.player.hp))} / ${state.player.maxHP}`;
    dom.enemyHPText.textContent = `${Math.max(0, Math.round(state.enemy.hp))} / ${state.enemy.maxHP}`;

    const playerEnergyPercent = Math.max(0, ((state.playerEnergy?.current || 0) / (state.playerEnergy?.max || 100)) * 100);
    const enemyEnergyPercent = Math.max(0, ((state.enemyEnergy?.current || 0) / (state.enemyEnergy?.max || 100)) * 100);

    dom.playerEnergy.style.width = `${playerEnergyPercent}%`;
    dom.enemyEnergy.style.width = `${enemyEnergyPercent}%`;

    dom.playerEnergyText.textContent = `Energia: ${state.playerEnergy.current} / ${state.playerEnergy.max}`;
    dom.enemyEnergyText.textContent = `Energia: ${state.enemyEnergy.current} / ${state.enemyEnergy.max}`;

    updateSpecialButtonState();
    updateActionHints();
    renderStatusBadges();
}

// Mantiene la vita del primo alleato per i combattimenti successivi.
function syncRosterHP() {
    state.roster[0].hp = Math.max(0, Math.round(state.player.hp));
    saveRoster();
}


function getSkillEffectCode(unit) {
    const specie = String(unit?.specie || '').toLowerCase();
    return SKILL_EFFECTS[specie] || 'none';
}

// Profili dati-driven per speciali e passive (prima versione completa per le 3 bestie iniziali).
let SPECIES_COMBAT_PROFILES = {
    leone: {
        special: { type: 'sacrifice_buff', hpCostRatio: 0.10, nextAttackMultiplier: 1.90 },
        passives: [
            { type: 'hp_loss_rage', thresholdStep: 0.25, bonusPerStep: 0.07 }
        ]
    },
    lonza: {
        special: { type: 'energy_drain', energyDrain: 18 },
        passives: [
            { type: 'reduce_enemy_special_damage', ratio: 0.82 },
            { type: 'first_strike_bonus', ratio: 0.16 }
        ]
    },
    lupa: {
        special: { type: 'shield', shieldHits: 1 },
        passives: [
            { type: 'conditional_shield_boost', enemyHpThreshold: 0.35, shieldBonusHits: 2 }
        ]
    }
};

function getCombatProfile(unit) {
    const specie = String(unit?.specie || '').toLowerCase();
    return SPECIES_COMBAT_PROFILES[specie] || { special: { type: getSkillEffectCode(unit), scale: 1 }, passives: [] };
}

async function loadCombatProfiles() {
    // Carica i profili da JSON per separare dati e logica.
    try {
        const response = await fetch('assets/data/combat_data/combat_profiles.json', { cache: 'no-store' });
        if (!response.ok) {
            return;
        }
        const json = await response.json();
        if (json && typeof json === 'object') {
            SPECIES_COMBAT_PROFILES = { ...SPECIES_COMBAT_PROFILES, ...json };
        }
    } catch {
        // Fallback silenzioso ai profili hardcoded.
    }
}

function getEffects(side) {
    return side === 'player' ? state.effects.player : state.effects.enemy;
}

function getUnitBySide(side) {
    return side === 'player' ? state.player : state.enemy;
}

function getSpriteBySide(side) {
    return side === 'player' ? dom.playerSprite : dom.enemySprite;
}

function getOppositeSide(side) {
    return side === 'player' ? 'enemy' : 'player';
}

function makeDefaultEffectsState() {
    return { charmTurns: 0, freezeTurns: 0, shieldHits: 0, bleedTurns: 0, bleedDamage: 0, burnTurns: 0, burnDamage: 0, weakenTurns: 0, weakenRatio: 1, nextAttackMultiplier: 1, trueStrikeCharges: 0, damageBonus: 0, damageBonusTurns: 0, invincibleTurns: 0, dodgeCharges: 0, reflectRatio: 0, plagueMarks: 0, reviveCharges: 0, reviveTurns: 0 };
}

function resetSideEffects(side) {
    state.effects[side] = makeDefaultEffectsState();
    if (!state.passiveRuntime) {
        state.passiveRuntime = { player: { hpLossThresholdsTriggered: 0, firstStrikeUsed: false, healOnceLowHpUsed: false, debuffImmunityUsed: false }, enemy: { hpLossThresholdsTriggered: 0, firstStrikeUsed: false, healOnceLowHpUsed: false, debuffImmunityUsed: false } };
    }
    state.passiveRuntime[side] = { hpLossThresholdsTriggered: 0, firstStrikeUsed: false, healOnceLowHpUsed: false, debuffImmunityUsed: false };
}

function resetEffectsState() {
    state.effects.player = makeDefaultEffectsState();
    state.effects.enemy = makeDefaultEffectsState();
    state.passiveRuntime = { player: { hpLossThresholdsTriggered: 0, firstStrikeUsed: false, healOnceLowHpUsed: false, debuffImmunityUsed: false }, enemy: { hpLossThresholdsTriggered: 0, firstStrikeUsed: false, healOnceLowHpUsed: false, debuffImmunityUsed: false } };
}

function applyShieldOnIncomingDamage(side, damage, ignoreShield = false) {
    const effects = getEffects(side);
    if (ignoreShield || effects.shieldHits <= 0) {
        return damage;
    }
    effects.shieldHits = Math.max(0, effects.shieldHits - 1);
    return Math.max(1, Math.round(damage * 0.62));
}

function resolveIncomingDamage(defenderSide, attackerSide, rawDamage, ignoreShield = false) {
    const defEffects = getEffects(defenderSide);
    const defUnit = getUnitBySide(defenderSide);
    const atkUnit = getUnitBySide(attackerSide);

    if (defEffects.invincibleTurns > 0) {
        emitCombatFeedback('status', defUnit.nome + ' è invincibile e annulla il colpo.', '', defenderSide);
        spawnFloatingText(getSpriteBySide(defenderSide), 'INVINCIBILE', 'control');
        return 0;
    }

    if (defEffects.dodgeCharges > 0) {
        defEffects.dodgeCharges = Math.max(0, defEffects.dodgeCharges - 1);
        emitCombatFeedback('status', defUnit.nome + ' schiva il colpo.', '', defenderSide);
        spawnFloatingText(getSpriteBySide(defenderSide), 'MISS', 'control');
        return 0;
    }

    let dealt = applyShieldOnIncomingDamage(defenderSide, rawDamage, ignoreShield);

    if (defEffects.reflectRatio > 0 && dealt > 0 && atkUnit) {
        const reflected = Math.max(1, Math.round(dealt * defEffects.reflectRatio));
        atkUnit.hp = Math.max(0, atkUnit.hp - reflected);
        spawnFloatingText(getSpriteBySide(attackerSide), '-' + reflected, 'damage');
    }

    return dealt;
}

function applyStartTurnStatusDamage(side) {
    const effects = getEffects(side);
    const unit = getUnitBySide(side);
    if (!effects || !unit) {
        return false;
    }
    if (side === 'player' && Number(effects.reviveTurns || 0) > 0) {
        effects.reviveTurns = Math.max(0, Number(effects.reviveTurns) - 1);
        if (effects.reviveTurns === 0) {
            effects.reviveCharges = 0;
        }
    }

    let total = 0;
    if (effects.bleedTurns > 0 && effects.bleedDamage > 0) {
        const dmg = Math.min(unit.hp, effects.bleedDamage);
        unit.hp = Math.max(0, unit.hp - dmg);
        total += dmg;
        effects.bleedTurns = Math.max(0, effects.bleedTurns - 1);
        if (effects.bleedTurns === 0) { effects.bleedDamage = 0; }
    }
    if (effects.burnTurns > 0 && effects.burnDamage > 0) {
        const dmg = Math.min(unit.hp, effects.burnDamage);
        unit.hp = Math.max(0, unit.hp - dmg);
        total += dmg;
        effects.burnTurns = Math.max(0, effects.burnTurns - 1);
        if (effects.burnTurns === 0) { effects.burnDamage = 0; }
    }
    // weaken si decrementa DOPO il calcolo del danno in applyOutgoingDamageModifiers.

    if (effects.invincibleTurns > 0) {
        effects.invincibleTurns = Math.max(0, effects.invincibleTurns - 1);
    }
    if (effects.reflectRatio > 0) {
        effects.reflectRatio = 0;
    }

    if (total > 0) {
        updateBars();
        const who = side === 'player' ? state.player.nome : state.enemy.nome;
        emitCombatFeedback('status', who + ' subisce danni periodici: ' + total + '.', '', side);
        if (side === 'player') { syncRosterHP(); }
    }
    return unit.hp <= 0;
}

function trySkipTurnForControl(side) {
    const effects = getEffects(side);
    if (!effects) { return false; }
    const unit = getUnitBySide(side);
    if (effects.freezeTurns > 0) {
        effects.freezeTurns = Math.max(0, effects.freezeTurns - 1);
        emitCombatFeedback('status', unit.nome + ' è congelato e salta il turno.', '', side);
        updateBars();
        return true;
    }
    if (effects.charmTurns > 0) {
        effects.charmTurns = Math.max(0, effects.charmTurns - 1);
        emitCombatFeedback('status', unit.nome + ' è sotto charme e perde il turno.', '', side);
        updateBars();
        return true;
    }
    return false;
}

function applyOutgoingDamageModifiers(side, damage, useSpecial = false, consume = false) {
    const effects = getEffects(side);
    const profile = getCombatProfile(getUnitBySide(side));
    let value = damage;
    if (effects.weakenTurns > 0) {
        value = Math.max(1, Math.round(value * effects.weakenRatio));
        if (consume) {
            effects.weakenTurns = Math.max(0, effects.weakenTurns - 1);
            if (effects.weakenTurns === 0) { effects.weakenRatio = 1; }
        }
    }
    if (effects.nextAttackMultiplier > 1) { value = Math.max(1, Math.round(value * effects.nextAttackMultiplier)); effects.nextAttackMultiplier = 1; }
    if (effects.damageBonus > 0) { value = Math.max(1, Math.round(value * (1 + effects.damageBonus))); }
    const opposite = getOppositeSide(side);
    const oppositeProfile = getCombatProfile(getUnitBySide(opposite));
    const reducePassive = oppositeProfile.passives.find((p) => p.type === 'reduce_enemy_special_damage');
    if (useSpecial && reducePassive) { value = Math.max(1, Math.round(value * reducePassive.ratio)); }
    return value;
}

function triggerPassives(side, trigger, payload = {}) {
    const profile = getCombatProfile(getUnitBySide(side));
    const runtime = state.passiveRuntime?.[side];
    const unit = getUnitBySide(side);
    const effects = getEffects(side);
    if (!profile || !Array.isArray(profile.passives) || !runtime || !unit || !effects) { return; }

    const enemySide = getOppositeSide(side);
    const enemy = getUnitBySide(enemySide);
    const enemyEffects = getEffects(enemySide);

    profile.passives.forEach((passive) => {
        if (passive.type === 'hp_loss_rage' && trigger === 'hp_changed') {
            const lostRatio = 1 - Math.max(0, unit.hp) / Math.max(1, unit.maxHP);
            const steps = Math.floor(lostRatio / passive.thresholdStep);
            if (steps > runtime.hpLossThresholdsTriggered) {
                const gained = (steps - runtime.hpLossThresholdsTriggered) * passive.bonusPerStep;
                effects.damageBonus += gained;
                runtime.hpLossThresholdsTriggered = steps;
                emitCombatFeedback('status', unit.nome + ' entra in furia: danno aumentato.', '', side);
            }
        }

        if (passive.type === 'conditional_shield_boost' && trigger === 'hp_changed') {
            const enemyRatio = enemy ? (Math.max(0, enemy.hp) / Math.max(1, enemy.maxHP)) : 1;
            if (enemyRatio <= Number(passive.enemyHpThreshold || 0.3)) {
                const bonus = Math.max(1, Number(passive.shieldBonusHits || 1));
                effects.shieldHits = Math.max(effects.shieldHits, bonus);
            }
        }

        if (passive.type === 'regen_every_turn' && trigger === 'turn_start') {
            const heal = Math.max(1, Math.round(unit.maxHP * Math.max(0.01, Number(passive.ratio || 0.03))));
            unit.hp = Math.min(unit.maxHP, unit.hp + heal);
            spawnFloatingText(getSpriteBySide(side), '+' + heal, 'heal');
        }

        if (passive.type === 'first_strike_bonus' && trigger === 'before_attack' && !runtime.firstStrikeUsed) {
            effects.nextAttackMultiplier = Math.max(effects.nextAttackMultiplier, 1 + Math.max(0.05, Number(passive.ratio || 0.2)));
            runtime.firstStrikeUsed = true;
        }

        if (passive.type === 'execution_bonus_low_enemy' && trigger === 'before_attack' && enemy) {
            const enemyRatio = Math.max(0, enemy.hp) / Math.max(1, enemy.maxHP);
            if (enemyRatio <= Number(passive.threshold || 0.35)) {
                effects.nextAttackMultiplier = Math.max(effects.nextAttackMultiplier, 1 + Math.max(0.05, Number(passive.ratio || 0.2)));
            }
        }

        if (passive.type === 'shield_each_turn' && trigger === 'turn_start') {
            effects.shieldHits = Math.max(effects.shieldHits, Math.max(1, Number(passive.hits || 1)));
        }

        if (passive.type === 'energy_on_damage_taken' && trigger === 'damaged') {
            const amount = Math.max(1, Number(passive.amount || 12));
            gainEnergy(side === 'player' ? state.playerEnergy : state.enemyEnergy, amount);
        }

        if (passive.type === 'regen_if_enemy_burn' && trigger === 'turn_start' && enemyEffects?.burnTurns > 0) {
            const heal = Math.max(1, Math.round(unit.maxHP * Math.max(0.01, Number(passive.ratio || 0.04))));
            unit.hp = Math.min(unit.maxHP, unit.hp + heal);
            spawnFloatingText(getSpriteBySide(side), '+' + heal, 'heal');
        }

        if (passive.type === 'cleanse_if_low_hp' && trigger === 'hp_changed') {
            const ratio = Math.max(0, unit.hp) / Math.max(1, unit.maxHP);
            if (ratio <= Number(passive.threshold || 0.3)) {
                effects.charmTurns = 0;
                effects.freezeTurns = 0;
                effects.bleedTurns = 0;
                effects.bleedDamage = 0;
                effects.burnTurns = 0;
                effects.burnDamage = 0;
                effects.weakenTurns = 0;
                effects.weakenRatio = 1;
            }
        }

        if (passive.type === 'heal_once_low_hp' && trigger === 'hp_changed' && !runtime.healOnceLowHpUsed) {
            const ratio = Math.max(0, unit.hp) / Math.max(1, unit.maxHP);
            if (ratio <= Number(passive.threshold || 0.5)) {
                const heal = Math.max(1, Math.round(unit.maxHP * Math.max(0.05, Number(passive.ratio || 0.25))));
                unit.hp = Math.min(unit.maxHP, unit.hp + heal);
                runtime.healOnceLowHpUsed = true;
                spawnFloatingText(getSpriteBySide(side), '+' + heal, 'heal');
                emitCombatFeedback('status', unit.nome + ' recupera forza infernale.', '', side);
            }
        }

        if (passive.type === 'shield_damage_scaling' && trigger === 'before_attack') {
            const perShield = Math.max(0.01, Number(passive.perShieldBonus || 0.10));
            const shieldLayers = Math.max(0, Number(effects.shieldHits || 0));
            if (shieldLayers > 0) {
                effects.nextAttackMultiplier = Math.max(effects.nextAttackMultiplier, 1 + shieldLayers * perShield);
            }
        }

        if (passive.type === 'plague_on_hit' && trigger === 'deal_damage' && enemyEffects) {
            const chance = Math.max(0, Math.min(1, Number(passive.chance || 0.35)));
            if (Math.random() < chance) {
                enemyEffects.plagueMarks = Math.min(3, Math.max(0, enemyEffects.plagueMarks) + 1);
                emitCombatFeedback('status', enemy.nome + ' riceve un marchio pestilente.', '', enemySide);
            }
        }

        if (passive.type === 'heal_on_enemy_special' && trigger === 'damaged' && payload?.wasSpecial) {
            const healRatio = Math.max(0.01, Number(passive.ratio || 0.10));
            const heal = Math.max(1, Math.round(unit.maxHP * healRatio));
            unit.hp = Math.min(unit.maxHP, unit.hp + heal);
            spawnFloatingText(getSpriteBySide(side), '+' + heal, 'heal');
            emitCombatFeedback('status', unit.nome + ' recupera HP reagendo a un colpo speciale.', '', side);
        }

        if (passive.type === 'combo_scaling' && trigger === 'deal_damage') {
            effects.damageBonus = Math.min(0.6, effects.damageBonus + Math.max(0.01, Number(passive.ratio || 0.1)));
        }
    });
}
function applySpecialEffect(attackerSide, damageDealt) {
    const attacker = getUnitBySide(attackerSide);
    const defenderSide = getOppositeSide(attackerSide);
    const defender = getUnitBySide(defenderSide);
    const atkEffects = getEffects(attackerSide);
    const defEffects = getEffects(defenderSide);
    const profile = getCombatProfile(attacker);
    const special = profile.special || { type: getSkillEffectCode(attacker), scale: 1 };
    if (!attacker || !defender || !atkEffects || !defEffects) { return ''; }

    const handlers = {
        shield: () => { const hits = Math.max(1, Number(special.shieldHits || 1)); atkEffects.shieldHits = Math.max(atkEffects.shieldHits, hits); return attacker.nome + ' attiva una barriera difensiva.'; },
        charm: () => { const turns = Math.max(1, Number(special.turns || 1)); defEffects.charmTurns = Math.max(defEffects.charmTurns, turns); return defender.nome + ' resta ammaliato e salta il prossimo turno.'; },
        bleed: () => { const turns = Math.max(1, Number(special.turns || 2)); const ratio = Math.max(0.08, Number(special.ratio || 0.25)); const v = Math.max(4, Math.round(damageDealt * ratio)); defEffects.bleedTurns = Math.max(defEffects.bleedTurns, turns); defEffects.bleedDamage = Math.max(defEffects.bleedDamage, v); return defender.nome + ' sanguina.'; },
        berserk: () => { const mul = Math.max(1.1, Number(special.nextAttackMultiplier || 1.75)); atkEffects.nextAttackMultiplier = Math.max(atkEffects.nextAttackMultiplier, mul); return attacker.nome + ' entra in berserk.'; },
        plague_mark: () => {
            const maxMarks = Math.max(1, Number(special.maxMarks || 3)); defEffects.plagueMarks = Math.min(maxMarks, defEffects.plagueMarks + 1);
            if (defEffects.plagueMarks >= maxMarks) {
                const burstRatio = Math.max(0.05, Number(special.burstRatio || 0.25)); const burst = Math.max(1, Math.round(defender.maxHP * burstRatio));
                defender.hp = Math.max(0, defender.hp - burst);
                defEffects.plagueMarks = 0;
                spawnFloatingText(getSpriteBySide(defenderSide), '-' + burst, 'damage');
                return defender.nome + ' esplode per il marchio pestilente.';
            }
            return defender.nome + ' riceve un marchio pestilente.';
        },
        sacrifice_buff: () => {
            const hpCost = Math.max(1, Math.round(attacker.hp * Math.max(0.05, Number(special.hpCostRatio || 0.15))));
            attacker.hp = Math.max(1, attacker.hp - hpCost);
            atkEffects.nextAttackMultiplier = Math.max(atkEffects.nextAttackMultiplier, Math.max(1.1, Number(special.nextAttackMultiplier || 2))); 
            return attacker.nome + ' sacrifica HP per potenziarsi.';
        },
        dodge: () => { const charges = Math.max(1, Number(special.charges || 1)); atkEffects.dodgeCharges = Math.max(atkEffects.dodgeCharges, charges); return attacker.nome + ' prepara una schivata.'; },
        burn: () => { const turns = Math.max(1, Number(special.turns || 2)); const ratio = Math.max(0.05, Number(special.ratio || 0.2)); const v = Math.max(3, Math.round(damageDealt * ratio)); defEffects.burnTurns = Math.max(defEffects.burnTurns, turns); defEffects.burnDamage = Math.max(defEffects.burnDamage, v); return defender.nome + ' prende fuoco.'; },
        swap: () => {
            if (attackerSide === 'player') {
                state.rules.switchUsed = false;
                playerAction('switch');
                state.rules.switchUsed = true;
                return attacker.nome + ' forza lo scambio.';
            }
            return attacker.nome + ' cambia postura.';
        },
        reflect_shield: () => { const hits = Math.max(1, Number(special.shieldHits || 1)); const ratio = Math.max(0.1, Math.min(1, Number(special.reflectRatio || 0.9))); atkEffects.shieldHits = Math.max(atkEffects.shieldHits, hits); atkEffects.reflectRatio = ratio; return attacker.nome + ' attiva uno scudo riflettente.'; },
        true_damage: () => { const charges = Math.max(1, Number(special.charges || 1)); atkEffects.trueStrikeCharges = Math.max(atkEffects.trueStrikeCharges, charges); return attacker.nome + ' prepara danno puro.'; },
        cleanse: () => { resetSideEffects(attackerSide); return attacker.nome + ' si purifica da ogni debuff.'; },
        chaos: () => { defEffects.shieldHits = 0; defEffects.reflectRatio = 0; defEffects.nextAttackMultiplier = 1; defEffects.dodgeCharges = 0; return attacker.nome + ' disperde i buff nemici.'; },
        weaken: () => { const turns = Math.max(1, Number(special.turns || 1)); const ratio = Math.min(0.95, Math.max(0.1, Number(special.ratio || 0.75))); defEffects.weakenTurns = Math.max(defEffects.weakenTurns, turns); defEffects.weakenRatio = ratio; return defender.nome + ' è indebolito.'; },
        freeze: () => { const turns = Math.max(1, Number(special.turns || 1)); defEffects.freezeTurns = Math.max(defEffects.freezeTurns, turns); return defender.nome + ' viene congelato.'; },
        energy_drain: () => { const drain = Math.max(10, Number(special.energyDrain || 20)); state[defenderSide + 'Energy'].current = Math.max(0, state[defenderSide + 'Energy'].current - drain); return defender.nome + ' perde energia speciale.'; },
        lifesteal: () => { const ratio = Math.max(0.1, Number(special.healRatio || 0.35)); const heal = Math.max(4, Math.round(damageDealt * ratio)); attacker.hp = Math.min(attacker.maxHP, attacker.hp + heal); spawnFloatingText(getSpriteBySide(attackerSide), '+' + heal, 'heal'); return attacker.nome + ' assorbe ' + heal + ' HP.'; },
        boss_combo: () => { const freezeTurns = Math.max(1, Number(special.freezeTurns || 1)); const bleedTurns = Math.max(1, Number(special.bleedTurns || 2)); const bleedRatio = Math.max(0.1, Number(special.bleedRatio || 0.3)); const minBleed = Math.max(1, Number(special.minBleed || 8)); defEffects.freezeTurns = Math.max(defEffects.freezeTurns, freezeTurns); const bleedValue = Math.max(minBleed, Math.round(damageDealt * bleedRatio)); defEffects.bleedTurns = Math.max(defEffects.bleedTurns, bleedTurns); defEffects.bleedDamage = Math.max(defEffects.bleedDamage, bleedValue); return defender.nome + ' è travolto dal gelo di Cocito.'; },
    };

    const typeKey = special.type || getSkillEffectCode(attacker);
    const defenderProfile = getCombatProfile(defender);
    const defenderRuntime = state.passiveRuntime?.[defenderSide];
    const defenderHasDebuffImmunity = !!(defenderProfile?.passives || []).find((p) => p.type === 'debuff_immunity_once');
    const debuffTypes = new Set(['charm', 'bleed', 'freeze', 'burn', 'weaken', 'plague_mark', 'energy_drain', 'boss_combo']);
    if (defenderHasDebuffImmunity && defenderRuntime && !defenderRuntime.debuffImmunityUsed && debuffTypes.has(typeKey)) {
        defenderRuntime.debuffImmunityUsed = true;
        return defender.nome + ' annulla il debuff grazie alla sua immunità passiva.';
    }
    handlers.invincible = () => { const turns = Math.max(1, Number(special.turns || 1)); atkEffects.invincibleTurns = Math.max(atkEffects.invincibleTurns, turns); return attacker.nome + ' diventa invincibile.'; };
    const handler = handlers[typeKey] || (() => '');
    const result = handler();
    updateBars();
    if (attackerSide === 'player') { syncRosterHP(); }
    return result;
}
function computeDamage(base) {
    const rolled = randomVariance(base);
    const isCrit = Math.random() < state.rules.critChance;
    const damage = isCrit ? Math.max(1, Math.round(rolled * (1 + state.rules.critBonus))) : rolled;
    return { damage, isCrit };
}

function randomVariance(base) {
    const variance = base * 0.12;
    return Math.max(1, Math.round(base + (Math.random() * variance * 2 - variance)));
}

function setActionsDisabled(disabled) {
    dom.battleActions.querySelectorAll('button').forEach((button) => {
        button.disabled = disabled;
    });
    refreshEscapeButtonLabel();
    updateSpecialButtonState();
    updateActionHints();
    renderStatusBadges();
}

function estimateOutgoingDamage(side, useSpecial = false) {
    // Stima rapida del danno per tooltip (valore medio, non un tiro reale).
    const attacker = getUnitBySide(side);
    const defenderSide = getOppositeSide(side);
    if (!attacker) {
        return 0;
    }
    const base = Number(useSpecial ? attacker.attaccoSpeciale : attacker.attacco) || 1;
    let value = applyOutgoingDamageModifiers(side, base, useSpecial);
    // Stima senza modificare lo stato dello scudo.
    const defEffects = getEffects(defenderSide);
    if (defEffects.shieldHits > 0) {
        value = Math.max(1, Math.round(value * 0.62));
    }
    return Math.max(1, Math.round(value));
}

function updateActionHints() {
    // Tooltip contestuali sulle azioni principali del pannello.
    if (!dom.battleActions) {
        return;
    }

    const lang = currentLang();
    const attackBtn = dom.battleActions.querySelector('button[data-action="attacco"]');
    const specialBtn = dom.battleActions.querySelector('button[data-action="speciale"]');
    const switchBtn = dom.battleActions.querySelector('button[data-action="switch"]');
    const itemBtn = dom.battleActions.querySelector('button[data-action="items"]');

    if (attackBtn) {
        const dmg = estimateOutgoingDamage('player', false);
        attackBtn.title = lang === 'en'
            ? `Normal attack. Expected damage: ~${dmg}.`
            : `Attacco normale. Danno previsto: ~${dmg}.`;
    }

    if (specialBtn) {
        const dmg = estimateOutgoingDamage('player', true);
        const ready = canUseSpecial(state.playerEnergy);
        const specialName = String(state.player?.speciale || (lang === 'en' ? 'Special' : 'Speciale'));
        const tip = getEffectDescription(getCombatProfile(state.player)?.special?.type || 'none');
        const readyText = ready
            ? (lang === 'en' ? 'Ready' : 'Pronto')
            : (lang === 'en' ? 'Not ready: full energy required' : 'Non pronto: serve energia piena');
        specialBtn.title = lang === 'en'
            ? `${specialName}. Expected damage: ~${dmg}. ${tip} (${readyText})`
            : `${specialName}. Danno previsto: ~${dmg}. ${tip} (${readyText})`;
    }

    if (switchBtn) {
        switchBtn.title = lang === 'en'
            ? 'Switch active unit (once per battle).'
            : 'Cambia unità attiva (una volta per combattimento).';
    }

    if (itemBtn) {
        itemBtn.title = lang === 'en'
            ? 'Use consumable items from inventory.'
            : 'Usa oggetti consumabili dall’inventario.';
    }
}

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
    });
}

async function loadFrames(folder, total) {
    const frames = [];
    for (let i = 0; i < total; i += 1) {
        const frame = await loadImage(`${folder}frame_${String(i).padStart(3, '0')}.png`);
        if (!frame) {
            break;
        }
        frames.push(frame);
    }
    return frames;
}

function inferPlayerFolder() {
    const specie = (state.player.specie || '').toLowerCase();
    return PLAYER_IDLE_MAP[specie] || PLAYER_IDLE_MAP.leone;
}

function resolvePlayerSpriteProfile() {
    // Per i dannati reclutati (non starter) riusa la mappa sprite dei nemici:
    // in questo modo, dopo uno switch, l'unita mostra le sue animazioni corrette.
    const rawSpecie = String(state.player?.specie || '').toLowerCase();
    const specie = rawSpecie === 'satana' || rawSpecie === 'traditori' ? 'traditore' : rawSpecie;
    return PLAYER_SPRITE_MAP[specie] || ENEMY_SPRITE_MAP[specie] || PLAYER_SPRITE_MAP.leone;
}

async function loadPlayerIdleFrames() {
    const profile = resolvePlayerSpriteProfile();
    state.anim.playerIdle = await loadFrames(profile.idle, STANDARD_SPRITE_FRAMES);
    state.anim.playerAttack = await loadFrames(profile.attack, STANDARD_SPRITE_FRAMES);
    state.anim.playerHurt = await loadFrames(profile.hurt, STANDARD_SPRITE_FRAMES);
    state.anim.playerDeath = await loadFrames(profile.death, STANDARD_SPRITE_FRAMES);
    state.anim.playerFrame = 0;
    state.anim.playerTimer = 0;

    if (state.anim.playerIdle.length > 0) {
        dom.playerSprite.src = state.anim.playerIdle[0].src;
    } else {
        dom.playerSprite.src = state.player.imgPath;
    }
}

function resolveEnemySpriteProfile() {
    const rawSpecie = String(state.enemy?.specie || '').toLowerCase();
    const specie = rawSpecie === 'satana' || rawSpecie === 'traditori' ? 'traditore' : rawSpecie;
    return ENEMY_SPRITE_MAP[specie] || ENEMY_SPRITE_MAP.lussurioso;
}
async function loadAnimationAssets() {
    await loadPlayerIdleFrames();
    const profile = resolveEnemySpriteProfile();
    state.anim.enemyIdle = await loadFrames(profile.idle, STANDARD_SPRITE_FRAMES);
    state.anim.enemyAttack = await loadFrames(profile.attack, STANDARD_SPRITE_FRAMES);
    state.anim.enemyHurt = await loadFrames(profile.hurt, STANDARD_SPRITE_FRAMES);
    state.anim.enemyDeath = await loadFrames(profile.death, STANDARD_SPRITE_FRAMES);

    if (state.anim.enemyIdle.length > 0) {
        dom.enemySprite.src = state.anim.enemyIdle[0].src;
    } else {
        dom.enemySprite.src = state.enemy.imgPath;
    }
}


function updateAnimation(dt) {
    state.anim.playerTimer += dt;
    state.anim.enemyTimer += dt;

    let playerFrames = state.anim.playerIdle;
    if (state.anim.playerPlayingDeath) {
        playerFrames = state.anim.playerDeath;
    } else if (state.anim.playerHurtPlaying && state.anim.playerHurt.length > 0) {
        playerFrames = state.anim.playerHurt;
    } else if (state.playerAttacking && state.anim.playerAttack.length > 0) {
        playerFrames = state.anim.playerAttack;
    }

    const playerFrameMs = state.playerAttacking ? ATTACK_FRAME_MS : BASE_FRAME_MS;
    if (state.anim.playerTimer >= playerFrameMs && playerFrames.length > 0) {
        state.anim.playerTimer = 0;
        if (state.anim.playerPlayingDeath) {
            if (state.anim.playerFrame < playerFrames.length - 1) {
                state.anim.playerFrame += 1;
            }
        } else if (state.anim.playerHurtPlaying) {
            if (state.anim.playerFrame < playerFrames.length - 1) {
                state.anim.playerFrame += 1;
            } else {
                state.anim.playerHurtPlaying = false;
                state.anim.playerFrame = 0;
            }
        } else {
            state.anim.playerFrame = (state.anim.playerFrame + 1) % playerFrames.length;
        }
        dom.playerSprite.src = playerFrames[state.anim.playerFrame].src;
    }

    let enemyFrames = state.anim.enemyIdle;
    if (state.anim.enemyPlayingDeath) {
        enemyFrames = state.anim.enemyDeath;
    } else if (state.anim.enemyHurtPlaying && state.anim.enemyHurt.length > 0) {
        enemyFrames = state.anim.enemyHurt;
    } else if (state.enemyAttacking && state.anim.enemyAttack.length > 0) {
        enemyFrames = state.anim.enemyAttack;
    }

    const enemyFrameMs = state.enemyAttacking ? ATTACK_FRAME_MS : BASE_FRAME_MS;
    if (state.anim.enemyTimer >= enemyFrameMs && enemyFrames.length > 0) {
        state.anim.enemyTimer = 0;
        if (state.anim.enemyPlayingDeath) {
            if (state.anim.enemyFrame < enemyFrames.length - 1) {
                state.anim.enemyFrame += 1;
            }
        } else if (state.anim.enemyHurtPlaying) {
            if (state.anim.enemyFrame < enemyFrames.length - 1) {
                state.anim.enemyFrame += 1;
            } else {
                state.anim.enemyHurtPlaying = false;
                state.anim.enemyFrame = 0;
            }
        } else {
            state.anim.enemyFrame = (state.anim.enemyFrame + 1) % enemyFrames.length;
        }
        dom.enemySprite.src = enemyFrames[state.anim.enemyFrame].src;
    }
}
function playHitEffect(element) {
    const now = performance.now();
    const hitLockMs = Math.max(220, getHurtAnimDurationMs(element === dom.playerSprite ? 'player' : 'enemy') - 40);
    const isEnemy = element === dom.enemySprite;
    const isPlayer = element === dom.playerSprite;

    // Evita trigger multipli sovrapposti della stessa animazione di hurt.
    if (isEnemy && state.anim.enemyHurtPlaying) {
        return;
    }
    if (isEnemy && now - (state.anim.enemyLastHitAt || 0) < hitLockMs) {
        return;
    }
    if (isPlayer && state.anim.playerHurtPlaying) {
        return;
    }
    if (isPlayer && now - (state.anim.playerLastHitAt || 0) < hitLockMs) {
        return;
    }

    element.classList.remove('hit');
    void element.offsetWidth;
    element.classList.add('hit');

    if (isEnemy && state.anim.enemyHurt.length > 0 && !state.anim.enemyPlayingDeath) {
        state.anim.enemyLastHitAt = now;
        state.anim.enemyHurtPlaying = true;
        state.anim.enemyFrame = 0;
        dom.enemySprite.src = state.anim.enemyHurt[0].src;
    }

    if (isPlayer && state.anim.playerHurt.length > 0 && !state.anim.playerPlayingDeath) {
        state.anim.playerLastHitAt = now;
        state.anim.playerHurtPlaying = true;
        state.anim.playerFrame = 0;
        dom.playerSprite.src = state.anim.playerHurt[0].src;
    }

    setTimeout(() => {
        element.classList.remove('hit');
    }, 420);
}

function playDeathEffect(element) {
    // Priorita alle frame di morte: evita il fade CSS immediato che copre l'animazione.
    if (element === dom.enemySprite) {
        state.anim.enemyPlayingDeath = true;
        state.anim.enemyHurtPlaying = false;
        state.enemyAttacking = false;
        state.anim.enemyFrame = 0;
        if (state.anim.enemyDeath.length > 0) {
            dom.enemySprite.src = state.anim.enemyDeath[0].src;
            return;
        }
    }
    if (element === dom.playerSprite) {
        state.anim.playerPlayingDeath = true;
        state.anim.playerHurtPlaying = false;
        state.playerAttacking = false;
        state.anim.playerFrame = 0;
        if (state.anim.playerDeath.length > 0) {
            dom.playerSprite.src = state.anim.playerDeath[0].src;
            return;
        }
    }

    // Fallback solo se mancano le frame di morte.
    element.classList.remove('dead');
    void element.offsetWidth;
    element.classList.add('dead');
}
function resetVisualState() {
    state.anim.playerPlayingDeath = false;
    state.anim.enemyPlayingDeath = false;
    state.anim.enemyDead = false;
    state.anim.playerHurtPlaying = false;
    state.anim.enemyHurtPlaying = false;
    dom.enemySprite.classList.remove('dead', 'hit');
    dom.playerSprite.classList.remove('dead', 'hit', 'victory');
}
function playVictoryEffect(element) {
    element.classList.remove('victory');
    void element.offsetWidth;
    element.classList.add('victory');
    setTimeout(() => {
        element.classList.remove('victory');
    }, 1600);
}


function getEffectDescription(type) {
    const lang = currentLang();
    const fromJson = EFFECT_META?.[type]?.[lang] || EFFECT_META?.[type]?.it || '';
    if (fromJson) {
        return fromJson;
    }

    const mapIt = {
        shield: 'Riduce il danno subito del prossimo colpo.',
        charm: 'Il bersaglio salta il prossimo turno.',
        bleed: 'Danno periodico a inizio turno.',
        freeze: 'Blocca completamente il turno.',
        burn: 'Bruciatura con danno periodico.',
        weaken: 'Riduce il danno inflitto dal bersaglio.',
        reflect_shield: 'Attiva scudo e riflette parte del danno ricevuto.',
        true_damage: 'Il prossimo colpo ignora lo scudo.',
        plague_mark: 'Accumula marchi e poi esplode in danno bonus.',
        energy_drain: 'Ruba energia speciale al bersaglio.',
        lifesteal: 'Recupera HP in base al danno inflitto.',
        
        sacrifice_buff: 'Consuma HP per aumentare il prossimo colpo.',
        chaos: 'Rimuove potenziamenti difensivi avversari.',
        boss_combo: 'Applica controllo e danno periodico combinato.'
    };
    const mapEn = {
        shield: 'Reduces incoming damage from the next hit.',
        charm: 'Target skips the next turn.',
        bleed: 'Periodic damage at turn start.',
        freeze: 'Fully blocks the next turn.',
        burn: 'Burning periodic damage.',
        weaken: 'Reduces target outgoing damage.',
        reflect_shield: 'Grants shield and reflects part of damage.',
        true_damage: 'Next strike ignores shield.',
        plague_mark: 'Stacks marks and bursts for bonus damage.',
        energy_drain: 'Drains special energy from target.',
        lifesteal: 'Heals based on dealt damage.',
        
        sacrifice_buff: 'Consumes HP to boost next hit.',
        chaos: 'Removes enemy defensive buffs.',
        boss_combo: 'Applies control + periodic damage combo.'
    };
    return (lang === 'en' ? mapEn : mapIt)[type] || (lang === 'en' ? 'No extra effect.' : 'Nessun effetto aggiuntivo.');
}
function describeActiveEffects(unit) {
    const side = unit === state.player ? 'player' : unit === state.enemy ? 'enemy' : null;
    if (!side) {
        return currentLang() === 'en' ? 'No active status.' : 'Nessuno stato attivo.';
    }

    const effects = getEffects(side);
    const parts = [];
    if (effects.shieldHits > 0) { parts.push(effectBadgeLabel('shield', effects.shieldHits)); }
    if (effects.charmTurns > 0) { parts.push(effectBadgeLabel('charm', effects.charmTurns)); }
    if (effects.freezeTurns > 0) { parts.push(effectBadgeLabel('freeze', effects.freezeTurns)); }
    if (effects.bleedTurns > 0) { parts.push(effectBadgeLabel('bleed', effects.bleedTurns)); }
    if (effects.burnTurns > 0) { parts.push(effectBadgeLabel('burn', effects.burnTurns)); }
    if (effects.weakenTurns > 0) { parts.push(effectBadgeLabel('weaken', effects.weakenTurns)); }
    if (effects.dodgeCharges > 0) { parts.push(effectBadgeLabel('dodge', effects.dodgeCharges)); }
    if (effects.plagueMarks > 0) { parts.push(effectBadgeLabel('plague', effects.plagueMarks)); }
    if (effects.invincibleTurns > 0) { parts.push(effectBadgeLabel('invincible', effects.invincibleTurns)); }
    if (effects.reflectRatio > 0) { parts.push(effectBadgeLabel('reflect', 1)); }
    if (effects.damageBonus > 0) { parts.push(effectBadgeLabel('damage_bonus', effects.damageBonus)); }
    return parts.length > 0 ? parts.join(', ') : (currentLang() === 'en' ? 'No active status.' : 'Nessuno stato attivo.');
}
function buildUnitTooltip(unit) {
    return getLoreTextBySpecies(unit.specie);
}

function getLoreTextBySpecies(specie) {
    const key = String(specie || '').toLowerCase();
    const lang = currentLang();
    const remote = CIRCLE_LORE?.[lang]?.[key];
    if (typeof remote === 'string' && remote.trim().length > 0) {
        return remote;
    }

        const it = {
        limbo: 'Cerchio 1 - Non battezzati virtuosi (Achille)\n\nAnime nobili e valorose, ma prive della fede cristiana. Non soffrono tormenti fisici, ma vivono in un\'eternità di desiderio senza speranza. La loro grandezza è offuscata da un destino incompiuto.',
        lussurioso: 'Cerchio 2 - Lussuriosi (Paolo Malatesta e Francesca da Rimini)\n\nTravolti da una bufera incessante, simbolo delle passioni che li dominarono in vita. Il loro amore è eterno, ma condannato a non trovare pace. Desiderio e tormento diventano la stessa cosa.',
        goloso: 'Cerchio 3 - Golosi (Ciacco)\n\nImmersi nel fango sotto una pioggia sporca e gelida. In vita cercarono solo il piacere materiale, ora sono ridotti a esistenze degradate. La loro voce è pesante, come il loro peccato.',
        avaro: 'Cerchio 4 - Avari (Ecclesiastici anonimi)\n\nAccumularono ricchezze senza misura, perdendo se stessi nel possesso. Ora spingono pesi enormi in un moto inutile e senza fine. Il loro volto è irriconoscibile, cancellato dall\'avidità.',
        prodigo: 'Cerchio 4 - Prodighi (Gli Sperperatori Eterni)\n\nSprecarono tutto ciò che avevano senza valore né misura. Condannati a uno sforzo eterno, opposto ma ugualmente inutile agli avari. Nel vuoto delle loro azioni, hanno perso ogni identità.',
        iracondo: 'Cerchio 5 - Iracondi (Filippo Argenti)\n\nConsumati dalla rabbia, si colpiscono senza tregua nella palude dello Stige. La furia che li dominava in vita non si è mai spenta. Sono prigionieri della loro stessa violenza.',
        accidioso: 'Cerchio 5 - Accidiosi (I Sommersi dello Stige)\n\nImmersi nel fango, incapaci di reagire o parlare chiaramente. In vita furono passivi e spenti, ora esistono in un silenzio soffocante. La loro pena è un\'eternità senza volontà.',
        eretico: 'Cerchio 6 - Eretici (Farinata degli Uberti)\n\nRinchiusi in tombe infuocate, puniti per aver negato verità eterne. Mantengono però la loro fierezza e identità. La loro mente arde, come le idee che difesero.',
        violenza_altri: 'Cerchio 7 - Violenti contro il prossimo (Attila)\n\nImmersi in un fiume di sangue bollente, simbolo della violenza inflitta agli altri. Più grave il crimine, più profonda la condanna. La loro brutalità è diventata la loro prigione.',
        violenza_se: 'Cerchio 7 - Violenti contro se stessi (Pier della Vigna)\n\nTrasformati in alberi contorti, privati del proprio corpo. Solo attraverso il dolore possono parlare. La loro disperazione ha messo radici eterne.',
        violenza_dio: 'Cerchio 7 - Violenti contro Dio/natura (Brunetto Latini)\n\nCamminano sotto una pioggia di fuoco su un deserto sterile. Sfidarono l\'ordine naturale e divino, e ora vivono in un mondo senza vita. La loro colpa è eterna sterilità.',
        fraudolento: 'Cerchio 8 - Fraudolenti (I Millevolti)\n\nColoro che usarono l\'inganno contro chi si fidava di loro. Sono divisi in dieci bolge e puniti secondo il tipo di frode commessa, riflettendo la corruzione dell\'intelligenza umana.',
        traditore: 'Cerchio 9 - Traditori (Lucifero)\n\nImmerso nel ghiaccio, domina il regno del tradimento. Le sue ali gelano tutto ciò che lo circonda. È il simbolo ultimo della fiducia spezzata e della caduta definitiva.',
        leone: 'Bestia alleata - Leone\n\nCompagno feroce e stabile, specializzato nel controllo del ritmo di battaglia e nella pressione costante.',
        lonza: 'Bestia alleata - Lonza\n\nCombattente rapido e opportunista, punta a colpi improvvisi e ad aperture tattiche.',
        lupa: 'Bestia alleata - Lupa\n\nPredatrice resistente e aggressiva, adatta a duelli lunghi con pressione continua.'
    };
    const en = {
        limbo: 'Circle 1 - Noble Unbaptized (Achilles)\n\nNoble and valiant souls, yet without Christian faith. They suffer no physical torture, but live in eternal longing without hope. Their greatness is dimmed by an unfinished destiny.',
        lussurioso: 'Circle 2 - Lustful (Paolo Malatesta and Francesca da Rimini)\n\nSwept by an endless storm, symbol of passions that ruled them in life. Their love is eternal, yet condemned to never find peace. Desire and torment become one.',
        goloso: 'Circle 3 - Gluttons (Ciacco)\n\nSubmerged in mud beneath filthy freezing rain. In life they sought only material pleasure, now reduced to degraded existence. Their voice is heavy like their sin.',
        avaro: 'Circle 4 - Avaricious (Anonymous Clerics)\n\nThey hoarded wealth without measure, losing themselves in possession. Now they push enormous weights in a useless endless motion. Their faces are erased by greed.',
        prodigo: 'Circle 4 - Prodigal (The Eternal Wasters)\n\nThey wasted everything without value or measure. Condemned to eternal effort, opposite yet equally pointless to the avaricious. In the void of their actions, identity is lost.',
        iracondo: 'Circle 5 - Wrathful (Filippo Argenti)\n\nConsumed by rage, they strike each other without pause in the Styx marsh. The fury that ruled their lives never faded. They are prisoners of their own violence.',
        accidioso: 'Circle 5 - Sullen (The Submerged of Styx)\n\nBuried in sludge, unable to react or speak clearly. In life they were passive and dim; now they exist in suffocating silence. Their punishment is eternity without will.',
        eretico: 'Circle 6 - Heretics (Farinata degli Uberti)\n\nLocked in burning tombs, punished for denying eternal truths. Yet they keep their pride and identity. Their minds burn like the ideas they defended.',
        violenza_altri: 'Circle 7 - Violent against others (Attila)\n\nImmersed in a river of boiling blood, symbol of violence inflicted on others. The graver the crime, the deeper the condemnation. Brutality became their prison.',
        violenza_se: 'Circle 7 - Violent against self (Pier della Vigna)\n\nTransformed into twisted trees, deprived of their bodies. Only through pain can they speak. Their despair has taken eternal root.',
        violenza_dio: 'Circle 7 - Violent against God/Nature (Brunetto Latini)\n\nThey walk under rain of fire on a sterile desert. They defied divine and natural order, and now live in a lifeless world. Their guilt is eternal sterility.',
        fraudolento: 'Circle 8 - Fraudulent (The Thousand-Faced)\n\nThose who used deception against trust. They are divided into ten bolge and punished by the specific fraud committed, reflecting the corruption of human intellect.',
        traditore: 'Circle 9 - Traitors (Lucifer)\n\nImmersed in ice, he rules the realm of betrayal. His wings freeze all around him. He is the ultimate symbol of broken trust and final downfall.',
        leone: 'Ally Beast - Lion\n\nA fierce and steady companion focused on controlling tempo and applying constant pressure.',
        lonza: 'Ally Beast - Leopard\n\nA fast and opportunistic fighter, built around sudden strikes and tactical openings.',
        lupa: 'Ally Beast - Wolf\n\nA resilient and aggressive predator suited for long duels and relentless pressure.'
    };
    const map = currentLang() === 'en' ? en : it;
    return map[key] || (currentLang() === 'en' ? 'No lore available for this unit.' : 'Nessuna descrizione disponibile per questa unità.');
}
// Apre popup con i dettagli della singola unita selezionata.
function openUnitModal(title, imagePath, bodyText) {
    dom.unitModalTitle.textContent = title || '';
    dom.unitModalTitle.style.display = title ? '' : 'none';
    dom.unitModalImage.src = imagePath || '';
    dom.unitModalImage.style.display = imagePath ? '' : 'none';
    dom.unitModalBody.textContent = bodyText;
    dom.unitModal.classList.remove('hidden');
}

function closeUnitModal() {
    dom.unitModal.classList.add('hidden');
    dom.unitModalTitle.style.display = '';
    dom.unitModalImage.style.display = '';
}

function getRosterUnitPreviewImage(unit) {
    // Anteprima coerente con il bestiario: prima frame idle della specie.
    const specie = String(unit?.specie || '').toLowerCase();
    const profile = PLAYER_SPRITE_MAP[specie] || ENEMY_SPRITE_MAP[specie] || null;
    if (profile?.idle) {
        return `${profile.idle}frame_000.png`;
    }
    return unit?.imgPath || state.player?.imgPath || 'assets/img/bestie/leone_idle_frames/frame_000.png';
}

function buildRosterUnitDetails(unit, index, total) {
    // Testo esteso in stile scheda unita.
    const safe = normalizeUnit(unit, DEFAULT_PLAYER);
    const energy = buildEnergyModel(safe);
    return {
        title: `${safe.nome} (${index + 1}/${total})`,
        image: getRosterUnitPreviewImage(safe),
        body: [
            `${tC('combat_tooltip_name', 'Nome')}: ${safe.nome}`,
            `${tC('combat_tooltip_species', 'Specie')}: ${safe.specie}`,
            `${tC('combat_tooltip_hp', 'HP')}: ${Math.round(safe.hp)} / ${safe.maxHP}`,
            `${tC('combat_tooltip_attack', 'Attacco')}: ${safe.attacco}`,
            `${tC('combat_tooltip_special', 'Speciale')}: ${safe.speciale} (${safe.attaccoSpeciale})`,
            `${tC('combat_tooltip_energy', 'Energia Speciale')}: ${energy.hitsNeeded} attacchi normali per caricare`,
            `${tC('combat_tooltip_desc', 'Descrizione')}: ${safe.descrizione}`
        ].join('\n')
    };
}

function openRosterModal() {
    // Viewer paginato della squadra, simile al bestiario.
    if (!Array.isArray(state.roster) || state.roster.length === 0) {
        return;
    }

    let pageIndex = 0;
    const total = state.roster.length;

    const renderPage = () => {
        const current = buildRosterUnitDetails(state.roster[pageIndex], pageIndex, total);
        openUnitModal(
            `${tC('combat_roster_modal_title', 'Squadra Dannati')} - ${current.title}`,
            current.image,
            current.body
        );
    };

    renderPage();

    const nav = document.createElement('div');
    nav.className = 'actions';
    nav.style.marginTop = '12px';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.textContent = '<';

    const indicator = document.createElement('span');
    indicator.style.alignSelf = 'center';
    indicator.style.padding = '8px 10px';
    indicator.style.opacity = '.95';

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.textContent = '>';

    const refreshIndicator = () => {
        indicator.textContent = `${pageIndex + 1} / ${total}`;
    };

    const onPrev = () => {
        pageIndex = (pageIndex - 1 + total) % total;
        const current = buildRosterUnitDetails(state.roster[pageIndex], pageIndex, total);
        dom.unitModalTitle.textContent = `${tC('combat_roster_modal_title', 'Squadra Dannati')} - ${current.title}`;
        dom.unitModalImage.src = current.image;
        dom.unitModalBody.textContent = current.body;
        refreshIndicator();
    };

    const onNext = () => {
        pageIndex = (pageIndex + 1) % total;
        const current = buildRosterUnitDetails(state.roster[pageIndex], pageIndex, total);
        dom.unitModalTitle.textContent = `${tC('combat_roster_modal_title', 'Squadra Dannati')} - ${current.title}`;
        dom.unitModalImage.src = current.image;
        dom.unitModalBody.textContent = current.body;
        refreshIndicator();
    };

    prevBtn.addEventListener('click', onPrev);
    nextBtn.addEventListener('click', onNext);
    refreshIndicator();

    nav.appendChild(prevBtn);
    nav.appendChild(indicator);
    nav.appendChild(nextBtn);
    dom.unitModalBody.parentElement.appendChild(nav);

    const cleanup = () => {
        prevBtn.removeEventListener('click', onPrev);
        nextBtn.removeEventListener('click', onNext);
        dom.unitModalClose.removeEventListener('click', cleanup);
        dom.unitModal.removeEventListener('click', onBackdrop);
        if (nav.parentElement) {
            nav.parentElement.removeChild(nav);
        }
    };

    const onBackdrop = (event) => {
        if (event.target === dom.unitModal) {
            cleanup();
        }
    };

    dom.unitModalClose.addEventListener('click', cleanup);
    dom.unitModal.addEventListener('click', onBackdrop);
}

function tryBossPhaseTransition() {
    if (!isFinalBossEncounter() || state.bossPhase.transitioned) {
        return;
    }

    const hpRatio = state.enemy.hp / Math.max(1, state.enemy.maxHP);
    if (hpRatio > 0.5) {
        return;
    }

    const profile = getCombatProfile(state.enemy);
    const bossCfg = profile?.boss || {};
    const maxHpMul = Math.max(1, Number(bossCfg.phase2MaxHpMultiplier || 1.4));
    const hpBoostRatio = Math.max(0, Number(bossCfg.phase2HpBoostRatio || 0.25));
    const atkMul = Math.max(1, Number(bossCfg.phase2AtkMultiplier || 1.5));
    const freezeTurns = Math.max(1, Number(bossCfg.phase2FreezeTurns || 1));

    state.bossPhase.phase = 2;
    state.bossPhase.transitioned = true;
    state.enemy.maxHP = Math.max(state.enemy.maxHP, Math.round(state.enemy.maxHP * maxHpMul));
    state.enemy.hp = Math.min(state.enemy.maxHP, state.enemy.hp + Math.round(state.enemy.maxHP * hpBoostRatio));
    state.enemy.attacco = Math.round(state.enemy.attacco * atkMul);
    state.enemy.attaccoSpeciale = Math.round(state.enemy.attaccoSpeciale * atkMul);
    getEffects('enemy').freezeTurns = freezeTurns;

    if (bossCfg.phase2SpecialType) {
        profile.special = { ...(profile.special || {}), type: String(bossCfg.phase2SpecialType) };
    }

    emitCombatFeedback('action', currentLang() === 'en' ? 'Boss phase 2 activated!' : 'Boss fase 2 attivata!');
    spawnFloatingText(dom.enemySprite, 'PHASE 2', 'control');
    updateBars();
}
function randomEndDelayMs() {
    // Ritardo naturale per far respirare l'esito dopo le animazioni di morte.
    return 500 + Math.floor(Math.random() * 501);
}

function getAttackAnimDurationMs(side) {
    const frames = side === 'player' ? state.anim.playerAttack : state.anim.enemyAttack;
    const frameMs = ATTACK_FRAME_MS;
    const count = Math.max(1, frames.length || 1);
    return count * frameMs;
}

function getDeathAnimDurationMs(side) {
    const frames = side === 'player' ? state.anim.playerDeath : state.anim.enemyDeath;
    const frameMs = 200;
    const count = Math.max(1, frames.length || 1);
    return Math.max(700, count * frameMs);
}
function getHurtAnimDurationMs(side) {
    const frames = side === 'player' ? state.anim.playerHurt : state.anim.enemyHurt;
    const frameMs = 200;
    const count = Math.max(1, frames.length || 1);
    return count * frameMs;
}

function showTurnOverlay(actor) {
    // Popup turno: blocca le azioni per 1.5s prima di eseguire qualsiasi mossa.
    return new Promise((resolve) => {
        if (!dom.turnOverlay || !dom.turnOverlayText) {
            setTimeout(resolve, TURN_OVERLAY_MS);
            return;
        }

        const text = actor === 'enemy'
            ? (currentLang() === 'en' ? 'Enemy Turn' : 'Turno Nemico')
            : (currentLang() === 'en' ? 'Player Turn' : 'Turno Giocatore');

        dom.turnOverlayText.textContent = text;
        dom.turnOverlay.classList.remove('hidden');
        setTimeout(() => {
            dom.turnOverlay.classList.add('hidden');
            resolve();
        }, TURN_OVERLAY_MS);
    });
}

async function enterPlayerTurn(autoAction) {
    // Ingresso turno giocatore: popup e poi azione/attesa comando.
    if (state.ended || state.selectingReserve) {
        return;
    }

    state.busy = true;
    setActionsDisabled(true);
    setTurnHud('player', currentLang() === 'en' ? 'player turn' : 'turno giocatore');
    await showTurnOverlay('player');

    if (state.ended || state.selectingReserve) {
        return;
    }

    if (autoAction) {
        state.busy = false;
        setActionsDisabled(false);
        playerAction('attacco');
        return;
    }

    state.busy = false;
    setActionsDisabled(false);
    setTurnHud('player', currentLang() === 'en' ? 'awaiting command' : 'attesa comando');
}

async function enemyTurn() {
    state.enemyAttacking = false;
    setTurnHud('enemy', currentLang() === 'en' ? 'enemy action' : 'azione nemico');
    if (state.ended) {
        return;
    }

    state.busy = true;
    setActionsDisabled(true);
    await showTurnOverlay('enemy');
    if (state.ended) {
        return;
    }
    // Effetti di inizio turno nemico.
    setTurnStep('bleed');
    triggerPassives('enemy', 'turn_start');
    if (applyStartTurnStatusDamage('enemy')) {
        playDeathEffect(dom.enemySprite);
        setTimeout(() => {
            finishBattle(true);
        }, getDeathAnimDurationMs('enemy') + randomEndDelayMs());
        return;
    }

    setTurnStep('action');
    if (trySkipTurnForControl('enemy')) {
        state.enemyAttacking = false;
        state.turn.number += 1;
        setTurnHud('player', currentLang() === 'en' ? 'bonus action' : 'azione bonus');
        setTimeout(() => {
            enterPlayerTurn(false);
        }, 120);
        return;
    }

    setTurnStep('action');
    state.enemyAttacking = true;
    state.anim.enemyFrame = 0;

    const useSpecial = canUseSpecial(state.enemyEnergy) && Math.random() < 0.42;
    triggerPassives('enemy', 'before_attack');
    const base = useSpecial ? state.enemy.attaccoSpeciale : state.enemy.attacco;
    const damageRollEnemy = computeDamage(base);
    let damage = damageRollEnemy.damage;

    if (useSpecial) {
        consumeEnergy(state.enemyEnergy);
    } else {
        gainEnergy(state.enemyEnergy);
    }

    damage = applyOutgoingDamageModifiers('enemy', damage, useSpecial, true);
    const ignoreShield = getEffects('enemy').trueStrikeCharges > 0;
    if (ignoreShield) {
        getEffects('enemy').trueStrikeCharges -= 1;
    }
    damage = resolveIncomingDamage('player', 'enemy', damage, ignoreShield);

    const attackDuration = getAttackAnimDurationMs('enemy');
    setTimeout(() => {
        // Il colpo viene registrato 0.2s dopo la fine dell'animazione d'attacco.
        setTimeout(() => {
            try {
                playHitEffect(dom.playerSprite);
                state.battleStats.enemyDamageDone += damage;
                emitCombatFeedback('hit', currentLang() === 'en' ? (state.enemy.nome + ' hits for ' + damage + (damageRollEnemy.isCrit ? ' !CRIT!' : '')) : (state.enemy.nome + ' colpisce: ' + damage + (damageRollEnemy.isCrit ? ' !CRITICO!' : '')), currentLang() === 'en' ? 'Player hit' : 'Giocatore colpito');
                state.player.hp = Math.max(0, state.player.hp - damage);
                triggerPassives('player', 'damaged', { damage, attackerSide: 'enemy', wasSpecial: useSpecial });
                triggerPassives('enemy', 'deal_damage', { damage, defenderSide: 'player' });
                if (damage > 0) { spawnFloatingText(dom.playerSprite, '-' + damage, damageRollEnemy.isCrit ? 'crit' : 'damage'); }
                triggerPassives('player', 'hp_changed');

                let detail = '';
                if (useSpecial) {
                    detail = applySpecialEffect('enemy', damage);
                }

                updateBars();

                const actionName = useSpecial ? state.enemy.speciale : tC('combat_action_attack', 'Attacco');
                const suffix = detail ? (' ' + detail) : '';
                emitCombatFeedback('action', tC('combat_log_enemy_attack', '{NAME} usa {ACTION}. Danno inflitto: {DAMAGE}.', {
                    NAME: state.enemy.nome,
                    ACTION: actionName,
                    DAMAGE: damage
                }) + suffix);

                syncRosterHP();
                setTurnStep('check-ko');
                if (state.player.hp <= 0) {
                    if (tryConsumePlayerReviveTotem()) {
                        return;
                    }
                    emitCombatFeedback('death', currentLang() === 'en' ? (state.player.nome + ' is defeated') : (state.player.nome + ' è sconfitto'));
                    playDeathEffect(dom.playerSprite);
                    setTimeout(() => {
                        handlePlayerDefeat();
                    }, getDeathAnimDurationMs('player') + randomEndDelayMs());
                } else {
                    const waitAfterPlayerHurt = getHurtAnimDurationMs('player') + 80;
                    setTimeout(() => {
                        enterPlayerTurn(false);
                    }, waitAfterPlayerHurt);
                }
            } catch (error) {
                console.error('Errore turno nemico:', error);
                if (!state.ended) {
                    const waitAfterPlayerHurt = getHurtAnimDurationMs('player') + 80;
                    setTimeout(() => {
                        enterPlayerTurn(false);
                    }, waitAfterPlayerHurt);
                }
            } finally {
                state.enemyAttacking = false;
            }
        }, 200);
    }, attackDuration);
}
function playerAction(action) {
    setTurnHud('player', currentLang() === 'en' ? 'player action' : 'azione giocatore');
    if (state.busy || state.ended) {
        return;
    }

    
    if (action === 'descrizione') {
        openRosterModal();
        return;
    }

    if (action === 'switch') {
        if (state.rules.switchUsed) {
            emitCombatFeedback('action', currentLang() === 'en' ? 'Switch already used in this battle.' : 'Switch già usato in questo combattimento.');
            return;
        }

        renderReserveSelection('switch');
        return;
    }

    // Effetti di inizio turno giocatore.
    setTurnStep('bleed');
    triggerPassives('player', 'turn_start');
    if (applyStartTurnStatusDamage('player')) {
        if (tryConsumePlayerReviveTotem()) {
            return;
        }
        playDeathEffect(dom.playerSprite);
        setTimeout(() => {
            handlePlayerDefeat();
        }, getDeathAnimDurationMs('player') + randomEndDelayMs());
        return;
    }

    setTurnStep('action');
    if (trySkipTurnForControl('player')) {
        state.playerAttacking = false;
        state.enemyAttacking = false;
        state.turn.number += 1;
        state.busy = true;
        setActionsDisabled(true);
        setTimeout(enemyTurn, 900);
        return;
    }

    const useSpecial = action === 'speciale';
    if (useSpecial && !canUseSpecial(state.playerEnergy)) {
        emitCombatFeedback('action', tC('combat_log_special_not_ready', 'Energia insufficiente: continua con attacchi normali.'), tC('combat_toast_special_not_ready', 'Speciale non ancora carico'), 'player');
        updateSpecialButtonState();
        return;
    }

    state.busy = true;
    setActionsDisabled(true);
    dom.rosterPanel.classList.add('hidden');

    if (useSpecial) {
        consumeEnergy(state.playerEnergy);
    } else {
        gainEnergy(state.playerEnergy);
    }

    setTurnStep('action');
    state.playerAttacking = true;
    state.anim.playerFrame = 0;

    triggerPassives('player', 'before_attack');
    const base = useSpecial ? state.player.attaccoSpeciale : state.player.attacco;
    const damageRollPlayer = computeDamage(base);
    let damage = damageRollPlayer.damage;
    damage = applyOutgoingDamageModifiers('player', damage, useSpecial, true);
    const ignoreShield = getEffects('player').trueStrikeCharges > 0;
    if (ignoreShield) {
        getEffects('player').trueStrikeCharges -= 1;
    }
    damage = resolveIncomingDamage('enemy', 'player', damage, ignoreShield);

    const attackDuration = getAttackAnimDurationMs('player');
    setTimeout(() => {
        // Il colpo viene registrato 0.2s dopo la fine dell'animazione d'attacco.
        setTimeout(() => {
            playHitEffect(dom.enemySprite);
            state.battleStats.playerDamageDone += damage;
            emitCombatFeedback('hit', currentLang() === 'en' ? `${state.player.nome} hits for ${damage}${damageRollPlayer.isCrit ? ' !CRIT!' : ''}` : `${state.player.nome} colpisce: ${damage}${damageRollPlayer.isCrit ? ' !CRITICO!' : ''}`, currentLang() === 'en' ? 'Enemy hit' : 'Nemico colpito');
            state.enemy.hp = Math.max(0, state.enemy.hp - damage);
            triggerPassives('enemy', 'damaged', { damage, attackerSide: 'player', wasSpecial: useSpecial });
            triggerPassives('player', 'deal_damage', { damage, defenderSide: 'enemy' });
            if (damage > 0) { spawnFloatingText(dom.enemySprite, '-' + damage, damageRollPlayer.isCrit ? 'crit' : 'damage'); }
            tryBossPhaseTransition();
            triggerPassives('enemy', 'hp_changed');

            let detail = '';
            if (useSpecial) {
                detail = applySpecialEffect('player', damage);
            }

            updateBars();

            const actionName = useSpecial ? state.player.speciale : tC('combat_action_attack', 'Attacco');
            const suffix = detail ? ` ${detail}` : '';
            emitCombatFeedback('action', tC('combat_log_player_attack', '{NAME} usa {ACTION}. Danno inflitto: {DAMAGE}.', {
                NAME: state.player.nome,
                ACTION: actionName,
                DAMAGE: damage
            }) + suffix);

            state.playerAttacking = false;

            setTurnStep('check-ko');
            if (state.enemy.hp <= 0) {
                emitCombatFeedback('death', currentLang() === 'en' ? `${state.enemy.nome} is defeated` : `${state.enemy.nome} è sconfitto`);
                playDeathEffect(dom.enemySprite);
                setTimeout(() => {
                    finishBattle(true);
                }, getDeathAnimDurationMs('enemy') + randomEndDelayMs());
                return;
            }

            const waitAfterHurt = getHurtAnimDurationMs('enemy') + 1000;
            state.turn.number += 1;
            setTimeout(enemyTurn, waitAfterHurt);
        }, 200);
    }, attackDuration);
}
function addEnemyToRoster() {
    const recruit = { ...state.enemy, hp: state.enemy.maxHP };

    if (state.roster.length < MAX_ROSTER_SIZE) {
        state.roster.push(recruit);
        saveRoster();
        emitCombatFeedback('victory', tC('combat_log_recruit_add', '{NAME} è stato aggiunto alla squadra.', { NAME: recruit.nome }), tC('combat_toast_recruit_add', '{NAME} aggiunto alla squadra', { NAME: recruit.nome }), 'player');
        return;
    }

    const replacePrompt = currentLang() === 'en'
        ? 'Roster is full (4). Replace the weakest unit with the new dannato?'
        : 'La squadra è piena (4). Vuoi sostituire l\'unità più debole con il nuovo dannato?';

    if (!window.confirm(replacePrompt)) {
        emitCombatFeedback('victory', currentLang() === 'en' ? 'Recruit cancelled.' : 'Reclutamento annullato.');
        return;
    }

    const weakestIndex = state.roster.reduce((idx, unit, i, arr) => (unit.maxHP < arr[idx].maxHP ? i : idx), 0);
    state.roster[weakestIndex] = recruit;
    saveRoster();

    emitCombatFeedback('victory', tC('combat_log_recruit_replace', 'Squadra piena: {NAME} sostituisce lo slot {SLOT}.', {
        NAME: recruit.nome,
        SLOT: weakestIndex + 1
    }), tC('combat_toast_recruit_replace', '{NAME} sostituisce slot {SLOT}', {
        NAME: recruit.nome,
        SLOT: weakestIndex + 1
    }), 'player');
}

function showRecruitPanel() {
    dom.battleActions.classList.add('hidden');
    dom.recruitActions.classList.remove('hidden');
}

function showEndPanel() {
    dom.recruitActions.classList.add('hidden');
    dom.endActions.classList.remove('hidden');
}

function triggerGameOver() {
    // Fine partita: nessun dannato disponibile per continuare.
    state.ended = true;
    state.busy = true;
    state.selectingReserve = false;
    dom.battleActions.classList.add('hidden');
    dom.recruitActions.classList.add('hidden');
    dom.endActions.classList.add('hidden');
    dom.reserveModal.classList.add('hidden');
    dom.gameoverOverlay.classList.remove('hidden');
    emitCombatFeedback('death', tC('combat_toast_all_ko', 'Tutti i dannati sono KO'), '', 'player');

    setTimeout(() => {
        const core = getCoreRuntime();
        if (core?.nav?.goWithLoading) {
            core.nav.goWithLoading('index.html', { profile: 'generic', from: 'combat.html' });
        } else {
            window.location.href = 'index.html';
        }
    }, 2100);
}

function renderReserveSelection(mode = 'defeat') {
    // Modal unica: usata sia per KO sia per cambio volontario.
    const reserveIndexes = getAliveReserveIndexes();
    dom.reserveList.innerHTML = '';

    if (reserveIndexes.length === 0) {
        if (mode === 'defeat') {
            triggerGameOver();
        } else {
            emitCombatFeedback('action', currentLang() === 'en' ? 'No reserve unit available.' : 'Nessuna unità disponibile in riserva.');
        }
        return;
    }

    if (dom.reserveTitle && dom.reserveSubtitle) {
        dom.reserveTitle.textContent = mode === 'switch'
            ? (currentLang() === 'en' ? 'Choose a unit to switch in' : 'Scegli un dannato da mandare in campo')
            : (currentLang() === 'en' ? 'Your current dannato has fallen' : 'Il tuo dannato è stato sconfitto');
        dom.reserveSubtitle.textContent = mode === 'switch'
            ? (currentLang() === 'en' ? 'Switch consumes your battle switch option.' : 'Lo switch consuma la tua sostituzione della battaglia.')
            : (currentLang() === 'en' ? 'Select a surviving reserve unit:' : 'Scegli un dannato rimasto nella riserva:');
    }

    reserveIndexes.forEach((idx) => {
        const unit = normalizeUnit(state.roster[idx], DEFAULT_PLAYER);
        const button = document.createElement('button');
        button.className = 'reserve-btn';
        button.type = 'button';
        button.innerHTML = `
            <img src="${unit.imgPath}" alt="${unit.nome}">
            <span class="reserve-name">${unit.nome}</span>
        `;

        button.addEventListener('click', async () => {
            swapRosterUnits(0, idx);
            state.player = normalizeUnit(state.roster[0], DEFAULT_PLAYER);
            state.playerEnergy = buildEnergyModel(state.player);
            resetSideEffects('player');

            await loadPlayerIdleFrames();
            dom.playerName.removeAttribute('data-i18n');
            dom.enemyName.removeAttribute('data-i18n');
            dom.playerName.textContent = state.player.nome;
            dom.playerKind.textContent = tC('combat_kind_label', 'Specie: {SPECIES}', { SPECIES: state.player.specie });

            updateBars();
            saveRoster();

            dom.reserveModal.classList.add('hidden');
            state.selectingReserve = false;
            state.busy = false;
            resetVisualState();
            setActionsDisabled(false);

            if (mode === 'switch') {
                state.rules.switchUsed = true;
                emitCombatFeedback('action', currentLang() === 'en' ? 'Switch executed. You can still attack this turn.' : 'Switch eseguito. Puoi ancora attaccare in questo turno.');
                return;
            }

            emitCombatFeedback('action', tC('combat_log_swap_in', '{NAME} entra in campo al posto del compagno caduto.', { NAME: state.player.nome }), tC('combat_toast_swap_in', '{NAME} entra in campo', { NAME: state.player.nome }), 'player');
        });

        dom.reserveList.appendChild(button);
    });

    state.selectingReserve = true;
    state.busy = true;
    setActionsDisabled(true);
    dom.reserveModal.classList.remove('hidden');
}
function tryConsumePlayerReviveTotem() {
    const fx = state.effects?.player;
    if (!fx) {
        return false;
    }
    if (Number(fx.reviveCharges || 0) <= 0 || Number(fx.reviveTurns || 0) <= 0) {
        return false;
    }

    fx.reviveCharges = 0;
    fx.reviveTurns = 0;
    state.player.hp = Math.max(1, Math.round(Number(state.player.maxHP || 1) * 0.5));
    fx.shieldHits = Math.max(1, Number(fx.shieldHits || 0) + 1);
    syncRosterHP();
    updateBars();
    emitCombatFeedback('status', currentLang() === 'en' ? 'Revive Totem triggered: revived at 50% HP + shield.' : 'Totem Immortalità attivato: resurrezione al 50% HP + scudo.');
    spawnFloatingText(dom.playerSprite, 'REVIVE 50%+SHD', 'heal');
    setTimeout(() => {
        enterPlayerTurn(false);
    }, 350);
    return true;
}

function handlePlayerDefeat() {
    state.playerAttacking = false;
    state.enemyAttacking = false;

    state.player.hp = 0;
    syncRosterHP();
    emitCombatFeedback('death', tC('combat_log_player_defeated', 'Il tuo dannato è stato sconfitto.'));
    renderReserveSelection();
}

function showVictoryModalAndWait() {
    return new Promise((resolve) => {
        openUnitModal(
            currentLang() === 'en' ? 'Victory' : 'Vittoria',
            dom.playerSprite.src,
            currentLang() === 'en'
                ? 'Enemy defeated. Add this dannato to your roster?'
                : 'Nemico sconfitto. Vuoi aggiungere questo dannato alla squadra?'
        );

        const container = document.createElement('div');
        container.className = 'inventory-modal-grid';
        container.style.marginTop = '12px';

        const yesBtn = document.createElement('button');
        yesBtn.type = 'button';
        yesBtn.textContent = currentLang() === 'en' ? 'Add to team' : 'Aggiungi alla squadra';

        const noBtn = document.createElement('button');
        noBtn.type = 'button';
        noBtn.textContent = currentLang() === 'en' ? 'Skip' : 'Lascia andare';

        container.appendChild(yesBtn);
        container.appendChild(noBtn);
        dom.unitModalBody.parentElement.appendChild(container);

        const cleanup = () => {
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
            dom.unitModalClose.removeEventListener('click', onNo);
            dom.unitModal.removeEventListener('click', onBackdrop);
            if (container.parentElement) {
                container.parentElement.removeChild(container);
            }
            closeUnitModal();
        };

        const onYes = () => {
            cleanup();
            resolve(true);
        };

        const onNo = () => {
            cleanup();
            resolve(false);
        };

        const onBackdrop = (event) => {
            if (event.target === dom.unitModal) {
                onNo();
            }
        };

        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
        dom.unitModalClose.addEventListener('click', onNo);
        dom.unitModal.addEventListener('click', onBackdrop);
    });
}
async function finishBattle(win) {
    saveCombatSummary(win);
    state.playerAttacking = false;
    state.enemyAttacking = false;
    state.ended = true;
    state.busy = false;
    setActionsDisabled(true);

    sessionStorage.setItem(STORAGE_KEYS.result, win ? 'win' : 'lose');
    if (win && state.encounter) {
        sessionStorage.setItem(STORAGE_KEYS.defeated, String(state.encounter.enemyId));
    }

    if (!win) {
        handlePlayerDefeat();
        return;
    }

    playVictoryEffect(dom.playerSprite);
    addCoins(5);
    CORE?.ui?.toast?.(currentLang() === 'en' ? '+5 coins from battle' : '+5 monete dalla battaglia');
    if (isFinalBossEncounter()) {
        emitCombatFeedback('death', currentLang() === 'en'
            ? 'Lucifer is defeated. The Infernal journey is complete.'
            : 'Lucifero è sconfitto. Il viaggio infernale è compiuto.', currentLang() === 'en' ? 'Final victory' : 'Vittoria finale', 'player', 1800);
        setTimeout(() => {
            goToEnding();
        }, 1600);
        return;
    }

    const recruit = await showVictoryModalAndWait();
    if (recruit) {
        addEnemyToRoster();
        emitCombatFeedback('victory', tC('combat_log_recruit_add', '{NAME} è stato aggiunto alla squadra.', { NAME: state.enemy.nome }));
    } else {
        emitCombatFeedback('victory', tC('combat_log_recruit_skip', 'Il dannato è stato lasciato andare.')); 
    }

    emitCombatFeedback('victory', tC('combat_toast_win', 'Vittoria'), '', 'player');
    setTimeout(() => {
        leaveBattle();
    }, 600);
}
function isFinalBossEncounter() {
    // Identifica lo scontro finale contro Lucifero.
    const specie = String(state.enemy?.specie || state.encounter?.enemy?.specie || '').toLowerCase();
    return specie === 'traditore' || state.encounter?.enemy?.isBoss === true;
}

function restoreRosterFullHP() {
    // Dopo ogni combattimento la squadra torna a HP pieni.
    if (!Array.isArray(state.roster)) {
        return;
    }
    state.roster = state.roster.map((unit) => {
        const maxHP = Number(unit?.maxHP || 1);
        return { ...unit, hp: maxHP };
    });
    saveRoster();
}
function goToEnding() {
    restoreRosterFullHP();
    const core = getCoreRuntime();
    if (core?.nav?.goWithLoading) {
        core.nav.goWithLoading('ending.html', { profile: 'boss', from: 'combat.html' });
    } else {
        window.location.href = 'ending.html';
    }
}
function leaveBattle() {
    restoreRosterFullHP();
    const core = getCoreRuntime();
    if (core?.nav?.goWithLoading) {
        core.nav.goWithLoading('porta.html', { profile: 'generic', from: 'combat.html' });
    } else {
        window.location.href = 'porta.html';
    }
}


function getInventoryDefinitions(lang) {
    return [
        { id: 'hp_potion', label: lang === 'en' ? 'HP' : 'HP', icon: 'assets/img/oggetti/shop_item/health_potion.png' },
        { id: 'energy_potion', label: lang === 'en' ? 'EN' : 'EN', icon: 'assets/img/oggetti/shop_item/energy_potion.png' },
        { id: 'revive_totem', label: lang === 'en' ? 'REV' : 'REV', icon: 'assets/img/oggetti/shop_item/totem.png' },
        { id: 'power_drink', label: lang === 'en' ? 'ATK' : 'ATK', icon: 'assets/img/oggetti/shop_item/power_potion.png' },
        { id: 'shield_drink', label: lang === 'en' ? 'SHD' : 'SHD', icon: 'assets/img/oggetti/shop_item/sheild_potion.png' }
    ];
}

function renderInventoryHud() {
    if (!dom.inventoryHud) {
        return;
    }
    const inv = getInventoryState();
    const lang = currentLang();
    const defs = getInventoryDefinitions(lang);
    dom.inventoryHud.innerHTML = '';

    defs.forEach((def) => {
        const qty = Number(inv[def.id] || 0);
        const chip = document.createElement('span');
        chip.className = 'inventory-chip' + (qty <= 0 ? ' is-empty' : '');
        chip.title = `${def.id} x${qty}`;
        chip.innerHTML = `<img src="${def.icon}" alt="${def.id}"><strong>${def.label}</strong><span>x${qty}</span>`;
        dom.inventoryHud.appendChild(chip);
    });
}
function getInventoryState() {
    try {
        const raw = localStorage.getItem(INVENTORY_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function setInventoryState(inv) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv || {}));
}

function consumeInventoryItem(id) {
    const inv = getInventoryState();
    const qty = Number(inv[id] || 0);
    if (qty <= 0) {
        return false;
    }
    inv[id] = qty - 1;
    if (inv[id] <= 0) {
        delete inv[id];
    }
    setInventoryState(inv);
    renderInventoryHud();
    return true;
}

function applyInventoryItemEffect(itemId) {
    if (!consumeInventoryItem(itemId)) {
        emitCombatFeedback('action', currentLang() === 'en' ? 'Item unavailable.' : 'Oggetto non disponibile.');
        return;
    }

    if (itemId === 'hp_potion') {
        state.player.hp = Math.min(Number(state.player.maxHP || 1), Number(state.player.hp || 0) + 30);
        spawnFloatingText(dom.playerSprite, '+30 HP', 'heal');
        emitCombatFeedback('status', currentLang() === 'en' ? 'HP Potion used: +30 HP.' : 'Pozione Vita usata: +30 HP.', '', 'player');
    } else if (itemId === 'energy_potion') {
        const gain = Math.max(1, Math.round(state.playerEnergy.max * 0.33));
        state.playerEnergy.current = Math.min(state.playerEnergy.max, state.playerEnergy.current + gain);
        spawnFloatingText(dom.playerSprite, '+ENERGIA', 'control');
        emitCombatFeedback('status', currentLang() === 'en' ? 'Energy Potion used.' : 'Pozione Energia usata.', '', 'player');
    } else if (itemId === 'revive_totem') {
        state.effects.player.reviveCharges = 1;
        state.effects.player.reviveTurns = 3;
        emitCombatFeedback('status', currentLang() === 'en' ? 'Revive Totem active: 3 turns.' : 'Totem Immortalità attivo: 3 turni.', '', 'player');
    } else if (itemId === 'power_drink') {
        state.effects.player.damageBonus = 0.30;
        state.effects.player.damageBonusTurns = 3;
        emitCombatFeedback('status', currentLang() === 'en' ? 'Power Drink: +30% damage for 3 turns.' : 'Bevanda Potenza: +30% danno per 3 turni.', '', 'player');
    } else if (itemId === 'shield_drink') {
        state.effects.player.shieldHits = Number(state.effects.player.shieldHits || 0) + 1;
        emitCombatFeedback('status', currentLang() === 'en' ? 'Shield Drink: +1 shield.' : 'Bevanda Scudo: +1 scudo.', '', 'player');
    }

    updateBars();
    renderStatusBadges();
    renderInventoryHud();
}

function openInventoryModalInCombat() {
    if (state.busy || state.ended || state.selectingReserve) {
        return;
    }
    renderInventoryHud();
    const inv = getInventoryState();
    const lang = currentLang();
    const entries = [
        { id: 'hp_potion', label: lang === 'en' ? 'HP Potion' : 'Pozione Vita', icon: 'assets/img/oggetti/shop_item/health_potion.png' },
        { id: 'energy_potion', label: lang === 'en' ? 'Energy Potion' : 'Pozione Energia', icon: 'assets/img/oggetti/shop_item/energy_potion.png' },
        { id: 'revive_totem', label: lang === 'en' ? 'Revive Totem' : 'Totem Immortalità', icon: 'assets/img/oggetti/shop_item/totem.png' },
        { id: 'power_drink', label: lang === 'en' ? 'Power Drink' : 'Bevanda Potenza', icon: 'assets/img/oggetti/shop_item/power_potion.png' },
        { id: 'shield_drink', label: lang === 'en' ? 'Shield Drink' : 'Bevanda Scudo', icon: 'assets/img/oggetti/shop_item/sheild_potion.png' }
    ];

    openUnitModal('', '', '');
    const container = document.createElement('div');
    container.className = 'inventory-modal-grid';
    container.style.marginTop = '10px';

    let found = false;
    entries.forEach((entry) => {
        const qty = Number(inv[entry.id] || 0);
        if (qty <= 0) {
            return;
        }
        found = true;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'inventory-modal-item';
        btn.innerHTML = '<img src="' + entry.icon + '" alt="' + entry.label + '"><span class="label">' + entry.label + '</span><span class="qty">x' + qty + '</span>';
        btn.addEventListener('click', () => {
            applyInventoryItemEffect(entry.id);
            closeUnitModal();
            state.busy = false;
            setActionsDisabled(false);
            setTurnHud('player', currentLang() === 'en' ? 'Your turn' : 'Turno tuo');
            setTurnStep('action');
        });
        container.appendChild(btn);
    });

    if (!found) {
        const p = document.createElement('p');
        p.textContent = lang === 'en' ? 'No items available.' : 'Nessun oggetto disponibile.';
        container.appendChild(p);
    }

    dom.unitModalBody.textContent = '';
    dom.unitModalBody.appendChild(container);
}

function openCodexModal() {
    // Apertura bestiario condiviso.
    window.Bestiario?.open?.(0);
}
function handleAction(action) {
    if (action === 'codex') {
        openCodexModal();
        return;
    }

    if (action === 'attacco' || action === 'speciale' || action === 'descrizione' || action === 'switch') {
        playerAction(action);
        return;
    }

    if (action === 'fuga') {
        confirmRunFromBattle().then((ok) => { if (ok) { runFromBattle(); } });
        return;
    }

    if (action === 'items') {
        openInventoryModalInCombat();
        return;
    }

    if (action === 'recluta-si') {
        addEnemyToRoster();
        showEndPanel();
        setTimeout(() => {
            leaveBattle();
        }, 1000);
        return;
    }

    if (action === 'recluta-no') {
        emitCombatFeedback('victory', tC('combat_log_recruit_skip', 'Il dannato è stato lasciato andare.')); 
        showEndPanel();
        setTimeout(() => {
            leaveBattle();
        }, 1000);
        return;
    }

    if (action === 'torna-mappa') {
        leaveBattle();
    }
}

function pickCoinAsset(playerStarts) {
    return playerStarts
        ? 'assets/img/oggetti/coin_head_frames/frame_000.png'
        : 'assets/img/oggetti/coin_cross_frames/frame_000.png';
}

function decideFirstTurnByCoin() {
    const forced = sessionStorage.getItem(COMBAT_FIRST_TURN_KEY);
    if (forced === 'player' || forced === 'enemy') {
        sessionStorage.removeItem(COMBAT_FIRST_TURN_KEY);
        state.busy = true;
        setActionsDisabled(true);

        setTimeout(() => {
            if (forced === 'player') {
                emitCombatFeedback('action', currentLang() === 'en' ? 'You start first.' : 'Inizi tu.');
                setTurnHud('player', currentLang() === 'en' ? 'awaiting command' : 'attesa comando');
                enterPlayerTurn(false);
                return;
            }

            emitCombatFeedback('action', currentLang() === 'en' ? 'Enemy starts first.' : 'Inizia il nemico.');
            enemyTurn();
        }, 1000);
        return;
    }

    const playerStarts = Math.random() < 0.5;
    const resultText = playerStarts
        ? (currentLang() === 'en' ? 'Coin: Head, player starts.' : 'Moneta: Testa, inizi tu.')
        : (currentLang() === 'en' ? 'Coin: Cross, enemy starts.' : 'Moneta: Croce, inizia il nemico.');

    state.busy = true;
    setActionsDisabled(true);

    if (dom.coinOverlay && dom.coinImage && dom.coinResult) {
        dom.coinImage.onerror = () => {
            if (dom.coinImage.src.endsWith('.gif')) {
                dom.coinImage.src = dom.coinImage.src.replace('.gif', '.png');
                return;
            }
            if (dom.coinImage.src.endsWith('.png')) {
                dom.coinImage.src = dom.coinImage.src.replace('.png', '.webp');
            }
        };
        dom.coinImage.src = pickCoinAsset(playerStarts);
        dom.coinResult.textContent = resultText;
        dom.coinOverlay.classList.remove('hidden');
    }

    setTimeout(() => {
        dom.coinOverlay?.classList.add('hidden');
        if (playerStarts) {
            emitCombatFeedback('action', resultText);
            setTurnHud('player', currentLang() === 'en' ? 'awaiting command' : 'attesa comando');
            enterPlayerTurn(false);
            return;
        }

        emitCombatFeedback('action', resultText);
        setTimeout(() => {
            enemyTurn();
        }, 1000);
    }, 1000);
}

function bindEvents() {
    window.addEventListener('resize', () => {
        const root = document.getElementById('gc-toast-root');
        if (root) {
            positionCombatToastLanes(root);
        }
    });
    document.querySelectorAll('button[data-action]').forEach((button) => {
        button.addEventListener('click', () => handleAction(button.dataset.action));
    });

    dom.playerSprite.addEventListener('click', () => {
        openUnitModal(state.player.nome, dom.playerSprite.src, buildUnitTooltip(state.player));
    });

    dom.enemySprite.addEventListener('click', () => {
        openUnitModal(state.enemy.nome, dom.enemySprite.src, buildUnitTooltip(state.enemy));
    });

    dom.unitModalClose.addEventListener('click', closeUnitModal);
    dom.unitModal.addEventListener('click', (event) => {
        if (event.target === dom.unitModal) {
            closeUnitModal();
        }
    });
}

function loop(timestamp) {
    if (CORE?.ui?.pause?.isPaused()) {
        state.lastTick = timestamp;
        requestAnimationFrame(loop);
        return;
    }
    if (!state.lastTick) {
        state.lastTick = timestamp;
    }

    const dt = Math.min(100, timestamp - state.lastTick);
    state.lastTick = timestamp;

    updateAnimation(dt);
    requestAnimationFrame(loop);
}

async function init() {
    await loadI18n();
    const codexBtn = document.querySelector('button[data-action="codex"]');
    if (codexBtn) { codexBtn.textContent = currentLang() === 'en' ? 'Bestiary' : 'Bestiario'; }
    await loadCombatProfiles();
    await loadCombatEffectsMeta();
    await loadCircleLore();
    await hydrateDefaultUnitsFromCatalog();
    if (CORE?.rules?.loadRemote) {
        await CORE.rules.loadRemote();
        MAX_ROSTER_SIZE = Number(CORE.rules.get('maxRosterSize', 6) || 6);
    }

    state.roster = loadRoster();
    if (!promoteFirstAliveToFront()) {
        triggerGameOver();
        return;
    }

    state.player = normalizeUnit(state.roster[0], DEFAULT_PLAYER);
    state.encounter = loadJSON(STORAGE_KEYS.encounter, null);
    state.enemy = reconcileUnitWithCatalog(state.encounter?.enemy, DEFAULT_ENEMY);

    state.playerEnergy = buildEnergyModel(state.player);
    state.enemyEnergy = buildEnergyModel(state.enemy);
    resetEffectsState();

    dom.playerName.removeAttribute('data-i18n');
    dom.enemyName.removeAttribute('data-i18n');
    dom.playerName.textContent = state.player.nome;
    dom.playerKind.textContent = tC('combat_kind_label', 'Specie: {SPECIES}', { SPECIES: state.player.specie });
    dom.enemyName.textContent = state.enemy.nome;
    dom.enemyKind.textContent = tC('combat_kind_label', 'Specie: {SPECIES}', { SPECIES: state.enemy.specie });

    applyArenaBackground();
    resetVisualState();
    updateBars();
    if (isFinalBossEncounter()) {
        emitCombatFeedback('action', currentLang() === 'en' ? 'Final battle: Lucifer appears.' : 'Battaglia finale: appare Lucifero.', currentLang() === 'en' ? 'Final Boss' : 'Boss Finale', 'enemy');
    } else {
        emitCombatFeedback('action', tC('combat_log_encounter_start', 'Uno scontro contro {NAME} è iniziato.', { NAME: state.enemy.nome }), tC('combat_toast_encounter', 'Scontro: {NAME}', { NAME: state.enemy.nome }), 'enemy');
    }

    await loadAnimationAssets();
    renderStatusBadges();
    setTurnHud('player', currentLang() === 'en' ? 'awaiting command' : 'attesa comando');
    setTurnStep('action');
    bindEvents();
    refreshEscapeButtonLabel();
    renderInventoryHud();

    if (CORE?.ui?.guideOnce) {
        await CORE.ui.guideOnce({
            id: 'guida_combat_modal_v1',
            title: { it: 'Guida Combattimento', en: 'Combat Guide' },
            lines: {
                it: ['Usa Attacco per colpire.', 'Lo Speciale richiede energia piena (barra blu).', 'Controlla buff/debuff sotto le barre vita.'],
                en: ['Use Attack to deal damage.', 'Special requires full energy (blue bar).', 'Check buffs/debuffs below HP bars.']
            },
            button: { it: 'Combattiamo', en: 'Fight' }
        });
    }

    decideFirstTurnByCoin();
    requestAnimationFrame(loop);
}

init();




























































































































































// Debug console per demo: abbassa HP nemico rapidamente durante la presentazione.
window.debugCombat = {
    hitEnemy(amount = 50) {
        const dmg = Math.max(1, Number(amount) || 1);
        state.enemy.hp = Math.max(0, Number(state.enemy.hp || 0) - dmg);
        updateBars();
        emitCombatFeedback('hit', `DEBUG: -${dmg} HP a ${state.enemy.nome}`);
        if (state.enemy.hp <= 0 && !state.ended) {
            finishBattle(true);
        }
    },
    setEnemyHP(value = 1) {
        const hp = Math.max(0, Number(value) || 0);
        state.enemy.hp = Math.min(Number(state.enemy.maxHP || hp), hp);
        updateBars();
        emitCombatFeedback('hit', `DEBUG: HP nemico = ${state.enemy.hp}`);
        if (state.enemy.hp <= 0 && !state.ended) {
            finishBattle(true);
        }
    }
};

















































