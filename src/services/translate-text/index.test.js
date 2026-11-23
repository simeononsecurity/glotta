const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { createTranslationProvider, translateText } = require('./index');
const { withRetries } = require('../with-retries');

describe('translation providers', () => {
    test('invalid provider fails before invoking a CLI', () => {
        expect(() => createTranslationProvider('UNKNOWN', { env: {} })).toThrow('not a valid Translate Provider');
    });

    test('Google receives explicit source and target languages', async () => {
        const translate = jest.fn().mockResolvedValue(['Hello']);
        const GoogleTranslate = jest.fn().mockImplementation(() => ({ translate }));
        const provider = createTranslationProvider('GOOGLE', { env: {}, GoogleTranslate });
        expect(await provider.translate('Hallo', 'de', 'en')).toBe('Hello');
        expect(translate).toHaveBeenCalledWith('Hallo', { from: 'de', to: 'en' });
    });

    test('DeepL keeps automatic source detection for default English and supports explicit source', async () => {
        const translateTextMock = jest.fn().mockResolvedValue({ text: 'Hello' });
        const DeepLTranslator = jest.fn().mockImplementation(() => ({ translateText: translateTextMock }));
        const provider = createTranslationProvider('DEEPL', {
            env: { DEEPL_AUTH_KEY: 'secret' },
            DeepLTranslator
        });
        expect(await provider.translate('Hallo', 'de', 'en')).toBe('Hello');
        await provider.translate('Hello', 'en', 'de');
        expect(translateTextMock).toHaveBeenNthCalledWith(1, 'Hallo', 'de', 'en');
        expect(translateTextMock).toHaveBeenNthCalledWith(2, 'Hello', null, 'de');
        expect(DeepLTranslator).toHaveBeenCalledWith('secret');
    });

    test('SDK errors are redacted and slow calls time out', async () => {
        const DeepLTranslator = jest.fn().mockImplementation(() => ({
            translateText: () => Promise.reject(new Error('secret credential in SDK error'))
        }));
        const provider = createTranslationProvider('DEEPL', { env: { DEEPL_AUTH_KEY: 'secret' }, DeepLTranslator });
        await expect(provider.translate('Hallo', 'de', 'en')).rejects.toThrow('check credentials');
        try { await provider.translate('Hallo', 'de', 'en'); }
        catch (error) { expect(error.message).not.toContain('secret'); }
        const slow = createTranslationProvider('DEEPL', {
            env: { DEEPL_AUTH_KEY: 'secret', TRANSLATE_TIMEOUT_MS: '5' },
            DeepLTranslator: jest.fn().mockImplementation(() => ({ translateText: () => new Promise(() => {}) }))
        });
        await expect(slow.translate('Hallo', 'de', 'en')).rejects.toThrow('timed out');
    });

    test('OpenAI-compatible provider sends model, credentials, and language prompt', async () => {
        const fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ choices: [{ message: { content: 'Hello' } }] })
        });
        const provider = createTranslationProvider('OPENAI', {
            env: {
                OPENAI_BASE_URL: 'https://example.test/v1',
                OPENAI_MODEL: 'local-model',
                OPENAI_API_KEY: 'test-secret',
                TRANSLATE_TIMEOUT_MS: '1234'
            },
            fetch
        });
        expect(await provider.translate('Hallo', 'de', 'en')).toBe('Hello');
        expect(fetch.mock.calls[0][0]).toBe('https://example.test/v1/chat/completions');
        const request = fetch.mock.calls[0][1];
        expect(request.headers.Authorization).toBe('Bearer test-secret');
        expect(request.signal).toBeDefined();
        expect(JSON.parse(request.body)).toMatchObject({
            model: 'local-model',
            messages: [{ role: 'user', content: expect.stringContaining('from de to en') }]
        });
    });

    test('OpenAI-compatible failures omit response body and credentials', async () => {
        const provider = createTranslationProvider('OPENAI', {
            env: { OPENAI_BASE_URL: 'https://example.test/v1', OPENAI_MODEL: 'model', OPENAI_API_KEY: 'secret' },
            fetch: jest.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'secret' })
        });
        await expect(provider.translate('Hallo', 'de', 'en')).rejects.toThrow('HTTP 401');
        try { await provider.translate('Hallo', 'de', 'en'); }
        catch (error) { expect(error.message).not.toContain('secret'); }
    });

    test.each([
        ['CODEX', 'codex', 'exec'],
        ['CLAUDE', 'claude', '--print']
    ])('%s adapter sends prompt through stdin with mocked process', async (providerName, command, firstArg) => {
        let received;
        const spawn = jest.fn((actualCommand, args) => {
            const child = new EventEmitter();
            child.stdout = new PassThrough();
            child.stderr = new PassThrough();
            child.stdin = { end: value => {
                received = value;
                queueMicrotask(() => {
                    child.stdout.emit('data', Buffer.from('Hello\n'));
                    child.emit('close', 0);
                });
            } };
            child.kill = jest.fn();
            return child;
        });
        const provider = createTranslationProvider(providerName, { env: {}, spawn });
        expect(await provider.translate('Hallo', 'de', 'en')).toBe('Hello');
        expect(spawn).toHaveBeenCalledWith(command, expect.arrayContaining([firstArg]), expect.objectContaining({ shell: false }));
        expect(received).toContain('Hallo');
        expect(received).toContain('from de to en');
    });

    test('translateText validates, skips whitespace, and delegates', async () => {
        const provider = { translate: jest.fn().mockResolvedValue('Hello') };
        expect(await translateText('Hallo', 'en', 'de', { provider })).toBe('Hello');
        expect(provider.translate).toHaveBeenCalledWith('Hallo', 'de', 'en');
        expect(await translateText('  ', 'en', 'de', { provider })).toBe('  ');
        expect(provider.translate).toHaveBeenCalledTimes(1);
        await expect(translateText('Hallo', 'xx', 'de', { provider })).rejects.toThrow('valid languageId');
    });

    test('retry only on retryable HTTP status and stop after limit', async () => {
        const error = Object.assign(new Error('failed'), { code: 503 });
        const operation = jest.fn().mockRejectedValueOnce(error).mockResolvedValue('ok');
        expect(await withRetries(operation, { maxAttempts: 2, initialDelayMs: 0 })()).toBe('ok');
        expect(operation).toHaveBeenCalledTimes(2);
        const unauthorized = jest.fn().mockRejectedValue(Object.assign(new Error('401'), { code: 401 }));
        await expect(withRetries(unauthorized, { initialDelayMs: 0 })()).rejects.toThrow('401');
        expect(unauthorized).toHaveBeenCalledTimes(1);
    });
});
