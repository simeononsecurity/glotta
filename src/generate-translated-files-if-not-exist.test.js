const { mkdtemp, mkdir, writeFile, readFile, rm } = require('node:fs/promises');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

jest.mock('./services/parse-hugo-file', () => ({ parseHugo: jest.fn(async text => ({ results: [text], translationDetails: { locations: [0], frontmatterItemValueLocations: {} } })) }));
jest.mock('./services/translate-parsed-hugo', () => ({ translateParsedHugo: jest.fn(async ({ targetLanguageId }) => `translated-${targetLanguageId}`) }));

const { generateTranslatedFilesIfNotExist } = require('./generate-translated-files-if-not-exist');
const { translateParsedHugo } = require('./services/translate-parsed-hugo');

describe('generateTranslatedFilesIfNotExist', () => {
    let dir;
    let log;

    beforeEach(async () => {
        dir = await mkdtemp(join(tmpdir(), 'glotta-generate-'));
        await mkdir(join(dir, 'nested'));
        await writeFile(join(dir, 'first.es.md'), 'source');
        await writeFile(join(dir, 'second.es.md'), 'source');
        await writeFile(join(dir, 'first.fr.md'), 'existing');
        log = jest.spyOn(console, 'log').mockImplementation(() => {});
        translateParsedHugo.mockClear();
    });

    afterEach(async () => {
        log.mockRestore();
        await rm(dir, { recursive: true, force: true });
    });

    it('translates from a non-English source and fills only missing matching files', async () => {
        await generateTranslatedFilesIfNotExist({ dir, sourceLanguageId: 'es', targetLanguageIds: ['fr'], recursive: false, force: false });
        expect(await readFile(join(dir, 'first.fr.md'), 'utf8')).toBe('existing');
        expect(await readFile(join(dir, 'second.fr.md'), 'utf8')).toBe('translated-fr');
        expect(translateParsedHugo).toHaveBeenCalledWith(expect.objectContaining({ sourceLanguageId: 'es', targetLanguageId: 'fr' }));
        expect(translateParsedHugo).toHaveBeenCalledTimes(1);
    });

    it('overwrites the selected target only with force', async () => {
        await generateTranslatedFilesIfNotExist({ dir, sourceLanguageId: 'es', targetLanguageIds: ['fr'], recursive: false, force: true });
        expect(await readFile(join(dir, 'first.fr.md'), 'utf8')).toBe('translated-fr');
        expect(translateParsedHugo).toHaveBeenCalledTimes(2);
    });

    it('does not overwrite a source file when the source language is selected as a target', async () => {
        await expect(generateTranslatedFilesIfNotExist({ dir, sourceLanguageId: 'es', targetLanguageIds: ['es'], recursive: false, force: true }))
            .rejects.toThrow(/source language/i);
        expect(await readFile(join(dir, 'first.es.md'), 'utf8')).toBe('source');
    });

    it('translates nested sources only with recursive discovery', async () => {
        await writeFile(join(dir, 'nested', 'index.es.md'), 'nested source');
        const opts = { dir, sourceLanguageId: 'es', targetLanguageIds: ['en'], force: false };
        await generateTranslatedFilesIfNotExist({ ...opts, recursive: false });
        await expect(readFile(join(dir, 'nested', 'index.en.md'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' });
        await generateTranslatedFilesIfNotExist({ ...opts, recursive: true });
        expect(await readFile(join(dir, 'nested', 'index.en.md'), 'utf8')).toBe('translated-en');
    });
});
