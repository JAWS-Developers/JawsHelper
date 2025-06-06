"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewRelease = void 0;
const semver_1 = __importDefault(require("semver"));
const ora_1 = __importDefault(require("ora"));
const child_process_1 = require("child_process");
const inquirer_1 = require("../inquirer");
// Funzione principale che gestisce la release
const createNewRelease = async () => {
    const currentVersion = require(process.env.NODE_ENV == "development" ? '../../package.json' : '../../../../package.json').version;
    const releaseType = (await inquirer_1.ReleaseManager.askReleaseType()).releaseType;
    const jiraTasks = (await inquirer_1.ReleaseManager.getJiraTasks()).jira;
    const newVersion = semver_1.default.inc(currentVersion, releaseType);
    const commitMessagePrefix = (await inquirer_1.ReleaseManager.askCommitMessage()).commitMessage;
    const fullCommitMessage = `${jiraTasks == "" ? "" : jiraTasks + " | "}${newVersion} - ${commitMessagePrefix}`;
    console.log("\nSummary:");
    console.log(`- Current Version: ${currentVersion}`);
    console.log(`- New Version: ${newVersion}`);
    console.log(`- Commit Message: ${fullCommitMessage}\n`);
    inquirer_1.ReleaseManager.confirmUpdate(newVersion, currentVersion).then(data => {
        if (!data.confirm)
            return;
        const versionSpinner = (0, ora_1.default)('Updating version...').start();
        (0, child_process_1.exec)(`npm version ${newVersion} --no-git-tag-version`, (err, stdout, stderr) => {
            if (err) {
                versionSpinner.fail(`Error updating version: ${err.message}`);
                return;
            }
            versionSpinner.succeed(`Version updated to: ${newVersion}`);
            // Esegui il commit
            (0, child_process_1.exec)(`git add . && git commit -m "${fullCommitMessage}"`, (err, stdout, stderr) => {
                if (err) {
                    return;
                }
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
        });
    });
};
exports.createNewRelease = createNewRelease;
