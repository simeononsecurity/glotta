const { resolve } = require('node:path');
const { getMissingLanguagesForDir } = require(".");

const FIXTURES_DIR = resolve(__dirname, '../../../__fixtures__');
const DIR = resolve(FIXTURES_DIR, './example-dir');

describe('getMissingLanguagesForDir', () => {
    it('returns missing language ids given a dir', async () => {
        const missingLanguageIds = await getMissingLanguagesForDir(DIR);
        expect(missingLanguageIds).toEqual(["ar", "bn", "ca", "zh", "fr", "de", "hi", "it", "ja", "pt", "pa", "ro", "ru", "es", "en"]);
    });
});
