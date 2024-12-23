import { createNewRelease } from "./utils/release";
import { FirstActionType } from "./inquirerType";
import inquirer from "inquirer";
import chalk from "chalk";
import { log } from "console";


export class FirstActions {
    private static actions: FirstActionType[] = [
        {
            label: "Create new release 🚀",
            action: createNewRelease
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
            },
        ]).then(data => {
            FirstActions.getActions().filter(action => action.label === data.action)[0].action()
        })
    }
}

export class ReleaseManager {

    static async askReleaseType() {
        return await inquirer.prompt([
            {
                type: 'list',
                name: 'releaseType',
                message: 'What type of release is it?',
                choices: ['major', 'minor', 'patch'],
            },
        ]);
    }

    static async confirmUpdate(newVersion: string, currentVersion: string) {        
        return await inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: `Update the version to : ${newVersion} (Current version: ${currentVersion})?`,
            }
        ])
    }

    static async confirmPush() {        
        return await inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: `The project will be pushed to github. Confirm?`,
            }
        ])
    }

    static async askCommitMessage() {
        return inquirer.prompt([
            {
                type: "input",
                name: "commitMessage",
                message: "Insert commit message"
            }
        ]);
    }
}