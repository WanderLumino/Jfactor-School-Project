// Commento generale file: componente condiviso del bestiario (16 pagine) per tutte le scene.
'use strict';

(function initBestiarioModule() {
    const LANG_KEY = 'lingua_gioco';
    const DATA_PATH = 'assets/data/combat_data/bestiario_pages.json';
    const FALLBACK_IMAGE = 'assets/img/bestie/leone_idle_frames/frame_000.png';
    const ROSTER_KEY = 'dannato_schierato';
    const ENCOUNTER_KEY = 'encounter_context';
    const DEX_UNLOCKED_KEY = 'bestiario_sbloccati';
    const STARTER_UNLOCKED = ['leone', 'lonza', 'lupa'];

    let pagesCache = null;
    let unitsCatalogCache = null;
    let combatProfilesCache = null;
    let currentIndex = 0;

    
    const EFFECT_ICON_MAP = {
        shield: 'assets/img/oggetti/effects/buff/sheild.svg',
        reflect_shield: 'assets/img/oggetti/effects/buff/reflect_sheild.svg',
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
        plague_mark: 'assets/img/oggetti/effects/debuff/plague_mark.svg',
        energy_drain: 'assets/img/oggetti/effects/debuff/weaken.svg',
        chaos: 'assets/img/oggetti/effects/debuff/weaken.svg',
        boss_combo: 'assets/img/oggetti/effects/debuff/boss_combo.svg'
    };

    function iconPathByEffect(type) {
        return EFFECT_ICON_MAP[String(type || '').toLowerCase()] || '';
    }

    function iconHtmlByEffect(type, label) {
        const src = iconPathByEffect(type);
        if (!src) {
            return '';
        }
        return `<img class="effect-mini-icon" src="${src}" alt="${label || type}">`;
    }
    function lang() {
        return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'it';
    }

    function safeParse(raw, fallback) {
        if (!raw) {
            return fallback;
        }
        try {
            return JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    function normalizeSpecie(value) {
        return String(value || '').trim().toLowerCase();
    }

    function readRosterSpecies() {
        const raw = sessionStorage.getItem(ROSTER_KEY);
        if (!raw) {
            return [];
        }

        const parsed = safeParse(raw, []);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        return list.map((u) => normalizeSpecie(u?.specie)).filter(Boolean);
    }

    function readEncounterSpecies() {
        const raw = sessionStorage.getItem(ENCOUNTER_KEY);
        if (!raw) {
            return '';
        }
        const parsed = safeParse(raw, null);
        return normalizeSpecie(parsed?.enemy?.specie);
    }

    function readStoredUnlocked() {
        const raw = sessionStorage.getItem(DEX_UNLOCKED_KEY);
        if (!raw) {
            return [];
        }
        const parsed = safeParse(raw, []);
        return Array.isArray(parsed) ? parsed.map((v) => normalizeSpecie(v)).filter(Boolean) : [];
    }

    function persistUnlocked(set) {
        sessionStorage.setItem(DEX_UNLOCKED_KEY, JSON.stringify(Array.from(set)));
    }

    function collectUnlockedSpecies() {
        // Fonte unica: starter + roster + incontro corrente + storico locale.
        const unlocked = new Set();
        STARTER_UNLOCKED.forEach((s) => unlocked.add(s));
        readStoredUnlocked().forEach((s) => unlocked.add(s));
        readRosterSpecies().forEach((s) => unlocked.add(s));
        const encounterSpecie = readEncounterSpecies();
        if (encounterSpecie) {
            unlocked.add(encounterSpecie);
        }
        persistUnlocked(unlocked);
        return unlocked;
    }

    async function loadPages() {
        if (Array.isArray(pagesCache) && pagesCache.length > 0) {
            return pagesCache;
        }
        const response = await fetch(DATA_PATH, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('BESTIARIO_LOAD_FAIL');
        }
        const json = await response.json();
        pagesCache = Array.isArray(json) ? json : [];
        return pagesCache;
    }

    function getNodes() {
        return {
            root: document.getElementById('bestiario-modal'),
            title: document.getElementById('bestiario-title'),
            index: document.getElementById('bestiario-index'),
            imageWrap: document.querySelector('.bestiario-image-wrap'),
            img: document.getElementById('bestiario-image'),
            nome: document.getElementById('bestiario-nome'),
            tipo: document.getElementById('bestiario-tipo'),
            hp: document.getElementById('bestiario-hp'),
            atk: document.getElementById('bestiario-atk'),
            specialName: document.getElementById('bestiario-special-name'),
            specialDamage: document.getElementById('bestiario-special-damage'),
            specialDesc: document.getElementById('bestiario-special-desc'),
            passiveName: document.getElementById('bestiario-passive-name'),
            passiveDesc: document.getElementById('bestiario-passive-desc'),
            btnPrev: document.getElementById('bestiario-prev'),
            btnNext: document.getElementById('bestiario-next'),
            btnClose: document.getElementById('bestiario-close')
        };
    }

        async function loadUnitsCatalog() {
        if (unitsCatalogCache) {
            return unitsCatalogCache;
        }
        try {
            if (window.GameCore?.units?.loadCatalog) {
                unitsCatalogCache = await window.GameCore.units.loadCatalog();
                if (unitsCatalogCache) {
                    return unitsCatalogCache;
                }
            }
        } catch {
            // fallback fetch diretto.
        }
        try {
            const response = await fetch('assets/data/combat_data/units_catalog.json', { cache: 'no-store' });
            if (response.ok) {
                unitsCatalogCache = await response.json();
            }
        } catch {
            unitsCatalogCache = null;
        }
        return unitsCatalogCache;
    }

    
    async function loadCombatProfiles() {
        if (combatProfilesCache) {
            return combatProfilesCache;
        }
        try {
            const response = await fetch('assets/data/combat_data/combat_profiles.json', { cache: 'no-store' });
            if (response.ok) {
                combatProfilesCache = await response.json();
            }
        } catch {
            combatProfilesCache = null;
        }
        return combatProfilesCache;
    }

    function getCatalogHpBySpecie(catalog, specie) {
        const key = normalizeSpecie(specie);
        const hp = Number(catalog?.species?.[key]?.maxHP ?? catalog?.starters?.[key]?.maxHP ?? 0);
        return Number.isFinite(hp) && hp > 0 ? hp : 0;
    }
function textByLang(row) {
        return lang() === 'en' ? row.en : row.it;
    }

    function lockLabel() {
        return lang() === 'en' ? 'LOCKED' : 'BLOCCATO';
    }

    function setLockedView(nodes, locked) {
        if (!nodes.imageWrap || !nodes.img) {
            return;
        }
        nodes.imageWrap.classList.toggle('is-locked', locked);
        nodes.imageWrap.setAttribute('data-lock', lockLabel());
        nodes.img.classList.toggle('is-locked', locked);
    }

    function renderRow(row, index, total, unlockedSet, catalog, profiles) {
        const n = getNodes();
        if (!n.root) {
            return;
        }

        const t = textByLang(row) || {};
        const isEn = lang() === 'en';
        const specie = normalizeSpecie(row.specie);
        const isUnlocked = unlockedSet.has(specie);

        n.title.textContent = isEn ? 'Bestiary' : 'Bestiario';
        n.index.textContent = `${index + 1} / ${total}`;
        n.img.src = row.image || FALLBACK_IMAGE;
        n.img.alt = t.nome || row.specie || 'Dannato';
        setLockedView(n, !isUnlocked);

        if (!isUnlocked) {
            n.nome.textContent = `${isEn ? 'Name' : 'Nome'}: ???`;
            n.tipo.textContent = `${isEn ? 'Specie' : 'Specie'}: ???`;
            n.hp.textContent = `${isEn ? 'HP' : 'HP'}: ???`;
            n.atk.textContent = `${isEn ? 'Base ATK' : 'Danno base'}: ???`;
            n.specialName.textContent = `${isEn ? 'Special Skill' : 'Speciale'}: ???`;
            n.specialDamage.textContent = `${isEn ? 'Special Damage' : 'Danno speciale'}: ???`;
            n.specialDesc.textContent = `${isEn ? 'Effect' : 'Effetto'}: ???`;
            n.passiveName.textContent = `${isEn ? 'Passive' : 'Passivo'}: ???`;
            n.passiveDesc.textContent = `${isEn ? 'Passive Effect' : 'Effetto passivo'}: ???`;
            return;
        }

        const hpValue = getCatalogHpBySpecie(catalog, row.specie);
        n.nome.textContent = `${isEn ? 'Name' : 'Nome'}: ${t.nome || '-'}`;
        n.tipo.textContent = `${isEn ? 'Specie' : 'Specie'}: ${t.tipo || '-'}`;
        n.hp.textContent = `${isEn ? 'HP' : 'HP'}: ${hpValue > 0 ? hpValue : '-'}`;
        n.atk.textContent = `${isEn ? 'Base ATK' : 'Danno base'}: ${Number(row.atk || 0)}`;
        const profile = profiles?.[specie] || null;
        const specialType = profile?.special?.type || '';
        const passives = Array.isArray(profile?.passives) ? profile.passives : [];
        const p1 = passives[0]?.type || '';
        const p2 = passives[1]?.type || '';

        n.specialName.innerHTML = `${isEn ? 'Special Skill' : 'Speciale'}: ${iconHtmlByEffect(specialType, t.specialName || specialType)} ${t.specialName || '-'}`;
        n.specialDamage.textContent = `${isEn ? 'Special Damage' : 'Danno speciale'}: ${Number(row.specialDamage || 0)}`;
        n.specialDesc.textContent = `${isEn ? 'Effect' : 'Effetto'}: ${t.specialDesc || '-'}`;
        n.passiveName.innerHTML = `${isEn ? 'Passive' : 'Passivo'}: ${iconHtmlByEffect(p1, t.passiveName || p1)} ${t.passiveName || '-'}${p2 ? ' ' + iconHtmlByEffect(p2, p2) : ''}`;
        n.passiveDesc.textContent = `${isEn ? 'Passive Effect' : 'Effetto passivo'}: ${t.passiveDesc || '-'}`;
    }

    async function open(startIndex = 0) {
        const n = getNodes();
        if (!n.root) {
            return;
        }

        try {
            const pages = await loadPages();
            const catalog = await loadUnitsCatalog();
            const profiles = await loadCombatProfiles();
            if (pages.length === 0) {
                return;
            }

            const unlockedSet = collectUnlockedSpecies();
            currentIndex = Math.max(0, Math.min(startIndex, pages.length - 1));
            renderRow(pages[currentIndex], currentIndex, pages.length, unlockedSet, catalog, profiles);
            n.root.classList.remove('hidden');
        } catch {
            // Fallback minimale in caso di errore caricamento.
            n.title.textContent = lang() === 'en' ? 'Bestiary' : 'Bestiario';
            n.index.textContent = '-';
            n.nome.textContent = lang() === 'en' ? 'Load error' : 'Errore caricamento';
            n.tipo.textContent = '';
            n.atk.textContent = '';
            n.specialName.textContent = '';
            n.specialDamage.textContent = '';
            n.specialDesc.textContent = '';
            n.passiveName.textContent = '';
            n.passiveDesc.textContent = '';
            n.root.classList.remove('hidden');
        }
    }

    function close() {
        const n = getNodes();
        if (!n.root) {
            return;
        }
        n.root.classList.add('hidden');
    }

    async function next() {
        const pages = await loadPages();
            const catalog = await loadUnitsCatalog();
            const profiles = await loadCombatProfiles();
        if (!pages.length) {
            return;
        }
        const unlockedSet = collectUnlockedSpecies();
        currentIndex = (currentIndex + 1) % pages.length;
        renderRow(pages[currentIndex], currentIndex, pages.length, unlockedSet, catalog, profiles);
    }

    async function prev() {
        const pages = await loadPages();
            const catalog = await loadUnitsCatalog();
            const profiles = await loadCombatProfiles();
        if (!pages.length) {
            return;
        }
        const unlockedSet = collectUnlockedSpecies();
        currentIndex = (currentIndex - 1 + pages.length) % pages.length;
        renderRow(pages[currentIndex], currentIndex, pages.length, unlockedSet, catalog, profiles);
    }

    function bind() {
        const n = getNodes();
        if (!n.root) {
            return;
        }
        n.btnPrev?.addEventListener('click', () => { prev(); });
        n.btnNext?.addEventListener('click', () => { next(); });
        n.btnClose?.addEventListener('click', () => { close(); });
        n.root.addEventListener('click', (event) => {
            if (event.target === n.root) {
                close();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', bind);

    window.Bestiario = {
        open,
        close
    };
})();














