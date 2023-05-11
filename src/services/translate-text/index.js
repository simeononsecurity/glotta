const { assertValidLanguageId } = require("../../assert-valid-language-id");
const { assertValidTranslateProvider, TRANSLATE_PROVIDERS } = require("../../assert-valid-translate-provider")

// Google
const { Translate } = require('@google-cloud/translate').v2

// Deepl
const deepl = require('deepl-node');
const authKey = process.env.DEEPL_AUTH_KEY;
const translator = new deepl.Translator(authKey);

async function translateText(text, languageId) {
    const translateProvider = process.env.TRANSLATE_PROVIDER;
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
    return result;
}

async function translateTextWithGoogleTranslationApi(text, languageId) {
    // the following expects process.env.GOOGLE_APPLICATION_CREDENTIALS
    //   to be set to the path to gcloud service account cred json file
    const translate = new Translate();
    const options = {
        from: 'en',
        to: languageId,
    };
    let results = await translate.translate(text, options);
    return results[0];
}

async function translateTextWithDeeplApi(text, languageId) {
    const result = await translator.translateText(text, null, languageId);
    return result.text;
}

module.exports = {
    translateText
}
