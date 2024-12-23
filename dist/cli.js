"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.release = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const semver_1 = __importDefault(require("semver"));
const ora_1 = __importDefault(require("ora"));
const child_process_1 = require("child_process");
// Funzione per chiedere la conferma dell'update
const confirmUpdate = async (newVersion, currentVersion) => {
    const answer = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'confirmed',
            message: `Update the version to ${newVersion} (Current version: ${currentVersion})?`,
            default: true,
        },
    ]);
    return answer.confirmed;
};
// Funzione per ottenere il tipo di release
const getReleaseType = async () => {
    const { releaseType } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'releaseType',
            message: 'What type of release is it?',
            choices: ['major', 'minor', 'patch'],
        },
    ]);
    return releaseType;
};
// Funzione principale che gestisce la release
const release = async () => {
    const currentVersion = require('../package.json').version;
    const releaseType = await getReleaseType();
    const newVersion = semver_1.default.inc(currentVersion, releaseType);
    const versionSpinner = (0, ora_1.default)('Updating version...').start();
    const confirmed = await confirmUpdate(newVersion, currentVersion);
    if (confirmed) {
        versionSpinner.succeed(`Version updated to: ${newVersion}`);
        // Esegui il commit
        const commitMessage = `Release version ${newVersion}`;
        (0, child_process_1.exec)(`git add . && git commit -m "${commitMessage}"`, (err, stdout, stderr) => {
            if (err) {
                versionSpinner.fail(`Error during commit: ${err.message}`);
                return;
            }
            versionSpinner.succeed("Changes committed successfully");
            // Esegui il push
            const pushSpinner = (0, ora_1.default)('Pushing changes to GitHub...').start();
            (0, child_process_1.exec)('git push', (err, stdout, stderr) => {
                if (err) {
                    pushSpinner.fail(`Error during push: ${err.message}`);
                    return;
                }
                pushSpinner.succeed('Changes pushed successfully');
            });
        });
    }
    else {
        versionSpinner.fail('Update cancelled.');
    }
};
exports.release = release;
