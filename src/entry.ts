#!/usr/bin/env node

import chalk from "chalk";
import { FirstActions } from "./inquirer";
import { AnalyzeFolder } from "./utils/project";
import { cancelByUser } from "./utils/helper";

// Fancy ASCII Art Title
const title = `
       ██╗  █████╗ ██╗    ██╗███████╗
       ██║ ██╔══██╗██║    ██║██╔════╝
       ██║ ███████║██║ █╗ ██║███████╗
  ██   ██║ ██╔══██║██║███╗██║╚════██║
  ╚█████╔╝ ██║  ██║╚███╔███╔╝███████║
   ╚════╝  ╚═╝  ╚═╝ ╚══╝╚══╝ ╚══════╝
`;

console.log(chalk.blueBright.bold(title));

// Add some dynamic styled messages
console.log(
  chalk.greenBright("🌊 Welcome to ") +
  chalk.bold.underline("JAWS Helper") +
  chalk.greenBright("! 🚀")
);
console.log(
  chalk.yellow("Preparing your environment...") +
  chalk.yellow.bold(" Please wait.")
);

process.on('uncaughtException', (error) => {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    cancelByUser();
  } else {
    throw error;
  }
});

AnalyzeFolder().then(({ isGitConfigured, isNodeProject, isUserLoggedIn }) => {
  if (!isGitConfigured || !isNodeProject || !isUserLoggedIn)
    return;

  console.log(chalk.cyanBright("All systems operational! ✅"));

  FirstActions.printInquirer();
})


