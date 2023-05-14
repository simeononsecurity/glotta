const { assertValidLanguageId } = require("../../assert-valid-language-id");
const { assertValidTranslateProvider, TRANSLATE_PROVIDERS } = require("../../assert-valid-translate-provider")

// Google
const { Translate } = require('@google-cloud/translate').v2

// Deepl
const deepl = require('deepl-node');
const { withRetries } = require("../with-retries");
const authKey = process.env.DEEPL_AUTH_KEY;
const translator = new deepl.Translator(authKey);

async function translateText(text, languageId) {
    await assertValidLanguageId(languageId);
    const translateTextWithProviderFunc = withRetries(await getTranslationApiProvider());
    const result = await translateTextWithProviderFunc(text, languageId);
    return result;
}

async function getTranslationApiProvider() {
    const translateProvider = process.env.TRANSLATE_PROVIDER;
    if (typeof translateProvider === 'undefined') {
        translateProvider = TRANSLATE_PROVIDERS.GOOGLE // default
    }
    await assertValidTranslateProvider(translateProvider);
    return translateProvider === TRANSLATE_PROVIDERS.DEEPL ? translateTextWithDeeplApi : translateTextWithGoogleTranslationApi;
}

async function translateTextWithGoogleTranslationApi(text, languageId) {
    if(text === ""){
        return text
    }
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
    if(text === ""){
        return text
    }
    const result = await translator.translateText(text, null, languageId);
    return result.text;
}

module.exports = {
    translateText
}
