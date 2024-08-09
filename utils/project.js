const ora = require('ora');

/**
 * Check if the package json is valid
 * @returns {boolean}
 */
const checkPackageJson = () => {
    const spinner = ora('Checking for package.json...').start();

    try {
        const packageJson = require('../package.json');

        // Basic validation (optional)
        if (!packageJson.name || !packageJson.version) {
            spinner.fail("package.json is not correct");
            return false;
        }

        spinner.succeed("package.json loaded correctly");
        return true;
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            spinner.fail('package.json not found');
            return false; // Early exit if not a Node.js project
        } else {
            spinner.fail('Error checking for package.json: ' + error.message);
            return false; // Unexpected error, indicate failure
        }
    }
};

module.exports = {
    checkPackageJson
};
