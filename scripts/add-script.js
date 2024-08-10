const fs = require('fs');
const path = require('path');

// Ottieni il percorso del package.json del progetto parent
const packageJsonPath = path.resolve(process.cwd(), 'package.json');

// Leggi il package.json del progetto parent
let packageJson = require(packageJsonPath);

// Aggiungi lo script per avviare il progetto
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts["release"] = `node ./node_modules/jaws-release-manager/main.js`;

// Scrivi il package.json aggiornato
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));