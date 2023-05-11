const { dirname, basename, join } = require("node:path");
const { LANGUAGE_IDS, assertValidLanguageIds } = require("./assert-valid-language-id");
const { getPathsOfFilesInLanguage } = require('./services/get-paths-of-files-in-language')
const { realpath, writeFile } = require('node:fs/promises');
const { getMissingLanguageIdsForDir } = require("./services/get-missing-languages-for-dir");
const { getFileContents } = require('./services/get-file-contents');
const { parseHugo } = require('./services/parse-hugo-file');
const { translateParsedHugo } = require('./services/translate-parsed-hugo');

async function generateTranslatedFilesIfNotExist({ dir, targetLanguageIds, recursive, force }) {
    assertValidLanguageIds(targetLanguageIds);

    const discoveredEnglishMarkdownFiles = await getPathsOfFilesInLanguage({
        startDir: dir,
        languageId: LANGUAGE_IDS.en,
        recursive: recursive
    });

    for await (const dir of Object.keys(discoveredEnglishMarkdownFiles)) {
        await handleGenerateForSingleDir({
            dir,
            targetLanguageIds,
            englishFilePaths: discoveredEnglishMarkdownFiles[dir],
            force
        });
    }
}

async function handleGenerateForSingleDir({ dir, targetLanguageIds, englishFilePaths, force }) {
    console.log("\n========== glotta ============");
    console.log("dir:", dir);
    console.log('Input file(s): ', englishFilePaths);
    console.log("targetLanguageIds:", targetLanguageIds.join(', '));
    const languageIdsToWrite = force ? targetLanguageIds : await getMissingLanguageIdsForDir({ dir, targetLanguageIds });
    console.log("force overwrite if file exists?:", force);
    if (!force) {
        console.log('missing languages in this dir: ', languageIdsToWrite.join(', '));
        if (languageIdsToWrite.length === 0) {
            console.log('No missing languages in this directory - no translations being done!')
            return;
        }
    }
    console.log("==============================\n");

    for await (let englishFilePath of englishFilePaths) {
        const absPath = await realpath(englishFilePath);
        const containingDirPath = dirname(absPath);

        // parse input file
        console.log('parsing input file...');
        const inputText = await getFileContents(englishFilePath);
        const { results, translationIndices } = await parseHugo(inputText);

        for await (const id of languageIdsToWrite.reverse()) {
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
