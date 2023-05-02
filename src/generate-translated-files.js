const { readFile } = require('node:fs/promises');
const { getPathsOfFilesInLanguage } = require('./services/get-paths-of-files-in-language')
const { LANGUAGE_IDS } = require("./assert-valid-language-id");
const { translateText } = require("./services/translate-text");

async function generateTranslatedFiles(srcDir, targetLang) {
    const DEFAULT_OUT_DIR = srcDir;

    const paths = await getPathsOfFilesInLanguage(srcDir, LANGUAGE_IDS.en)
    for (let p of paths) {
        const fileContent = await readFile(p, 'utf8');
        const translatedText = await translateText(fileContent, LANGUAGE_IDS.es);
        console.log(translatedText);
    }
}

module.exports = {
    generateTranslatedFiles
}
