// Commento generale file: gestione lingua globale del progetto.
// js/lingua.js

// Dizionario corrente e codice lingua attivo.
let dizionarioLingua = {};
let linguaCorrente = 'it';

/**
 * Inizializza il sistema di lingua quando il DOM e pronto.
 */
document.addEventListener('DOMContentLoaded', () => {
    const linguaSalvata = localStorage.getItem('lingua_gioco');
    if (linguaSalvata === 'it' || linguaSalvata === 'en') {
        linguaCorrente = linguaSalvata;
    }

    caricaLingua(linguaCorrente);
    inizializzaPulsantiLingua();
});

/**
 * Carica il file JSON della lingua scelta e aggiorna i testi.
 * @param {string} codiceLingua - Codice lingua (it/en).
 */
function caricaLingua(codiceLingua) {
    const percorso = `assets/data/lingue/${codiceLingua}.json`;

    fetch(percorso)
        .then((risposta) => risposta.json())
        .then((dati) => {
            dizionarioLingua = dati;
            linguaCorrente = codiceLingua;
            localStorage.setItem('lingua_gioco', codiceLingua);
            aggiornaTestiPagina();

            // Evento utile per gli script che devono reagire al cambio lingua.
            window.dispatchEvent(new CustomEvent('lingua-cambiata', { detail: { lingua: codiceLingua } }));
        })
        .catch((errore) => {
            console.error('Errore nel caricamento della lingua:', errore);
        });
}

/**
 * Applica i testi tradotti agli elementi marcati nella pagina.
 */
function aggiornaTestiPagina() {
    const elementiTesto = document.querySelectorAll('[data-i18n]');
    const elementiHtml = document.querySelectorAll('[data-i18n-html]');
    const elementiAria = document.querySelectorAll('[data-i18n-aria-label]');

    elementiTesto.forEach((elemento) => {
        const chiave = elemento.getAttribute('data-i18n');
        const testo = dizionarioLingua[chiave];
        if (typeof testo === 'string') {
            elemento.textContent = testo;
        }
    });

    elementiHtml.forEach((elemento) => {
        const chiave = elemento.getAttribute('data-i18n-html');
        const testo = dizionarioLingua[chiave];
        if (typeof testo === 'string') {
            elemento.innerHTML = testo;
        }
    });

    elementiAria.forEach((elemento) => {
        const chiave = elemento.getAttribute('data-i18n-aria-label');
        const testo = dizionarioLingua[chiave];
        if (typeof testo === 'string') {
            elemento.setAttribute('aria-label', testo);
        }
    });

    document.documentElement.lang = linguaCorrente;
    aggiornaStatoPulsanti();
}

/**
 * Collega i pulsanti lingua presenti (solo index, quando disponibili).
 */
function inizializzaPulsantiLingua() {
    const pulsantiLingua = document.querySelectorAll('.lang-btn');
    pulsantiLingua.forEach((pulsante) => {
        pulsante.addEventListener('click', () => {
            const nuovaLingua = pulsante.getAttribute('data-lang');
            if (nuovaLingua && nuovaLingua !== linguaCorrente) {
                caricaLingua(nuovaLingua);
            }
        });
    });
    aggiornaStatoPulsanti();
}

/**
 * Evidenzia il pulsante lingua attivo quando presente nella pagina.
 */
function aggiornaStatoPulsanti() {
    const pulsantiLingua = document.querySelectorAll('.lang-btn');
    pulsantiLingua.forEach((pulsante) => {
        const isActive = pulsante.getAttribute('data-lang') === linguaCorrente;
        pulsante.classList.toggle('active', isActive);
        pulsante.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}
