
const { resolve } = require('node:path');
const { getFileContents } = require('../get-file-contents');
const { parseHugo } = require('./parse-hugo');

const { writeFileSync } = require('node:fs');

const MOCK_FILE_PATH = resolve(__dirname, '../../../__fixtures__/example-dir/nested-example-dir/mock-file.en.md');

describe('parseHugo', () => {
    it('parses hugo text content into expected structure', async () => {
        const fileText = await getFileContents(MOCK_FILE_PATH);
        const { results, translationIndices } = await parseHugo(fileText);
        writeFileSync('./mock-input.json', JSON.stringify({ results, translationIndices }));
        expect({ results, translationIndices }).toEqual("");
    });
});

