WARNING: There are no guarantees that this code has no security vulnerabilities. Please use at your own risk.

### Glotta

Script that translates Hugo markdown file content into other languages.

#### Example command:

```sh
node src/index.js --source=YOUR_TARGET_DIRECTORY --recursive --force
# --source is the root dir to search for ".en.md" files
# --recursive will include any nested directories in the root dir (default is false)
# --force will cause existing language files to be overwritten (default is to ignore existing language file)
# --targetLanguageIds is another option that can be specified (default target ids are: ar, bn, ca, zh, fr, de, hi, it, ja, pt, pa, ro, ru, es
```

#### Example output:
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


## Author:

[1nf053c](https://github.com/1nf053c)


## Owner:

[simeononsecurity](https://github.com/simeononsecurity)

## License

[MIT](https://github.com/simeononsecurity/glotta/blob/main/LICENSE)
