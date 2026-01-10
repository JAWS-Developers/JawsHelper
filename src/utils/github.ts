import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
 * Prompt user for GitHub token
 * @returns {Promise<string>}
 */
const promptForToken = async (): Promise<string> => {
    console.log(chalk.yellow('\n📝 GitHub Authentication Required'));
    console.log(chalk.cyan('To access private repositories, you need a GitHub Personal Access Token.'));
    console.log(chalk.cyan('Create one at: https://github.com/settings/tokens'));
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
    let token = getStoredToken();
    
    if (token) {
        console.log(chalk.cyan('Found stored GitHub token'));
        const { valid } = await verifyToken(token);
        
        if (valid) {
            return new Octokit({ auth: token });
        } else {
            console.log(chalk.yellow('Stored token is invalid, requesting new token...'));
            fs.unlinkSync(TOKEN_FILE);
            token = null;
        }
    }
    
    // Prompt for new token
    token = await promptForToken();
    const { valid } = await verifyToken(token);
    
    if (!valid) {
        console.log(chalk.red('Authentication failed. Please try again.'));
        return null;
    }
    
    // Store the token
    storeToken(token);
    console.log(chalk.green('Token stored successfully!'));
    
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
