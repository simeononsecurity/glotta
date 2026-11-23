# Glotta

[![Tests](https://github.com/simeononsecurity/glotta/actions/workflows/test.yml/badge.svg)](https://github.com/simeononsecurity/glotta/actions/workflows/test.yml)
[![Sponsor](https://img.shields.io/badge/Sponsor-Click%20Here-ff69b4)](https://github.com/sponsors/simeononsecurity)

Glotta translates Hugo Markdown bundles into other languages while keeping
front matter layout, links, headings, code, shortcodes, and formatting.

[GitHub releases](https://github.com/simeononsecurity/glotta/releases) contain
the current source. The [npm package](https://www.npmjs.com/package/glotta)
follows a separate release schedule.

## Install

Use Node.js 22 or newer. Clone the repository and run `npm ci` to install the
locked dependencies. Copy `.env.template` to `.env` if you need local provider
settings. `.env` is ignored by Git.

## Supported Languages

### Google Translate

`ar, bn, ca, de, en, es, fr, hi, it, ja, pa, pt, ro, ru, zh`

### DeepL

`de, en, es, fr, it, ja, nl, pl, ro, ru, zh`

## Translation providers

Set `TRANSLATE_PROVIDER` to `GOOGLE` (default), `DEEPL`, `OPENAI`,
`CODEX`, or `CLAUDE`. The test suite uses provider mocks and needs no
credentials.

| Provider | Settings |
| --- | --- |
| Google Translate | Uses Google Application Default Credentials. `GOOGLE_APPLICATION_CREDENTIALS` may point to a service account JSON file. |
| DeepL | Set `DEEPL_AUTH_KEY`. |
| OpenAI-compatible chat completions | Set `OPENAI_BASE_URL` and `OPENAI_MODEL`. Set `OPENAI_API_KEY` for authenticated endpoints. The default base URL is `https://api.openai.com/v1`, which requires an API key. The URL may end in `/chat/completions` or its parent path. |
| Codex CLI | Install and authenticate `codex` on your PATH. `CODEX_MODEL` is optional. |
| Claude CLI | Install and authenticate `claude` on your PATH. `CLAUDE_MODEL` is optional. |

`TRANSLATE_TIMEOUT_MS` sets the request or process timeout in milliseconds
(default 30000). Copy `.env.template` to `.env` for local settings. Keep
credentials in the environment or ignored local files. Provider errors omit
credentials and response bodies.

Every provider receives the source and target language. DeepL keeps automatic
source detection when the source is English, matching its previous behavior.
AI providers translate each selected text segment. Review their output before
using it in a published site.

## Run

```sh
node src/index.js --source content --recursive --targetLanguageIds es fr
node src/index.js --source content --sourceLanguageId de --targetLanguageIds en
```

`--source` selects the directory to search. By default, Glotta reads
`*.en.md` files in that directory. `--sourceLanguageId` selects another
source language, such as `de`. `--recursive` includes child directories.
`--targetLanguageIds` accepts one or more language IDs separated by spaces.
Without this option, Glotta selects every supported target except the source.
Glotta creates only missing target files. `--force` overwrites selected
target files. It never overwrites a source file.

The parser keeps front matter layout, Markdown links and destinations,
headings, code, shortcodes, and formatting markers. It translates text in
YAML strings and lists while leaving dates, slugs, paths, and control fields
unchanged.

## Test

Run `npm test -- --runInBand` for offline unit and issue regression tests.
The [Tests workflow](https://github.com/simeononsecurity/glotta/actions/workflows/test.yml)
runs these tests and checks CLI startup on Node.js 22, 24, and 26 for pull
requests, main branch pushes, and version tags. It uses no provider secrets
and makes no paid translation requests.

## Learn more about [glotta and translating hugo index bundles](https://simeononsecurity.ch/other/glotta-streamlining-hugo-text-translation-for-global-reach/)

## Author:

[1nf053c](https://github.com/1nf053c) from [compassionandhardwork.com](https://compassionandhardwork.com)

## Owner:

[simeononsecurity](https://github.com/simeononsecurity) from [simeononsecurity.ch](https://simeononsecurity.ch)

## License

[MIT](https://github.com/simeononsecurity/glotta/blob/main/LICENSE)

<a href="https://simeononsecurity.ch" target="_blank" rel="noopener noreferrer">
  <h2>Explore the World of Cybersecurity</h2>
</a>
<a href="https://simeononsecurity.ch" target="_blank" rel="noopener noreferrer">
  <img src="https://simeononsecurity.ch/img/banner.png" alt="SimeonOnSecurity Logo" width="300" height="300">
</a>

### Links:
- #### [github.com/simeononsecurity](https://github.com/simeononsecurity)
- #### [simeononsecurity.ch](https://simeononsecurity.ch)
