
# Public Release Manager

![Public Release Manager](https://a) <!-- Replace with your own image -->

## Overview

Public Release Manager is a Node.js CLI tool designed to automate the process of updating and releasing new versions of your projects. This tool helps streamline the versioning process by handling Git operations, updating the `package.json`, and pushing changes to your repository.

## Features

- **Git Integration**: Automatically checks if Git is installed, configured, and logged in.
- **Version Management**: Uses `semver` to increment project versions.
- **Automatic Commits**: Commits and pushes changes to the repository.
- **Interactive CLI**: Provides a user-friendly command-line interface for managing releases.

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (v6 or later)
- Git installed and configured

### Installation

1. Clone the repository:

    ```bash
    npm install jaws-release-manager
    ```

### How It Works

1. **Create a script shortcut**: Add the script to the package.json file

    ```json
    "scripts": {
        "release": "node ./node_modules/jaws-release-manager/main.js"
    },
    ```

2. **Execute the tool**: Run the commmand
   ```bash
    npm run release
   ```

3. **Git Checks**: The tool checks if Git is installed, if your project is a valid Node.js project, and if Git is configured correctly:
4. **Select Release Type**: Choose the type of release you want to create (Major, Minor, Patch, etc.):

5. **Version Update Confirmation**: Confirm if you want to update the version:

6. **Automatic Commit and Push**: The tool commits the changes and pushes them to your repository:

### File Structure

Here's an overview of the main files in the project:

```bash
.
├── utils
│   ├── git.js      # Git-related functions
│   ├── project.js  # Project-related functions (e.g., package.json checks)
├── package.json        # Project configuration and dependencies
├── README.md           # This file
├── cli.js          # Handles user prompts and CLI interactions
├── main.js         # Main entry point for the release process
└── ...
