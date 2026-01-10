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
 * Main function to handle git clone flow
 */
export const gitCloneFlow = async (): Promise<void> => {
    console.log(chalk.magentaBright.bold('\n🚀 Git Clone - Repository Browser\n'));
    
    // Authenticate with GitHub
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
