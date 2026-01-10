"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeModules = exports.ReleaseManager = exports.FirstActions = void 0;
const release_1 = require("./utils/release");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const console_1 = require("console");
const copyright_1 = require("./utils/copyright");
const node_modules_1 = require("./utils/node_modules");
const gitClone_1 = require("./utils/gitClone");
class FirstActions {
    static actions = [
        {
            label: chalk_1.default.greenBright("Git clone 📦"),
            action: gitClone_1.gitCloneFlow,
            requiresFullSetup: false
        },
        {
            label: chalk_1.default.greenBright("Create new release 🚀"),
            action: release_1.createNewRelease,
            requiresFullSetup: true
        },
        {
            label: chalk_1.default.greenBright("Write copyright ©️"),
            action: copyright_1.writeCopy,
            requiresFullSetup: true
        },
        {
            label: chalk_1.default.greenBright("Verify node_modules📝"),
            action: node_modules_1.verifyNodeModules,
            requiresFullSetup: true
        },
        {
            label: chalk_1.default.greenBright("Exit 👋"),
            action: () => process.exit(0),
            requiresFullSetup: false
        },
    ];
    static getLabels(isFullyConfigured = true) {
        return this.actions
            .filter(action => !action.requiresFullSetup || isFullyConfigured)
            .map(item => item.label);
    }
    static getActions(isFullyConfigured = true) {
        return this.actions.filter(action => !action.requiresFullSetup || isFullyConfigured);
    }
    static printInquirer(isFullyConfigured = true) {
        inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: chalk_1.default.cyanBright("What do you want to do❓ 🤔"),
                choices: FirstActions.getLabels(isFullyConfigured),
            }
        ]).then(data => {
            const selectedAction = FirstActions.getActions(isFullyConfigured).filter(action => action.label === data.action)[0];
            (0, console_1.log)(chalk_1.default.magentaBright(`You selected: ${selectedAction.label}`));
            selectedAction.action();
        });
    }
}
exports.FirstActions = FirstActions;
class ReleaseManager {
    static async askReleaseType() {
        return await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'releaseType',
                message: chalk_1.default.yellowBright('What type of release is it? 🛠️'),
                choices: [
                    { name: chalk_1.default.greenBright('major 🚀'), value: "major" },
                    { name: chalk_1.default.blueBright('minor 🟦'), value: "minor" },
                    { name: chalk_1.default.gray('patch 🛠️'), value: "patch" }
                ],
            },
        ]);
    }
    static async getJiraTasks() {
        return inquirer_1.default.prompt([
            {
                type: "input",
                name: "jira",
                message: chalk_1.default.blueBright("Insert all solved Jira tasks 📝:")
            }
        ]);
    }
    static async confirmUpdate(newVersion, currentVersion) {
        return await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: chalk_1.default.magentaBright(`Update the version to: ${chalk_1.default.cyanBright(newVersion)} (Current version: ${chalk_1.default.cyanBright(currentVersion)})?`)
            }
        ]);
    }
    static async confirmPush() {
        return await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: chalk_1.default.yellowBright(`The project will be pushed to GitHub. Confirm? 🤖`)
            }
        ]);
    }
    static async askCommitMessage() {
        return await inquirer_1.default.prompt([
            {
                type: "input",
                name: "commitMessage",
                message: chalk_1.default.greenBright("Insert commit message 📝:")
            }
        ]);
    }
}
exports.ReleaseManager = ReleaseManager;
class NodeModules {
    static async confirmDelete() {
        return await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: chalk_1.default.magentaBright(`Are you sure you want to delete the node_modules folder? This action cannot be undone.`)
            }
        ]);
    }
}
exports.NodeModules = NodeModules;
