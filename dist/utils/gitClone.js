"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitCloneFlow = void 0;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const github_1 = require("./github");
const inquirer_2 = require("../inquirer");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
/**
 * Format repository for display
 * @param {Repository} repo
 * @returns {string}
 */
const formatRepoChoice = (repo) => {
    const privacyBadge = repo.private ? chalk_1.default.red('🔒 Private') : chalk_1.default.green('🌐 Public');
    const description = repo.description ? chalk_1.default.gray(` - ${repo.description.substring(0, 50)}`) : '';
    return `${privacyBadge} ${chalk_1.default.cyan(repo.full_name)}${description}`;
};
/**
 * Prompt user to select clone method
 * @returns {Promise<string>}
 */
const selectCloneMethod = async () => {
    const { method } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'method',
            message: chalk_1.default.yellowBright('Select clone method:'),
            choices: [
                { name: chalk_1.default.greenBright('HTTPS (recommended)'), value: 'https' },
                { name: chalk_1.default.blueBright('SSH'), value: 'ssh' }
            ]
        }
    ]);
    return method;
};
/**
 * Prompt user to select destination directory
 * @returns {Promise<string>}
 */
const selectDestination = async (repoName) => {
    const { destination } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'destination',
            message: chalk_1.default.greenBright('Enter destination directory (or press Enter for current directory):'),
            default: `./${repoName}`
        }
    ]);
    return destination;
};
/**
 * Clone the selected repository
 * @param {Repository} repo
 * @param {string} method
 * @param {string} destination
 * @returns {Promise<boolean>}
 */
const cloneRepository = async (repo, method, destination) => {
    const cloneUrl = method === 'https' ? repo.clone_url : repo.ssh_url;
    const spinner = (0, ora_1.default)(chalk_1.default.yellow(`Cloning ${repo.full_name}...`)).start();
    try {
        await execPromise(`git clone ${cloneUrl} ${destination}`);
        spinner.succeed(chalk_1.default.green(`Successfully cloned ${repo.full_name} to ${destination}`));
        return true;
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`Failed to clone repository`));
        console.error(chalk_1.default.red(error.message));
        return false;
    }
};
/**
 * Clone from URL without authentication
 * @param {string} url
 * @param {string} destination
 * @returns {Promise<boolean>}
 */
const cloneFromUrl = async (url, destination) => {
    const spinner = (0, ora_1.default)(chalk_1.default.yellow(`Cloning repository...`)).start();
    try {
        await execPromise(`git clone ${url} ${destination}`);
        spinner.succeed(chalk_1.default.green(`Successfully cloned repository to ${destination}`));
        return true;
    }
    catch (error) {
        spinner.fail(chalk_1.default.red(`Failed to clone repository`));
        console.error(chalk_1.default.red(error.message));
        return false;
    }
};
/**
 * Handle manual URL clone flow
 */
const manualCloneFlow = async () => {
    const { repoUrl } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'repoUrl',
            message: chalk_1.default.greenBright('Enter repository URL (HTTPS or SSH):'),
            validate: (input) => {
                if (!input || input.trim().length === 0) {
                    return 'URL cannot be empty';
                }
                // Basic validation for git URLs
                if (!input.includes('github.com') && !input.includes('git@')) {
                    return 'Please enter a valid Git URL';
                }
                return true;
            }
        }
    ]);
    // Extract repo name from URL for default destination
    const urlParts = repoUrl.trim().split('/');
    const repoNameWithGit = urlParts[urlParts.length - 1];
    const repoName = repoNameWithGit.replace('.git', '');
    const { destination } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'destination',
            message: chalk_1.default.greenBright('Enter destination directory (or press Enter for current directory):'),
            default: `./${repoName}`
        }
    ]);
    const { confirm } = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: chalk_1.default.yellowBright(`Clone repository to ${chalk_1.default.cyan(destination)}?`),
            default: true
        }
    ]);
    if (!confirm) {
        console.log(chalk_1.default.yellow('Clone cancelled.'));
        inquirer_2.FirstActions.printInquirer();
        return;
    }
    const success = await cloneFromUrl(repoUrl.trim(), destination);
    if (success) {
        console.log(chalk_1.default.green.bold('\n✅ Repository cloned successfully!\n'));
    }
    inquirer_2.FirstActions.printInquirer();
};
/**
 * Main function to handle git clone flow
 */
const gitCloneFlow = async () => {
    console.log(chalk_1.default.magentaBright.bold('\n🚀 Git Clone - Repository Browser\n'));
    // Ask user to choose between authenticated browsing or manual URL
    const { cloneMethod } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'cloneMethod',
            message: chalk_1.default.cyanBright('How would you like to clone a repository?'),
            choices: [
                { name: chalk_1.default.greenBright('📦 Enter repository URL (no authentication required)'), value: 'manual' },
                { name: chalk_1.default.blueBright('🔍 Browse my repositories (requires GitHub authentication)'), value: 'browse' },
                { name: chalk_1.default.red('← Back to main menu'), value: 'back' }
            ]
        }
    ]);
    if (cloneMethod === 'back') {
        inquirer_2.FirstActions.printInquirer();
        return;
    }
    if (cloneMethod === 'manual') {
        await manualCloneFlow();
        return;
    }
    // Authenticate with GitHub for browsing
    const octokit = await (0, github_1.authenticateGitHub)();
    if (!octokit) {
        console.log(chalk_1.default.red('Authentication failed. Returning to main menu...'));
        inquirer_2.FirstActions.printInquirer();
        return;
    }
    // Get all repositories
    const repositories = await (0, github_1.getAllRepositories)(octokit);
    if (repositories.length === 0) {
        console.log(chalk_1.default.yellow('No repositories found.'));
        inquirer_2.FirstActions.printInquirer();
        return;
    }
    // Sort repositories by updated date (most recent first)
    repositories.sort((a, b) => {
        const dateA = new Date(a.updated_at || 0).getTime();
        const dateB = new Date(b.updated_at || 0).getTime();
        return dateB - dateA;
    });
    // Create choices for inquirer
    const choices = repositories.map(repo => ({
        name: formatRepoChoice(repo),
        value: repo
    }));
    // Add separator and back option
    choices.push(new inquirer_1.default.Separator(), { name: chalk_1.default.red('← Back to main menu'), value: null });
    // Prompt user to select repository
    const { selectedRepo } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'selectedRepo',
            message: chalk_1.default.cyanBright(`Select a repository to clone (${repositories.length} repositories):`),
            choices: choices,
            pageSize: 15
        }
    ]);
    // If user selected back, return to main menu
    if (!selectedRepo) {
        inquirer_2.FirstActions.printInquirer();
        return;
    }
    // Select clone method
    const method = await selectCloneMethod();
    // Select destination
    const destination = await selectDestination(selectedRepo.name);
    // Confirm clone
    const { confirm } = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: chalk_1.default.yellowBright(`Clone ${chalk_1.default.cyan(selectedRepo.full_name)} to ${chalk_1.default.cyan(destination)}?`),
            default: true
        }
    ]);
    if (!confirm) {
        console.log(chalk_1.default.yellow('Clone cancelled.'));
        inquirer_2.FirstActions.printInquirer();
        return;
    }
    // Clone repository
    const success = await cloneRepository(selectedRepo, method, destination);
    if (success) {
        console.log(chalk_1.default.green.bold('\n✅ Repository cloned successfully!\n'));
    }
    // Return to main menu
    inquirer_2.FirstActions.printInquirer();
};
exports.gitCloneFlow = gitCloneFlow;
