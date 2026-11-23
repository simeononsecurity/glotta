const { InvalidArgumentError } = require("commander");

const TRANSLATE_PROVIDERS = Object.freeze({
    GOOGLE: 'GOOGLE',
    DEEPL: 'DEEPL',
    OPENAI: 'OPENAI',
    CODEX: 'CODEX',
    CLAUDE: 'CLAUDE'
});

function assertValidTranslateProvider(provider) {
    if (!Object.hasOwn(TRANSLATE_PROVIDERS, provider)) {
        throw new InvalidArgumentError(`${provider} is not a valid Translate Provider`);
    }
}

module.exports = {
    TRANSLATE_PROVIDERS,
    assertValidTranslateProvider
}
