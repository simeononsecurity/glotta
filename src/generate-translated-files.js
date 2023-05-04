const { readFile } = require('node:fs/promises');
const { LANGUAGE_IDS } = require("./assert-valid-language-id");
const { getPathsOfFilesInLanguage } = require('./services/get-paths-of-files-in-language')
const { parseHugo } = require('./services/parse-hugo');

// const { translateText } = require("./services/translate-text");
// const BaseSQLVisitor = parserInstance.getBaseCstVisitorConstructor();

async function generateTranslatedFiles(srcDir, targetLang) {
    const DEFAULT_OUT_DIR = srcDir;
    const paths = await getPathsOfFilesInLanguage(srcDir, LANGUAGE_IDS.en);
    for (let p of paths) {
        const text = await readFile(p, 'utf8');
        const { hugoParser, hugoVisitor } = await parseHugo(text);
        const cst = hugoParser.hugo();
        const value = hugoVisitor.visit(cst);
        console.log(JSON.stringify(value, null, 2));
        // const translatedText = await translateText(fileContent, LANGUAGE_IDS.es);
        // console.log(translatedText);
    }
}

module.exports = {
    generateTranslatedFiles
}
