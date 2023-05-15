const { translateText } = require('../translate-text');
const { assertValidLanguageId } = require('../../assert-valid-language-id');

async function translateParsedHugo({ results, translationDetails, targetLanguageId }) {
    await assertValidLanguageId(targetLanguageId);
    const translatedResults = await translate({ results, translationDetails, targetLanguageId });
    const translatedFileText = await asOneString(translatedResults);
    return translatedFileText;
}

async function translate({ results, translationDetails, targetLanguageId }) {
    const newResults = [];
    let j = 0;
    for await (const i of translationDetails.locations) {
        let textToTranslate = results[i];
        const fmItem = translationDetails.frontmatterItemValueLocations[i];

        if (fmItem) {
            textToTranslate = fmItem ? fmItem.rawValue : textToTranslate;
        }
        let translatedTextSegment = (await translateText(textToTranslate, targetLanguageId));
        if (textToTranslate.endsWith(' ') && !translatedTextSegment.endsWith(' ')) { // retain trailing spaces
            translatedTextSegment += ' ';
        }
        else if (!textToTranslate.endsWith(' ') && translatedTextSegment.endsWidth(' ')) { // don't randomly add trailing spaces
            translatedTExtSegment = translatedTextSegment.slice(0, -1);
        }
        if (fmItem) {
            translatedTextSegment = translatedTextSegment.replaceAll('"', ''); // stop translation API from being extra "helpful" with frontmatter values
            translatedTextSegment = `"${translatedTextSegment}${fmItem.suffix}`
        }

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

async function asOneString(results) {
    return results.join('');
}

module.exports = {
    translateParsedHugo
}
