const { resolve } = require('node:path');
const { getMissingLanguageIdsForDir } = require(".");
const { LANGUAGE_IDS } = require('../../assert-valid-language-id');

const FIXTURES_DIR = resolve(__dirname, '../../../__fixtures__');
const DIR = resolve(FIXTURES_DIR, './example-dir');

describe('getMissingLanguagesForDir', () => {
    it('returns missing language ids given a dir', async () => {
        const missingLanguageIds = await getMissingLanguageIdsForDir({ dir: DIR, targetLanguageIds: Object.keys(LANGUAGE_IDS) });
        expect(missingLanguageIds).toEqual(["ar", "bn", "ca", "fr", "de", "hi", "it", "ja", "pt", "pa", "ro", "ru", "es"]);
    });
});
