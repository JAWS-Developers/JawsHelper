console.log("Esecuzione dello script postinstall...");

const fs = require('fs');

// Leggi il package.json del progetto parent
const packageJsonPath = "../../../package.json"
let packageJson = require(packageJsonPath);

// Aggiungi lo script per avviare il progetto
packageJson.scripts = packageJson.scripts || {};
packageJson.scripts["release"] = `node ./node_modules/jaws-release-manager/main.js`;

// Scrivi il package.json aggiornato
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
