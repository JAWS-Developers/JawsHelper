const fs = require('fs');
const path = require('path');

// Path del package.json del progetto corrente
const projectPackageJsonPath = path.resolve(process.cwd(), 'package.json');

// Funzione per aggiungere uno script al package.json
const addScriptToPackageJson = () => {
    if (fs.existsSync(projectPackageJsonPath)) {
        const packageJson = require(projectPackageJsonPath);

        // Aggiungi uno script al package.json del progetto
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts['new-release'] = "./node_modules/release-manager/main.js";

        // Scrivi il package.json modificato
        fs.writeFileSync(
            projectPackageJsonPath,
            JSON.stringify(packageJson, null, 2)
        );

        console.log("Script 'my-script' added to package.json");
    } else {
        console.error('package.json not found in the current directory');
    }
};

addScriptToPackageJson();
