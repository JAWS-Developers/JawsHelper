"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelByUser = void 0;
const chalk_1 = __importDefault(require("chalk"));
const process_1 = require("process");
const cancelByUser = () => {
    console.log(chalk_1.default.red("Process stopped by user"));
    (0, process_1.exit)(0);
};
exports.cancelByUser = cancelByUser;
