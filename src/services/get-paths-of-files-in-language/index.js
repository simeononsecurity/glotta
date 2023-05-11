const { readdir, stat } = require('node:fs/promises');
const { join } = require('node:path');
const { assertValidLanguageId } = require('../../assert-valid-language-id');

async function getPathsOfFilesInLanguage({ startDir, languageId, recursive }) {
    await assertValidLanguageId(languageId);
    const results = {};
    let currentDir = startDir;
    let seenDirs = [];
    let moreToExplore = true;
    while (moreToExplore) {
        let seenFiles = await readdir(currentDir);
        for (let i = 0; i < seenFiles.length; i++) {
            let currentFile = seenFiles[i];
            let p = join(currentDir, currentFile);
            if ((await stat(p)).isDirectory()) {
                if (recursive) {
                    seenDirs.push(p);
                }
            }
            else if (p.endsWith(`.${languageId}.md`)) {
                if (!results[currentDir]) {
                    results[currentDir] = [];
                }
                results[currentDir].push(p)
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
