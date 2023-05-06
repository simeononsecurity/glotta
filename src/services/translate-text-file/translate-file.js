const { createCstToFileVisitor, createTranslatedCstVisitor } = require('./create-hugo-parser');
const { translateTree } = require('./translate-tree');
const { parseHugo } = require('./parse-hugo');

async function translateFileText(text) {
    // parse text into cst
    const { inputTree, BaseCstVisitorConstructor } = await parseHugo(text);

    // translate tree
    const translateCstVisitor = createTranslatedCstVisitor(BaseCstVisitorConstructor);
    const translatedCst = translateCstVisitor.visit(inputTree);

    // reconstruct text
    const cstToFileVisitor = createCstToFileVisitor(BaseCstVisitorConstructor);
    const translatedFileText = await cstToFileVisitor.visit(translatedCst); // create file from translated tree
    return translatedFileText;
}

module.exports = {
    translateFileText
}
