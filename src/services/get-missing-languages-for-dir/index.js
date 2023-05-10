const { readdir } = require('node:fs/promises');
const { join } = require('node:path');
const { LANGUAGE_IDS } = require("../../assert-valid-language-id");

async function getMissingLanguagesForDir(dir) {
    const missingLanguageIds = [];
    const existingLanguageIds = {};
    const languageIds = Object.keys(LANGUAGE_IDS);
    const seenFiles = await readdir(dir);

    for (let i = 0; i < languageIds.length; i++) {
        const id = languageIds[i];
        for (let j = 0; j < seenFiles.length; j++) {
            const file = seenFiles[j];
            const filepath = join(dir, file);
            if (filepath.endsWith(`.${id}.md`) && !existingLanguageIds[id]) {
                existingLanguageIds[id] = id;
            }
        }
        if (!existingLanguageIds[id]) {
            missingLanguageIds.push(id);
        }
    }
    return missingLanguageIds;
}

module.exports = {
    getMissingLanguagesForDir
}
