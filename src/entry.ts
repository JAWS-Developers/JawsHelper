#!/usr/bin/env node

import chalk from "chalk";
import inquirer from "inquirer";
import { FirstActions } from "./inquirer";
import { AnalyzeFolder } from "./utils/project";

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

AnalyzeFolder().then(({ isGitConfigured, isNodeProject, isUserLoggedIn }) => {
  if (!isGitConfigured || !isNodeProject || !isUserLoggedIn)
    return;

  console.log(chalk.cyanBright("All systems operational! ✅"));

  FirstActions.printInquirer();
})


