import inquirer from 'inquirer';
import semver from 'semver';
import ora from 'ora';
import { exec } from 'child_process';
import { ReleaseManager } from '../inquirer';


// Funzione per ottenere il tipo di release
const getReleaseType = async (): Promise<'major' | 'minor' | 'patch'> => {
    const { releaseType } = await inquirer.prompt([
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
export const createNewRelease = async (): Promise<void> => {
    const currentVersion = require(process.env.NODE_ENV == "development" ? '../../package.json' : '../../../../package.json').version;
    const releaseType = (await ReleaseManager.askReleaseType()).releaseType;
    const newVersion = semver.inc(currentVersion, releaseType) as string;

    const commitMessagePrefix = (await ReleaseManager.askCommitMessage()).commitMessage;
    const fullCommitMessage = `Version: ${newVersion} - ${commitMessagePrefix}`;

    ReleaseManager.confirmUpdate(newVersion, currentVersion).then(data => {
        if (!data.confirm)
            return;

        console.log("\nSummary:");
        console.log(`- Current Version: ${currentVersion}`);
        console.log(`- New Version: ${newVersion}`);
        console.log(`- Commit Message: ${fullCommitMessage}\n`);


        // Esegui il commit
        const commitMessage = `Release version ${newVersion}`;
        exec(`git add . && git commit -m "${commitMessage}"`, (err, stdout, stderr) => {
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

};