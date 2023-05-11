const { resolve } = require('node:path');
const { LANGUAGE_IDS } = require('../../assert-valid-language-id');
const { getPathsOfFilesInLanguage } = require('./index');

const FIXTURES_DIR = resolve(__dirname, '../../../__fixtures__');

describe('getPathsOfFilesInLanguage', () => {
    it('recursive case: returns an array of file paths for a valid language id', async () => {
        const DIR = resolve(FIXTURES_DIR, './example-dir');
        let paths = await getPathsOfFilesInLanguage({ startDir: DIR, languageId: LANGUAGE_IDS.en, recursive: true });
        expect(paths).toEqual({ "/home/l/Projects/github.com/1nf053c/glotta/__fixtures__/example-dir": ["/home/l/Projects/github.com/1nf053c/glotta/__fixtures__/example-dir/mock-file.en.md"], "/home/l/Projects/github.com/1nf053c/glotta/__fixtures__/example-dir/nested-example-dir": ["/home/l/Projects/github.com/1nf053c/glotta/__fixtures__/example-dir/nested-example-dir/mock-file.en.md"] })
    });

    it('non-recursive case: returns an array of file paths for a valid language id', async () => {
        const DIR = resolve(FIXTURES_DIR, './example-dir');
        let paths = await getPathsOfFilesInLanguage({ startDir: DIR, languageId: LANGUAGE_IDS.en, recursive: false });
        expect(paths).toEqual({ "/home/l/Projects/github.com/1nf053c/glotta/__fixtures__/example-dir": ["/home/l/Projects/github.com/1nf053c/glotta/__fixtures__/example-dir/mock-file.en.md"] })
    });

    it('returns a TypeError if provided an invalid language id', async () => {
        await expect(getPathsOfFilesInLanguage(FIXTURES_DIR, 'invalid-language-id')).rejects.toThrow(TypeError);
    });
});
