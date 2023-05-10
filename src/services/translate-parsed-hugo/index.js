const { translateText } = require('../translate-text');
const { assertValidLanguageId } = require('../../assert-valid-language-id');

async function translateParsedHugo({ results, translationIndices, targetLanguageId }) {
    await assertValidLanguageId(targetLanguageId);
    const translatedResults = await translate({ results, translationIndices, targetLanguageId });
    const translatedFileText = await asOneString(translatedResults);
    return translatedFileText;
}

async function translate({ results, translationIndices, targetLanguageId }) {
    for await (const i of translationIndices) {
        results[i] = (await translateText( results[i], targetLanguageId ));
    }
    return results;
}

async function asOneString(results) {
    return results.join('');
}

module.exports = {
    translateParsedHugo
}
