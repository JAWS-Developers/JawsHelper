import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import { authenticateGitHub, getAllRepositories } from './github';
import { FirstActions } from '../inquirer';

const execPromise = promisify(exec);

interface Repository {
    name: string;
    full_name: string;
    clone_url: string;
    ssh_url: string;
    private: boolean;
    description: string | null;
    owner: {
        login: string;
    };
}

/**
 * Format repository for display
 * @param {Repository} repo
 * @returns {string}
 */
const formatRepoChoice = (repo: Repository): string => {
    const privacyBadge = repo.private ? chalk.red('🔒 Private') : chalk.green('🌐 Public');
    const description = repo.description ? chalk.gray(` - ${repo.description.substring(0, 50)}`) : '';
    return `${privacyBadge} ${chalk.cyan(repo.full_name)}${description}`;
};

/**
 * Prompt user to select clone method
 * @returns {Promise<string>}
 */
const selectCloneMethod = async (): Promise<string> => {
    const { method } = await inquirer.prompt([
        {
            type: 'list',
            name: 'method',
            message: chalk.yellowBright('Select clone method:'),
            choices: [
                { name: chalk.greenBright('HTTPS (recommended)'), value: 'https' },
                { name: chalk.blueBright('SSH'), value: 'ssh' }
            ]
        }
    ]);
    return method;
};

/**
 * Prompt user to select destination directory
 * @returns {Promise<string>}
 */
const selectDestination = async (repoName: string): Promise<string> => {
    const { destination } = await inquirer.prompt([
        {
            type: 'input',
            name: 'destination',
            message: chalk.greenBright('Enter destination directory (or press Enter for current directory):'),
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
const cloneRepository = async (repo: Repository, method: string, destination: string): Promise<boolean> => {
    const cloneUrl = method === 'https' ? repo.clone_url : repo.ssh_url;
    const spinner = ora(chalk.yellow(`Cloning ${repo.full_name}...`)).start();
    
    try {
        await execPromise(`git clone ${cloneUrl} ${destination}`);
        spinner.succeed(chalk.green(`Successfully cloned ${repo.full_name} to ${destination}`));
        return true;
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to clone repository`));
        console.error(chalk.red(error.message));
        return false;
    }
};

/**
 * Clone from URL without authentication
 * @param {string} url
 * @param {string} destination
 * @returns {Promise<boolean>}
 */
const cloneFromUrl = async (url: string, destination: string): Promise<boolean> => {
    const spinner = ora(chalk.yellow(`Cloning repository...`)).start();
    
    try {
        await execPromise(`git clone ${url} ${destination}`);
        spinner.succeed(chalk.green(`Successfully cloned repository to ${destination}`));
        return true;
    } catch (error: any) {
        spinner.fail(chalk.red(`Failed to clone repository`));
        console.error(chalk.red(error.message));
        return false;
    }
};

/**
 * Handle manual URL clone flow
 */
const manualCloneFlow = async (): Promise<void> => {
    const { repoUrl } = await inquirer.prompt([
        {
            type: 'input',
            name: 'repoUrl',
            message: chalk.greenBright('Enter repository URL (HTTPS or SSH):'),
            validate: (input: string) => {
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

    const { destination } = await inquirer.prompt([
        {
            type: 'input',
            name: 'destination',
            message: chalk.greenBright('Enter destination directory (or press Enter for current directory):'),
            default: `./${repoName}`
        }
    ]);

    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellowBright(`Clone repository to ${chalk.cyan(destination)}?`),
            default: true
        }
    ]);

    if (!confirm) {
        console.log(chalk.yellow('Clone cancelled.'));
        FirstActions.printInquirer();
        return;
    }

    const success = await cloneFromUrl(repoUrl.trim(), destination);

    if (success) {
        console.log(chalk.green.bold('\n✅ Repository cloned successfully!\n'));
    }

    FirstActions.printInquirer();
};

/**
 * Main function to handle git clone flow
 */
export const gitCloneFlow = async (): Promise<void> => {
    console.log(chalk.magentaBright.bold('\n🚀 Git Clone - Repository Browser\n'));
    
    // Ask user to choose between authenticated browsing or manual URL
    const { cloneMethod } = await inquirer.prompt([
        {
            type: 'list',
            name: 'cloneMethod',
            message: chalk.cyanBright('How would you like to clone a repository?'),
            choices: [
                { name: chalk.greenBright('📦 Enter repository URL (no authentication required)'), value: 'manual' },
                { name: chalk.blueBright('🔍 Browse my repositories (requires GitHub authentication)'), value: 'browse' },
                { name: chalk.red('← Back to main menu'), value: 'back' }
            ]
        }
    ]);

    if (cloneMethod === 'back') {
        FirstActions.printInquirer();
        return;
    }

    if (cloneMethod === 'manual') {
        await manualCloneFlow();
        return;
    }

    // Authenticate with GitHub for browsing
    const octokit = await authenticateGitHub();
    
    if (!octokit) {
        console.log(chalk.red('Authentication failed. Returning to main menu...'));
        FirstActions.printInquirer();
        return;
    }
    
    // Get all repositories
    const repositories = await getAllRepositories(octokit);
    
    if (repositories.length === 0) {
        console.log(chalk.yellow('No repositories found.'));
        FirstActions.printInquirer();
        return;
    }
    
    // Sort repositories by updated date (most recent first)
    repositories.sort((a, b) => {
        const dateA = new Date(a.updated_at || 0).getTime();
        const dateB = new Date(b.updated_at || 0).getTime();
        return dateB - dateA;
    });
    
    // Create choices for inquirer
    const choices: any[] = repositories.map(repo => ({
        name: formatRepoChoice(repo),
        value: repo
    }));
    
    // Add separator and back option
    choices.push(
        new inquirer.Separator(),
        { name: chalk.red('← Back to main menu'), value: null }
    );
    
    // Prompt user to select repository
    const { selectedRepo } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedRepo',
            message: chalk.cyanBright(`Select a repository to clone (${repositories.length} repositories):`),
            choices: choices,
            pageSize: 15
        }
    ]);
    
    // If user selected back, return to main menu
    if (!selectedRepo) {
        FirstActions.printInquirer();
        return;
    }
    
    // Select clone method
    const method = await selectCloneMethod();
    
    // Select destination
    const destination = await selectDestination(selectedRepo.name);
    
    // Confirm clone
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: chalk.yellowBright(`Clone ${chalk.cyan(selectedRepo.full_name)} to ${chalk.cyan(destination)}?`),
            default: true
        }
    ]);
    
    if (!confirm) {
        console.log(chalk.yellow('Clone cancelled.'));
        FirstActions.printInquirer();
        return;
    }
    
    // Clone repository
    const success = await cloneRepository(selectedRepo, method, destination);
    
    if (success) {
        console.log(chalk.green.bold('\n✅ Repository cloned successfully!\n'));
    }
    
    // Return to main menu
    FirstActions.printInquirer();
};
