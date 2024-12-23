"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitChanges = exports.checkGitClean = exports.checkGitHub = exports.checkGitLogin = exports.checkGitInstalled = void 0;
const chalk_1 = __importDefault(require("chalk"));
const child_process_1 = require("child_process");
const ora_1 = __importDefault(require("ora"));
/**
 * Check if Git is installed
 * @returns {Promise<boolean>}
 */
const checkGitInstalled = () => {
    const spinner = (0, ora_1.default)(chalk_1.default.yellow('Checking if Git is installed...')).start();
    return new Promise((resolve) => {
        (0, child_process_1.exec)('git --version', (error, stdout, stderr) => {
            if (error) {
                spinner.fail('Git is not installed or not found in PATH');
                resolve(false);
            }
            else {
                spinner.succeed('Git is installed');
                resolve(true);
            }
        });
    });
};
exports.checkGitInstalled = checkGitInstalled;
/**
 * Check if the user is logged into Git
 * @returns {Promise<boolean>}
 */
const checkGitLogin = () => {
    const spinner = (0, ora_1.default)(chalk_1.default.yellow('Checking if the user is logged into Git...')).start();
    return new Promise((resolve) => {
        (0, child_process_1.exec)('git config --get user.name', (error, stdout, stderr) => {
            if (error || !stdout.trim()) {
                spinner.fail('User is not logged into Git');
                resolve(false);
            }
            else {
                spinner.succeed('User is logged into Git');
                resolve(true);
            }
        });
    });
};
exports.checkGitLogin = checkGitLogin;
/**
 * Check if the Git repository is configured
 * @returns {Promise<boolean>}
 */
const checkGitHub = () => {
    const gitSpinner = (0, ora_1.default)(chalk_1.default.yellow('Checking for Git repository...')).start();
    return new Promise((resolve) => {
        (0, child_process_1.exec)('git status', (error, stdout, stderr) => {
            if (error) {
                const errorMessage = error.toString();
                if (errorMessage.includes('CMD.EXE') && errorMessage.includes('UNC')) {
                    gitSpinner.fail('Source can\'t be in a network folder');
                }
                else {
                    gitSpinner.fail('Git status unavailable');
                }
                resolve(false);
            }
            else {
                gitSpinner.succeed('Git repository found');
                resolve(true);
            }
        });
    });
};
exports.checkGitHub = checkGitHub;
/**
 * Check if the Git working directory is clean
 * @returns {Promise<boolean>}
 */
const checkGitClean = () => {
    const spinner = (0, ora_1.default)(chalk_1.default.yellow('Checking if Git working directory is clean...')).start();
    return new Promise((resolve) => {
        (0, child_process_1.exec)('git status --porcelain', (error, stdout, stderr) => {
            if (error) {
                spinner.fail(`Error checking Git status: ${error.message}`);
                resolve(false);
            }
            else {
                spinner.succeed('Git working directory is clean.');
                resolve(true);
            }
        });
    });
};
exports.checkGitClean = checkGitClean;
/**
 * Commit changes if Git working directory is not clean
 * @returns {Promise<void>}
 */
const commitChanges = () => {
    const spinner = (0, ora_1.default)(chalk_1.default.yellow('Committing changes...')).start();
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)('git add . && git commit -m "Committing changes before version update"', (error, stdout, stderr) => {
            if (error) {
                spinner.fail(`Error committing changes: ${error.message}`);
                reject(error);
            }
            else {
                spinner.succeed('Changes committed successfully.');
                resolve(true);
            }
        });
    });
};
exports.commitChanges = commitChanges;
