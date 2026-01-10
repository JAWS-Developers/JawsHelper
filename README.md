# 🛠️ JAWS Helper

Uno strumento utile per semplificare lo sviluppo di progetti con JAWS Developers! Questo pacchetto offre diverse utility che puoi usare per migliorare la gestione delle tue applicazioni.

## 📦 Installazione

Per installare **JAWS Helpers** come dipendenza di sviluppo nel tuo progetto, esegui il seguente comando:

```bash
npm install --save-dev jaws-helper
```

## 🚀 Utilizzo

Esegui il comando:
```bash
jaws-helper
```

## ✨ Funzionalità

### 🔐 Git Clone
Clona repository GitHub (pubblici e privati) con due modalità:

**Modalità 1: Clone diretto (senza autenticazione)**
- Inserisci l'URL del repository (HTTPS o SSH)
- Perfetto per repository pubblici
- Non richiede token GitHub

**Modalità 2: Sfoglia repository (con autenticazione)**
- Autenticazione con GitHub Personal Access Token
- Visualizza tutti i repository dell'utente e delle organizzazioni
- Supporta repository privati
- Supporta sia clonazione HTTPS che SSH
- Selezione interattiva dei repository

**Primo utilizzo (solo per Modalità 2):**
1. Seleziona "Git clone" dal menu principale
2. Scegli "Browse my repositories"
3. Inserisci il tuo GitHub Personal Access Token (crealo su https://github.com/settings/tokens)
4. Scopes richiesti: `repo`, `read:org`
5. Il token verrà salvato in modo sicuro in `~/.jaws-helper/github-token`

### 🚀 Create new release
Crea una nuova release del progetto con gestione automatica della versione.

### ©️ Write copyright
Aggiunge l'header di copyright ai file del progetto.

### 📝 Verify node_modules
Verifica e gestisce le dipendenze del progetto.