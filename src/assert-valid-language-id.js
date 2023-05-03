const LANGUAGE_IDS = {
    en: 'en',
    es: 'es'
}

async function assertValidLanguageId(languageId) {
    if (typeof LANGUAGE_IDS[languageId] === 'undefined') {
        throw TypeError(`${languageId} is not a valid languageId`);
    }
}

module.exports = {
    LANGUAGE_IDS,
    assertValidLanguageId
}
