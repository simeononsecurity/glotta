const { parseHugo } = require('../parse-hugo-file');
const { translateParsedHugo } = require('.');

test('#32 sends a non-English source language through the translation seam', async () => {
    const calls = [];
    const translator = async (text, target, source) => {
        calls.push({ text, target, source });
        return text === 'Guten Tag' ? 'Good day' : text;
    };
    const translated = await translateParsedHugo({
        ...parseHugo('---\ntitle: "Guten Tag"\n---\n## Guten Tag\n'),
        sourceLanguageId: 'de',
        targetLanguageId: 'en',
        translator
    });
    expect(translated).toBe('---\ntitle: "Good day"\n---\n## Good day\n');
    expect(calls).toEqual([
        { text: 'Guten Tag', target: 'en', source: 'de' },
        { text: 'Guten Tag', target: 'en', source: 'de' }
    ]);
});

test('escapes translated YAML quotes while retaining the original quote style', async () => {
    const translated = await translateParsedHugo({
        ...parseHugo("---\ntitle: 'Hello'\ndescription: \"World\"\n---\n"),
        targetLanguageId: 'es',
        translator: async () => 'He said "yes" and it\'s good'
    });
    expect(translated).toContain("title: 'He said \"yes\" and it''s good'");
    expect(translated).toContain('description: "He said \\"yes\\" and it\'s good"');
});
