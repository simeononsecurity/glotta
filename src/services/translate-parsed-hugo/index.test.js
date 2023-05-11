require('dotenv').config()

const { resolve } = require('node:path');
const { getFileContents } = require('../get-file-contents');
const { translateParsedHugo } = require('./index');
const { LANGUAGE_IDS } = require('../../assert-valid-language-id');
const { TRANSLATE_PROVIDERS } = require('../../assert-valid-translate-provider');

const MOCK_PARSED_HUGO_PATH = resolve(__dirname, '../../../__fixtures__/mock-parsed-hugo.json');

const MOCK_GENERATED_HUGO_PATH = resolve(__dirname, '../../../__fixtures__/mock-generated-hugo.es.md'); // GOOGLE result
const MOCK_GENERATED_HUGO_PATH_DEEPL = resolve(__dirname, '../../../__fixtures__/mock-generated-hugo-deepl.es.md'); // DEEPL result

const EXPECTED_PATH = process.env.TRANSLATE_PROVIDER === TRANSLATE_PROVIDERS.DEEPL ? MOCK_GENERATED_HUGO_PATH_DEEPL : MOCK_GENERATED_HUGO_PATH;
describe('translateParsedHugo', () => {
    it('translates parsed hugo given translation indicies', async () => {
        const { results, translationIndices } = JSON.parse(await getFileContents(MOCK_PARSED_HUGO_PATH));
        const EXPECTED = await getFileContents(EXPECTED_PATH);
        const translatedText = await translateParsedHugo({ results, translationIndices, targetLanguageId: LANGUAGE_IDS.es });
        expect(translatedText).toEqual(EXPECTED);
    }, 20000);
});
