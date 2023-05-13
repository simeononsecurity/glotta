const { resolve } = require('node:path');
const { getFileContents } = require('../get-file-contents');
const { parseHugo } = require('./index');

const MOCK_FILE_PATH = resolve(__dirname, '../../../__fixtures__/example-dir/nested-example-dir/mock-file.en.md');
const MOCK_PARSED_HUGO_PATH = resolve(__dirname, '../../../__fixtures__/mock-parsed-hugo.json');

describe('parseHugo', () => {
    it('parse hugo text content into expected structure', async () => {
        const fileText = await getFileContents(MOCK_FILE_PATH);
        const expectedData = await getFileContents(MOCK_PARSED_HUGO_PATH);
        const { results, translationDetails } = await parseHugo(fileText);

        expect(JSON.stringify({ results, translationDetails }, null, 2)).toEqual(JSON.stringify(JSON.parse(expectedData), null, 2));
    });
});
