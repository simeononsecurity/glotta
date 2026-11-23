const { mkdtemp, rm } = require('node:fs/promises');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

jest.mock('./generate-translated-files-if-not-exist', () => ({
    generateTranslatedFilesIfNotExist: jest.fn(async () => {})
}));

const { run } = require('./index');
const { generateTranslatedFilesIfNotExist } = require('./generate-translated-files-if-not-exist');

describe('CLI options', () => {
    let dir;

    beforeEach(async () => {
        dir = await mkdtemp(join(tmpdir(), 'glotta-cli-'));
        generateTranslatedFilesIfNotExist.mockClear();
    });

    afterEach(async () => {
        await rm(dir, { recursive: true, force: true });
    });

    it('defaults to English and all other supported target languages', async () => {
        await run(['node', 'glotta', '--source', dir]);
        const opts = generateTranslatedFilesIfNotExist.mock.calls[0][0];
        expect(opts.sourceLanguageId).toBe('en');
        expect(opts.targetLanguageIds).not.toContain('en');
        expect(opts.targetLanguageIds).toContain('es');
        expect(opts.recursive).toBe(false);
        expect(opts.force).toBe(false);
    });

    it('passes selected source, targets, recursive, and force options', async () => {
        await run(['node', 'glotta', '--source', dir, '--sourceLanguageId', 'es',
            '--targetLanguageIds', 'en', 'fr', '--recursive', '--force']);
        expect(generateTranslatedFilesIfNotExist).toHaveBeenCalledWith({
            dir, sourceLanguageId: 'es', targetLanguageIds: ['en', 'fr'], recursive: true, force: true
        });
    });

    it('excludes a non-English source from default targets', async () => {
        await run(['node', 'glotta', '--source', dir, '--sourceLanguageId', 'es']);
        const opts = generateTranslatedFilesIfNotExist.mock.calls[0][0];
        expect(opts.targetLanguageIds).not.toContain('es');
        expect(opts.targetLanguageIds).toContain('en');
    });

    it('rejects an invalid source language before generation', async () => {
        await expect(run(['node', 'glotta', '--source', dir, '--sourceLanguageId', 'invalid']))
            .rejects.toThrow(TypeError);
        expect(generateTranslatedFilesIfNotExist).not.toHaveBeenCalled();
    });
});
