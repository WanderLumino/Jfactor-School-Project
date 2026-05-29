// Commento generale file: logica principale dello script.
'use strict';

const CORE = window.GameCore || null;

// Testo integrale intro per allineamento completo con audio iniziale.
const DEFAULT_INTRO_LINES = [
    "Nel mezzo del cammin di nostra vita",
    "mi ritrovai per una selva oscura,",
    "ché la diritta via era smarrita.",
    "",
    "Ahi quanto a dir qual era è cosa dura",
    "esta selva selvaggia e aspra e forte",
    "che nel pensier rinova la paura!",
    "",
    "Tant’è amara che poco è più morte;",
    "ma per trattar del ben ch’i’ vi trovai,",
    "dirò de l’altre cose ch’i’ v’ho scorte."
];

const output = document.getElementById('typewriter');
const skipBtn = document.getElementById('skip-btn');
const audio = document.getElementById('audio');
const puntini = document.getElementById('puntini');
const chapterLabel = document.getElementById('loading-chapter-label');

// Blocco immediato di eventuale musica pagina precedente: nel loading resta solo la traccia locale.
window.MusicManager?.stopMusica?.();

const dots = ['.', '..', '...'];
const INTRO_AUDIO_DURATION_SEC = 30;
const INTERMEDIATE_TARGET_MS = 5000;
function readGlobalMusicVolume() {
    // Legge volume globale: prima dal manager, poi da localStorage.
    if (window.MusicManager && typeof window.MusicManager.ottieniVolumeMusicaNormalizzato === 'function') {
        return window.MusicManager.ottieniVolumeMusicaNormalizzato();
    }
    try {
        const raw = localStorage.getItem('impostazioni_gioco');
        const parsed = raw ? JSON.parse(raw) : {};
        const value = Number(parsed.volumeMusica);
        if (!Number.isNaN(value)) {
            return Math.max(0, Math.min(1, value / 100));
        }
    } catch {
    }
    return 0.7;
}

let dotsIndex = 0;
let skipShown = false;
let navigationStarted = false;
let textIndex = 0;
let charIndex = 0;
let writtenChars = 0;
let writeSpeedMs = 42;
let lines = [...DEFAULT_INTRO_LINES];
let loadingContext = null;
let activeCircle = 0;
let activeCantoLabel = '';
let paused = false;

function getLang() {
    return localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
}

function isIntroProfile() {
    return (loadingContext?.profile || 'intro') === 'intro';
}

function getLinePauseMs() {
    return isIntroProfile() ? 400 : 70;
}

function getFinishDelayMs(skipImmediate) {
    if (skipImmediate) {
        return 0;
    }
    // Pausa finale morbida tra 0.5s e 0.8s dopo l'ultima riga.
    return 1500 + Math.floor(Math.random() * 301);
}

function getCircleDepth() {
    const targetKey = CORE?.keys?.targetCircle || 'cerchio_destinazione';
    const currentKey = CORE?.keys?.currentCircle || 'cerchio_corrente';

    const t = Number(localStorage.getItem(targetKey));
    if (!Number.isNaN(t) && t > 0) {
        return t;
    }

    const c = Number(localStorage.getItem(currentKey));
    if (!Number.isNaN(c) && c >= 0) {
        return c;
    }

    return 0;
}

function getQuoteKeyForCircle(circle) {
    if (circle <= 0) {
        return 'antinferno';
    }
    if (circle >= 1 && circle <= 9) {
        return `cerchio_${circle}`;
    }
    return 'finale';
}

function getFallbackCantoLabel(circle) {
    // Fallback se il file citazioni non contiene metadati canto.
    const lang = getLang();
    if (circle <= 0) {
        return lang === 'en' ? 'Canto III' : 'Canto III';
    }
    return `Canto ${circle}`;
}

function updateChapterLabel() {
    if (!chapterLabel) {
        return;
    }

    if (activeCantoLabel) {
        chapterLabel.textContent = activeCantoLabel;
        return;
    }

    chapterLabel.textContent = getFallbackCantoLabel(activeCircle);
}

function normalizeLinesNode(node, lang) {
    if (!node) {
        return [];
    }

    if (Array.isArray(node)) {
        return node;
    }

    if (typeof node === 'object') {
        const list = node[lang] || node.it || node.en || [];
        return Array.isArray(list) ? list : [];
    }

    return [];
}

function normalizeQuoteEntry(entry, key, lang) {
    // Supporta sia il vecchio formato (array) sia il nuovo formato con metadati canto.
    if (!entry) {
        return { lines: [], canto: '' };
    }

    if (Array.isArray(entry)) {
        return {
            lines: [...entry],
            canto: key === 'intro'
                ? (lang === 'en' ? 'Canto I (First Canto)' : 'Canto I (Canto Primo)')
                : ''
        };
    }

    if (typeof entry === 'object') {
        const linesNode = entry.lines || entry.versi || entry.text || [];
        const parsedLines = normalizeLinesNode(linesNode, lang);
        const cantoNode = entry.canto || null;
        const canto = (cantoNode && typeof cantoNode === 'object')
            ? (cantoNode[lang] || cantoNode.it || cantoNode.en || '')
            : (typeof cantoNode === 'string' ? cantoNode : '');

        return { lines: parsedLines, canto };
    }

    return { lines: [], canto: '' };
}

async function readQuotesPayload() {
    // Sorgente unica delle citazioni: manteniamo solo il file con accenti originali.
    try {
        const response = await fetch('assets/data/citazioni.json');
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        if (data && typeof data === 'object') {
            return data;
        }
    } catch {
        // In caso di errore verranno usate le frasi fallback locali.
    }
    return null;
}

async function resolveQuoteContent(profile, circle) {
    const lang = getLang();
    const payload = await readQuotesPayload();

    if (!payload || typeof payload !== 'object') {
        return {
            lines: profile === 'intro' ? [...DEFAULT_INTRO_LINES] : [],
            canto: profile === 'intro' ? (lang === 'en' ? 'Canto I (First Canto)' : 'Canto I (Canto Primo)') : ''
        };
    }

    if (profile === 'intro') {
        const parsedIntro = normalizeQuoteEntry(payload.intro, 'intro', lang);
        return {
            lines: parsedIntro.lines.length > 0 ? parsedIntro.lines : [...DEFAULT_INTRO_LINES],
            canto: parsedIntro.canto || (lang === 'en' ? 'Canto I (First Canto)' : 'Canto I (Canto Primo)')
        };
    }

    const key = getQuoteKeyForCircle(circle);
    const parsed = normalizeQuoteEntry(payload[key], key, lang);
    return {
        lines: parsed.lines,
        canto: parsed.canto
    };
}

function getNavigationTarget() {
    if (loadingContext && typeof loadingContext.target === 'string' && loadingContext.target.trim()) {
        return loadingContext.target;
    }
    return 'selva_oscura.html';
}

function showSkipIfNeeded() {
    if (skipShown) {
        return;
    }

    const totalChars = lines.join('').length;
    if (writtenChars >= Math.floor(totalChars / 2)) {
        skipShown = true;
        if (skipBtn) {
            skipBtn.classList.remove('nascosto');
        }
    }
}

function finishLoading(skipImmediate) {
    if (navigationStarted) {
        return;
    }
    navigationStarted = true;

    if (skipBtn) {
        skipBtn.classList.add('nascosto');
    }

    setTimeout(() => {
        window.location.href = getNavigationTarget();
    }, getFinishDelayMs(skipImmediate));
}

function typeWriter() {
    if (navigationStarted) {
        return;
    }

    if (paused) {
        setTimeout(typeWriter, 200);
        return;
    }

    if (!output) {
        finishLoading(true);
        return;
    }

    const currentText = lines[textIndex] || '';
    if (charIndex < currentText.length) {
        output.textContent += currentText.charAt(charIndex);
        charIndex += 1;
        writtenChars += 1;
        showSkipIfNeeded();
        setTimeout(typeWriter, writeSpeedMs);
        return;
    }

    setTimeout(() => {
        if (navigationStarted) {
            return;
        }

        if (paused) {
            typeWriter();
            return;
        }

        textIndex += 1;
        charIndex = 0;

        if (textIndex < lines.length) {
            output.textContent += '\n';
            typeWriter();
            return;
        }

        finishLoading(false);
    }, getLinePauseMs());
}

function startDotAnimation() {
    setInterval(() => {
        dotsIndex = (dotsIndex + 1) % dots.length;
        if (puntini) {
            puntini.textContent = dots[dotsIndex];
        }
    }, 700);
}

function computeFastWriteSpeed() {
    const totalChars = Math.max(1, lines.join('\n').length);
    const pauseBudget = Math.max(0, lines.length - 1) * getLinePauseMs();
    const writeBudget = Math.max(900, INTERMEDIATE_TARGET_MS - pauseBudget);
    return Math.max(8, Math.round(writeBudget / totalChars));
}

async function initLoadingContent() {
    loadingContext = CORE?.nav?.consumeLoadingContext?.() || null;
    const profile = loadingContext?.profile || 'intro';
    activeCircle = getCircleDepth();

    const quoteContent = await resolveQuoteContent(profile, activeCircle);
    if (Array.isArray(quoteContent.lines) && quoteContent.lines.length > 0) {
        lines = quoteContent.lines;
    }
    activeCantoLabel = quoteContent.canto || '';

    updateChapterLabel();

    // Intro sincronizzato all'audio; i passaggi intermedi durano circa 5 secondi.
    if (profile === 'intro') {
        const totalChars = Math.max(1, lines.join('').length);
        writeSpeedMs = Math.max(45, Math.round((INTRO_AUDIO_DURATION_SEC * 780) / totalChars));
    } else {
        writeSpeedMs = 80;
    }
}

window.addEventListener('load', async () => {
    // Nel loading fermiamo ogni BGM globale: resta solo la traccia voce intro quando prevista.
    window.MusicManager?.stopMusica?.();
    startDotAnimation();
    await initLoadingContent();

    if (skipBtn) {
        skipBtn.classList.remove('nascosto');
        skipShown = true;
    }

    if (CORE?.preload?.images) {
        CORE.preload.images([
            'assets/img/mappe/selva_oscura.png',
            'assets/img/mappe/porta_antinferno.png',
            'assets/img/mappe/lava_inferno_base.png'
        ]);
    }

    // Audio solo nel primo loading iniziale.
    if (audio) {
        if (isIntroProfile()) {
            audio.volume = readGlobalMusicVolume();
            audio.play().catch(() => {
                // Alcuni browser bloccano autoplay: non fermiamo il caricamento.
            });
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', () => finishLoading(true));
    }

    const pauseVolumeSlider = document.getElementById('pause-volume-loading');
    if (pauseVolumeSlider) {
        const initVol = (() => {
            try {
                const raw = localStorage.getItem('impostazioni_gioco');
                const parsed = raw ? JSON.parse(raw) : {};
                const v = Number(parsed.volumeMusica);
                return Number.isNaN(v) ? 70 : Math.max(0, Math.min(100, v));
            } catch { return 70; }
        })();
        pauseVolumeSlider.value = initVol;
        pauseVolumeSlider.addEventListener('input', () => {
            const val = Math.max(0, Math.min(100, Number(pauseVolumeSlider.value)));
            if (window.MusicManager?.salvaVolumeMusicaPercentuale) {
                window.MusicManager.salvaVolumeMusicaPercentuale(val);
            }
            if (window.MusicManager?.applicaVolumeMediaNellaPagina) {
                window.MusicManager.applicaVolumeMediaNellaPagina();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !navigationStarted) {
            paused = !paused;
            const pauseOverlay = document.getElementById('pause-overlay');
            if (pauseOverlay) {
                if (paused && pauseVolumeSlider) {
                    try {
                        const raw = localStorage.getItem('impostazioni_gioco');
                        const parsed = raw ? JSON.parse(raw) : {};
                        const v = Number(parsed.volumeMusica);
                        pauseVolumeSlider.value = Number.isNaN(v) ? 70 : Math.max(0, Math.min(100, v));
                    } catch { /* ignore */ }
                }
                pauseOverlay.style.display = paused ? 'flex' : 'none';
            }
            if (audio && isIntroProfile()) {
                if (paused) {
                    audio.pause();
                } else {
                    audio.play().catch(() => {});
                }
            }
        }
    });

    typeWriter();
});








