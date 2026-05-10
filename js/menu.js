// Commento generale file: logica principale dello script.
const CORE = window.GameCore || null;

document.addEventListener('DOMContentLoaded', () => {
    const bottoneGioca = document.getElementById('btn-gioca');
    const bottoneImpostazioni = document.getElementById('btn-impostazioni');
    const finestraImpostazioni = document.getElementById('finestra-impostazioni');
    const bottoneChiudiImpostazioni = document.getElementById('btn-chiudi-impostazioni');
    const bottoneCodex = document.getElementById('btn-codex');
    const sliderVolumeMusica = document.getElementById('volume-musica');
    const aggiornaEtichettaBestiario = () => {
        const lang = localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
        bottoneCodex.textContent = lang === 'en' ? 'Bestiary' : 'Bestiario';
    };
    aggiornaEtichettaBestiario();
    window.addEventListener('lingua-cambiata', aggiornaEtichettaBestiario);

    bottoneGioca.addEventListener('click', () => {
        if (CORE?.nav?.goWithLoading) {
            CORE.nav.goWithLoading('selva_oscura.html', { profile: 'intro', from: 'index.html' });
            return;
        }
        window.location.href = 'loading.html';
    });

    bottoneImpostazioni.addEventListener('click', () => {
        finestraImpostazioni.classList.remove('nascosto');
    });

    bottoneChiudiImpostazioni.addEventListener('click', () => {
        finestraImpostazioni.classList.add('nascosto');
    });

    bottoneCodex.addEventListener('click', () => {
        window.Bestiario?.open?.(0);
    });

    caricaImpostazioni(sliderVolumeMusica);
    sliderVolumeMusica.addEventListener('input', function sliderInputHandler() {
        const vol = parseInt(this.value, 10);
        if (Number.isNaN(vol)) return;

        // Salva SEMPRE direttamente su localStorage.
        const settingsKey = CORE?.keys?.settings || 'impostazioni_gioco';
        let existing = {};
        try { existing = JSON.parse(localStorage.getItem(settingsKey) || '{}'); } catch { existing = {}; }
        existing.volumeMusica = vol;
        localStorage.setItem(settingsKey, JSON.stringify(existing));

        // Applica volume direttamente all'Audio interno del MusicManager.
        if (window.MusicManager?.salvaVolumeMusicaPercentuale) {
            window.MusicManager.salvaVolumeMusicaPercentuale(vol);
        }
        // Forza applicazione volume a TUTTI gli audio (DOM + interni).
        if (window.MusicManager?.applicaVolumeMediaNellaPagina) {
            window.MusicManager.applicaVolumeMediaNellaPagina();
        }
        // Assicura che il BGM stia riproducendo (autoplay potrebbe essere bloccato).
        if (window.MusicManager?.riproduciMusica) {
            window.MusicManager.riproduciMusica('home');
        }
    });

    animazioneIdle(document.getElementById('menu-dante'), 'assets/img/personaggi/dante_spritesheet/Dante_idle_frames/', 12, 95);
    animazioneIdle(document.getElementById('menu-virgilio'), 'assets/img/personaggi/virgilio_spritesheet/Virgilio_idle_frames/', 12, 115);

    // Avvia BGM home rispettando il volume globale salvato.
    // MusicManager si inizializza autonomamente nel suo DOMContentLoaded.
    // Qui sincronizziamo solo se e gia disponibile.
    if (window.MusicManager?.setBgmContext) {
        window.MusicManager.setBgmContext('home');
        window.MusicManager.applicaVolumeMediaNellaPagina();
    }
});

function caricaImpostazioni(sliderMusica) {
    const settingsKey = CORE?.keys?.settings || 'impostazioni_gioco';
    try {
        const raw = localStorage.getItem(settingsKey);
        if (!raw) return;
        const dati = JSON.parse(raw);
        const vol = Number(dati?.volumeMusica);
        if (!Number.isNaN(vol)) {
            sliderMusica.value = String(vol);
        }
    } catch {
        // Ignora dati corrotti.
    }
}


function animazioneIdle(imgEl, folder, count, speed) {
    if (!imgEl) {
        return;
    }
    let frame = 0;
    setInterval(() => {
        imgEl.src = `${folder}frame_${String(frame).padStart(3, '0')}.png`;
        frame = (frame + 1) % count;
    }, speed);
}



