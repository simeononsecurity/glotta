const LANGUAGE_IDS = {
    ar: 'ar',
    bn: 'bn',
    ca: 'ca',
    zh: 'zh',
    en: 'en',
    fr: 'fr',
    de: 'de',
    hi: 'hi',
    it: 'it',
    ja: 'ja',
    pt: 'pt',
    pa: 'pa',
    ro: 'ro',
    ru: 'ru',
    es: 'es'
}

async function assertValidLanguageIds(languageIds) {
    for await (const id of languageIds) {
        await assertValidLanguageId(id);
    }
}

async function assertValidLanguageId(languageId) {
    if (typeof LANGUAGE_IDS[languageId] === 'undefined') {
        throw TypeError(`${languageId} is not a valid languageId`);
    }
}

module.exports = {
    LANGUAGE_IDS,
    assertValidLanguageIds,
    assertValidLanguageId
}
