const { readdir } = require('node:fs/promises');
const { join } = require('node:path');

async function getMissingLanguageIdsForDir({ dir, targetLanguageIds }) {
    const missingLanguageIds = [];
    const existingLanguageIds = {};
    const seenFiles = await readdir(dir);

    for (let i = 0; i < targetLanguageIds.length; i++) {
        const id = targetLanguageIds[i];
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
    getMissingLanguageIdsForDir
}
