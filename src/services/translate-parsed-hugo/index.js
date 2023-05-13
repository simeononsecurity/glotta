const { translateText } = require('../translate-text');
const { assertValidLanguageId, LANGUAGE_IDS } = require('../../assert-valid-language-id');

async function translateParsedHugo({ results, translationIndices, targetLanguageId }) {
    await assertValidLanguageId(targetLanguageId);
    const translatedResults = await translate({ results, translationIndices, targetLanguageId });
    const translatedFileText = await asOneString(translatedResults, targetLanguageId);
    return translatedFileText;
}

async function translate({ results, translationIndices, targetLanguageId }) {
    const newResults = [];
    let j = 0;
    for await (const i of translationIndices) {
        const translatedTextSegment = (await translateText(results[i], targetLanguageId));
        while (j < i) {
            newResults.push(results[j]);
            j++;
        }
        if (j === i) {
            j++;
        }
        newResults.push(translatedTextSegment);
    }
    while (j < results.length) {
        newResults.push(results[j]);
        j++;
    }
    return newResults;
}

async function asOneString(results, targetLanguageId) {
    let str = results.join('');
    if (targetLanguageId === LANGUAGE_IDS.de) {
        str = str.replace('„', '"');
        str = str.replace('“', '"');
    }
    else if (targetLanguageId === LANGUAGE_IDS.ar) {
        str = str.replace('،', ',');
    }
    return str;
}

module.exports = {
    translateParsedHugo
}
