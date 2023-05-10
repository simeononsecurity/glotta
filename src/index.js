require('dotenv').config()

const program = require('commander');
const { access } = require('node:fs/promises');
const { assertValidLanguageIds, LANGUAGE_IDS } = require('./assert-valid-language-id');
const { generateTranslatedFilesIfNotExist } = require('./generate-translated-files-if-not-exist');

const DEFAULT_TARGET_LANGUAGE_IDS = Object.keys(LANGUAGE_IDS);

async function run() {
    // init
    program
        .version('1.0.0')
        .option('-s, --source [source]', 'source file or directory.')
        .option('-l, --targetLanguageIds [targetLanguageIds...]', 'target languages', DEFAULT_TARGET_LANGUAGE_IDS)
        .parse(process.argv);
    const opts = program.opts();

    // cli arg validation
    await access(opts.source); // throws if cannot access
    await assertValidLanguageIds(opts.targetLanguageIds);

    // execute
    await generateTranslatedFilesIfNotExist({ dir: opts.source, targetLanguageIds: opts.targetLanguageIds });
}

run().then().catch(err => {
    console.log(err)
});
