const { readdir } = require('node:fs/promises');
const { basename } = require('node:path');

async function getMissingLanguageIdsForDir({ dir, sourceFilePath, targetLanguageIds }) {
    const names = new Set(await readdir(dir));
    if (!sourceFilePath) {
        return targetLanguageIds.filter(id => !Array.from(names).some(name => name.endsWith(`.${id}.md`)));
    }

    const sourceName = basename(sourceFilePath);
    const match = sourceName.match(/^(.*)\.[a-z]{2,3}\.md$/i);
    if (!match) {
        throw new TypeError(`Source file must end with a language code and .md: ${sourceName}`);
    }
    return targetLanguageIds.filter(id => !names.has(`${match[1]}.${id}.md`));
}

module.exports = { getMissingLanguageIdsForDir };
