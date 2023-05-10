const { LANGUAGE_IDS, assertValidLanguageId } = require("./assert-valid-language-id");
const { getPathsOfFilesInLanguage } = require('./services/get-paths-of-files-in-language')
const { parseHugo } = require('./services/parse-hugo');

async function generateTranslatedFiles(srcDir, targetLang) {
    assertValidLanguageId(targetLang);
    const paths = await getPathsOfFilesInLanguage(srcDir, targetLang);
    for await (let p of paths) {
        const text = await getFileContents(p);
        const { results, translationIndices } = await parseHugo(text);

        const translatedText = await translateParsedHugo({ results, translationIndices });
        const newFilepath = getNewFileNameForLanguage(p);
        // await writeFile()
    }
}

module.exports = {
    generateTranslatedFiles
}
