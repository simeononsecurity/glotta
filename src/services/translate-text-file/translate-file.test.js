require('dotenv').config();

const { resolve } = require('node:path');
const { parseHugo } = require('./parse-hugo');
const { getFileContents } = require('../get-file-contents');

const { translateTree } = require('./translate-tree');
const { translateFileText } = require('./translate-file');
const { writeFileSync } = require('node:fs');

const MOCK_FILE_PATH = resolve(__dirname, '../../../__fixtures__/example-dir/nested-example-dir/mock-file.en.md');
const MOCK_CST_PATH = resolve(__dirname, '../../../__fixtures__/mock-cst.json');

describe('parseHugo', () => {
    it.skip('parses hugo text content into expected structure', async () => {
        const fileText = await getFileContents(MOCK_FILE_PATH);
        const cstJson = await getFileContents(MOCK_CST_PATH);
        const expectedCst = JSON.parse(cstJson);

        const { inputTree } = await parseHugo(fileText);
        //await writeFileSync('./mock-cst.json', JSON.stringify(inputTree));
        expect(inputTree).toEqual(expectedCst);
    });
});

describe('translateTree', () => {
    it.skip('translates only the expected values', async () => {
        const result = await translateTree(MOCK_TRANSLATE_INPUT_TREE);
        expect(result).toEqual(MOCK_TRANSLATED_TREE);
    }, 20000);
});

describe('translateFileText', () => {
    it.skip('translates expected parts of the given file', async () => {
        const fileText = await getFileContents(MOCK_FILE_PATH);
        const result = await translateFileText(fileText);

        writeFileSync('./mock-cst.json', JSON.stringify(result));

        expect(result).toEqual("");
    }, 20000);
});
