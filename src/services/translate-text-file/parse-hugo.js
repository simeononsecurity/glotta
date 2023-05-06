const { createHugoParser, createCstToTranslateInputTreeVisitor } = require('./create-hugo-parser');

async function parseHugo(text) {
    const parser = await createHugoParser(text);
    const cst = parser.hugo();

    const BaseCstVisitorConstructor = parser.getBaseCstVisitorConstructor()
    const inputTreeVisitor = createCstToTranslateInputTreeVisitor(BaseCstVisitorConstructor);
    const inputTree = await inputTreeVisitor.visit(cst);

    return {
        inputTree,
        BaseCstVisitorConstructor
    }
}

module.exports = {
    parseHugo
}
