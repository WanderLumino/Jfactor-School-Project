// Commento generale file: logica principale dello script.
'use strict';

// Dati statici dei cerchi: i testi vengono letti dai file lingua.
const CERCHI = [
    { num: 3, romanum: 'III', mapKey: 'mappa1', preview: 'assets/img/mappe/lava_inferno_base.png' },
    { num: 0, romanum: '0', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_1.png' },
    { num: 1, romanum: 'I', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_1.png' },
    { num: 2, romanum: 'II', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_2.png' },
    { num: 3, romanum: 'III', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_3.png' },
    { num: 4, romanum: 'IV', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_4.png' },
    { num: 5, romanum: 'V', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_5.png' },
    { num: 6, romanum: 'VI', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_6.png' },
    { num: 7, romanum: 'VII', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_7.png' },
    { num: 8, romanum: 'VIII', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_8.png' },
    { num: 9, romanum: 'IX', mapKey: 'mappa1', preview: 'assets/img/mappe/mappe_gioco/mappa_9.png' }
];

const ITEM_H = 140;
const REPEATS = 22;
const CORE = window.GameCore || null;

function getCoreRuntime() {
    // Recupera GameCore a runtime per evitare race con script defer.
    return window.GameCore || CORE || null;
}

const CURRENT_CIRCLE_KEY = CORE?.keys?.currentCircle || 'cerchio_corrente';
const TARGET_CIRCLE_KEY = CORE?.keys?.targetCircle || 'cerchio_destinazione';
const CURRENT_MAP_KEY = CORE?.keys?.currentMap || 'mappa_corrente';

let cerchioCorrente = Number(localStorage.getItem(CURRENT_CIRCLE_KEY) || 0);
if (Number.isNaN(cerchioCorrente) || cerchioCorrente < 0) {
    cerchioCorrente = 0;
}

const state = {
    spinning: false,
    snapping: false,
    offset: 0,
    speed: 18,
    itemH: ITEM_H,
    slotItems: [],
    raf: null,
    i18n: {}
};

const btnPorta = document.getElementById('btn-porta');
const slotContainer = document.getElementById('slot-container');
const slotFrame = document.getElementById('slot-frame');
const slotTrack = document.getElementById('slot-track');
const slotRange = document.getElementById('slot-range');
const slotHint = document.getElementById('slot-hint');

function getLinguaCorrente() {
    return localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
}

function testoPorta(chiave, fallback = '') {
    return state.i18n[chiave] || fallback;
}

function getCerchioNome(item) {
    return testoPorta(`porta_circle_${item.num}_name`, `Cerchio ${item.romanum}`);
}

function getCerchioPeccato(item) {
    return testoPorta(`porta_circle_${item.num}_sin`, '');
}

async function caricaLinguaPorta() {
    const lingua = getLinguaCorrente();
    try {
        const risposta = await fetch(`assets/data/lingue/${lingua}.json`);
        if (!risposta.ok) {
            state.i18n = {};
            return;
        }
        const dati = await risposta.json();
        state.i18n = dati || {};
    } catch (errore) {
        console.error('Errore caricamento lingua porta:', errore);
        state.i18n = {};
    }
}

function updateHUD() {
    const current = CERCHI.find((c) => c.num === cerchioCorrente) || CERCHI[0];
    document.getElementById('hud-cerchio').textContent = current.romanum;
    document.getElementById('hud-nome').textContent = getCerchioNome(current);
    updateRangeHint();
}

function getAvailableCerchi() {
    const min = Math.min(cerchioCorrente + 1, 9);
    const max = Math.min(cerchioCorrente + 4, 9);
    const list = CERCHI.filter((item) => item.num >= min && item.num <= max);
    return list.length > 0 ? list : [CERCHI[9]];
}

function updateRangeHint() {
    const available = getAvailableCerchi();
    if (!slotRange) {
        return;
    }
    if (available.length === 1) {
        slotRange.textContent = testoPorta('porta_slot_next_circle', 'PROSSIMO: CERCHIO {ROMAN}')
            .replace('{ROMAN}', available[0].romanum);
        return;
    }

    const first = available[0];
    const last = available[available.length - 1];
    slotRange.textContent = testoPorta('porta_slot_range_circle', 'RANGE: CERCHIO {FROM} - {TO}')
        .replace('{FROM}', first.romanum)
        .replace('{TO}', last.romanum);
}

function applyOffset() {
    slotTrack.style.transform = `translateY(${state.offset}px)`;
}

function buildTrack() {
    const pool = getAvailableCerchi();
    state.slotItems = [];
    for (let i = 0; i < REPEATS; i += 1) {
        pool.forEach((item) => state.slotItems.push(item));
    }

    slotTrack.innerHTML = '';
    state.slotItems.forEach((item) => {
        const nome = getCerchioNome(item);
        const peccato = getCerchioPeccato(item);

        const div = document.createElement('div');
        div.className = 'slot-item';
        div.innerHTML = `
            <img class="slot-preview" src="${item.preview}" alt="Mappa ${nome}">
            <div class="slot-copy">
                <div class="slot-num">${item.romanum}</div>
                <div class="slot-nome">${nome}</div>
                <div class="slot-peccato">${peccato}</div>
            </div>
        `;
        slotTrack.appendChild(div);
    });

    const firstItem = slotTrack.querySelector('.slot-item');
    const measuredItemH = firstItem
        ? (firstItem.getBoundingClientRect().height || firstItem.offsetHeight || ITEM_H)
        : ITEM_H;
    state.itemH = Math.max(1, measuredItemH);

    const mid = Math.floor(state.slotItems.length / 2);
    const frameH = slotFrame.getBoundingClientRect().height || slotFrame.offsetHeight || 300;
    const centerY = frameH / 2;
    state.offset = centerY - (mid * state.itemH + state.itemH / 2);
    applyOffset();
}

function spinLoop() {
    if (!state.spinning && !state.snapping) {
        return;
    }

    state.offset -= state.speed;
    applyOffset();

    const full = Math.max(1, state.slotItems.length * state.itemH);
    if (-state.offset > full * 0.75) {
        const mid = Math.floor(state.slotItems.length / 2);
        const frameH = slotFrame.getBoundingClientRect().height || slotFrame.offsetHeight || 300;
        const centerY = frameH / 2;
        state.offset = centerY - (mid * state.itemH + state.itemH / 2) + ((-state.offset) % (full * 0.5));
    }

    state.raf = requestAnimationFrame(spinLoop);
}

function easeToTarget(target, selectedCerchio) {
    const diff = target - state.offset;
    if (Math.abs(diff) < 0.6) {
        state.offset = target;
        applyOffset();
        finalizeSelection(selectedCerchio);
        return;
    }

    state.offset += diff * 0.12;
    applyOffset();
    state.raf = requestAnimationFrame(() => easeToTarget(target, selectedCerchio));
}

function startSpin() {
    state.spinning = true;
    state.snapping = false;
    state.speed = 18;

    slotContainer.classList.remove('hidden');
    buildTrack();
    btnPorta.classList.add('spinning');
    slotHint.textContent = testoPorta('porta_slot_hint_click', 'CLICCA LA PORTA PER FERMARE');
    slotHint.classList.add('is-blink');
    updateRangeHint();
    getCoreRuntime()?.ui?.toast?.(testoPorta('porta_toast_spin_started', 'Rotazione avviata'));

    if (state.raf) {
        cancelAnimationFrame(state.raf);
    }
    state.raf = requestAnimationFrame(spinLoop);
}

function stopSpin() {
    if (state.slotItems.length === 0) {
        state.spinning = false;
        state.snapping = false;
        return;
    }

    state.spinning = false;
    state.snapping = true;

    const available = getAvailableCerchi();
    const pick = available[Math.floor(Math.random() * available.length)];
    const frameH = slotFrame.getBoundingClientRect().height || slotFrame.offsetHeight || 300;
    const centerY = frameH / 2;
    const currentCenterIndex = Math.round((centerY - state.offset - state.itemH / 2) / state.itemH);

    let bestIndex = -1;
    let bestDistance = Infinity;
    for (let i = 0; i < state.slotItems.length; i += 1) {
        if (state.slotItems[i].num !== pick.num) {
            continue;
        }
        const d = Math.abs(i - currentCenterIndex);
        if (d < bestDistance) {
            bestDistance = d;
            bestIndex = i;
        }
    }
    if (bestIndex < 0) {
        bestIndex = Math.floor(state.slotItems.length / 2);
    }

    const targetOffset = centerY - (bestIndex * state.itemH + state.itemH / 2);
    cancelAnimationFrame(state.raf);

    getCoreRuntime()?.ui?.toast?.(
        testoPorta('porta_toast_draw_circle', 'Estrazione: Cerchio {ROMAN}')
            .replace('{ROMAN}', pick.romanum)
    );
    easeToTarget(targetOffset, pick);
}

window.addEventListener('lingua-cambiata', async () => {
    await caricaLinguaPorta();
    buildTrack();
    updateHUD();
    aggiornaEtichettaPorta();
    if (state.spinning) {
        slotHint.textContent = testoPorta('porta_slot_hint_click', 'CLICCA LA PORTA PER FERMARE');
    slotHint.classList.add('is-blink');
    }
});

function aggiornaEtichettaPorta() {
    const openText = testoPorta('porta_open_button', 'APRI');
    const stopText = testoPorta('porta_stop_button', 'FERMA');
    const ariaText = testoPorta('porta_open_aria', 'Apri la porta');

    btnPorta.setAttribute('data-open-label', openText.toUpperCase());
    btnPorta.setAttribute('data-stop-label', stopText.toUpperCase());
    btnPorta.setAttribute('aria-label', ariaText);
}
function animateSprite(imgEl, folder, count, speed) {
    let index = 0;
    setInterval(() => {
        imgEl.src = `${folder}frame_${String(index).padStart(3, '0')}.png`;
        index = (index + 1) % count;
    }, speed);
}

function finalizeSelection(cerchio) {
    state.snapping = false;
    btnPorta.classList.remove('spinning');

    const nome = getCerchioNome(cerchio).toUpperCase();
    slotHint.classList.remove('is-blink');
    slotHint.textContent = testoPorta('porta_slot_selected', 'CERCHIO {ROMAN} - {NAME}')
        .replace('{ROMAN}', cerchio.romanum)
        .replace('{NAME}', nome);

    localStorage.setItem(TARGET_CIRCLE_KEY, String(cerchio.num));
    localStorage.setItem(CURRENT_CIRCLE_KEY, String(Math.max(cerchioCorrente, cerchio.num)));
    localStorage.setItem(CURRENT_MAP_KEY, cerchio.mapKey);

    setTimeout(() => {
        const core = getCoreRuntime();
        if (core?.nav?.goWithLoading) {
            core.nav.goWithLoading('mappa.html', { profile: 'generic', from: 'porta.html' });
        } else {
            window.location.href = 'mappa.html';
        }
    }, 1000);
}

btnPorta.addEventListener('click', () => {
    if (!state.spinning && !state.snapping) {
        startSpin();
        return;
    }

    if (state.spinning) {
        stopSpin();
    }
});

async function initPorta() {
    await caricaLinguaPorta();
    buildTrack();
    updateHUD();
    aggiornaEtichettaPorta();
    animateSprite(document.getElementById('dante-sprite'), 'assets/img/personaggi/dante_spritesheet/Dante_idle_frames/', 12, 100);
    animateSprite(document.getElementById('virgilio-sprite'), 'assets/img/personaggi/virgilio_spritesheet/Virgilio_idle_frames/', 12, 120);

    ensurePortaShopUI();
    refreshCoinHud();

    const coreRT = getCoreRuntime();
    if (coreRT?.ui?.guideTimes) {
        coreRT.ui.guideTimes({
            id: 'guida_porta_v1',
            maxTimes: 1,
            title: { it: 'Guida Porta', en: 'Gate Guide' },
            lines: {
                it: ['Premi la porta al centro per avviare il sorteggio.', 'Premi una seconda volta per fermare il rullo.', 'Il cerchio estratto decide la mappa successiva.'],
                en: ['Press the central gate to start the draw.', 'Press again to stop the reel.', 'The selected circle decides the next map.']
            },
            button: { it: 'Chiaro', en: 'Got it' }
        });
    }
}







/* Modulo economia e negozio: gestione monete + acquisti casuali in Porta. */
const COINS_KEY = 'inferno_coins';
const INVENTORY_KEY = 'inferno_inventory';
const SHOP_ITEMS = [
    { id: 'hp_potion', it: 'Pozione Vita', en: 'HP Potion', cost: 5, descIt: '+30 HP', descEn: '+30 HP', icon: 'assets/img/oggetti/shop_item/health_potion.png', effect: { type: 'heal', value: 30 } },
    { id: 'energy_potion', it: 'Pozione Energia', en: 'Energy Potion', cost: 4, descIt: '+33% energia', descEn: '+33% energy', icon: 'assets/img/oggetti/shop_item/energy_potion.png', effect: { type: 'energy', value: 33 } },
    { id: 'revive_totem', it: 'Totem Immortalità', en: 'Revive Totem', cost: 10, descIt: 'Resurrezione una volta', descEn: 'One-time revive', icon: 'assets/img/oggetti/shop_item/totem.png', effect: { type: 'revive', value: 1 } },
    { id: 'power_drink', it: 'Bevanda Potenza', en: 'Power Drink', cost: 6, descIt: '+10% danno', descEn: '+10% damage', icon: 'assets/img/oggetti/shop_item/power_potion.png', effect: { type: 'damage', value: 10 } },
    { id: 'shield_drink', it: 'Bevanda Scudo', en: 'Shield Drink', cost: 5, descIt: '+1 scudo', descEn: '+1 shield', icon: 'assets/img/oggetti/shop_item/sheild_potion.png', effect: { type: 'shield', value: 1 } }
];

function getCoins() {
    const value = Number(localStorage.getItem(COINS_KEY) || 0);
    return Number.isNaN(value) ? 0 : value;
}

function setCoins(value) {
    localStorage.setItem(COINS_KEY, String(Math.max(0, Math.floor(value))));
}

function getInventory() {
    try {
        const raw = localStorage.getItem(INVENTORY_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function setInventory(inv) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv || {}));
}

function addInventoryItem(itemId, qty = 1) {
    const inv = getInventory();
    inv[itemId] = Number(inv[itemId] || 0) + qty;
    setInventory(inv);
}

function pickRandomShopItems() {
    const pool = [...SHOP_ITEMS].sort(() => Math.random() - 0.5);
    return pool.slice(0, 3);
}

function ensurePortaShopUI() {
    if (document.getElementById('coin-hud')) {
        return;
    }

    const coinHud = document.createElement('div');
    coinHud.id = 'coin-hud';
    coinHud.innerHTML = '<img src="assets/img/oggetti/coin.png" alt="coin"><span id="coin-count">0</span>';
    document.body.appendChild(coinHud);

    const shopBtn = document.createElement('button');
    shopBtn.id = 'btn-shop';
    shopBtn.type = 'button';
    shopBtn.textContent = getLinguaCorrente() === 'en' ? 'Shop' : 'Negozio';
    document.body.appendChild(shopBtn);

    const modal = document.createElement('div');
    modal.id = 'shop-modal';
    modal.className = 'hidden';
    modal.innerHTML = `
        <div class="shop-card">
            <button id="shop-close" type="button" aria-label="close">X</button>
            <h3 id="shop-title">Negozio</h3>
            <p id="shop-subtitle"></p>
            <div id="shop-list" class="shop-list"></div>
            <button id="shop-refresh" type="button" class="shop-refresh-btn"></button>
        </div>
    `;
    document.body.appendChild(modal);

    shopBtn.addEventListener('click', openShopModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeShopModal();
        }
    });
    modal.querySelector('#shop-close')?.addEventListener('click', closeShopModal);
    modal.querySelector('#shop-refresh')?.addEventListener('click', () => {
        if (shopRefreshes <= 0) {
            return;
        }
        shopRefreshes -= 1;
        renderShopCards(pickRandomShopItems());
        updateRefreshButton();
    });

    refreshCoinHud();
}

function refreshCoinHud() {
    const node = document.getElementById('coin-count');
    if (node) {
        node.textContent = String(getCoins());
    }
}

function closeShopModal() {
    const modal = document.getElementById('shop-modal');
    if (!modal) {
        return;
    }
    modal.classList.add('hidden');
}

function renderShopCards(items) {
    const list = document.getElementById('shop-list');
    if (!list) {
        return;
    }

    const lang = getLinguaCorrente();
    list.innerHTML = '';

    items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'shop-item';
        const ownedQty = Number(getInventory()[item.id] || 0);
        card.innerHTML = `
            <img src="${item.icon}" alt="${item.id}">
            <h4>${lang === 'en' ? item.en : item.it}</h4>
            <p>${lang === 'en' ? item.descEn : item.descIt}</p>
            <p class="shop-cost">${item.cost} coin</p>
            <p class="shop-owned">${lang === 'en' ? `Owned: ${ownedQty}` : `Posseduti: ${ownedQty}`}</p>
            <button type="button">${lang === 'en' ? 'Buy' : 'Compra'}</button>
        `;

        const btn = card.querySelector('button');
        if (btn) {
            btn.addEventListener('click', () => {
                const coins = getCoins();
                if (coins < item.cost) {
                    getCoreRuntime()?.ui?.toast?.(lang === 'en' ? 'Not enough coins.' : 'Monete insufficienti.');
                    return;
                }
                setCoins(coins - item.cost);
                addInventoryItem(item.id, 1);
                refreshCoinHud();
                getCoreRuntime()?.ui?.toast?.(lang === 'en' ? 'Purchased!' : 'Acquisto completato!');
                const subtitle = document.getElementById('shop-subtitle');
                if (subtitle) {
                    subtitle.textContent = (lang === 'en' ? 'Coins available: ' : 'Monete disponibili: ') + getCoins();
                }
                btn.disabled = true;
                btn.textContent = lang === 'en' ? 'Bought' : 'Comprato';
                card.classList.add('is-bought');
                const owned = card.querySelector('.shop-owned');
                if (owned) {
                    const nextQty = Number(getInventory()[item.id] || 0);
                    owned.textContent = lang === 'en' ? `Owned: ${nextQty}` : `Posseduti: ${nextQty}`;
                }
            });
        }

        list.appendChild(card);
    });
}

let shopRefreshes = 3;

function openShopModal() {
    const modal = document.getElementById('shop-modal');
    if (!modal) {
        return;
    }
    const lang = getLinguaCorrente();
    const title = document.getElementById('shop-title');
    const subtitle = document.getElementById('shop-subtitle');
    if (title) {
        title.textContent = lang === 'en' ? 'Infernal Shop' : 'Negozio Infernale';
    }
    if (subtitle) {
        subtitle.textContent = (lang === 'en' ? 'Coins available: ' : 'Monete disponibili: ') + getCoins();
    }
    shopRefreshes = 3;
    renderShopCards(pickRandomShopItems());
    updateRefreshButton();
    modal.classList.remove('hidden');
}

function updateRefreshButton() {
    const btn = document.getElementById('shop-refresh');
    if (!btn) {
        return;
    }
    const lang = getLinguaCorrente();
    if (shopRefreshes <= 0) {
        btn.disabled = true;
        btn.textContent = lang === 'en' ? 'No refreshes' : 'Nessun aggiornamento';
    } else {
        btn.disabled = false;
        btn.textContent = (lang === 'en' ? 'Refresh' : 'Aggiorna') + ` (${shopRefreshes})`;
    }
}

initPorta();










