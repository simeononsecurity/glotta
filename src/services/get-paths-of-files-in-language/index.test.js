const { resolve } = require('node:path');
const { LANGUAGE_IDS } = require('../../assert-valid-language-id');
const { getPathsOfFilesInLanguage } = require('./index');

const FIXTURES_DIR = resolve(__dirname, '../../../__fixtures__');

describe('getPathsOfFilesInLanguage', () => {
    it('returns an array of file paths for a valid language id', async () => {
        const DIR = resolve(FIXTURES_DIR, './example-dir');

        let paths = await getPathsOfFilesInLanguage(DIR, LANGUAGE_IDS.en);

        expect(paths[0]).toEqual(resolve(DIR, 'mock-file.en.md'))
        expect(paths[1]).toEqual(resolve(DIR, 'nested-example-dir/mock-file.en.md'))
        expect(paths.length).toEqual(2);
    });

    it('returns a TypeError if provided an invalid language id', async () => {
        await expect(getPathsOfFilesInLanguage(FIXTURES_DIR, 'invalid-language-id')).rejects.toThrow(TypeError);
    });
});
