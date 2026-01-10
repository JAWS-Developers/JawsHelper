#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = require("./inquirer");
const project_1 = require("./utils/project");
const helper_1 = require("./utils/helper");
// Fancy ASCII Art Title
const title = `
       ██╗  █████╗ ██╗    ██╗███████╗
       ██║ ██╔══██╗██║    ██║██╔════╝
       ██║ ███████║██║ █╗ ██║███████╗
  ██   ██║ ██╔══██║██║███╗██║╚════██║
  ╚█████╔╝ ██║  ██║╚███╔███╔╝███████║
   ╚════╝  ╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝
`;
console.log(chalk_1.default.blueBright.bold(title));
// Add some dynamic styled messages
console.log(chalk_1.default.greenBright("🌊 Welcome to ") +
    chalk_1.default.bold.underline("JAWS Helper") +
    chalk_1.default.greenBright("! 🚀"));
console.log(chalk_1.default.yellow("Preparing your environment...") +
    chalk_1.default.yellow.bold(" Please wait."));
process.on('uncaughtException', (error) => {
    if (error instanceof Error && error.name === 'ExitPromptError') {
        (0, helper_1.cancelByUser)();
    }
    else {
        throw error;
    }
});
(0, project_1.AnalyzeFolder)().then(({ isGitConfigured, isNodeProject, isUserLoggedIn }) => {
    const isFullyConfigured = isGitConfigured && isNodeProject && isUserLoggedIn;
    if (isFullyConfigured) {
        console.log(chalk_1.default.cyanBright("All systems operational! ✅"));
    }
    else {
        console.log(chalk_1.default.yellowBright("⚠️  Limited features available (Git clone only)"));
    }
    inquirer_1.FirstActions.printInquirer(isFullyConfigured);
});
