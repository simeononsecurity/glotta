const { translateText } = require('../translate-text');
const { assertValidLanguageId } = require('../../assert-valid-language-id');

async function translateParsedHugo({ results, translationIndices, targetLanguageId }) {
    await assertValidLanguageId(targetLanguageId);
    const translatedResults = await translate({ results, translationIndices, targetLanguageId });
    const translatedFileText = await asOneString(translatedResults);
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
    return newResults;
}

async function asOneString(results) {
    return results.join('');
}

module.exports = {
    translateParsedHugo
}
