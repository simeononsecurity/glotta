const { dirname, basename, join } = require('node:path');
const { writeFile } = require('node:fs/promises');
const { assertValidLanguageId, assertValidLanguageIds } = require('./assert-valid-language-id');
const { getPathsOfFilesInLanguage } = require('./services/get-paths-of-files-in-language');
const { getMissingLanguageIdsForDir } = require('./services/get-missing-languages-for-dir');
const { getFileContents } = require('./services/get-file-contents');
const { parseHugo } = require('./services/parse-hugo-file');
const { translateParsedHugo } = require('./services/translate-parsed-hugo');

async function generateTranslatedFilesIfNotExist({
    dir, targetLanguageIds, recursive = false, force = false, sourceLanguageId = 'en'
}) {
    await assertValidLanguageId(sourceLanguageId);
    await assertValidLanguageIds(targetLanguageIds);
    if (targetLanguageIds.includes(sourceLanguageId)) {
        throw new TypeError('A target language cannot equal the source language');
    }

    const sourceFilesByDir = await getPathsOfFilesInLanguage({
        startDir: dir,
        languageId: sourceLanguageId,
        recursive
    });

    for (const sourceFilePaths of Object.values(sourceFilesByDir)) {
        for (const sourceFilePath of sourceFilePaths) {
            await generateForSourceFile({ sourceFilePath, targetLanguageIds, sourceLanguageId, force });
        }
    }
}

async function generateForSourceFile({ sourceFilePath, targetLanguageIds, sourceLanguageId, force }) {
    const dir = dirname(sourceFilePath);
    const targetIds = force
        ? targetLanguageIds
        : await getMissingLanguageIdsForDir({ dir, sourceFilePath, targetLanguageIds });
    if (targetIds.length === 0) {
        return;
    }

    console.log('Input file:', sourceFilePath);
    console.log('Target languages:', targetIds.join(', '));
    const inputText = await getFileContents(sourceFilePath);
    const { results, translationDetails } = await parseHugo(inputText);
    const suffix = `.${sourceLanguageId}.md`;
    const stem = basename(sourceFilePath).slice(0, -suffix.length);

    for (const targetLanguageId of targetIds) {
        console.log('Translating into:', targetLanguageId);
        const translatedText = await translateParsedHugo({
            results, translationDetails, sourceLanguageId, targetLanguageId
        });
        await writeFile(join(dir, `${stem}.${targetLanguageId}.md`), translatedText);
    }
}

module.exports = { generateTranslatedFilesIfNotExist };
