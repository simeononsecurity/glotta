# Glotta

[![Sponsor](https://img.shields.io/badge/Sponsor-Click%20Here-ff69b4)](https://github.com/sponsors/simeononsecurity) 

Script that translates Hugo markdown file content into other languages.

[View Glotta on NPM](https://www.npmjs.com/package/glotta)

## Notes and Warnings
**WARNING**: There are no guarantees that this code has no security vulnerabilities. The code is provided as-is. We hold no responcibility for how you use it.

## Supported Languages

### Google Translate

`ar, bn, ca, de, en, es, fr, hi, it, ja, pa, pt, ro, ru, zh`

### Deepl

`de, en, es, fr, it, ja, nl, pl, ro, ru, zh`

## How to change Translation API Provider

Set the `TRANSLATE_PROVIDER` environment variable to either `GOOGLE` or `DEEPL`, and be sure to set your `DEEPL_AUTH_KEY` as well.
The test suites will rely on these env variables so you can test your integration by running `npm test`

For example:
```sh
GOOGLE_APPLICATION_CREDENTIALS=./gcloud-keys/dev-service-account-keys.json
DEEPL_AUTH_KEY= **********
TRANSLATE_PROVIDER=DEEPL
```

## How to run Glotta
#### Example Glotts command:

```sh
node src/index.js --source=__fixtures__ --recursive --force
# --source is the root dir to search for ".en.md" files. You may replace __fixtures__ with any other dir name.
# --recursive will include any nested directories in the root dir (default is false)
# --force will cause existing language files to be overwritten (default is to ignore existing language file)
# --targetLanguageIds is another option that can be specified (default target ids are: ar, bn, ca, zh, fr, de, hi, it, ja, pt, pa, ro, ru, es
```

#### Example Glotts Output:
```txt
========== glotta ============
dir: __fixtures__/simeon-usecase-dir/content/articles/a-beginners-guide-to-setting-up-a-secure-and-resilient-vpn-for-remote-workers
Input file(s):  [
  '__fixtures__/simeon-usecase-dir/content/articles/a-beginners-guide-to-setting-up-a-secure-and-resilient-vpn-for-remote-workers/index.en.md'
]
targetLanguageIds: ar, bn, ca, zh, fr, de, hi, it, ja, pt, pa, ro, ru, es
force overwrite if file exists?: true
==============================

parsing input file...
translating text into...  es
writing new file...
translating text into...  ru
writing new file...
translating text into...  ro
writing new file...
translating text into...  pa
```

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
