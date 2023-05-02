const { InvalidArgumentError } = require("commander");

const TRANSLATE_PROVIDERS = {
    GOOGLE: 'GOOGLE',
    DEEPL: 'DEEPL'
}

async function assertValidTranslateProvider(provider) {
    if (typeof TRANSLATE_PROVIDERS[provider] === 'undefined') {
        throw new InvalidArgumentError(`${provider} is not a valid Translate Provider`);
    }
}

module.exports = {
    TRANSLATE_PROVIDERS,
    assertValidTranslateProvider
}
