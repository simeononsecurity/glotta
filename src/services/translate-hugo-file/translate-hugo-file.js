const { createCstToFileVisitor, createTranslatedCstVisitor } = require('./create-hugo-parser');
const { parseHugo } = require('./parse-hugo');

async function translateFileText(text) {
    // parse text into cst
    const { results, translationIndices } = await parseHugo(text);
    // return { results, trans
    //return inputTree;

    // translate tree
    // const translateCstVisitor = createTranslatedCstVisitor(BaseCstVisitorConstructor);
    // const translatedCst = translateCstVisitor.visit(inputTree);

    // reconstruct text
    // const cstToFileVisitor = createCstToFileVisitor(BaseCstVisitorConstructor);
    // const translatedFileText = await cstToFileVisitor.visit(translatedCst); // create file from translated tree
    //return translatedCst; // translatedFileText;
}

module.exports = {
    translateFileText
}
