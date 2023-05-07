const { createHugoParser, cstToTranslationInput } = require('./create-hugo-parser');

async function parseHugo(text) {
    const parser = await createHugoParser(text);

    const cst = parser.hugo();
    const BaseCstVisitorConstructor = parser.getBaseCstVisitorConstructor()

    return cstToTranslationInput(cst, BaseCstVisitorConstructor);
}

module.exports = {
    parseHugo
}
