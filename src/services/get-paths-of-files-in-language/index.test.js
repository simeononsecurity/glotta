const { mkdtemp, mkdir, writeFile, rm } = require('node:fs/promises');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { getPathsOfFilesInLanguage } = require('./index');

describe('getPathsOfFilesInLanguage', () => {
    let root;

    beforeEach(async () => {
        root = await mkdtemp(join(tmpdir(), 'glotta-discovery-'));
        await mkdir(join(root, 'nested'));
        await writeFile(join(root, 'index.en.md'), 'source');
        await writeFile(join(root, 'index.es.md'), 'translation');
        await writeFile(join(root, 'nested', 'index.en.md'), 'nested source');
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    it('finds nested source files only when recursive', async () => {
        expect(await getPathsOfFilesInLanguage({ startDir: root, languageId: 'en', recursive: false }))
            .toEqual({ [root]: [join(root, 'index.en.md')] });
        expect(await getPathsOfFilesInLanguage({ startDir: root, languageId: 'en', recursive: true }))
            .toEqual({
                [root]: [join(root, 'index.en.md')],
                [join(root, 'nested')]: [join(root, 'nested', 'index.en.md')]
            });
    });

    it('finds files in a non-English source language', async () => {
        expect(await getPathsOfFilesInLanguage({ startDir: root, languageId: 'es' }))
            .toEqual({ [root]: [join(root, 'index.es.md')] });
    });

    it('rejects an invalid language id', async () => {
        await expect(getPathsOfFilesInLanguage({ startDir: root, languageId: 'invalid' }))
            .rejects.toThrow(TypeError);
    });
});
