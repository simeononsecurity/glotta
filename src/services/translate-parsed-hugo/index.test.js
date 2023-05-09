require('dotenv').config()

const { resolve } = require('node:path');
const { getFileContents } = require('../get-file-contents');
const { translateParsedHugo } = require('./index');

const MOCK_PARSED_HUGO_PATH = resolve(__dirname, '../../../__fixtures__/mock-parsed-hugo.json');
const MOCK_GENERATED_HUGO_PATH = resolve(__dirname, '../../../__fixtures__/mock-generated-hugo.es.md');

describe('translateParsedHugo', () => {
    it('translates parsed hugo given translation indicies', async () => {
        const { results, translationIndices } = JSON.parse(await getFileContents(MOCK_PARSED_HUGO_PATH));
        const EXPECTED = await getFileContents(MOCK_GENERATED_HUGO_PATH);
        const translatedText = await translateParsedHugo({ results, translationIndices });
        expect(translatedText).toEqual(EXPECTED);
    }, 20000);
});
