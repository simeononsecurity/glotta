const { assertValidLanguageId } = require("../../assert-valid-language-id");
const { assertValidTranslateProvider, TRANSLATE_PROVIDERS } = require("../../assert-valid-translate-provider")
const { Translate } = require('@google-cloud/translate').v2

async function translateText(text, languageId, translateProvider) {
    await assertValidLanguageId(languageId);
    if (typeof translateProvider === 'undefined') {
        translateProvider = TRANSLATE_PROVIDERS.GOOGLE // default
    }
    await assertValidTranslateProvider(translateProvider);

    let result;
    if (translateProvider == TRANSLATE_PROVIDERS.GOOGLE) {
        result = await translateTextWithGoogleTranslationApi(text, languageId);
    }
    else {
        result = await translateTextWithDeeplApi(text, languageId)
    }
    return result[0]
}

async function translateTextWithGoogleTranslationApi(text, languageId) {
    // the following expects process.env.GOOGLE_APPLICATION_CREDENTIALS
    //   to be set to the path to gcloud service account cred json file
    const translate = new Translate();
    const options = {
        from: 'en',
        to: languageId,
    };
    console.log('debug', options)
    let results = await translate.translate(text, options);
    return results;
}

async function translateTextWithDeeplApi(text, languageId) {
    throw 'not yet implemented'
}

module.exports = {
    translateText
}
