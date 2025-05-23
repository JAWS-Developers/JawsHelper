import semver from 'semver';
import ora from 'ora';
import { exec } from 'child_process';
import { ReleaseManager } from '../inquirer';


// Funzione principale che gestisce la release
export const createNewRelease = async (): Promise<void> => {
    const currentVersion = require(process.env.NODE_ENV == "development" ? '../../package.json' : '../../../../package.json').version;
    const releaseType = (await ReleaseManager.askReleaseType()).releaseType;
    const jiraTasks = (await ReleaseManager.getJiraTasks()).jira;
    const newVersion = semver.inc(currentVersion, releaseType) as string;

    const commitMessagePrefix = (await ReleaseManager.askCommitMessage()).commitMessage;
    const fullCommitMessage = `${jiraTasks == "" ? "" : jiraTasks + " | "}${newVersion} - ${commitMessagePrefix}`;

    console.log("\nSummary:");
    console.log(`- Current Version: ${currentVersion}`);
    console.log(`- New Version: ${newVersion}`);
    console.log(`- Commit Message: ${fullCommitMessage}\n`);

    ReleaseManager.confirmUpdate(newVersion, currentVersion).then(data => {
        if (!data.confirm)
            return;

        const versionSpinner = ora('Updating version...').start();

        exec(`npm version ${newVersion} --no-git-tag-version`, (err, stdout, stderr) => {
            if (err) {
                versionSpinner.fail(`Error updating version: ${err.message}`);
                return;
            }

            versionSpinner.succeed(`Version updated to: ${newVersion}`);
            // Esegui il commit
            exec(`git add . && git commit -m "${fullCommitMessage}"`, (err, stdout, stderr) => {
                if (err) {
                    return;
                }

                // Esegui il push
                const pushSpinner = ora('Pushing changes to GitHub...').start();
                exec('git push', (err, stdout, stderr) => {
                    if (err) {
                        pushSpinner.fail(`Error during push: ${err.message}`);
                        return;
                    }

                    pushSpinner.succeed('Changes pushed successfully');
                });
            });
        })
    })

};