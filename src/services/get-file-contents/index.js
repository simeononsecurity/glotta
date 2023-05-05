const { readFile } = require('node:fs/promises');

async function getFileContents(filepath) {
    const contents = await readFile(filepath, 'utf8');
    return contents;
}

module.exports = {
    getFileContents
}
