// Commento generale file: logica principale dello script.
'use strict';

// Chiavi di stato condivise con mappa/combat.
const STORAGE_KEYS = {
    roster: 'dannato_schierato',
    encounter: 'encounter_context',
    result: 'encounter_result',
    defeated: 'encounter_enemy_id'
};

const PLAYER_IDLE_MAP = {
    leone: 'assets/img/bestie/leone_idle_frames/',
    lonza: 'assets/img/bestie/lonza_idle_frames/',
    lupa: 'assets/img/bestie/lupa_idle_frames/'
};


const ENEMY_IDLE_WATCHER_MAP = {
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
const CORE = window.GameCore || null;
let QUIZ_TOTAL = 3;
let QUIZ_MIN_WIN = 2;
let I18N = {};

const FINAL_QUESTION_TIME = 15;

const dom = {
    progress: document.getElementById('progress'),
    score: document.getElementById('score'),
    tension: document.getElementById('tensione-indicatore'),
    countdown: document.getElementById('countdown-indicatore'),
    questionText: document.getElementById('question-text'),
    optionList: document.getElementById('option-list'),
    helperText: document.getElementById('helper-text'),
    btnTranslate: document.getElementById('btn-translate'),
    btnHint: document.getElementById('btn-hint'),
    questionCard: document.querySelector('.question-card'),
    resultCard: document.getElementById('result-card'),
    resultTitle: document.getElementById('result-title'),
    resultScore: document.getElementById('result-score'),
    resultDetail: document.getElementById('result-detail'),
    recruitActions: document.getElementById('recruit-actions'),
    btnReturn: document.getElementById('btn-return'),
    reserveModal: document.getElementById('reserve-modal'),
    reserveList: document.getElementById('reserve-list'),
    gameoverOverlay: document.getElementById('gameover-overlay'),
    judgementOverlay: document.getElementById('judgement-overlay'),
    judgementText: document.getElementById('judgement-text'),
    watcherDante: document.getElementById('watcher-dante'),
    watcherVirgilio: document.getElementById('watcher-virgilio'),
    watcherAlly: document.getElementById('watcher-ally'),
    watcherEnemy: document.getElementById('watcher-enemy'),
    btnCodex: document.getElementById('btn-bestiario-q')
};

const state = {
    toastNodes: [],
    allQuestions: [],
    selected: [],
    index: 0,
    correct: 0,
    helpUsed: false,
    selectingReserve: false,
    encounter: null,
    roster: [],
    resolvingAnswer: false,
    countdownSeconds: 0,
    countdownTimer: null,
    audioContext: null,
    anim: {
        dante: [],
        virgilio: [],
        ally: [],
        enemy: [],
        frame: 0,
        timer: 0,
        last: 0
    }
};

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

function tQ(key, fallback, vars = {}) {
    const base = I18N[key] || fallback;
    return Object.keys(vars).reduce((acc, name) => acc.replace(`{${name}}`, String(vars[name])), base);
}

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

function normalizeUnit(unit) {
    if (CORE?.units?.normalize) {
        return CORE.units.normalize(unit);
    }

    const source = unit && typeof unit === 'object' ? unit : {};
    return {
        nome: source.nome || 'Dannato',
        specie: source.specie || source.tipo || 'leone',
        imgPath: source.imgPath || 'assets/img/bestie/leone_idle_frames/frame_000.png',
        maxHP: Number(source.maxHP ?? 100),
        hp: Number(source.hp ?? source.maxHP ?? 100),
        attacco: Number(source.attacco ?? 16),
        speciale: source.speciale || source.skill || 'Colpo Infernale',
        attaccoSpeciale: Number(source.attaccoSpeciale ?? 22),
        descrizione: source.descrizione || 'Un dannato pronto a combattere.'
    };
}

function loadRoster() {
    if (CORE?.units?.loadRoster) {
        return CORE.units.loadRoster();
    }

    const raw = loadJSON(STORAGE_KEYS.roster, null);
    if (Array.isArray(raw)) {
        return raw.map((unit) => normalizeUnit(unit));
    }
    if (raw && typeof raw === 'object') {
        return [normalizeUnit(raw)];
    }
    return [normalizeUnit(CORE?.units?.getTemplateBySpecies ? CORE.units.getTemplateBySpecies('leone') : { specie: 'leone' })];
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

function createFallbackUnit() {
    // Unita di sicurezza per evitare game over immediato causato da dati corrotti.
    const fallback = CORE?.units?.getTemplateBySpecies ? CORE.units.getTemplateBySpecies('leone') : { specie: 'leone' };
    fallback.descrizione = currentLang() === 'en' ? 'Emergency companion to continue the journey.' : 'Compagno di emergenza per continuare il viaggio.';
    return normalizeUnit(fallback);
}

function isFinalBossEncounter() {
    const specie = String(state.encounter?.enemy?.specie || '').toLowerCase();
    return specie === 'traditore';
}

function goToPorta() {
    if (CORE?.nav?.goWithLoading) {
        CORE.nav.goWithLoading('porta.html', { profile: 'generic', from: 'question.html' });
    } else {
        window.location.href = 'porta.html';
    }
}

function goToEnding() {
    if (CORE?.nav?.goWithLoading) {
        CORE.nav.goWithLoading('ending.html', { profile: 'boss', from: 'question.html' });
    } else {
        window.location.href = 'ending.html';
    }
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

function ensureUsableRosterOnEnter() {
    // In ingresso a question non vogliamo game over immediato.
    if (!Array.isArray(state.roster) || state.roster.length === 0) {
        state.roster = [createFallbackUnit()];
        saveRoster();
        return;
    }

    if (promoteFirstAliveToFront()) {
        return;
    }

    state.roster[0] = normalizeUnit(state.roster[0]);
    state.roster[0].hp = Math.max(1, Number(state.roster[0].maxHP) || 100);
    saveRoster();
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

function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function getTensionLabel() {
    if (state.index <= 0) {
        return currentLang() === 'en' ? 'Tension: LOW' : 'Tensione: BASSA';
    }
    if (state.index === 1) {
        return currentLang() === 'en' ? 'Tension: MEDIUM' : 'Tensione: MEDIA';
    }
    return currentLang() === 'en' ? 'Tension: CRITICAL' : 'Tensione: CRITICA';
}

function updateCountdownLabel() {
    if (state.index !== QUIZ_TOTAL - 1 || state.countdownSeconds <= 0) {
        dom.countdown.classList.add('hidden');
        return;
    }

    const label = currentLang() === 'en' ? 'Time' : 'Tempo';
    dom.countdown.textContent = `${label}: ${state.countdownSeconds}`;
    dom.countdown.classList.remove('hidden');
}

function updateHeader() {
    dom.progress.textContent = tQ('question_progress_runtime', 'Domanda {CURRENT} / {TOTAL}', {
        CURRENT: state.index + 1,
        TOTAL: QUIZ_TOTAL
    });
    dom.score.textContent = tQ('question_score_runtime', 'Corrette: {COUNT}', {
        COUNT: state.correct
    });
    dom.tension.textContent = getTensionLabel();
    updateCountdownLabel();
}

// Cambia palette/atmosfera in base alla domanda corrente.
function applyQuestionStage() {
    document.body.classList.remove('stage-cyan', 'stage-orange', 'stage-red', 'flame-medium', 'flame-strong', 'stage-critical');

    if (state.index <= 0) {
        document.body.classList.add('stage-cyan');
        return;
    }

    if (state.index === 1) {
        document.body.classList.add('stage-orange', 'flame-medium');
        return;
    }

    document.body.classList.add('stage-red', 'flame-strong', 'stage-critical');
}

function getMusicVolumeRatio() {
    // Usa il volume globale impostato nel menu (0..1).
    if (window.MusicManager?.ottieniVolumeMusicaNormalizzato) {
        return Math.max(0, Math.min(1, Number(window.MusicManager.ottieniVolumeMusicaNormalizzato()) || 0));
    }
    try {
        const raw = localStorage.getItem('impostazioni_gioco');
        const parsed = raw ? JSON.parse(raw) : {};
        const n = Number(parsed.volumeMusica);
        if (!Number.isNaN(n)) {
            return Math.max(0, Math.min(1, n / 100));
        }
    } catch {}
    return 0.7;
}

function getAudioContext() {
    if (state.audioContext) {
        return state.audioContext;
    }

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
        return null;
    }

    try {
        state.audioContext = new Ctx();
        return state.audioContext;
    } catch {
        return null;
    }
}

function playHeartbeat(volume = 0.08) {
    // Battito sintetico leggero per la domanda finale.
    const ctx = getAudioContext();
    if (!ctx) {
        return;
    }

    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const emitBeat = (at, freq, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, at);
        gain.gain.setValueAtTime(0, at);
        const scaled = Math.max(0, Math.min(1, volume * getMusicVolumeRatio()));
        gain.gain.linearRampToValueAtTime(scaled, at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, at + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(at);
        osc.stop(at + duration + 0.02);
    };

    emitBeat(now, 90, 0.1);
    emitBeat(now + 0.14, 70, 0.12);
}

function stopCountdown() {
    if (state.countdownTimer) {
        clearInterval(state.countdownTimer);
        state.countdownTimer = null;
    }
    state.countdownSeconds = 0;
    updateCountdownLabel();
}

function startFinalCountdown() {
    if (state.index !== QUIZ_TOTAL - 1) {
        stopCountdown();
        return;
    }

    stopCountdown();
    state.countdownSeconds = FINAL_QUESTION_TIME;
    updateCountdownLabel();

    state.countdownTimer = setInterval(() => {
        if (CORE?.ui?.pause?.isPaused()) { return; }
        if (state.resolvingAnswer) {
            stopCountdown();
            return;
        }

        state.countdownSeconds -= 1;
        if (state.countdownSeconds <= 0) {
            stopCountdown();
            submitAnswer(-1, true);
            return;
        }

        if (state.countdownSeconds <= 10) {
            const volume = state.countdownSeconds <= 5 ? 0.14 : 0.08;
            playHeartbeat(volume);
        }

        updateCountdownLabel();
    }, 1000);
}



function ensureQuestionToastRoot() {
    let root = document.getElementById('question-toast-root');
    if (root) {
        return root;
    }
    root = document.createElement('div');
    root.id = 'question-toast-root';
    document.body.appendChild(root);
    return root;
}

function showQuestionBubble(message, kind = 'ok', duration = 1450) {
    const root = ensureQuestionToastRoot();
    const bubble = document.createElement('div');
    bubble.className = 'q-toast ' + (kind === 'bad' ? 'bad' : 'ok');
    bubble.textContent = String(message || '');
    root.appendChild(bubble);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const xMin = Math.floor(vw * 0.16);
    const xMax = Math.floor(vw * 0.78);
    const yMin = Math.floor(vh * 0.22);
    const yMax = Math.floor(vh * 0.74);

    const x = xMin + Math.floor(Math.random() * Math.max(1, (xMax - xMin)));
    const y = yMin + Math.floor(Math.random() * Math.max(1, (yMax - yMin)));
    bubble.style.left = x + 'px';
    bubble.style.top = y + 'px';

    requestAnimationFrame(() => bubble.classList.add('show'));

    setTimeout(() => {
        bubble.classList.remove('show');
        setTimeout(() => {
            if (bubble.parentElement) {
                bubble.parentElement.removeChild(bubble);
            }
        }, 240);
    }, duration);
}
function getJudgementLabel(isCorrect, timedOut) {
    // Etichetta cinematografica usata tra una domanda e la successiva.
    if (timedOut) {
        return currentLang() === 'en' ? 'TIME OVER' : 'TEMPO SCADUTO';
    }
    return isCorrect
        ? (currentLang() === 'en' ? 'CORRECT' : 'CORRETTO')
        : (currentLang() === 'en' ? 'WRONG' : 'ERRATO');
}

function buildRoundStatusText() {
    // Testo breve di riepilogo per mostrare subito punteggio e domande rimanenti.
    const answered = Math.min(state.index + 1, QUIZ_TOTAL);
    const remaining = Math.max(0, QUIZ_TOTAL - answered);
    if (currentLang() === 'en') {
        return `Score: ${state.correct}/${answered}. Remaining: ${remaining}.`;
    }
    return `Punteggio: ${state.correct}/${answered}. Restanti: ${remaining}.`;
}

function buildFinalSummaryText() {
    // Riepilogo finale visibile prima dell'esito (vittoria/sconfitta).
    if (currentLang() === 'en') {
        return `Final score: ${state.correct}/${QUIZ_TOTAL}.`;
    }
    return `Punteggio finale: ${state.correct}/${QUIZ_TOTAL}.`;
}
function showJudgement(text, duration = 900) {
    return new Promise((resolve) => {
        dom.judgementText.textContent = text;
        dom.judgementOverlay.classList.remove('hidden');
        setTimeout(() => {
            dom.judgementOverlay.classList.add('hidden');
            resolve(true);
        }, duration);
    });
}

function renderQuestion() {
    updateHeader();
    applyQuestionStage();
    state.helpUsed = false;
    state.resolvingAnswer = false;

    dom.btnTranslate.disabled = false;
    dom.btnHint.disabled = false;
    dom.helperText.textContent = '';

    const question = state.selected[state.index];
    dom.questionText.textContent = question.question_en;

    dom.optionList.innerHTML = '';
    question.choices.forEach((choice, choiceIndex) => {
        const button = document.createElement('button');
        button.textContent = `${String.fromCharCode(65 + choiceIndex)}. ${choice}`;
        button.addEventListener('click', () => submitAnswer(choiceIndex, false));
        dom.optionList.appendChild(button);
    });

    startFinalCountdown();
}

async function submitAnswer(choiceIndex, timedOut) {
    if (state.resolvingAnswer) {
        return;
    }
    state.resolvingAnswer = true;
    stopCountdown();

    const question = state.selected[state.index];
    const buttons = Array.from(dom.optionList.querySelectorAll('button'));

    buttons.forEach((button) => {
        button.disabled = true;
    });

    const isCorrect = choiceIndex === question.correct_index;
    if (isCorrect) {
        state.correct += 1;
        if (buttons[choiceIndex]) {
            buttons[choiceIndex].classList.add('correct');
        }
    } else {
        if (choiceIndex >= 0 && buttons[choiceIndex]) {
            buttons[choiceIndex].classList.add('wrong');
        }
        if (buttons[question.correct_index]) {
            buttons[question.correct_index].classList.add('correct');
        }
        if (timedOut) {
            dom.helperText.textContent = currentLang() === 'en'
                ? 'Time is over. The enemy takes advantage.'
                : 'Tempo scaduto. Il nemico approfitta della tua esitazione.';
        }
    }

    updateHeader();

    const giudizio = getJudgementLabel(isCorrect, timedOut);


    await showJudgement(giudizio, 900);

    state.index += 1;
    if (state.index < QUIZ_TOTAL) {
        renderQuestion();
        return;
    }

    await finishQuiz();
}

function addEnemyToRoster() {
    const raw = state.encounter?.enemy || { nome: 'Dannato Errante', specie: 'dannato' };
    let enemy = normalizeUnit(raw);

    // Allinea al catalogo centralizzato.
    if (CORE?.units?.reconcileWithCatalog) {
        enemy = CORE.units.reconcileWithCatalog(enemy);
    }

    const maxSize = CORE?.rules?.get?.('maxRosterSize', 6) || 6;
    if (state.roster.length < maxSize) {
        state.roster.push(enemy);
    } else {
        // Non sostituire il dannato attivo (index 0) se ci sono riserve.
        let weakestIndex = 1;
        for (let i = 2; i < state.roster.length; i++) {
            if (state.roster[i].maxHP < state.roster[weakestIndex].maxHP) {
                weakestIndex = i;
            }
        }
        state.roster[weakestIndex] = enemy;
    }

    saveRoster();
}

function triggerGameOver() {
    // Mostra Game Over quando non ci sono piu dannati disponibili.
    dom.reserveModal.classList.add('hidden');
    dom.recruitActions.classList.add('hidden');
    dom.btnReturn.classList.add('hidden');

    if (dom.gameoverOverlay) {
        dom.gameoverOverlay.classList.remove('hidden');
    }

    CORE?.ui?.toast?.(tQ('question_toast_no_reserve', 'Nessun dannato disponibile: GAME OVER'));

    setTimeout(() => {
        // Pulisci dati di sessione prima di tornare al menu.
        sessionStorage.removeItem(STORAGE_KEYS.encounter);
        sessionStorage.removeItem(STORAGE_KEYS.result);
        sessionStorage.removeItem(STORAGE_KEYS.defeated);
        sessionStorage.removeItem(STORAGE_KEYS.roster);

        if (CORE?.nav?.goWithLoading) {
            CORE.nav.goWithLoading('index.html', { profile: 'generic', from: 'question.html' });
        } else {
            window.location.href = 'index.html';
        }
    }, 2100);
}

function renderReserveSelectionAfterDefeat() {
    const reserveIndexes = getAliveReserveIndexes();
    dom.reserveList.innerHTML = '';

    if (reserveIndexes.length === 0) {
        triggerGameOver();
        return;
    }

    reserveIndexes.forEach((idx) => {
        const unit = normalizeUnit(state.roster[idx]);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'reserve-btn';
        button.innerHTML = `
            <img src="${unit.imgPath}" alt="${unit.nome}">
            <span>${unit.nome}</span>
        `;

        button.addEventListener('click', () => {
            swapRosterUnits(0, idx);
            saveRoster();
            dom.reserveModal.classList.add('hidden');
            state.selectingReserve = false;

            CORE?.ui?.toast?.(tQ('question_toast_reserve_selected', '{NAME} selezionato dalla riserva', {
                NAME: unit.nome
            }));
            setTimeout(goToPorta, 600);
        });

        dom.reserveList.appendChild(button);
    });

    state.selectingReserve = true;
    dom.reserveModal.classList.remove('hidden');
}

function handleQuizDefeatWithRoster() {
    state.roster[0].hp = 0;
    saveRoster();
    renderReserveSelectionAfterDefeat();
}

function showPostQuizPanel() {
    // A quiz concluso nascondiamo il modulo domanda e mostriamo solo il pannello esito.
    dom.optionList.innerHTML = '';
    dom.helperText.textContent = '';
    dom.questionText.textContent = '';
    dom.btnTranslate.disabled = true;
    dom.btnHint.disabled = true;
    dom.questionCard.classList.add('hidden');
    dom.resultCard.classList.remove('hidden');
    document.body.classList.add('quiz-ended');
}

async function finishQuiz() {
    const win = state.correct >= QUIZ_MIN_WIN;
    sessionStorage.setItem(STORAGE_KEYS.result, win ? 'win' : 'lose');

    if (win && state.encounter) {
        sessionStorage.setItem(STORAGE_KEYS.defeated, String(state.encounter.enemyId));
    }

    stopCountdown();
    showPostQuizPanel();

    dom.resultTitle.textContent = currentLang() === 'en' ? 'Result' : 'Esito';
    if (dom.resultScore) {
        dom.resultScore.textContent = buildFinalSummaryText();
    }
    dom.resultDetail.textContent = currentLang() === 'en' ? 'Preparing final judgement...' : 'Preparazione giudizio finale...';
    await showJudgement((currentLang() === 'en' ? 'JUDGEMENT' : 'GIUDIZIO') + ' | ' + buildFinalSummaryText(), 1200);

    if (win) {
        const coins = Number(localStorage.getItem('inferno_coins') || 0);
        localStorage.setItem('inferno_coins', String((Number.isNaN(coins) ? 0 : coins) + 5));
        CORE?.ui?.toast?.(currentLang() === 'en' ? '+5 coins from quiz battle' : '+5 monete dalla prova domande');
        if (isFinalBossEncounter()) {
            dom.resultTitle.textContent = currentLang() === 'en' ? 'Final Victory' : 'Vittoria Finale';
            if (dom.resultScore) {
                dom.resultScore.textContent = buildFinalSummaryText();
            }
            dom.resultDetail.textContent = currentLang() === 'en'
                ? 'Satan has fallen. The journey through Hell is complete.'
                : "Satana è caduto. Il viaggio nell'Inferno è compiuto.";
            dom.recruitActions.classList.add('hidden');
            dom.btnReturn.classList.add('hidden');
            CORE?.ui?.toast?.(currentLang() === 'en' ? 'Final boss defeated' : 'Boss finale sconfitto');

            setTimeout(goToEnding, 1600);
            return;
        }

        await showJudgement(currentLang() === 'en' ? 'VICTORY' : 'VITTORIA', 900);
        dom.resultTitle.textContent = tQ('question_result_win_title', currentLang() === 'en' ? 'Victory' : 'Vittoria');
        if (dom.resultScore) {
            dom.resultScore.textContent = buildFinalSummaryText();
        }
        dom.resultDetail.textContent = tQ('question_result_win_detail', 'Risposte corrette: {CORRECT}/{TOTAL}.', {
            CORRECT: state.correct,
            TOTAL: state.totalQuestions
        });
        dom.recruitActions.classList.remove('hidden');
        dom.btnReturn.classList.add('hidden');
        CORE?.ui?.toast?.(tQ('question_toast_win', 'Quiz superato'));
    } else {
        dom.resultTitle.textContent = tQ('question_result_lose_title', 'Sconfitta');
        if (dom.resultScore) {
            dom.resultScore.textContent = buildFinalSummaryText();
        }
        dom.resultDetail.textContent = tQ('question_result_lose_detail', 'Risposte corrette: {CORRECT}/{TOTAL}. Il tuo dannato è stato sconfitto.', {
            CORRECT: state.correct,
            TOTAL: QUIZ_TOTAL
        });
        dom.recruitActions.classList.add('hidden');
        dom.btnReturn.classList.add('hidden');
        CORE?.ui?.toast?.(tQ('question_toast_lose', 'Quiz fallito'));
        setTimeout(handleQuizDefeatWithRoster, 650);
    }

    applyQuestionStage();
}


function openCodexQuick() {
    // Apertura bestiario condiviso, uguale alla home e al combat.
    window.Bestiario?.open?.(0);
}

function initHelpButtons() {
    const unlockAudioContext = () => {
        if (state.audioContext && state.audioContext.state === 'suspended') {
            state.audioContext.resume().catch(() => {});
        }
    };

    dom.btnTranslate.addEventListener('click', () => {
        unlockAudioContext();
        if (state.helpUsed || state.resolvingAnswer) {
            return;
        }
        state.helpUsed = true;
        const question = state.selected[state.index];
        dom.helperText.textContent = question.question_it;
        showQuestionBubble(currentLang() === 'en' ? 'Translation used' : 'Traduzione usata', 'ok', 1200);
        dom.btnHint.disabled = true;
    });

    dom.btnCodex?.addEventListener('click', () => {
        openCodexQuick();
    });

    dom.btnHint.addEventListener('click', () => {
        unlockAudioContext();
        if (state.helpUsed || state.resolvingAnswer) {
            return;
        }
        state.helpUsed = true;
        const question = state.selected[state.index];
        dom.helperText.textContent = question.hint_en;
        showQuestionBubble('Hint', 'ok', 1200);
        dom.btnTranslate.disabled = true;
    });
}

function initResultButtons() {
    dom.recruitActions.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
            const yes = btn.dataset.recruit === 'yes';
            if (yes) {
                addEnemyToRoster();
                dom.resultDetail.textContent = tQ('question_result_recruit_yes', 'Nuovo dannato aggiunto alla squadra.');
                CORE?.ui?.toast?.(tQ('question_toast_recruit_yes', 'Nuovo dannato reclutato'));
            } else {
                dom.resultDetail.textContent = tQ('question_result_recruit_no', 'Hai deciso di non reclutare il dannato.');
                CORE?.ui?.toast?.(tQ('question_toast_recruit_no', 'Reclutamento annullato'));
            }

            dom.recruitActions.classList.add('hidden');
            dom.btnReturn.classList.remove('hidden');
            setTimeout(goToPorta, 1000);
        });
    });

    dom.btnReturn.addEventListener('click', () => {
        goToPorta();
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

async function loadFrames(folder, count) {
    const frames = [];
    for (let i = 0; i < count; i += 1) {
        const frame = await loadImage(`${folder}frame_${String(i).padStart(3, '0')}.png`);
        if (!frame) {
            break;
        }
        frames.push(frame);
    }
    return frames;
}

function inferAllyFolder() {
    const ally = normalizeUnit(state.roster[0]);
    const specie = (ally.specie || '').toLowerCase();
    return PLAYER_IDLE_MAP[specie] || PLAYER_IDLE_MAP.leone;
}


function inferEnemyFolder() {
    const specie = String(state.encounter?.enemy?.specie || '').toLowerCase();
    return ENEMY_IDLE_WATCHER_MAP[specie] || ENEMY_IDLE_WATCHER_MAP.lussurioso;
}
async function initWatchers() {
    state.anim.dante = await loadFrames('assets/img/personaggi/dante_spritesheet/Dante_idle_frames/', 12);
    state.anim.virgilio = await loadFrames('assets/img/personaggi/virgilio_spritesheet/Virgilio_idle_frames/', 12);
    state.anim.ally = await loadFrames(inferAllyFolder(), 12);
    state.anim.enemy = await loadFrames(inferEnemyFolder(), 12);

    if (state.anim.dante[0]) {
        dom.watcherDante.src = state.anim.dante[0].src;
    }
    if (state.anim.virgilio[0]) {
        dom.watcherVirgilio.src = state.anim.virgilio[0].src;
    }
    if (state.anim.ally[0]) {
        dom.watcherAlly.src = state.anim.ally[0].src;
    }
    if (state.anim.enemy[0]) {
        dom.watcherEnemy.src = state.anim.enemy[0].src;
    }
}

function watcherLoop(timestamp) {
    if (CORE?.ui?.pause?.isPaused()) {
        state.anim.last = timestamp;
        requestAnimationFrame(watcherLoop);
        return;
    }
    if (!state.anim.last) {
        state.anim.last = timestamp;
    }

    const dt = Math.min(100, timestamp - state.anim.last);
    state.anim.last = timestamp;
    state.anim.timer += dt;

    if (state.anim.timer >= 200) {
        state.anim.timer = 0;
        state.anim.frame += 1;

        if (state.anim.dante.length > 0) {
            dom.watcherDante.src = state.anim.dante[state.anim.frame % state.anim.dante.length].src;
        }
        if (state.anim.virgilio.length > 0) {
            dom.watcherVirgilio.src = state.anim.virgilio[state.anim.frame % state.anim.virgilio.length].src;
        }
        if (state.anim.ally.length > 0) {
            dom.watcherAlly.src = state.anim.ally[state.anim.frame % state.anim.ally.length].src;
        }
        if (state.anim.enemy.length > 0) {
            dom.watcherEnemy.src = state.anim.enemy[state.anim.frame % state.anim.enemy.length].src;
        }
    }

    requestAnimationFrame(watcherLoop);
}

async function init() {
    await loadI18n();
    if (dom.btnCodex) { dom.btnCodex.textContent = currentLang() === 'en' ? 'Bestiary' : 'Bestiario'; }
    if (CORE?.units?.loadCatalog) { await CORE.units.loadCatalog(); }

    if (CORE?.rules?.loadRemote) {
        await CORE.rules.loadRemote();
        QUIZ_TOTAL = Number(CORE.rules.get('quizQuestionsPerRun', 3) || 3);
        QUIZ_MIN_WIN = Number(CORE.rules.get('quizMinCorrectToWin', 2) || 2);
    }

    const response = await fetch('assets/data/domande.json');
    state.allQuestions = await response.json();
    state.selected = shuffle(state.allQuestions).slice(0, QUIZ_TOTAL);
    state.encounter = loadJSON(STORAGE_KEYS.encounter, null);
    state.roster = loadRoster();
    ensureUsableRosterOnEnter();

    initHelpButtons();
    initResultButtons();
    renderQuestion();

    if (CORE?.ui?.guideTimes) {
        CORE.ui.guideTimes({
            id: 'guida_question_bubble_v2',
            maxTimes: 1,
            title: { it: 'Guida Domande', en: 'Quiz Guide' },
            lines: {
                it: ['Rispondi a 3 domande in inglese.', 'Nell\'ultima domanda hai un timer e la pressione cresce.', 'Puoi usare un solo aiuto: traduzione o hint.'],
                en: ['Answer 3 questions in English.', 'In the last question you have a timer and rising pressure.', 'You can use only one help: translation or hint.']
            },
            button: { it: 'Capito', en: 'Understood' }
        });
    }

    await initWatchers();
    requestAnimationFrame(watcherLoop);
}

init().catch(() => {
    dom.questionText.textContent = tQ('question_error_loading', 'Errore nel caricamento delle domande.');
    dom.btnTranslate.disabled = true;
    dom.btnHint.disabled = true;
});





































