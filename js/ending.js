// Commento generale file: logica principale dello script.
'use strict';

const CORE = window.GameCore || null;

function getLang() {
    return localStorage.getItem('lingua_gioco') === 'en' ? 'en' : 'it';
}

function getEndingContent() {
    if (getLang() === 'en') {
        return {
            title: 'INFERNO CLEARED',
            subtitle: 'Lucifer has fallen. Dante and Virgil rise toward the stars.',
            restart: 'Restart',
            acts: [
                'Act I - The dark wood tested your courage.',
                'Act II - The circles judged every choice.',
                'Act III - The final ice shattered under your will.'
            ],
            credits: [
                'School Project : JFactor- IIS A. Volta Lodi',
                'Theme: Dante Alighieri - Divine Comedy (Inferno)',
                'Design: Gameplay + Narrative Team',
                'Programming: HTML / CSS / JavaScript',
                'Team members : Ferlino Nicolas, Guaita Cristian, Huang Yandi, Quagliotti Marco, Salzillo Giovanni',
                'Team leader : Guaita Cristian',
                'Developers : Huang Yandi, Guaita Cristian',
                'Sprite designer : Huang Yandi',
                'UI designer : Huang Yandi',
                'Map designers : Ferlino Nicolas, Quagliotti Marco',
                'Narrative designer : Salzillo Giovanni',
                'Thank you for playing'
            ]
        };
    }

    return {
        title: 'INFERNO COMPLETATO',
        subtitle: 'Lucifero è stato sconfitto. Dante e Virgilio rivedono la luce.',
        restart: 'Ricomincia',
        acts: [
            'Atto I - La selva oscura ha messo alla prova il tuo coraggio.',
            'Atto II - I cerchi hanno giudicato ogni tua scelta.',
            'Atto III - Il gelo finale si è infranto davanti alla tua volontà.'
        ],
        credits: [
            'Progetto Scolastico : JFactor - IIS A. Volta Lodi',
            'Tema: Dante Alighieri - Divina Commedia (Inferno)',
            'Design: Team Gameplay + Narrazione',
            'Programmazione: HTML / CSS / JavaScript',
            'Membri del gruppo : Ferlino Nicolas, Guaita Cristian, Huang Yandi, Quagliotti Marco, Salzillo Giovanni',
            'Capogruppo : Guaita Cristian',
            'Programmatori : Huang Yandi, Guaita Cristian',
            'Progettista di sprite : Huang Yandi',
            'Progettista di UI : Huang Yandi',
            'Progettisti di mappe : Ferlino Nicolas, Quagliotti Marco',
            'Progettista narrativo : Salzillo Giovanni',
            'Grazie per aver giocato'
        ]
    };
}

function getTeamInfo() {
    // Dati gruppo per presentazione: puoi personalizzarli da localStorage.
    const lang = getLang();
    const name = localStorage.getItem('team_name') || (lang === 'en' ? 'JFactor Team' : 'Team JFactor');
    const fallbackMembers = lang === 'en' ? ['Dante Designer', 'Combat Coder', 'Narrative Curator'] : ['Designer Dante', 'Programmatore Combat', 'Curatore Narrazione'];
    let members = fallbackMembers;
    try {
        const raw = localStorage.getItem('team_members');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                members = parsed.map((x) => String(x));
            }
        }
    } catch {
        // Fallback membri predefiniti.
    }
    return { name, members };
}

function renderTeamInfo() {
    const titleNode = document.getElementById('ending-team-title');
    const nameNode = document.getElementById('ending-team-name');
    const membersNode = document.getElementById('ending-team-members');
    if (!titleNode || !nameNode || !membersNode) {
        return;
    }

    const lang = getLang();
    const team = getTeamInfo();
    titleNode.textContent = lang === 'en' ? 'Project Team' : 'Team di Progetto';
    nameNode.textContent = (lang === 'en' ? 'Group name: ' : 'Nome gruppo: ') + team.name;
    membersNode.textContent = (lang === 'en' ? 'Members: ' : 'Membri: ') + team.members.join(' · ');
}
function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function playEndingSequence(content) {
    const actsContainer = document.getElementById('ending-atti');
    const creditsTrack = document.getElementById('credits-track');
    const restart = document.getElementById('ending-restart');

    actsContainer.innerHTML = '';
    creditsTrack.innerHTML = '';

    for (const line of content.acts) {
        const p = document.createElement('p');
        p.className = 'ending-riga';
        p.textContent = line;
        actsContainer.appendChild(p);

        await wait(380);
        p.classList.add('visible');
        await wait(1050);
    }

    content.credits.forEach((line) => {
        const p = document.createElement('p');
        p.className = 'credits-line';
        p.textContent = line;
        creditsTrack.appendChild(p);
    });

    await wait(450);
    creditsTrack.classList.add('run');

    await wait(6500);
    restart.disabled = false;
}

function bindRestart() {
    const restart = document.getElementById('ending-restart');
    restart.addEventListener('click', () => {
        // Nuova run: reset variabili di progressione principali.
        const currentCircleKey = CORE?.keys?.currentCircle || 'cerchio_corrente';
        const targetCircleKey = CORE?.keys?.targetCircle || 'cerchio_destinazione';
        const currentMapKey = CORE?.keys?.currentMap || 'mappa_corrente';

        localStorage.setItem(currentCircleKey, '0');
        localStorage.removeItem(targetCircleKey);
        localStorage.removeItem(currentMapKey);

        // Pulisci sessionStorage per evitare dati residui dalla run precedente.
        const rosterKey = CORE?.keys?.roster || 'dannato_schierato';
        const encounterKey = CORE?.keys?.encounter || 'encounter_context';
        const resultKey = CORE?.keys?.result || 'encounter_result';
        const defeatedKey = CORE?.keys?.defeated || 'encounter_enemy_id';
        sessionStorage.removeItem(rosterKey);
        sessionStorage.removeItem(encounterKey);
        sessionStorage.removeItem(resultKey);
        sessionStorage.removeItem(defeatedKey);
        sessionStorage.removeItem('combat_escape_used');

        if (CORE?.nav?.goWithLoading) {
            CORE.nav.goWithLoading('index.html', { profile: 'generic', from: 'ending.html' });
        } else {
            window.location.href = 'index.html';
        }
    });
}

window.addEventListener('load', async () => {
    const content = getEndingContent();

    const title = document.getElementById('ending-title');
    const subtitle = document.getElementById('ending-subtitle');
    const restart = document.getElementById('ending-restart');

    title.textContent = content.title;
    subtitle.textContent = content.subtitle;
    restart.textContent = content.restart;

    bindRestart();
    renderTeamInfo();
    await playEndingSequence(content);
});



