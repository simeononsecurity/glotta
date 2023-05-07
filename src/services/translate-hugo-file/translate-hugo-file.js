const { parseHugo } = require('./parse-hugo');

async function translateHugoFileText(text) {
    const { results, translationIndices } = await parseHugo(text);
    const translatedResults = await translate(results, translationIndices);
    // const translatedFileText await resultsToFile(results);
    
    return translateHugoFileText;
}

async function translate(results, translationIndices){
    // todo
}

module.exports = {
    translateFileText
}
