import chalk from "chalk";
import { checkGitHub, checkGitInstalled, checkGitLogin } from "./git";

const ora = require('ora');

/**
 * Check if the package json is valid
 * @returns {boolean}
 */
const checkPackageJson = () => {
    const spinner = ora(chalk.yellow('Checking for package.json...')).start();

    try {
        const packageJson = require(process.env.NODE_ENV == "development" ? '../../package.json' : './package.json');

        // Basic validation (optional)
        if (!packageJson.name || !packageJson.version) {
            spinner.fail("package.json is not correct");
            return false;
        }

        spinner.succeed("package.json loaded correctly");
        return true;
    } catch (error: any) {
        if (error.code === 'MODULE_NOT_FOUND') {
            spinner.fail('package.json not found');
            return false; // Early exit if not a Node.js project
        } else {
            spinner.fail('Error checking for package.json: ' + error.message);
            return false; // Unexpected error, indicate failure
        }
    }
};

export const AnalyzeFolder = async () => {
    const isGitInstalled = await checkGitInstalled();
    const isNodeProject = isGitInstalled ? checkPackageJson() : false;
    const isGitConfigured = isGitInstalled && isNodeProject ? await checkGitHub() : false;
    const isUserLoggedIn = isGitInstalled && isNodeProject ? await checkGitLogin() : false;
    return { isNodeProject, isGitConfigured, isUserLoggedIn };
};
