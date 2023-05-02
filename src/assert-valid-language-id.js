const { InvalidArgumentError } = require("commander");

const LANGUAGE_IDS = {
    en: 'en',
    es: 'es'
}

async function assertValidLanguageId(languageId) {
    if (typeof LANGUAGE_IDS[languageId] === 'undefined') {
        throw new InvalidArgumentError(`${languageId} is not a valid languageId`);
    }
}

module.exports = {
    LANGUAGE_IDS,
    assertValidLanguageId
}
