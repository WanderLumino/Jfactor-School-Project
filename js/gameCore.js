// Commento generale file: nucleo condiviso per stato, regole e modelli dati.
'use strict';

(function bootstrapGameCore() {
    const KEYS = {
        roster: 'dannato_schierato',
        encounter: 'encounter_context',
        result: 'encounter_result',
        defeated: 'encounter_enemy_id',
        settings: 'impostazioni_gioco',
        currentCircle: 'cerchio_corrente',
        targetCircle: 'cerchio_destinazione',
        currentMap: 'mappa_corrente',
        loadingContext: 'loading_context',
        guideSeen: 'guide_seen_v1'
    };

    const DEFAULT_RULES = {
        quizQuestionsPerRun: 3,
        quizMinCorrectToWin: 2,
        maxRosterSize: 6,
        recruitReplacePolicy: 'weakest_maxhp'
    };

    let DEFAULT_UNIT = {
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

    const runtime = {
        rules: { ...DEFAULT_RULES },
        remoteLoaded: false,
        unitsCatalog: null
    };

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
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

    function createStorageDriver(storage) {
        return {
            getJSON(key, fallback = null) {
                return safeParse(storage.getItem(key), fallback);
            },
            setJSON(key, value) {
                storage.setItem(key, JSON.stringify(value));
            },
            getNumber(key, fallback = 0) {
                const n = Number(storage.getItem(key));
                return Number.isNaN(n) ? fallback : n;
            },
            setNumber(key, value) {
                storage.setItem(key, String(value));
            },
            remove(key) {
                storage.removeItem(key);
            }
        };
    }

    function normalizeUnit(unit, fallback = DEFAULT_UNIT) {
        const source = unit && typeof unit === 'object' ? unit : {};
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

    async function loadUnitsCatalog(url = 'assets/data/combat_data/units_catalog.json') {
        // Carica catalogo unita centralizzato (bestie/dannati/default).
        if (runtime.unitsCatalog) {
            return runtime.unitsCatalog;
        }
        try {
            const res = await fetch(url);
            if (!res.ok) {
                return null;
            }
            const parsed = await res.json();
            if (parsed && typeof parsed === 'object') {
                runtime.unitsCatalog = parsed;
                if (parsed.defaults?.player) {
                    DEFAULT_UNIT = normalizeUnit(parsed.defaults.player, DEFAULT_UNIT);
                }
            }
        } catch {
            // Fallback silenzioso ai default hardcoded.
        }
        return runtime.unitsCatalog;
    }

    function getUnitTemplateBySpecies(specie) {
        const key = String(specie || '').toLowerCase();
        const source = runtime.unitsCatalog?.species?.[key]
            || runtime.unitsCatalog?.starters?.[key]
            || runtime.unitsCatalog?.defaults?.player
            || DEFAULT_UNIT;
        return normalizeUnit(source, DEFAULT_UNIT);
    }
    function reconcileUnitWithCatalog(unit) {
    // Riconcilia i valori numerici dell'unita con il catalogo centrale per specie.
    const normalized = normalizeUnit(unit, DEFAULT_UNIT);
    const specieKey = String(normalized.specie || '').toLowerCase();
    const tpl = runtime.unitsCatalog
        ? getUnitTemplateBySpecies(specieKey)
        : null;
    if (!tpl) {
        return normalized;
    }

    const prevMax = Math.max(1, Number(normalized.maxHP ?? tpl.maxHP));
    const hpRatio = Math.max(0, Math.min(1, Number(normalized.hp ?? prevMax) / prevMax));
    const merged = {
        ...normalized,
        nome: normalized.nome || tpl.nome,
        imgPath: normalized.imgPath || tpl.imgPath,
        maxHP: Number(tpl.maxHP),
        attacco: Number(tpl.attacco),
        attaccoSpeciale: Number(tpl.attaccoSpeciale),
        speciale: normalized.speciale || tpl.speciale,
        descrizione: normalized.descrizione || tpl.descrizione
    };
    merged.hp = Math.max(0, Math.min(merged.maxHP, Math.round(merged.maxHP * hpRatio)));
    return merged;
}
function loadRoster() {
        const raw = core.storage.session.getJSON(KEYS.roster, null);
        if (Array.isArray(raw)) {
            return raw.map((item) => reconcileUnitWithCatalog(item));
        }
        if (raw && typeof raw === 'object') {
            return [reconcileUnitWithCatalog(raw)];
        }
        return [reconcileUnitWithCatalog(DEFAULT_UNIT)];
    }

    function saveRoster(roster) {
        if (!Array.isArray(roster) || roster.length === 0) {
            core.storage.session.setJSON(KEYS.roster, [normalizeUnit(DEFAULT_UNIT, DEFAULT_UNIT)]);
            return;
        }
        if (roster.length === 1) {
            core.storage.session.setJSON(KEYS.roster, normalizeUnit(roster[0], DEFAULT_UNIT));
            return;
        }
        core.storage.session.setJSON(KEYS.roster, roster.map((u) => normalizeUnit(u, DEFAULT_UNIT)));
    }

    function swapRoster(roster, a, b) {
        if (!Array.isArray(roster)) {
            return;
        }
        if (a < 0 || b < 0 || a >= roster.length || b >= roster.length) {
            return;
        }
        const temp = roster[a];
        roster[a] = roster[b];
        roster[b] = temp;
    }

    function promoteFirstAlive(roster) {
        if (!Array.isArray(roster) || roster.length === 0) {
            return false;
        }
        const idx = roster.findIndex((unit) => Number(unit.hp) > 0);
        if (idx < 0) {
            return false;
        }
        if (idx > 0) {
            swapRoster(roster, 0, idx);
        }
        return true;
    }

    async function loadRemoteRules(url = 'assets/data/game_rules.json') {
        if (runtime.remoteLoaded) {
            return runtime.rules;
        }
        try {
            const res = await fetch(url);
            if (!res.ok) {
                return runtime.rules;
            }
            const parsed = await res.json();
            if (parsed && typeof parsed === 'object') {
                runtime.rules = {
                    ...runtime.rules,
                    ...parsed,
                    quizQuestionsPerRun: clamp(Number(parsed.quizQuestionsPerRun ?? runtime.rules.quizQuestionsPerRun), 1, 10),
                    quizMinCorrectToWin: clamp(Number(parsed.quizMinCorrectToWin ?? runtime.rules.quizMinCorrectToWin), 1, 10),
                    maxRosterSize: clamp(Number(parsed.maxRosterSize ?? runtime.rules.maxRosterSize), 1, 12)
                };
            }
            runtime.remoteLoaded = true;
        } catch {
            // Silenzioso: fallback a regole default.
        }
        return runtime.rules;
    }

    function getRule(name, fallback = null) {
        if (Object.prototype.hasOwnProperty.call(runtime.rules, name)) {
            return runtime.rules[name];
        }
        return fallback;
    }

    async function preloadImages(paths) {
        if (!Array.isArray(paths) || paths.length === 0) {
            return;
        }
        await Promise.all(paths.map((path) => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = path;
        })));
    }

    function showToast(message, durationMs = 1300) {
        if (!message) {
            return;
        }
        let root = document.getElementById('gc-toast-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'gc-toast-root';
            root.style.position = 'fixed';
            root.style.left = '50%';
            root.style.bottom = '22px';
            root.style.transform = 'translateX(-50%)';
            root.style.zIndex = '9999';
            root.style.pointerEvents = 'none';
            document.body.appendChild(root);
        }

        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.background = 'rgba(0,0,0,0.78)';
        toast.style.color = '#f5deb3';
        toast.style.border = '1px solid rgba(255,170,92,0.5)';
        toast.style.padding = '8px 12px';
        toast.style.borderRadius = '8px';
        toast.style.fontFamily = '"VCR OSD Mono", monospace';
        toast.style.fontSize = '12px';
        toast.style.letterSpacing = '0.5px';
        toast.style.boxShadow = '0 6px 18px rgba(0,0,0,0.35)';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity .15s ease';
        root.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 180);
        }, Math.max(300, durationMs));
    }

    function getCurrentLang() {
        return localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
    }

    function goWithLoading(target, options = {}) {
        // Navigazione unificata: passa sempre da loading.html.
        if (!target || typeof target !== 'string') {
            return;
        }

        const context = {
            target,
            profile: options.profile || 'generic',
            from: options.from || window.location.pathname.split('/').pop() || '',
            createdAt: Date.now()
        };
        sessionStorage.setItem(KEYS.loadingContext, JSON.stringify(context));
        window.location.href = 'loading.html';
    }

    function consumeLoadingContext() {
        const raw = sessionStorage.getItem(KEYS.loadingContext);
        if (!raw) {
            return null;
        }
        sessionStorage.removeItem(KEYS.loadingContext);
        return safeParse(raw, null);
    }

    function getGuideSet() {
        return core.storage.session.getJSON(KEYS.guideSeen, {});
    }

    function getGuideCounterSet() {
        return core.storage.session.getJSON(`${KEYS.guideSeen}_count`, {});
    }

    function markGuideSeen(id) {
        const store = getGuideSet();
        store[id] = true;
        core.storage.session.setJSON(KEYS.guideSeen, store);
    }

    function hasGuideBeenSeen(id) {
        const store = getGuideSet();
        return !!store[id];
    }

    function getGuideShownCount(id) {
        const store = getGuideCounterSet();
        return Number(store[id] || 0);
    }

    function increaseGuideShownCount(id) {
        const store = getGuideCounterSet();
        store[id] = Number(store[id] || 0) + 1;
        core.storage.session.setJSON(`${KEYS.guideSeen}_count`, store);
    }

    function showGuideOnce(config) {
        // Mostra una guida rapida solo al primo accesso della scena.
        // Restituisce una Promise che si risolve alla chiusura (o subito se già vista).
        if (!config || !config.id || hasGuideBeenSeen(config.id)) {
            return Promise.resolve(false);
        }

        const lang = getCurrentLang();
        const title = (config.title && (config.title[lang] || config.title.it)) || 'Guida';
        const lines = (config.lines && (config.lines[lang] || config.lines.it)) || [];
        const buttonLabel = (config.button && (config.button[lang] || config.button.it)) || 'OK';

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '10000';
        overlay.style.background = 'rgba(0,0,0,0.72)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '18px';

        const card = document.createElement('div');
        card.style.width = 'min(92vw, 560px)';
        card.style.background = 'rgba(12, 6, 4, 0.96)';
        card.style.border = '2px solid #a8612b';
        card.style.borderRadius = '12px';
        card.style.padding = '16px';
        card.style.color = '#f5dfbf';
        card.style.fontFamily = '"VCR OSD Mono", monospace';
        card.style.lineHeight = '1.45';

        const h = document.createElement('h3');
        h.textContent = title;
        h.style.margin = '0 0 10px';
        h.style.fontSize = '20px';
        card.appendChild(h);

        lines.forEach((line) => {
            const p = document.createElement('p');
            p.textContent = `- ${line}`;
            p.style.margin = '6px 0';
            p.style.fontSize = '14px';
            card.appendChild(p);
        });

        const btn = document.createElement('button');
        btn.textContent = buttonLabel;
        btn.style.marginTop = '12px';
        btn.style.padding = '10px 14px';
        btn.style.borderRadius = '8px';
        btn.style.border = '2px solid #5f3416';
        btn.style.background = '#2a1409';
        btn.style.color = '#f5dfbf';
        btn.style.fontFamily = '"VCR OSD Mono", monospace';
        btn.style.cursor = 'pointer';

        const guidePromise = new Promise((resolve) => {
            btn.addEventListener('click', () => {
                markGuideSeen(config.id);
                increaseGuideShownCount(config.id);
                overlay.remove();
                resolve(true);
            });
        });

        card.appendChild(btn);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
        return guidePromise;
    }


    function showGuideBubblesOnce(config) {
        // Mostra suggerimenti a fumetto una sola volta per id configurato.
        if (!config || !config.id || hasGuideBeenSeen(config.id)) {
            return;
        }
        const steps = Array.isArray(config.steps) ? config.steps : [];
        if (steps.length === 0) {
            return;
        }

        const lang = getCurrentLang();
        let idx = 0;

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '10001';
        overlay.style.pointerEvents = 'none';

        const bubble = document.createElement('div');
        bubble.className = 'gc-guide-bubble';
        bubble.style.position = 'fixed';
        bubble.style.maxWidth = 'min(86vw, 420px)';
        bubble.style.background = '#fff7e6';
        bubble.style.border = '2px solid #5f3416';
        bubble.style.borderRadius = '16px';
        bubble.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
        bubble.style.padding = '12px 14px';
        bubble.style.color = '#24170e';
        bubble.style.fontFamily = '"VCR OSD Mono", monospace';
        bubble.style.pointerEvents = 'auto';

        const arrow = document.createElement('div');
        arrow.style.position = 'fixed';
        arrow.style.width = '16px';
        arrow.style.height = '16px';
        arrow.style.background = '#fff7e6';
        arrow.style.border = '2px solid #5f3416';
        arrow.style.transform = 'rotate(45deg)';
        arrow.style.boxShadow = '0 6px 14px rgba(0,0,0,0.18)';

        const title = document.createElement('h4');
        title.style.margin = '0 0 8px';
        title.style.fontSize = '15px';

        const img = document.createElement('img');
        img.style.display = 'none';
        img.style.width = '100%';
        img.style.maxHeight = '120px';
        img.style.objectFit = 'contain';
        img.style.marginBottom = '8px';

        const body = document.createElement('p');
        body.style.margin = '0';
        body.style.fontSize = '13px';
        body.style.lineHeight = '1.45';

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.marginTop = '10px';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.pointerEvents = 'auto';

        actions.appendChild(btn);
        bubble.appendChild(title);
        bubble.appendChild(img);
        bubble.appendChild(body);
        bubble.appendChild(actions);
        actions.appendChild(btn);
        overlay.appendChild(bubble);
        overlay.appendChild(arrow);
        document.body.appendChild(overlay);

        function placeNear(selector) {
            const target = selector ? document.querySelector(selector) : null;
            if (!target) {
                bubble.style.left = '50%';
                bubble.style.top = '20px';
                bubble.style.transform = 'translateX(-50%)';
                arrow.style.display = 'none';
                return;
            }

            const r = target.getBoundingClientRect();
            const bw = Math.min(420, Math.floor(window.innerWidth * 0.86));
            const bh = Math.max(110, bubble.offsetHeight || 170);
            const gap = 16;

            const spaces = {
                top: r.top,
                bottom: window.innerHeight - r.bottom,
                left: r.left,
                right: window.innerWidth - r.right
            };

            let side = 'top';
            const order = ['top', 'bottom', 'right', 'left'];
            let best = -1;
            for (const k of order) {
                if (spaces[k] > best) {
                    best = spaces[k];
                    side = k;
                }
            }

            let left = 12;
            let top = 12;

            if (side === 'top') {
                top = Math.max(12, r.top - bh - gap);
                left = Math.min(window.innerWidth - bw - 12, Math.max(12, r.left + (r.width - bw) / 2));
                arrow.style.left = `${Math.min(window.innerWidth - 28, Math.max(14, r.left + r.width / 2 - 8))}px`;
                arrow.style.top = `${top + bh - 10}px`;
            } else if (side === 'bottom') {
                top = Math.min(window.innerHeight - bh - 12, r.bottom + gap);
                left = Math.min(window.innerWidth - bw - 12, Math.max(12, r.left + (r.width - bw) / 2));
                arrow.style.left = `${Math.min(window.innerWidth - 28, Math.max(14, r.left + r.width / 2 - 8))}px`;
                arrow.style.top = `${top - 8}px`;
            } else if (side === 'right') {
                left = Math.min(window.innerWidth - bw - 12, r.right + gap);
                top = Math.min(window.innerHeight - bh - 12, Math.max(12, r.top + (r.height - bh) / 2));
                arrow.style.left = `${left - 8}px`;
                arrow.style.top = `${Math.min(window.innerHeight - 28, Math.max(14, r.top + r.height / 2 - 8))}px`;
            } else {
                left = Math.max(12, r.left - bw - gap);
                top = Math.min(window.innerHeight - bh - 12, Math.max(12, r.top + (r.height - bh) / 2));
                arrow.style.left = `${left + bw - 10}px`;
                arrow.style.top = `${Math.min(window.innerHeight - 28, Math.max(14, r.top + r.height / 2 - 8))}px`;
            }

            bubble.style.left = `${left}px`;
            bubble.style.top = `${top}px`;
            bubble.style.transform = 'none';
            arrow.style.display = '';
        }

        function renderStep() {
            const step = steps[idx] || {};
            const titleMap = step.title || {};
            const textMap = step.text || {};
            title.textContent = titleMap[lang] || titleMap.it || '';
            body.textContent = textMap[lang] || textMap.it || '';
            if (step.image) {
                img.src = step.image;
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
                img.removeAttribute('src');
            }

            requestAnimationFrame(() => {
                placeNear(step.anchor || '');
            });

            btn.textContent = (idx >= steps.length - 1)
                ? ((config.doneLabel && (config.doneLabel[lang] || config.doneLabel.it)) || 'OK')
                : ((config.nextLabel && (config.nextLabel[lang] || config.nextLabel.it)) || 'Avanti');
        }

        btn.addEventListener('click', () => {
            idx += 1;
            if (idx >= steps.length) {
                markGuideSeen(config.id);
                increaseGuideShownCount(config.id);
                overlay.remove();
                return;
            }
            renderStep();
        });

        window.addEventListener('resize', () => {
            if (document.body.contains(overlay)) {
                renderStep();
            }
        });

        renderStep();
    }
    function showGuideTimes(config) {
        // Mostra una guida per un numero limitato di volte (es. prime 2 partite).
        if (!config || !config.id) {
            return;
        }

        const maxTimes = Math.max(1, Number(config.maxTimes || 2));
        if (getGuideShownCount(config.id) >= maxTimes) {
            return;
        }

        const lang = getCurrentLang();
        const title = (config.title && (config.title[lang] || config.title.it)) || 'Guida';
        const lines = (config.lines && (config.lines[lang] || config.lines.it)) || [];
        const buttonLabel = (config.button && (config.button[lang] || config.button.it)) || 'OK';

        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.zIndex = '10000';
        overlay.style.background = 'rgba(0,0,0,0.72)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.padding = '18px';

        const card = document.createElement('div');
        card.style.width = 'min(92vw, 560px)';
        card.style.background = 'rgba(12, 6, 4, 0.96)';
        card.style.border = '2px solid #a8612b';
        card.style.borderRadius = '12px';
        card.style.padding = '16px';
        card.style.color = '#f5dfbf';
        card.style.fontFamily = '"VCR OSD Mono", monospace';
        card.style.lineHeight = '1.45';

        const h = document.createElement('h3');
        h.textContent = title;
        h.style.margin = '0 0 10px';
        h.style.fontSize = '20px';
        card.appendChild(h);

        lines.forEach((line) => {
            const p = document.createElement('p');
            p.textContent = `- ${line}`;
            p.style.margin = '6px 0';
            p.style.fontSize = '14px';
            card.appendChild(p);
        });

        const btn = document.createElement('button');
        btn.textContent = buttonLabel;
        btn.style.marginTop = '12px';
        btn.style.padding = '10px 14px';
        btn.style.borderRadius = '8px';
        btn.style.border = '2px solid #5f3416';
        btn.style.background = '#2a1409';
        btn.style.color = '#f5dfbf';
        btn.style.fontFamily = '"VCR OSD Mono", monospace';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            increaseGuideShownCount(config.id);
            overlay.remove();
        });
        card.appendChild(btn);

        overlay.appendChild(card);
        document.body.appendChild(overlay);
    }

    // ── Sistema di Pausa con controllo volume ──
    function createPauseSystem() {
        // La pagina loading.html ha il suo sistema di pausa separato.
        if (document.title === 'Loading' || window.location.pathname.includes('loading')) {
            return { isPaused: () => false, toggle() {}, show() {}, hide() {} };
        }
        let paused = false;
        let overlay = null;

        function readVolume() {
            try {
                const raw = localStorage.getItem('impostazioni_gioco');
                const parsed = raw ? JSON.parse(raw) : {};
                const v = Number(parsed.volumeMusica);
                return Number.isNaN(v) ? 70 : Math.max(0, Math.min(100, v));
            } catch { return 70; }
        }

        function writeVolume(val) {
            const clamped = Math.max(0, Math.min(100, Math.round(val)));
            if (window.MusicManager?.salvaVolumeMusicaPercentuale) {
                window.MusicManager.salvaVolumeMusicaPercentuale(clamped);
            }
            if (window.MusicManager?.applicaVolumeMediaNellaPagina) {
                window.MusicManager.applicaVolumeMediaNellaPagina();
            }
        }

        function ensureOverlay() {
            if (overlay) { return overlay; }
            overlay = document.createElement('div');
            overlay.id = 'game-pause-overlay';
            overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:9998;align-items:center;justify-content:center;';
            const lang = getCurrentLang();
            const vol = readVolume();
            overlay.innerHTML = `
                <div style="text-align:center;color:#f5e6c8;font-family:'Cinzel',serif;min-width:260px;">
                    <p style="font-size:42px;letter-spacing:3px;margin:0 0 24px;">⏸ PAUSA</p>
                    <div style="margin-bottom:20px;">
                        <label style="display:block;font-size:14px;margin-bottom:8px;opacity:0.8;">${lang === 'en' ? 'Music Volume' : 'Volume Musica'}</label>
                        <input type="range" id="pause-volume" min="0" max="100" value="${vol}" style="width:200px;accent-color:#a86e36;">
                    </div>
                    <p style="font-size:15px;margin-top:8px;opacity:0.6;">${lang === 'en' ? 'Press ESC to resume' : 'Premi ESC per continuare'}</p>
                </div>
            `;
            document.body.appendChild(overlay);
            const slider = overlay.querySelector('#pause-volume');
            if (slider) {
                slider.addEventListener('input', () => { writeVolume(Number(slider.value)); });
            }
            return overlay;
        }

        function show() {
            ensureOverlay();
            const slider = overlay.querySelector('#pause-volume');
            if (slider) { slider.value = readVolume(); }
            overlay.style.display = 'flex';
            paused = true;
        }

        function hide() {
            if (overlay) { overlay.style.display = 'none'; }
            paused = false;
        }

        function toggle() {
            if (paused) { hide(); } else { show(); }
        }

        function isPaused() { return paused; }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggle();
            }
        });

        return { isPaused, toggle, show, hide };
    }

    const core = {
        keys: KEYS,
        storage: {
            local: createStorageDriver(localStorage),
            session: createStorageDriver(sessionStorage)
        },
        units: {
            get defaultUnit() { return DEFAULT_UNIT; },
            normalize: normalizeUnit,
            loadRoster,
            saveRoster,
            swapRoster,
            promoteFirstAlive,
            loadCatalog: loadUnitsCatalog,
            getTemplateBySpecies: getUnitTemplateBySpecies
        },
        rules: {
            defaults: DEFAULT_RULES,
            loadRemote: loadRemoteRules,
            get: getRule
        },
        preload: {
            images: preloadImages
        },
        ui: {
            toast: showToast,
            guideOnce: showGuideOnce,
            guideTimes: showGuideTimes,
            guideBubblesOnce: showGuideBubblesOnce,
            pause: createPauseSystem()
        },
        nav: {
            goWithLoading,
            consumeLoadingContext
        }
    };

    window.GameCore = core;
})();










