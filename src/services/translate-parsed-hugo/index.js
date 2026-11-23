const { translateText } = require('../translate-text');
const { assertValidLanguageId } = require('../../assert-valid-language-id');

async function translateParsedHugo({
    results, translationDetails, targetLanguageId, sourceLanguageId = 'en',
    translator = translateText
}) {
    await assertValidLanguageId(sourceLanguageId);
    await assertValidLanguageId(targetLanguageId);
    const translated = results.slice();
    for (const index of translationDetails.locations) {
        const detail = translationDetails.frontmatterItemValueLocations[index];
        const input = detail ? detail.rawValue : results[index];
        const output = await translator(input, targetLanguageId, sourceLanguageId);
        if (typeof output !== 'string') {
            throw new TypeError('Translation provider returned a non-text response');
        }
        const value = output.trim();
        if (detail) {
            if (detail.quote === '"') translated[index] = '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
            else if (detail.quote === "'") translated[index] = "'" + value.replace(/'/g, "''") + "'";
            else translated[index] = value;
        } else {
            translated[index] = value;
        }
    }
    return translated.join('');
}

module.exports = { translateParsedHugo };
