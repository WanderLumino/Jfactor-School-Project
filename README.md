# Inferno Journey

> Un Progetto scolastico ispirato alla Divina Commedia: Inferno di Dante Alighieri.
> A school project inspired by Divine Comedy: Dante's Inferno.

**Tecnologie / Tech:** HTML5 · CSS3 · Vanilla JavaScript · JSON

---

## Descrizione / Description

**ITA:** Il giocatore nei panni di Dante attraversa i nove cerchi dell'Inferno, affronta dannati con combattimento a turni o quiz sulla Divina Commedia, e recluta nemici nella propria squadra fino allo scontro finale con Lucifero.

**EN:** Players control Dante through the nine circles of Hell, battling damned enemies in turn-based combat or answering Divine Comedy quizzes, recruiting defeated foes until the final showdown with Lucifer.

---

## Meccaniche / Gameplay

| Feature | Descrizione |
|---------|-------------|
| Esplorazione / Exploration | Mappa a griglia 64x64, movimento WASD/frecce |
| Combattimento / Combat | RPG a turni con effetti di stato (sanguinamento, gelo, scudo...) |
| Quiz | 3 domande a risposta multipla con timer e aiuti limitati |
| Reclutamento / Recruit | Vincere un incontro permette di reclutare il nemico |
| Negozio / Shop | Acquisto oggetti con monete guadagnate in gioco |
| Bestiario / Bestiary | 16 pagine consultabili con statistiche e abilità |
| Lingua / Language | Italiano e Inglese, selezionabile dal menu |

---

## Pagine / Pages

| Pagina | File | Funzione |
|--------|------|----------|
| Menu | `index.html` | Home, impostazioni, bestiario |
| Loading | `loading.html` | Transizione con citazioni dantesche |
| Selva Oscura | `selva_oscura.html` | Scelta del dannato iniziale |
| Porta | `porta.html` | Slot machine + negozio |
| Mappa | `mappa.html` | Esplorazione e incontri |
| Combattimento | `combat.html` | Sistema RPG a turni |
| Domande | `question.html` | Quiz sulla Divina Commedia |
| Ending | `ending.html` | Crediti e riassunto finale |

---

## Avvio locale / Run locally

Il progetto usa `fetch` su file JSON: serve un server locale.

**VS Code:** installa l'estensione **Live Server** e apri `index.html`.

**Python:**

```bash
python -m http.server 5500
```

Poi apri `http://127.0.0.1:5500/index.html`.

---

## Struttura / Structure

```text
assets/
  audio/              audio e musica
  data/
    combat_data/      statistiche, profili, regole di combattimento
    lingue/           traduzioni IT/EN
    mappe/            dati delle mappe
  img/                sprite, tileset, interfaccia
css/                  fogli di stile (1 per pagina)
js/                   logica JavaScript (modulare)
docs/                 documentazione, presentazione, debug tools
*.html                8 pagine di gioco
```

---

## Team

- **Ferlino Nicolas**
- **Guaita Cristian** — Capogruppo
- **Huang Yandi** — Progettista di sprite
- **Quagliotti Marco**
- **Salzillo Giovanni**

Scuola: **IIS A. Volta — Lodi**

Progetto scolastico / School project.
