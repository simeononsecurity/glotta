require('dotenv').config()

const { Command, Option } = require('commander');
const { stat } = require('node:fs/promises');
const { assertValidLanguageId, assertValidLanguageIds, LANGUAGE_IDS } = require('./assert-valid-language-id');
async function run(argv = process.argv) {
    const program = new Command();
    // init
    program
        .version(require('../package.json').version)
        .requiredOption('-s, --source <source>', 'source directory')
        .option('--sourceLanguageId <sourceLanguageId>', 'source language', 'en')
        .option('-r, --recursive', 'traverse all child folders', false)
        .option('-l, --targetLanguageIds <targetLanguageIds...>', 'target languages')
        .option('-f, --force', 'overwrite language file even if it already exists', false)
        .addOption(new Option('-d, --debug').hideHelp())
        .addOption(new Option('-z, --secret').hideHelp())
        .parse(argv);
    const opts = program.opts();
    const targetLanguageIds = opts.targetLanguageIds || Object.keys(LANGUAGE_IDS).filter(id => id !== opts.sourceLanguageId);

    // cli arg validation
    if (!(await stat(opts.source)).isDirectory()) {
        throw new TypeError('Source must be a directory');
    }
    await assertValidLanguageId(opts.sourceLanguageId);
    await assertValidLanguageIds(targetLanguageIds);

    if (opts.secret) { // easter egg
        console.log("Your secret message is:\nee79af38125b63593499ec2f364e3f195c54405731d97eafec6fd502ca8cff2d\n")
    }

    // execute
    if (!opts.debug) {
        const { generateTranslatedFilesIfNotExist } = require('./generate-translated-files-if-not-exist');
        await generateTranslatedFilesIfNotExist({
            dir: opts.source,
            sourceLanguageId: opts.sourceLanguageId,
            targetLanguageIds,
            recursive: opts.recursive,
            force: opts.force
        });
    }
}

if (require.main === module) {
    run().catch(err => {
        console.error(err.message);
        process.exitCode = 1;
    });
}

module.exports = { run };
