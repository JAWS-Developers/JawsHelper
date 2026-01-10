"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRepositories = exports.authenticateGitHub = exports.getStoredToken = void 0;
const rest_1 = require("@octokit/rest");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.jaws-helper');
const TOKEN_FILE = path_1.default.join(CONFIG_DIR, 'github-token');
/**
 * Get stored GitHub token
 * @returns {string | null}
 */
const getStoredToken = () => {
    try {
        if (fs_1.default.existsSync(TOKEN_FILE)) {
            return fs_1.default.readFileSync(TOKEN_FILE, 'utf-8').trim();
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error reading stored token'));
    }
    return null;
};
exports.getStoredToken = getStoredToken;
/**
 * Store GitHub token
 * @param {string} token
 */
const storeToken = (token) => {
    try {
        if (!fs_1.default.existsSync(CONFIG_DIR)) {
            fs_1.default.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        fs_1.default.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
    }
    catch (error) {
        console.error(chalk_1.default.red('Error storing token'));
    }
};
/**
 * Prompt user for GitHub token
 * @returns {Promise<string>}
 */
const promptForToken = async () => {
    console.log(chalk_1.default.yellow('\n📝 GitHub Authentication Required'));
    console.log(chalk_1.default.cyan('To access private repositories, you need a GitHub Personal Access Token.'));
    console.log(chalk_1.default.cyan('Create one at: https://github.com/settings/tokens'));
    console.log(chalk_1.default.cyan('Required scopes: repo, read:org\n'));
    const { token } = await inquirer_1.default.prompt([
        {
            type: 'password',
            name: 'token',
            message: chalk_1.default.greenBright('Enter your GitHub Personal Access Token:'),
            validate: (input) => {
                if (!input || input.trim().length === 0) {
                    return 'Token cannot be empty';
                }
                return true;
            }
        }
    ]);
    return token.trim();
};
/**
 * Verify GitHub token
 * @param {string} token
 * @returns {Promise<{valid: boolean, username?: string}>}
 */
const verifyToken = async (token) => {
    const spinner = (0, ora_1.default)(chalk_1.default.yellow('Verifying GitHub token...')).start();
    try {
        const octokit = new rest_1.Octokit({ auth: token });
        const { data } = await octokit.users.getAuthenticated();
        spinner.succeed(chalk_1.default.green(`Authenticated as ${chalk_1.default.bold(data.login)}`));
        return { valid: true, username: data.login };
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Invalid GitHub token'));
        return { valid: false };
    }
};
/**
 * Authenticate with GitHub
 * @returns {Promise<Octokit | null>}
 */
const authenticateGitHub = async () => {
    let token = (0, exports.getStoredToken)();
    if (token) {
        console.log(chalk_1.default.cyan('Found stored GitHub token'));
        const { valid } = await verifyToken(token);
        if (valid) {
            return new rest_1.Octokit({ auth: token });
        }
        else {
            console.log(chalk_1.default.yellow('Stored token is invalid, requesting new token...'));
            fs_1.default.unlinkSync(TOKEN_FILE);
            token = null;
        }
    }
    // Prompt for new token
    token = await promptForToken();
    const { valid } = await verifyToken(token);
    if (!valid) {
        console.log(chalk_1.default.red('Authentication failed. Please try again.'));
        return null;
    }
    // Store the token
    storeToken(token);
    console.log(chalk_1.default.green('Token stored successfully!'));
    return new rest_1.Octokit({ auth: token });
};
exports.authenticateGitHub = authenticateGitHub;
/**
 * Get all repositories (user + organizations)
 * @param {Octokit} octokit
 * @returns {Promise<Array>}
 */
const getAllRepositories = async (octokit) => {
    const spinner = (0, ora_1.default)(chalk_1.default.yellow('Fetching repositories...')).start();
    try {
        const repositories = [];
        // Get user repositories
        let page = 1;
        let userRepos;
        do {
            const { data } = await octokit.repos.listForAuthenticatedUser({
                per_page: 100,
                page: page,
                sort: 'updated',
                affiliation: 'owner,collaborator,organization_member'
            });
            userRepos = data;
            repositories.push(...userRepos);
            page++;
        } while (userRepos.length === 100);
        spinner.succeed(chalk_1.default.green(`Found ${repositories.length} repositories`));
        return repositories;
    }
    catch (error) {
        spinner.fail(chalk_1.default.red('Error fetching repositories'));
        console.error(error.message);
        return [];
    }
};
exports.getAllRepositories = getAllRepositories;
