// Commento generale file: gestione centralizzata audio/volume e BGM per pagina.
'use strict';

const SETTINGS_KEY = 'impostazioni_gioco';
const DEFAULT_VOLUME_PERCENT = 70;
const VOLUME_EVENT_NAME = 'music-volume-changed';

let musicaPrincipale = null;
let currentTrackPath = '';
let currentContext = '';
let mediaObserver = null;

const BGM_TRACKS = {
    home: 'assets/audio/bgmusic/home-world_bgmusic.mp3',
    porta: 'assets/audio/bgmusic/porta_bgmusic.mp3',
    combat: 'assets/audio/bgmusic/combat_bgmusic.mp3',
    question: 'assets/audio/bgmusic/question_bgmusic.mp3',
    final: 'assets/audio/bgmusic/final_bgmusic.mp3'
};

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function leggiImpostazioni() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) {
            return {};
        }
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return {};
        }
        // Filtra solo le chiavi di impostazione valide.
        const ALLOWED_KEYS = ['volumeMusica'];
        const clean = {};
        ALLOWED_KEYS.forEach((k) => {
            if (parsed[k] !== undefined) {
                clean[k] = parsed[k];
            }
        });
        return clean;
    } catch {
        return {};
    }
}

function salvaImpostazioni(parziali) {
    const correnti = leggiImpostazioni();
    // Mantieni solo le chiavi di impostazione valide, scarta eventuali proprietà estranee.
    const ALLOWED_KEYS = ['volumeMusica'];
    const puliti = {};
    ALLOWED_KEYS.forEach((k) => {
        if (correnti[k] !== undefined) {
            puliti[k] = correnti[k];
        }
    });
    const next = { ...puliti, ...parziali };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

function ottieniVolumeMusicaPercentuale() {
    const settings = leggiImpostazioni();
    const saved = Number(settings.volumeMusica);
    if (Number.isNaN(saved)) {
        return DEFAULT_VOLUME_PERCENT;
    }
    return clamp(Math.round(saved), 0, 100);
}

function salvaVolumeMusicaPercentuale(percentuale) {
    const valore = clamp(Number(percentuale), 0, 100);
    salvaImpostazioni({ volumeMusica: valore });
    // Evento locale: sincronizza subito la pagina corrente.
    window.dispatchEvent(new CustomEvent(VOLUME_EVENT_NAME, { detail: { percent: valore } }));
}

function ottieniVolumeMusicaNormalizzato() {
    return ottieniVolumeMusicaPercentuale() / 100;
}

function applicaVolumeMediaNellaPagina(root = document) {
    const volume = ottieniVolumeMusicaNormalizzato();
    const mediaList = root.querySelectorAll('audio, video');
    mediaList.forEach((media) => {
        media.volume = volume;
    });

    // Assicura che l'oggetto Audio in memoria esista prima di impostare il volume.
    const audio = ensureAudio();
    audio.volume = volume;
}

function ensureAudio() {
    if (!musicaPrincipale) {
        musicaPrincipale = new Audio();
        musicaPrincipale.loop = true;
        musicaPrincipale.preload = 'auto';
    }
    return musicaPrincipale;
}

function detectContextFromPage() {
    const page = (window.location.pathname.split('/').pop() || '').toLowerCase();
    if (page === 'porta.html') {
        return 'porta';
    }
    if (page === 'combat.html') {
        return 'combat';
    }
    if (page === 'question.html') {
        return 'question';
    }
    if (page === 'ending.html') {
        return 'final';
    }
    if (page === 'loading.html') {
        return 'loading';
    }
    return 'home';
}

function getTrackForContext(context) {
    if (context === 'loading') {
        return '';
    }
    return BGM_TRACKS[context] || BGM_TRACKS.home;
}

function setBgmContext(context) {
    const nextContext = context || detectContextFromPage();
    const nextTrack = getTrackForContext(nextContext);
    if (!nextTrack) {
        stopMusica();
        currentTrackPath = '';
        return;
    }
    currentContext = nextContext;

    const audio = ensureAudio();
    if (currentTrackPath !== nextTrack) {
        currentTrackPath = nextTrack;
        audio.src = nextTrack;
    }

    audio.volume = ottieniVolumeMusicaNormalizzato();
    audio.play().catch(() => {
        // Autoplay puo essere bloccato: riproviamo al primo input utente.
    });
}

function riproduciMusica(contesto) {
    setBgmContext(contesto || detectContextFromPage());
}

function stopMusica() {
    if (!musicaPrincipale) {
        return;
    }
    musicaPrincipale.pause();
}


function attachMediaObserver() {
    if (mediaObserver || !document.body || typeof MutationObserver === 'undefined') {
        return;
    }
    mediaObserver = new MutationObserver((mutations) => {
        let changed = false
        for (const m of mutations) {
            if (!m.addedNodes || m.addedNodes.length === 0) {
                continue;
            }
            for (const node of m.addedNodes) {
                if (!node || node.nodeType !== 1) {
                    continue;
                }
                if (node.matches?.('audio, video') || node.querySelector?.('audio, video')) {
                    changed = true;
                    break;
                }
            }
            if (changed) {
                break;
            }
        }
        if (changed) {
            applicaVolumeMediaNellaPagina();
        }
    });
    mediaObserver.observe(document.body, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', () => {
    applicaVolumeMediaNellaPagina();
    attachMediaObserver();
    setBgmContext(detectContextFromPage());

    const unlock = () => {
        if (musicaPrincipale && musicaPrincipale.paused) {
            musicaPrincipale.play().catch(() => {});
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    // Sincronizza volume in tempo reale tra pagine/tab.
    window.addEventListener('storage', (event) => {
        if (event.key === SETTINGS_KEY) {
            applicaVolumeMediaNellaPagina();
        }
    });

    // Sincronizza volume nella stessa pagina dopo cambio slider.
    window.addEventListener(VOLUME_EVENT_NAME, () => {
        applicaVolumeMediaNellaPagina();
    });

    // Hard sync iniziale: copre media create subito dopo il load.
    let syncCount = 0;
    const syncTimer = setInterval(() => {
        applicaVolumeMediaNellaPagina();
        syncCount += 1;
        if (syncCount >= 8) {
            clearInterval(syncTimer);
        }
    }, 500);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            applicaVolumeMediaNellaPagina();
        }
    });
});

window.MusicManager = {
    ottieniVolumeMusicaPercentuale,
    salvaVolumeMusicaPercentuale,
    ottieniVolumeMusicaNormalizzato,
    applicaVolumeMediaNellaPagina,
    riproduciMusica,
    setBgmContext,
    stopMusica
};

