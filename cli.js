const { select, input } = require('@inquirer/prompts');

const releaseTypes = [
    { name: 'Major', value: 'major' },
    { name: 'Minor', value: 'minor' },
    { name: 'Patch', value: 'patch' },
    { name: 'Prerelease', value: 'prerelease' },
];

/**
 * Prompt user to confirm the update
 * @param {string} newVersion - The new version to confirm
 * @returns {Promise<boolean>}
 */
const confirmUpdate = (newVersion, currentVersion) => {
    return select({
        message: `Update the version to : ${newVersion} (Current version: ${currentVersion})?`,
        choices: [
            {
                name: 'yes',
                value: true,
                description: 'Confirm update',
            },
            {
                name: 'no',
                value: false,
                description: 'Cancel update',
            }
        ]
    })
        .then(answers => answers);
};

/**
 * Prompt user to confirm the update
 * @param {string} newVersion - The new version to confirm
 * @returns {Promise<boolean>}
 */
const confirmPush = (message) => {
    return select({
        message: `The project will be pushed to github. Confirm?`,
        choices: [
            {
                name: 'yes',
                value: true,
                description: 'Confirm push',
            },
            {
                name: 'no',
                value: false,
                description: 'Cancel push',
            }
        ]
    })
        .then(answers => answers);
};

/**
 * Prompt user for the release type
 * @returns {Promise<string>}
 */
const getReleaseType = () => {
    return select({
        message: 'What type of release is it?',
        choices: releaseTypes,
    });
};

/**
 * Prompt user for the release type
 * @returns {Promise<string>}
 */
const askForCommitMessage = () => {
    return input({
        message: 'Add a commit message (Leave empty for no message):',
    });
};

module.exports = {
    confirmUpdate,
    getReleaseType,
    askForCommitMessage,
    confirmPush
};
