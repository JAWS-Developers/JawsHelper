import { createNewRelease } from "./utils/release";
import { FirstActionType } from "./inquirerType";
import inquirer from "inquirer";
import chalk from "chalk";
import { log } from "console";
import { writeCopy } from "./utils/copyright";
import { verifyNodeModules } from "./utils/node_modules";


export class FirstActions {
    private static actions: FirstActionType[] = [
        {
            label: chalk.greenBright("Create new release 🚀"),
            action: createNewRelease
        },
        {
            label: chalk.greenBright("Write copyright ©️"),
            action: writeCopy
        },
        {
            label: chalk.greenBright("Verify node_modules📝"),
            action: verifyNodeModules
        },
        {
            label: chalk.greenBright("Exit 👋"),
            action: () => process.exit(0)
        },
    ];

    static getLabels() {
        return this.actions.map(item => item.label);
    }

    static getActions() {
        return this.actions;
    }

    static printInquirer() {
        inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: chalk.cyanBright("What do you want to do❓ 🤔"),
                choices: FirstActions.getLabels(),
            }
        ]).then(data => {
            const selectedAction = FirstActions.getActions().filter(action => action.label === data.action)[0];
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