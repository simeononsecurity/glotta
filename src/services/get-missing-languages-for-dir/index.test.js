const { mkdtemp, writeFile, rm } = require('node:fs/promises');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { getMissingLanguageIdsForDir } = require('.');

describe('getMissingLanguageIdsForDir', () => {
    let dir;

    beforeEach(async () => {
        dir = await mkdtemp(join(tmpdir(), 'glotta-missing-'));
        await writeFile(join(dir, 'first.en.md'), 'source');
        await writeFile(join(dir, 'second.en.md'), 'source');
        await writeFile(join(dir, 'first.es.md'), 'translation');
    });

    afterEach(async () => {
        await rm(dir, { recursive: true, force: true });
    });

    it('checks the matching bundle filename, not any file in the directory', async () => {
        expect(await getMissingLanguageIdsForDir({
            dir, sourceFilePath: join(dir, 'second.en.md'), targetLanguageIds: ['es', 'fr']
        })).toEqual(['es', 'fr']);
        expect(await getMissingLanguageIdsForDir({
            dir, sourceFilePath: join(dir, 'first.en.md'), targetLanguageIds: ['es', 'fr']
        })).toEqual(['fr']);
    });
});
