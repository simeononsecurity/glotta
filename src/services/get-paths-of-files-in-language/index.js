const { readdir, stat } = require('node:fs/promises');
const { join } = require('node:path');
const { assertValidLanguageId } = require('../../assert-valid-language-id')

async function getPathsOfFilesInLanguage(startDir, languageId) {
    await assertValidLanguageId(languageId);
    let results = [];
    let currentDir = startDir;
    let seenDirs = [];
    let moreToExplore = true;
    while (moreToExplore) {
        let seenFiles = await readdir(currentDir);
        for (let i = 0; i < seenFiles.length; i++) {
            let currentFile = seenFiles[i];
            let p = join(currentDir, currentFile);
            if ((await stat(p)).isDirectory()) {
                seenDirs.push(p);
            }
            else if (p.endsWith(`.${languageId}.md`)) {
                results.push(p);
            }
        }
        if (seenDirs.length > 0) {
            currentDir = seenDirs.pop();
        }
        else {
            moreToExplore = false;
        }
    }
    return results;
}

module.exports = {
    getPathsOfFilesInLanguage
}
