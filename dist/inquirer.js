"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseManager = exports.FirstActions = void 0;
const release_1 = require("./utils/release");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const console_1 = require("console");
class FirstActions {
    static getLabels() {
        return this.actions.map(item => item.label);
    }
    static getActions() {
        return this.actions;
    }
    static printInquirer() {
        inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: chalk_1.default.cyanBright("What do you want to do❓ 🤔"),
                choices: FirstActions.getLabels(),
            },
        ]).then(data => {
            const selectedAction = FirstActions.getActions().filter(action => action.label === data.action)[0];
            (0, console_1.log)(chalk_1.default.magentaBright(`You selected: ${selectedAction.label}`));
            selectedAction.action();
        });
    }
}
exports.FirstActions = FirstActions;
FirstActions.actions = [
    {
        label: chalk_1.default.greenBright("Create new release 🚀"),
        action: release_1.createNewRelease
    },
];
class ReleaseManager {
    static async askReleaseType() {
        return await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'releaseType',
                message: chalk_1.default.yellowBright('What type of release is it? 🛠️'),
                choices: [
                    { name: chalk_1.default.greenBright('major 🚀'), value: "major" },
                    { name: chalk_1.default.blueBright('minor 🟦'), value: "major" },
                    { name: chalk_1.default.gray('patch 🛠️'), value: "major" }
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
