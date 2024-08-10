const { checkGitInstalled, checkGitLogin, checkGitHub, checkGitClean, commitChanges } = require('./utils/git');
const { checkPackageJson } = require('./utils/project');
const { confirmUpdate, getReleaseType, askForCommitMessage, confirmPush } = require('./cli');
const semver = require('semver');
const { exec } = require('child_process');
const ora = require('ora');

const execPromise = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
};

const AnalyzeFolder = async () => {
    const isGitInstalled = await checkGitInstalled();
    const isNodeProject = isGitInstalled ? checkPackageJson() : false;
    const isGitConfigured = isGitInstalled && isNodeProject ? await checkGitHub() : false;
    const isUserLoggedIn = isGitInstalled && isNodeProject ? await checkGitLogin() : false;
    return { isNodeProject, isGitConfigured, isUserLoggedIn };
};

const processInput = async () => {
    AnalyzeFolder().then(async result => {
        if (result.isNodeProject && result.isGitConfigured && result.isUserLoggedIn) {
            const releaseType = await getReleaseType();
            const currentVersion = require('./package.json').version;

            const newVersion = semver.inc(currentVersion, releaseType);

            // Chiedi il messaggio di commit
            const commitMessagePrefix = await askForCommitMessage();
            const fullCommitMessage = `Version: ${newVersion} - ${commitMessagePrefix}`;

            const gitClean = await checkGitClean();
            if (!gitClean) {
                await commitChanges();  // Commit preliminare delle modifiche
            }

            // Fermiamo lo spinner prima di chiedere la conferma
            const versionSpinner = ora('Updating version...').start();
            versionSpinner.stop();

            const confirmed = await confirmUpdate(newVersion, currentVersion);
            if (confirmed) {


                // Mostra le informazioni finali prima di chiedere la conferma
                console.log("\nSummary:");
                console.log(`- Current Version: ${currentVersion}`);
                console.log(`- New Version: ${newVersion}`);
                console.log(`- Commit Message: ${fullCommitMessage}\n`);

                const pushConfirmed = await confirmPush();
                if (pushConfirmed) {

                    versionSpinner.start();  // Riavviamo lo spinner
                    exec(`npm version ${newVersion} --no-git-tag-version`, (err, stdout, stderr) => {
                        if (err) {
                            versionSpinner.fail(`Error updating version: ${err.message}`);
                            return;
                        }

                        versionSpinner.succeed(`Version updated to: ${newVersion}`);


                        const commitSpinner = ora("Committing version changes...").start();

                        exec(`git add . && git commit -m "${fullCommitMessage}"`, async (err, stdout, stderr) => {
                            if (err) {
                                commitSpinner.fail(`Error during commit: ${err.message}`);
                                return;
                            }

                            commitSpinner.succeed("Changes committed");
                        });

                        const pushSpinner = ora("Pushing changes...").start();

                        exec(`git push`, (err, stdout, stderr) => {
                            if (err) {
                                pushSpinner.fail(`Error during push: ${err.message}`);
                                return;
                            }

                            pushSpinner.succeed("Changes pushed successfully");
                        });
                    });
                } else {
                    console.log('Push cancelled.');
                }
            } else {
                console.log('Update cancelled.');
            }
        } else {
            console.log('Project setup is not valid. Please check the error messages.');
        }
    });
};

processInput();
