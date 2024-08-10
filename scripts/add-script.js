const fs = require('fs');
const path = require('path');

// Ottieni il percorso del package.json del progetto parent
const packageJsonPath = path.resolve(process.cwd(), 'package.json');

// Leggi il package.json del progetto parent
let packageJson = require(packageJsonPath);
const scriptPath = path.resolve(__dirname, './main.js');

// Aggiungi lo script per avviare il progetto
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts["start-project"] = `node ${scriptPath}`;

// Scrivi il package.json aggiornato
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));