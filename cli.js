const { select } = require('@inquirer/prompts');

const releaseTypes = [
    { name: 'Major', value: 'major' },
    { name: 'Minor', value: 'minor' },
    { name: 'Patch', value: 'patch' },
    { name: 'Premajor', value: 'premajor' },
    { name: 'Preminor', value: 'preminor' },
    { name: 'Prepatch', value: 'prepatch' },
    { name: 'Prerelease', value: 'prerelease' },
];

/**
 * Prompt user to confirm the update
 * @param {string} newVersion - The new version to confirm
 * @returns {Promise<boolean>}
 */
const confirmUpdate = (newVersion) => {
    return select({
        message: `Update the version to : ${newVersion}?`,
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
 * Prompt user for the release type
 * @returns {Promise<string>}
 */
const getReleaseType = () => {
    return select({
        message: 'What type of release is it?',
        choices: releaseTypes,
    });
};

module.exports = {
    confirmUpdate,
    getReleaseType
};
