"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeFolder = void 0;
const chalk_1 = __importDefault(require("chalk"));
const git_1 = require("./git");
const ora = require('ora');
/**
 * Check if the package json is valid
 * @returns {boolean}
 */
const checkPackageJson = () => {
    const spinner = ora(chalk_1.default.yellow('Checking for package.json...')).start();
    try {
        const packageJson = require(process.env.NODE_ENV == "development" ? '../../package.json' : '../../../../package.json');
        // Basic validation (optional)
        if (!packageJson.name || !packageJson.version) {
            spinner.fail("package.json is not correct");
            return false;
        }
        spinner.succeed("package.json loaded correctly");
        return true;
    }
    catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            spinner.fail('package.json not found');
            return false; // Early exit if not a Node.js project
        }
        else {
            spinner.fail('Error checking for package.json: ' + error.message);
            return false; // Unexpected error, indicate failure
        }
    }
};
const AnalyzeFolder = async () => {
    const isGitInstalled = await (0, git_1.checkGitInstalled)();
    const isNodeProject = isGitInstalled ? checkPackageJson() : false;
    const isGitConfigured = isGitInstalled && isNodeProject ? await (0, git_1.checkGitHub)() : false;
    const isUserLoggedIn = isGitInstalled && isNodeProject ? await (0, git_1.checkGitLogin)() : false;
    return { isNodeProject, isGitConfigured, isUserLoggedIn };
};
exports.AnalyzeFolder = AnalyzeFolder;
