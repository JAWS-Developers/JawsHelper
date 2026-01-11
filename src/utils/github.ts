import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const CONFIG_DIR = path.join(os.homedir(), '.jaws-helper');
const TOKEN_FILE = path.join(CONFIG_DIR, 'github-token');

/**
 * Get stored GitHub token
 * @returns {string | null}
 */
export const getStoredToken = (): string | null => {
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            return fs.readFileSync(TOKEN_FILE, 'utf-8').trim();
        }
    } catch (error) {
        console.error(chalk.red('Error reading stored token'));
    }
    return null;
};

/**
 * Get token from GitHub CLI (gh)
 * @returns {Promise<string | null>}
 */
const getGhCliToken = async (): Promise<string | null> => {
    try {
        const { stdout } = await execPromise('gh auth token');
        const token = stdout.trim();
        if (token && token.length > 0) {
            return token;
        }
    } catch (error) {
        // gh not authenticated or not installed
        return null;
    }
    return null;
};

/**
 * Store GitHub token
 * @param {string} token
 */
const storeToken = (token: string): void => {
    try {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
    } catch (error) {
        console.error(chalk.red('Error storing token'));
    }
};

/**
 * Prompt user for authentication method
 * @returns {Promise<string>}
 */
const promptForToken = async (): Promise<string | null> => {
    console.log(chalk.yellow('\n📝 GitHub Authentication Required'));
    console.log(chalk.cyan('Choose your authentication method:\n'));

    const { authMethod } = await inquirer.prompt([
        {
            type: 'list',
            name: 'authMethod',
            message: chalk.greenBright('How would you like to authenticate?'),
            choices: [
                { name: chalk.blueBright('🔑 Use GitHub CLI (gh auth login)'), value: 'gh' },
                { name: chalk.greenBright('🔐 Enter Personal Access Token manually'), value: 'token' },
                { name: chalk.red('← Cancel'), value: 'cancel' }
            ]
        }
    ]);

    if (authMethod === 'cancel') {
        return null;
    }

    if (authMethod === 'gh') {
        // Try to get token from gh CLI
        const ghToken = await getGhCliToken();
        
        if (ghToken) {
            console.log(chalk.green('✓ Found GitHub CLI authentication'));
            return ghToken;
        }
        
        // If not authenticated, prompt user to run gh auth login
        console.log(chalk.yellow('\nGitHub CLI is not authenticated.'));
        console.log(chalk.cyan('Please run: ') + chalk.bold('gh auth login') + chalk.cyan(' in another terminal'));
        console.log(chalk.cyan('Then come back and try again.\n'));
        
        const { retry } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'retry',
                message: chalk.yellowBright('Have you completed gh auth login?'),
                default: false
            }
        ]);

        if (retry) {
            const retryToken = await getGhCliToken();
            if (retryToken) {
                console.log(chalk.green('✓ GitHub CLI authentication successful'));
                return retryToken;
            }
        }

        console.log(chalk.yellow('Falling back to manual token entry...'));
        // Fall through to manual token entry
    }

    // Manual token entry
    console.log(chalk.cyan('\nCreate a Personal Access Token at: https://github.com/settings/tokens'));
    console.log(chalk.cyan('Required scopes: repo, read:org\n'));

    const { token } = await inquirer.prompt([
        {
            type: 'password',
            name: 'token',
            message: chalk.greenBright('Enter your GitHub Personal Access Token:'),
            validate: (input: string) => {
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
const verifyToken = async (token: string): Promise<{ valid: boolean; username?: string }> => {
    const spinner = ora(chalk.yellow('Verifying GitHub token...')).start();
    
    try {
        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.users.getAuthenticated();
        
        spinner.succeed(chalk.green(`Authenticated as ${chalk.bold(data.login)}`));
        return { valid: true, username: data.login };
    } catch (error: any) {
        spinner.fail(chalk.red('Invalid GitHub token'));
        return { valid: false };
    }
};

/**
 * Authenticate with GitHub
 * @returns {Promise<Octokit | null>}
 */
export const authenticateGitHub = async (): Promise<Octokit | null> => {
    // First, try to get token from stored file
    let token = getStoredToken();
    
    if (token) {
        console.log(chalk.cyan('Found stored GitHub token'));
        const { valid } = await verifyToken(token);
        
        if (valid) {
            return new Octokit({ auth: token });
        } else {
            console.log(chalk.yellow('Stored token is invalid, will try other methods...'));
            fs.unlinkSync(TOKEN_FILE);
            token = null;
        }
    }
    
    // Try to get token from GitHub CLI
    if (!token) {
        const ghToken = await getGhCliToken();
        if (ghToken) {
            console.log(chalk.cyan('Found GitHub CLI authentication'));
            const { valid } = await verifyToken(ghToken);
            
            if (valid) {
                return new Octokit({ auth: ghToken });
            } else {
                console.log(chalk.yellow('GitHub CLI token is invalid'));
            }
        }
    }
    
    // Prompt for new token or use gh auth login
    token = await promptForToken();
    
    if (!token) {
        console.log(chalk.red('Authentication cancelled.'));
        return null;
    }
    
    const { valid } = await verifyToken(token);
    
    if (!valid) {
        console.log(chalk.red('Authentication failed. Please try again.'));
        return null;
    }
    
    // Store the token only if it was manually entered (not from gh CLI)
    const ghToken = await getGhCliToken();
    if (token !== ghToken) {
        storeToken(token);
        console.log(chalk.green('Token stored successfully!'));
    }
    
    return new Octokit({ auth: token });
};

/**
 * Get all repositories (user + organizations)
 * @param {Octokit} octokit
 * @returns {Promise<Array>}
 */
export const getAllRepositories = async (octokit: Octokit): Promise<any[]> => {
    const spinner = ora(chalk.yellow('Fetching repositories...')).start();
    
    try {
        const repositories: any[] = [];
        
        // Get user repositories
        let page = 1;
        let userRepos: any[];
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
        
        spinner.succeed(chalk.green(`Found ${repositories.length} repositories`));
        return repositories;
    } catch (error: any) {
        spinner.fail(chalk.red('Error fetching repositories'));
        console.error(error.message);
        return [];
    }
};
