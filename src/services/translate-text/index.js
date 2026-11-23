const { spawn } = require('node:child_process');
const deepl = require('deepl-node');
const { assertValidLanguageId } = require('../../assert-valid-language-id');
const { assertValidTranslateProvider, TRANSLATE_PROVIDERS } = require('../../assert-valid-translate-provider');
const { withRetries } = require('../with-retries');

function timeoutFrom(env) {
    const value = Number(env.TRANSLATE_TIMEOUT_MS || 30000);
    if (!Number.isInteger(value) || value < 1) throw new Error('TRANSLATE_TIMEOUT_MS must be a positive integer');
    return value;
}

function promptFor(text, sourceLanguageId, targetLanguageId) {
    return 'Translate this text from ' + sourceLanguageId + ' to ' + targetLanguageId +
        '. Return only the translation. Preserve whitespace, punctuation, Markdown syntax, and placeholders exactly.\n\n' + text;
}

function completionUrl(base) {
    const url = new URL(base);
    if (!/^https?:$/.test(url.protocol)) throw new Error('OPENAI_BASE_URL must use HTTP or HTTPS');
    if (!url.pathname.endsWith('/chat/completions')) {
        url.pathname = url.pathname.replace(/\/$/, '') + '/chat/completions';
    }
    return url.toString();
}

async function sdkRequest(promise, name, timeoutMs) {
    let timer;
    try {
        return await Promise.race([
            promise,
            new Promise((_, reject) => {
                timer = setTimeout(() => reject(new Error(name + ' translation timed out after ' + timeoutMs + ' ms')), timeoutMs);
            })
        ]);
    } catch (error) {
        if (error.message.startsWith(name + ' translation timed out')) throw error;
        const status = Number(error.code || error.status);
        const message = Number.isInteger(status)
            ? name + ' translation failed (HTTP ' + status + ')'
            : name + ' translation failed; check credentials, language pair, or network access';
        const safeError = new Error(message);
        if (Number.isInteger(status)) safeError.code = status;
        throw safeError;
    } finally {
        clearTimeout(timer);
    }
}

function runCli(command, args, input, timeoutMs, spawnImpl = spawn) {
    return new Promise((resolve, reject) => {
        let child;
        try {
            child = spawnImpl(command, args, { stdio: ['pipe', 'pipe', 'pipe'], shell: false });
        } catch {
            reject(new Error(command + ' CLI could not start'));
            return;
        }
        let stdout = '';
        let finished = false;
        const timer = setTimeout(() => {
            child.kill();
            finish(new Error(command + ' CLI timed out after ' + timeoutMs + ' ms'));
        }, timeoutMs);
        function finish(error, output) {
            if (finished) return;
            finished = true;
            clearTimeout(timer);
            if (error) reject(error);
            else resolve(output);
        }
        child.on('error', () => finish(new Error(command + ' CLI could not start; check installation and PATH')));
        child.on('close', code => {
            if (code !== 0) finish(new Error(command + ' CLI exited with status ' + code));
            else if (!stdout.trim()) finish(new Error(command + ' CLI returned an empty translation'));
            else finish(null, stdout.trimEnd());
        });
        child.stdout.on('data', chunk => { stdout += chunk; });
        child.stderr.on('data', () => {});
        child.stdin.end(input);
    });
}

function createTranslationProvider(providerName = process.env.TRANSLATE_PROVIDER || TRANSLATE_PROVIDERS.GOOGLE, dependencies = {}) {
    assertValidTranslateProvider(providerName);
    const env = dependencies.env || process.env;
    const timeoutMs = timeoutFrom(env);
    if (providerName === TRANSLATE_PROVIDERS.GOOGLE) {
        // The locked Google SDK depends on a package that still references SlowBuffer.
        // Node 26 removed that alias; restore it before loading the SDK.
        const nodeBuffer = require('node:buffer');
        if (!nodeBuffer.SlowBuffer) nodeBuffer.SlowBuffer = nodeBuffer.Buffer;
        const GoogleTranslate = dependencies.GoogleTranslate || require('@google-cloud/translate').v2.Translate;
        return { async translate(text, sourceLanguageId, targetLanguageId) {
            const client = new GoogleTranslate({ timeout: timeoutMs });
            const [translated] = await sdkRequest(
                client.translate(text, { from: sourceLanguageId, to: targetLanguageId }),
                'Google', timeoutMs
            );
            return translated;
        } };
    }
    if (providerName === TRANSLATE_PROVIDERS.DEEPL) {
        if (!env.DEEPL_AUTH_KEY) throw new Error('DEEPL_AUTH_KEY is required for DeepL');
        const DeepLTranslator = dependencies.DeepLTranslator || deepl.Translator;
        return { async translate(text, sourceLanguageId, targetLanguageId) {
            const client = new DeepLTranslator(env.DEEPL_AUTH_KEY);
            const result = await sdkRequest(
                client.translateText(text, sourceLanguageId === 'en' ? null : sourceLanguageId, targetLanguageId),
                'DeepL', timeoutMs
            );
            return result.text;
        } };
    }
    if (providerName === TRANSLATE_PROVIDERS.OPENAI) {
        const url = completionUrl(env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
        if (!env.OPENAI_MODEL) throw new Error('OPENAI_MODEL is required for OpenAI-compatible translation');
        if (!env.OPENAI_API_KEY && new URL(url).hostname === 'api.openai.com') {
            throw new Error('OPENAI_API_KEY is required for the OpenAI endpoint');
        }
        const fetchImpl = dependencies.fetch || globalThis.fetch;
        if (!fetchImpl) throw new Error('Node.js fetch support is required for OpenAI-compatible translation');
        return { async translate(text, sourceLanguageId, targetLanguageId) {
            let response;
            try {
                response = await fetchImpl(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(env.OPENAI_API_KEY ? { Authorization: 'Bearer ' + env.OPENAI_API_KEY } : {}) },
                    body: JSON.stringify({
                        model: env.OPENAI_MODEL,
                        messages: [{ role: 'user', content: promptFor(text, sourceLanguageId, targetLanguageId) }],
                        temperature: 0
                    }),
                    signal: AbortSignal.timeout(timeoutMs)
                });
            } catch (error) {
                if (error.name === 'TimeoutError' || error.name === 'AbortError') {
                    throw new Error('OpenAI-compatible translation timed out after ' + timeoutMs + ' ms');
                }
                throw new Error('OpenAI-compatible translation request failed; check endpoint and network access');
            }
            if (!response.ok) {
                const error = new Error('OpenAI-compatible translation failed (HTTP ' + response.status + ')');
                error.code = response.status;
                throw error;
            }
            let data;
            try { data = await response.json(); }
            catch { throw new Error('OpenAI-compatible endpoint returned invalid JSON'); }
            const result = data?.choices?.[0]?.message?.content;
            if (typeof result !== 'string' || !result.trim()) {
                throw new Error('OpenAI-compatible endpoint returned no translation text');
            }
            return result;
        } };
    }
    const command = providerName === TRANSLATE_PROVIDERS.CODEX ? 'codex' : 'claude';
    const model = providerName === TRANSLATE_PROVIDERS.CODEX ? env.CODEX_MODEL : env.CLAUDE_MODEL;
    const args = providerName === TRANSLATE_PROVIDERS.CODEX
        ? ['exec', '--sandbox', 'read-only', '--ephemeral', '--skip-git-repo-check', ...(model ? ['--model', model] : []), '-']
        : ['--print', '--output-format', 'text', ...(model ? ['--model', model] : [])];
    return { translate(text, sourceLanguageId, targetLanguageId) {
        return runCli(command, args, promptFor(text, sourceLanguageId, targetLanguageId), timeoutMs, dependencies.spawn);
    } };
}

async function translateText(text, targetLanguageId, sourceLanguageId = 'en', options = {}) {
    await assertValidLanguageId(targetLanguageId);
    await assertValidLanguageId(sourceLanguageId);
    if (typeof text !== 'string') throw new TypeError('Translation text must be a string');
    if (!text.trim()) return text;
    const provider = options.provider || createTranslationProvider(options.providerName, options.dependencies);
    const result = await withRetries(() => provider.translate(text, sourceLanguageId, targetLanguageId), options.retryOptions)();
    if (typeof result !== 'string') throw new Error('Translation provider returned non-text output');
    return result;
}

module.exports = { translateText, createTranslationProvider, runCli };
