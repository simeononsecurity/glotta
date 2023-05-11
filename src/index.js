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
        .requiredOption('-s, --source [source]', 'must specify source directory')
        .option('-r, --recursive', 'traverse all child folders', false)
        .option('-l, --targetLanguageIds [targetLanguageIds...]', 'target languages', DEFAULT_TARGET_LANGUAGE_IDS)
        .option('-f, --force', 'overwrite language file even if it already exists', false)
        .addOption(new program.Option('-d, --debug').hideHelp())
        .addOption(new program.Option('-z, --secret').hideHelp())
        .parse(process.argv);
    const opts = program.opts();

    // cli arg validation
    await access(opts.source); // throws if cannot access
    await assertValidLanguageIds(opts.targetLanguageIds);

    if (opts.secret) { // easter egg
        console.log("Your secret message is:\nee79af38125b63593499ec2f364e3f195c54405731d97eafec6fd502ca8cff2d\n")
    }

    // execute
    if (!opts.debug)
        await generateTranslatedFilesIfNotExist({
            dir: opts.source,
            targetLanguageIds: opts.targetLanguageIds,
            recursive: opts.recursive
        });
}

run().then().catch(err => {
    console.log(err)
});
