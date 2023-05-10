require('dotenv').config()

const program = require('commander');
const { access } = require('node:fs/promises');
const { assertValidLanguageId } = require('./assert-valid-language-id');
const { generateTranslatedFiles } = require('./generate-translated-files');

async function run() {
    // init
    program
        .version('1.0.0')
        .option('-s, --source [source]', 'source file or directory.')
        .option('-l, --targetLanguages [languageIds...]', 'target languages')
        .parse(process.argv);
    const opts = program.opts();

    // cli arg validation
    await access(opts.source); // throws if cannot access
    for await (const id of opts.targetLanguages) {
        await assertValidLanguageId(id);
    }

    // execute
    await generateTranslatedFiles(opts.source, opts.lang);
}

run().then().catch(err => {
    console.log(err)
});
