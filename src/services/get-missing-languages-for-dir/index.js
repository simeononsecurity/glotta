const { readdir } = require('node:fs/promises');
const { join } = require('node:path');
const { LANGUAGE_IDS } = require("../../assert-valid-language-id");

async function getMissingLanguagesForDir(dir) {
    const missingLanguageIds = {};
    const languageIds = Object.keys(LANGUAGE_IDS);
    const seenFiles = await readdir(dir);
    for (let i = 0; i < seenFiles.length; i++) {
        const file = seenFiles[i];
        const filepath = join(dir, file);
        for (let j = 0; j < languageIds.length; j++) {
            const id = languageIds[j];
            if (!filepath.endsWith(`.${id}.md`) && !missingLanguageIds[id]) {
                missingLanguageIds[id] = id;
            }
        }
    }
    return Object.keys(missingLanguageIds);
}

module.exports = {
    getMissingLanguagesForDir
}
