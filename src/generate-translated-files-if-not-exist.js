const { dirname } = require("node:path");
const { LANGUAGE_IDS, assertValidLanguageIds } = require("./assert-valid-language-id");
const { getPathsOfFilesInLanguage } = require('./services/get-paths-of-files-in-language')
const { realpath } = require('node:fs/promises');

async function generateTranslatedFilesIfNotExist({ source, targetLanguages }) {
    assertValidLanguageIds(targetLanguages);
    const pathsToEnglishFiles = await getPathsOfFilesInLanguage({ startDir: source, languageId: LANGUAGE_IDS.es, recursive: false });
    for await (let englishFilePath of pathsToEnglishFiles) {
        // in the same dir,
        //   for each missing language files,
        //     generate it

        const absPath = await realpath(englishFilePath);
        const containingDirPath = await dirname(absPath);
        
        const missingLanguageFiles = getMissingLanguageFiles(containingDirPath);

        // const text = await getFileContents(englishFilePaths);
        // const { results, translationIndices } = await parseHugo(text);

        // const translatedText = await translateParsedHugo({ results, translationIndices });
        // const newFilepath = getNewFileNameForLanguage(englishFilePaths);

        // await writeFile()
    }
}

module.exports = {
    generateTranslatedFilesIfNotExist
}
