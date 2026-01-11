import { createNewRelease } from "./utils/release";
import { FirstActionType } from "./inquirerType";
import inquirer from "inquirer";
import chalk from "chalk";
import { log } from "console";
import { writeCopy } from "./utils/copyright";
import { verifyNodeModules } from "./utils/node_modules";
import { gitCloneFlow } from "./utils/gitClone";


export class FirstActions {
    private static actions: FirstActionType[] = [
        {
            label: chalk.greenBright("Git clone 📦"),
            action: gitCloneFlow,
            requiresFullSetup: false
        },
        {
            label: chalk.greenBright("Create new release 🚀"),
            action: createNewRelease,
            requiresFullSetup: true
        },
        {
            label: chalk.greenBright("Write copyright ©️"),
            action: writeCopy,
            requiresFullSetup: true
        },
        {
            label: chalk.greenBright("Verify node_modules📝"),
            action: verifyNodeModules,
            requiresFullSetup: true
        },
        {
            label: chalk.greenBright("Exit 👋"),
            action: () => process.exit(0),
            requiresFullSetup: false
        },
    ];

    static getLabels(isFullyConfigured: boolean = true) {
        return this.actions
            .filter(action => !action.requiresFullSetup || isFullyConfigured)
            .map(item => item.label);
    }

    static getActions(isFullyConfigured: boolean = true) {
        return this.actions.filter(action => !action.requiresFullSetup || isFullyConfigured);
    }

    static printInquirer(isFullyConfigured: boolean = true) {
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: chalk.cyanBright("What do you want to do❓ 🤔"),
                choices: FirstActions.getLabels(isFullyConfigured),
            }
        ]).then(data => {
            const selectedAction = FirstActions.getActions(isFullyConfigured).filter(action => action.label === data.action)[0];
            log(chalk.magentaBright(`You selected: ${selectedAction.label}`));
            selectedAction.action();
        });

    }
}

export class ReleaseManager {

    static async askReleaseType() {
        return await inquirer.prompt([
            {
                type: 'list',
                name: 'releaseType',
                message: chalk.yellowBright('What type of release is it? 🛠️'),
                choices: [
                    { name: chalk.greenBright('major 🚀'), value: "major" },
                    { name: chalk.blueBright('minor 🟦'), value: "minor" },
                    { name: chalk.gray('patch 🛠️'), value: "patch" }
                ],
            },
        ]);
    }

    static async getJiraTasks() {
        return inquirer.prompt([
            {
                type: "input",
                name: "jira",
                message: chalk.blueBright("Insert all solved Jira tasks 📝:")
            }
        ]);
    }

    static async confirmUpdate(newVersion: string, currentVersion: string) {
        return await inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: chalk.magentaBright(`Update the version to: ${chalk.cyanBright(newVersion)} (Current version: ${chalk.cyanBright(currentVersion)})?`)
            }
        ])
    }

    static async confirmPush() {
        return await inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: chalk.yellowBright(`The project will be pushed to GitHub. Confirm? 🤖`)
            }
        ])
    }

    static async askCommitMessage() {
        return await inquirer.prompt([
            {
                type: "input",
                name: "commitMessage",
                message: chalk.greenBright("Insert commit message 📝:")
            }
        ]);
    }
}

export class NodeModules {
    static async confirmDelete() {
        return await inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: chalk.magentaBright(`Are you sure you want to delete the node_modules folder? This action cannot be undone.`)
            }
        ]);
    }
}