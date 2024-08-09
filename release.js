const { exec } = require('child_process');
const semver = require('semver');
const { select } = require('@inquirer/prompts');
const ora = require('ora'); // Import the 'ora' package
const { log } = require('console');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


/**
 * Options to choose for the release
 * @type {[{name: string, value: string},{name: string, value: string},{name: string, value: string},{name: string, value: string},{name: string, value: string},null,null]}
 */
const releaseTypes = [
    { name: 'Major', value: 'major' },
    { name: 'Minor', value: 'minor' },
    { name: 'Patch', value: 'patch' },
    { name: 'Premajor', value: 'premajor' },
    { name: 'Preminor', value: 'preminor' },
    { name: 'Prepatch', value: 'prepatch' },
    { name: 'Prerelease', value: 'prerelease' },
];

/**
 * Confirmation to upgrade the project
 * @param newVersion
 * @returns {Promise<unknown>}
 */
const confirmUpdate = (newVersion) => {
    return select({
        message: `Update the version to : ${newVersion}?`,
        choices: [
            {
                name: 'yes',
                value: true,
                description: 'Confirm update',
            },
            {
                name: 'no',
                value: false,
                description: 'Cancel update',
            }
        ]
    })
        .then(answers => answers);
};

/**
 * Check if Git is installed
 * @returns {Promise<boolean>}
 */
const checkGitInstalled = async () => {
    const spinner = ora('Checking if Git is installed...').start();
    return new Promise((resolve) => {
        exec('git --version', (error, stdout, stderr) => {
            if (error) {
                spinner.fail('Git is not installed or not found in PATH');
                resolve(false);
            } else {
                spinner.succeed('Git is installed');
                resolve(true);
            }
        });
    });
};

/**
 * Check if the user is logged into Git
 * @returns {Promise<boolean>}
 */
const checkGitLogin = async () => {
    const spinner = ora('Checking if the user is logged into Git...').start();
    return new Promise((resolve) => {
        exec('git config --get user.name', (error, stdout, stderr) => {
            if (error || !stdout.trim()) {
                spinner.fail('User is not logged into Git');
                resolve(false);
            } else {
                spinner.succeed('User is logged into Git');
                resolve(true);
            }
        });
    });
};

/**
 * Analyze the folder to check if it's correct
 * @returns {Promise<unknown>}
 * @constructor
 */
const AnalyzeFolder = async () => {
    /**
     * Check if the package json is valid
     * @returns {boolean}
     */
    const checkPackageJson = () => {
        const spinner = ora('Checking for package.json...').start();

        try {
            const packageJson = require('./package.json');

            // Basic validation (optional)
            if (!packageJson.name || !packageJson.version) {
                spinner.fail("package.json is not correct");
                return false;
            }

            spinner.succeed("package.json loaded correctly");
            return true;
        } catch (error) {
            if (error.code === 'MODULE_NOT_FOUND') {
                spinner.fail('package.json not found');
                return false; // Early exit if not a Node.js project
            } else {
                spinner.fail('Error checking for package.json: ' + error.message);
                return false; // Unexpected error, indicate failure
            }
        }
    }

    /**
     * Check if the GitHub configuration is valid
     * @returns {Promise<unknown>}
     */
    const checkGitHub = async () => {
        const gitSpinner = ora('Checking for Git repository...').start();
        return new Promise((resolve) => {
            exec('git status', (error, stdout, stderr) => {
                if (error) {
                    const errorMessage = error.toString();
                    if (errorMessage.includes('CMD.EXE') && errorMessage.includes('UNC')) {
                        gitSpinner.fail('Source can\'t be in a network folder');
                    } else {
                        gitSpinner.fail('Git status unavailable');
                    }
                    resolve(false);
                } else {
                    gitSpinner.succeed('Git repository found');
                    resolve(true);
                }
            });
        });
    };

    /**
     * Execute the functions and return the values
     */
    return new Promise(async (resolve, reject) => {
        const isGitInstalled = await checkGitInstalled();
        const isNodeProject = isGitInstalled ? checkPackageJson() : false;
        const isGitConfigured = isGitInstalled && isNodeProject ? await checkGitHub() : false;
        const isUserLoggedIn = isGitInstalled && isNodeProject ? await checkGitLogin() : false;
        resolve({ isNodeProject, isGitConfigured, isUserLoggedIn });
    });
};

/**
 * Init the process to upgrade and push the project
 * @returns {Promise<void>}
 */
const processInput = async () => {
    //Analyze directory
    AnalyzeFolder().then(async result => {
        if (result.isNodeProject && result.isGitConfigured && result.isUserLoggedIn) {
            // Prompt for release type
            const releaseType = await select({
                message: 'What type of release is it?',
                choices: releaseTypes,
            });

            const currentVersion = require('./package.json').version;
            const projectName = require('./package.json').name;
            console.log(`Current version: ${currentVersion}`); // Informative message

            const newVersion = semver.inc(currentVersion, releaseType);
            const version = ora('Updating version...').start();

            confirmUpdate(newVersion)
                .then(confirmed => {
                    if (confirmed) {
                        // Update version in package.json
                        exec(`npm version ${newVersion}`, (err, stdout, stderr) => {
                            if (err) {
                                version.fail(`Error updating version: ${err.message}`);
                                return;
                            }

                            version.succeed(`Version updated to: ${newVersion}`);

                            const commit = ora("Committing changes...").start();

                            // Git commit, push, and optional release creation (unchanged)
                            exec(`git add . && git commit -m "Version: ${newVersion}" && git push`, (err, stdout, stderr) => {
                                if (err) {
                                    commit.fail(`Error during commit: ${err.message}`);
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
    })
};
processInput();
