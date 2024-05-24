import {exec} from "child_process";

exec(`electron-packager ${projectName} --platform=win32 --arch=x64"`)
const createRelease = process.argv.includes('--create-release');
if (createRelease) {
    exec(`gh release create v${newVersion} --title "v${newVersion}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Release creata con successo');
    });
}