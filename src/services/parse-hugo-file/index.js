// Keep the original bytes outside translated text. Hugo accepts YAML syntax that
// a Markdown lexer cannot safely reconstruct, including block lists and CRLF.
function parseHugo(text) {
    const results = [];
    const translationDetails = { locations: [], frontmatterItemValueLocations: {} };
    const add = (value, translate = false, detail) => {
        results.push(value);
        if (translate) {
            const index = results.length - 1;
            translationDetails.locations.push(index);
            if (detail) translationDetails.frontmatterItemValueLocations[index] = detail;
        }
    };

    const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
    let bodyStart = 0;
    if (lines[0] && /^---\r?\n$/.test(lines[0])) {
        add(lines[0]);
        let key = '';
        let closed = false;
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (/^---\s*(?:\r?\n)?$/.test(line)) {
                add(line);
                bodyStart = i + 1;
                closed = true;
                break;
            }
            const item = line.match(/^(\s*([\w-]+)\s*:\s*)(.*?)(\r?\n|$)/);
            if (item) {
                key = item[2].toLowerCase();
                add(item[1]);
                addYamlValue(item[3], key, add);
                add(item[4]);
                continue;
            }
            const list = line.match(/^(\s*-\s+)(.*?)(\r?\n|$)/);
            if (list) {
                add(list[1]);
                addYamlValue(list[2], key, add);
                add(list[3]);
                continue;
            }
            add(line);
        }
        if (!closed) throw new Error('Unclosed YAML front matter');
    }

    let fence = null;
    for (const line of lines.slice(bodyStart)) {
        const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
        if (fenceMatch) {
            const marker = fenceMatch[1];
            if (!fence) fence = marker;
            else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
            add(line);
            continue;
        }
        if (fence || /^ {4}|^\t/.test(line) || /^\s*(?:[-*_]\s*){3,}(?:\r?\n)?$/.test(line) || /^\s*\[[^\]]+\]:\s+/.test(line)) {
            add(line);
            continue;
        }
        const prefix = line.match(/^(\s{0,3}(?:(?:#{1,6}|>|[-+*]|\d+[.)])\s+)+)/);
        if (prefix) add(prefix[0]);
        addMarkdown(line.slice(prefix ? prefix[0].length : 0), add);
    }
    return { results, translationDetails };
}

const UNCHANGED_KEYS = new Set([
    'date', 'lastmod', 'publishdate', 'expirydate', 'draft', 'toc', 'slug',
    'url', 'aliases', 'weight', 'layout', 'type', 'cover', 'image', 'images',
    'thumbnail', 'canonicalurl', 'translationkey', 'id'
]);

function addYamlValue(value, key, add) {
    if (UNCHANGED_KEYS.has(key)) return add(value);
    if (value.startsWith('[') && value.endsWith(']')) {
        add('[');
        const inner = value.slice(1, -1);
        const parts = inner.match(/(?:"(?:\\.|[^"\\])*"|'(?:''|[^'])*'|[^,]+|,)/g) || [];
        for (const part of parts) {
            if (part === ',') add(part);
            else addYamlScalar(part, add);
        }
        add(']');
    } else addYamlScalar(value, add);
}

function addYamlScalar(value, add) {
    const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
    add(match[1]);
    const scalar = match[2];
    const quoted = scalar.length >= 2 && ((scalar[0] === '"' && scalar.at(-1) === '"') || (scalar[0] === "'" && scalar.at(-1) === "'"));
    const rawValue = quoted ? scalar.slice(1, -1) : scalar;
    if (!rawValue || /^(?:true|false|null|~|\||>|[-+]?\d+(?:\.\d+)?|\d{4}-\d\d-\d\d)$/i.test(rawValue) || /^(?:https?:\/\/|\/|#|\.)/.test(rawValue) || /^\S+@\S+\.\S+$/.test(rawValue)) {
        add(scalar);
    } else {
        add(scalar, true, { rawValue, quote: quoted ? scalar[0] : '' });
    }
    add(match[3]);
}

// Protect link destinations, shortcodes, code, HTML, and raw URLs. All text
// between protected spans remains a separate translation location.
const PROTECTED = /(!?\[[^\]\n]*\]\((?:[^()\n]|\([^()\n]*\))*\)|\{\{[\s\S]*?\}\}|`+[^`\n]*`+|<!--[\s\S]*?-->|<[^>\n]+>|https?:\/\/[^\s<>)]+|\[[^\]\n]+\]\[[^\]\n]*\])/g;
function addMarkdown(text, add) {
    let cursor = 0;
    for (const match of text.matchAll(PROTECTED)) {
        addPlainText(text.slice(cursor, match.index), add);
        add(match[0]);
        cursor = match.index + match[0].length;
    }
    addPlainText(text.slice(cursor), add);
}

function addPlainText(text, add) {
    for (const part of text.split(/(\*\*|__|~~|\*|_)/)) {
        if (!part) continue;
        if (/^(?:\*\*|__|~~|\*|_)$/.test(part)) {
            add(part);
            continue;
        }
        const match = part.match(/^(\s*)([\s\S]*?)(\s*)$/);
        add(match[1]);
        if (match[2]) add(match[2], true);
        add(match[3]);
    }
}

module.exports = { parseHugo };
