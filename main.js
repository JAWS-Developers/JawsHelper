const { checkGitInstalled, checkGitLogin, checkGitHub, checkGitClean, commitChanges } = require('./utils/git');
const { checkPackageJson } = require('./utils/project');
const { confirmUpdate, getReleaseType } = require('./cli');
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

            console.log(`Current version: ${currentVersion}`);

            const newVersion = semver.inc(currentVersion, releaseType);

            const gitClean = await checkGitClean();
            if (!gitClean) {
                await commitChanges();  // Commit preliminare delle modifiche
            }

            const versionSpinner = ora('Updating version...').start();

            confirmUpdate(newVersion)
                .then(confirmed => {
                    if (confirmed) {
                        exec(`npm version ${newVersion}`, (err, stdout, stderr) => {
                            if (err) {
                                versionSpinner.fail(`Error updating version: ${err.message}`);
                                return;
                            }

                            versionSpinner.succeed(`Version updated to: ${newVersion}`);

                            const commit = ora("Committing version changes...").start();

                            exec(`git push`, (err, stdout, stderr) => {
                                if (err) {
                                    commit.fail(`Error during push: ${err.message}`);
                                    return;
                                }

                                commit.succeed("Changes committed and pushed");
                            });
                        });
                    } else {
                        console.log('Update cancelled.');
                    }
                });
        } else {
            console.log('Project setup is not valid. Please check the error messages.');
        }
    });
};

processInput();
