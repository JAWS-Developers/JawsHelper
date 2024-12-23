const { exec } = require('child_process');
const ora = require('ora');

/**
 * Check if Git is installed
 * @returns {Promise<boolean>}
 */
const checkGitInstalled = () => {
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
const checkGitLogin = () => {
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
 * Check if the Git repository is configured
 * @returns {Promise<boolean>}
 */
const checkGitHub = () => {
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
 * Check if the Git working directory is clean
 * @returns {Promise<boolean>}
 */
const checkGitClean = () => {
    const spinner = ora('Checking if Git working directory is clean...').start();
    return new Promise((resolve) => {
        exec('git status --porcelain', (error, stdout, stderr) => {
            if (error) {
                spinner.fail(`Error checking Git status: ${error.message}`);
                resolve(false);
            } else {
                spinner.succeed('Git working directory is clean.');
                resolve(true);
            }
        });
    });
};

/**
 * Commit changes if Git working directory is not clean
 * @returns {Promise<void>}
 */
const commitChanges = () => {
    const spinner = ora('Committing changes...').start();
    return new Promise((resolve, reject) => {
        exec('git add . && git commit -m "Committing changes before version update"', (error, stdout, stderr) => {
            if (error) {
                spinner.fail(`Error committing changes: ${error.message}`);
                reject(error);
            } else {
                spinner.succeed('Changes committed successfully.');
                resolve();
            }
        });
    });
};

module.exports = {
    checkGitInstalled,
    checkGitLogin,
    checkGitHub,
    checkGitClean,
    commitChanges
};
