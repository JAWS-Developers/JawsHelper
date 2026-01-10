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
Clona repository GitHub (pubblici e privati) con autenticazione:
- Autenticazione con GitHub Personal Access Token
- Visualizza tutti i repository dell'utente e delle organizzazioni
- Supporta sia clonazione HTTPS che SSH
- Selezione interattiva dei repository

**Primo utilizzo:**
1. Seleziona "Git clone" dal menu principale
2. Inserisci il tuo GitHub Personal Access Token (crealo su https://github.com/settings/tokens)
3. Scopes richiesti: `repo`, `read:org`
4. Il token verrà salvato in modo sicuro in `~/.jaws-helper/github-token`

### 🚀 Create new release
Crea una nuova release del progetto con gestione automatica della versione.

### ©️ Write copyright
Aggiunge l'header di copyright ai file del progetto.

### 📝 Verify node_modules
Verifica e gestisce le dipendenze del progetto.