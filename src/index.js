require('dotenv').config()

const program = require('commander');
const { access } = require('node:fs/promises');
const { assertValidLanguageIds } = require('./assert-valid-language-id');
const { generateTranslatedFilesIfNotExist } = require('./generate-translated-files-if-not-exist');

async function run() {
    // init
    program
        .version('1.0.0')
        .option('-s, --source [source]', 'source file or directory.')
        .option('-l, --targetLanguages [languageIds...]', 'target languages', ['es'])
        .parse(process.argv);
    const opts = program.opts();

    // cli arg validation
    await access(opts.source); // throws if cannot access
    await assertValidLanguageIds(opts.targetLanguages);

    // execute
    await generateTranslatedFilesIfNotExist({ source: opts.source, targetLanguages: opts.targetLanguages });
}

run().then().catch(err => {
    console.log(err)
});
