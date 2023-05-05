const { LANGUAGE_IDS } = require("./assert-valid-language-id");
const { getPathsOfFilesInLanguage } = require('./services/get-paths-of-files-in-language')
const { parseHugo } = require('./services/parse-hugo');

async function generateTranslatedFiles(srcDir, targetLang) {
    const paths = await getPathsOfFilesInLanguage(srcDir, LANGUAGE_IDS.en);
    for (let p of paths) {
        const text = await getFileContents(p);
        const translateInputTree = await parseHugo(text);
        // TODO
    }
}

module.exports = {
    generateTranslatedFiles
}
