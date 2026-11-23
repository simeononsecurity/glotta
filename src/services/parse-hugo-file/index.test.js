const { parseHugo } = require('.');
const { translateParsedHugo } = require('../translate-parsed-hugo');

async function translate(input, translator = async text => `ES(${text})`) {
    return translateParsedHugo({
        ...parseHugo(input), targetLanguageId: 'es', translator
    });
}

describe('lossless Hugo parsing', () => {
    test('reassembles the existing fixture byte for byte before translation', async () => {
        const { readFile } = require('node:fs/promises');
        const { resolve } = require('node:path');
        const original = await readFile(resolve(__dirname, '../../../__fixtures__/example-dir/nested-example-dir/mock-file.en.md'), 'utf8');
        expect(parseHugo(original).results.join('')).toBe(original);
    });

    test('#33 translates YAML block lists without changing their structure', async () => {
        const source = `---
categories:
- Development
- VIM
date: "2012-04-06"
description: "spf13-vim is a cross platform distribution of vim plugins and resources for Vim."
slug: "spf13-vim-3-0-release-and-new-website"
tags:
- .vimrc
- plugins
- spf13-vim
- vim
title: "spf13-vim 3.0 release and new website"
---

## Hello Word
`;
        const result = await translate(source);
        expect(result).toContain('categories:\n- ES(Development)\n- ES(VIM)\n');
        expect(result).toContain('date: "2012-04-06"');
        expect(result).toContain('slug: "spf13-vim-3-0-release-and-new-website"');
        expect(result).toContain('tags:\n- .vimrc\n- ES(plugins)');
        expect(result).toContain('## ES(Hello Word)');
        expect(parseHugo(source).results.join('')).toBe(source);
    });

    test('#34 retains a heading immediately after front matter', async () => {
        const source = '---\ndate: "2024-01-11"\ndescription: "Hello World"\ntitle: "Hello World"\n---\n## Hello World\n';
        const result = await translate(source);
        expect(result).toContain('---\n## ES(Hello World)\n');
        expect(result).toContain('title: "ES(Hello World)"');
    });

    test('#35 translates text between two Markdown links', async () => {
        const source = '---\ndescription: "Link issue"\ntitle: "Link issue"\n---\n\n## Link issue\n\nThis is a link [GitHub](https://www.github.com) and this is also [Google](https://www.google.com) a link.\n';
        const result = await translate(source);
        expect(result).toContain('[GitHub](https://www.github.com) ES(and this is also) [Google](https://www.google.com)');
        expect(result).toContain('## ES(Link issue)');
    });

    test('preserves code, shortcodes, formatting, URLs and CRLF', async () => {
        const source = '---\r\ntitle: "Hello"\r\ncover: "/img/test.png"\r\n---\r\n## Hello\r\n**bold words** and `code` {{< ref "x" >}} https://example.com\r\n```js\r\nconst hello = 1\r\n```\r\n';
        const result = await translate(source);
        expect(result).toContain('**ES(bold words)**');
        expect(result).toContain('`code` {{< ref "x" >}} https://example.com');
        expect(result).toContain('```js\r\nconst hello = 1\r\n```');
        expect(result).toContain('cover: "/img/test.png"');
        expect(result).toContain('## ES(Hello)\r\n');
        expect(parseHugo(source).results.join('')).toBe(source);
    });

    test('keeps nested link destinations and YAML block markers intact', async () => {
        const source = '---\ndescription: |\n  Keep this block unchanged\n---\n[Example](https://example.com/a_(b)) and more\n';
        const result = await translate(source);
        expect(result).toContain('description: |\n  Keep this block unchanged\n');
        expect(result).toContain('[Example](https://example.com/a_(b)) ES(and more)');
    });
});
