"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseManager = exports.FirstActions = void 0;
const release_1 = require("./utils/release");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
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
            FirstActions.getActions().filter(action => action.label === data.action)[0].action();
        });
    }
}
exports.FirstActions = FirstActions;
FirstActions.actions = [
    {
        label: "Create new release 🚀",
        action: release_1.createNewRelease
    },
];
class ReleaseManager {
    static async askReleaseType() {
        return await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'releaseType',
                message: 'What type of release is it?',
                choices: ['major', 'minor', 'patch'],
            },
        ]);
    }
    static async confirmUpdate(newVersion, currentVersion) {
        return await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: `Update the version to : ${newVersion} (Current version: ${currentVersion})?`,
            }
        ]);
    }
    static async confirmPush() {
        return await inquirer_1.default.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: `The project will be pushed to github. Confirm?`,
            }
        ]);
    }
    static async askCommitMessage() {
        return inquirer_1.default.prompt([
            {
                type: "input",
                name: "commitMessage",
                message: "Insert commit message"
            }
        ]);
    }
}
exports.ReleaseManager = ReleaseManager;
