import chalk from "chalk"
import { exit } from "process";

export const cancelByUser = () => {
    console.log(chalk.red("Process stopped by user"));
    exit(0)
}