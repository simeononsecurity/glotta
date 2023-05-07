const { parseHugo } = require('./parse-hugo');
const { translateText } = require('../translate-text');
const { LANGUAGE_IDS } = require('../../assert-valid-language-id');

async function translateHugoFileText(text) {
    const { results, translationIndices } = await parseHugo(text);
    const translatedResults = await translate(results, translationIndices);
    const translatedFileText = await asOneString(translatedResults);
    return translatedFileText;
}

async function translate(results, translationIndices) {
    translationIndices.forEach(async i => {
        results[i] = await translateText(results[i], LANGUAGE_IDS.es);
    });
    return results
}

async function asOneString(results) {
    return results.join('')
}

module.exports = {
    translateFileText
}
