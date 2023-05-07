const { resolve } = require('node:path');
const { getFileContents } = require('../get-file-contents');
const { parseHugo } = require('./parse-hugo');

const MOCK_FILE_PATH = resolve(__dirname, '../../../__fixtures__/example-dir/nested-example-dir/mock-file.en.md');
const MOCK_PARSED_PATH = resolve(__dirname, '../../../__fixtures__/mock-input.json');

describe('parseHugo', () => {
    it('parses hugo text content into expected structure', async () => {
        const fileText = await getFileContents(MOCK_FILE_PATH);
        const expectedData = await getFileContents(MOCK_PARSED_PATH);
        const { results, translationIndices } = await parseHugo(fileText);
        expect(JSON.stringify({ results, translationIndices }, null, 2)).toEqual(JSON.stringify(JSON.parse(expectedData), null, 2));
    });
});
