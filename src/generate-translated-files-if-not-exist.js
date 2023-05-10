const { dirname, basename, join } = require("node:path");
const { LANGUAGE_IDS, assertValidLanguageIds } = require("./assert-valid-language-id");
const { getPathsOfFilesInLanguage } = require('./services/get-paths-of-files-in-language')
const { realpath, writeFile } = require('node:fs/promises');
const { getMissingLanguageIdsForDir } = require("./services/get-missing-languages-for-dir");
const { getFileContents } = require('./services/get-file-contents');
const { parseHugo } = require('./services/parse-hugo-file');
const { translateParsedHugo } = require('./services/translate-parsed-hugo');

async function generateTranslatedFilesIfNotExist({ dir, targetLanguageIds }) {
    assertValidLanguageIds(targetLanguageIds);
    const pathsToEnglishFiles = await getPathsOfFilesInLanguage({ startDir: dir, languageId: LANGUAGE_IDS.en, recursive: false });
    const missingLanguageIds = await getMissingLanguageIdsForDir({ dir, targetLanguageIds });

    console.log("\n========== glotta ============");
    console.log("dir:", dir);
    console.log('Input file(s): ', pathsToEnglishFiles);
    console.log("targetLanguageIds:", targetLanguageIds.join(', '));
    console.log('missing languages in this dir: ', missingLanguageIds.join(', '));
    if (missingLanguageIds.length === 0) {
        console.log('No missing languages in this directory - no translations being done!')
        return;
    }
    console.log("==============================\n");

    for await (let englishFilePath of pathsToEnglishFiles) {
        const absPath = await realpath(englishFilePath);
        const containingDirPath = dirname(absPath);

        // parse input file
        console.log('parsing input file...');
        const inputText = await getFileContents(englishFilePath);
        const { results, translationIndices } = await parseHugo(inputText);

        for await (const id of missingLanguageIds.reverse()) {
            // handle translation
            console.log('translating text into... ', id);
            const translatedText = await translateParsedHugo({ results, translationIndices, targetLanguageId: id });

            // write new file
            console.log('writing new file...');
            const translatedFileName = basename(englishFilePath).slice(0, -5) + `${id}.md`;
            const translatedFileFullPath = join(containingDirPath, translatedFileName);
            await writeFile(translatedFileFullPath, translatedText);
        }
    }
}

module.exports = {
    generateTranslatedFilesIfNotExist
}
