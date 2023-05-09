const { translateText } = require('../translate-text');
const { LANGUAGE_IDS } = require('../../assert-valid-language-id');

async function translateParsedHugo(results, translationIndices) {
    const translatedResults = await translate(results, translationIndices);
    const translatedFileText = await asOneString(translatedResults);
    return translatedFileText;
}

async function translate({ results, translationIndices }) {
    for await (const i of translationIndices) {
        results[i] = (await translateText(results[i], LANGUAGE_IDS.es))
    }
    return results;
}


async function asOneString(results) {
    return results.join('')
}

module.exports = {
    translateParsedHugo
}
