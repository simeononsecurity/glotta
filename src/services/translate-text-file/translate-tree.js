const { LANGUAGE_IDS } = require('../../assert-valid-language-id');
const { translateText } = require('../translate-text');

async function translateTree(tree) {
    const translatedFrontmatter = await translate(tree.frontmatter);
    const translatedContent = await translate(tree.content.value);
    return {
        frontmatter: translatedFrontmatter,
        content: translatedContent
    }
}

/*
{
    type: 'Type',
    value: {
        type: 'TYPE',
        value: 'text to translate',
        translate: true | false
    } | Array<value>
    translate: true | false | undefined (undefined if value is array)
}
*/

async function translate(arr) {
    const result = [];
    for (const item of arr) {
        if (item.translate) {
            item.value = await translateText(item.value, LANGUAGE_IDS.es);
        }
        else if (Array.isArray(item.value)) {
            const subitems = [];
            for (const subitem of item.value) {
                if (subitem.translate) {
                    subitem.value = await translateText(subitem.value, LANGUAGE_IDS.es);
                }
                subitems.push(subitem);
            }
            item.value = subitems
        }
        result.push(item);
    }
    return result;
}

module.exports = {
    translateTree
}
