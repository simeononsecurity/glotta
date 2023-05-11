WARNING: There are no guarantees that this code has no security vulnerabilities. Please use at your own risk.

### Glotta

Script that translates Hugo markdown file content into other languages.

#### Example

```sh
node src/index --source=__fixtures__/example-dir/nested-example-dir
# this will create translations of the existing `.en.md` file, for every valid language, except for any that exist
# if this is your first time running this in this `nested-example-dir` then it will skip generation of `.es.md` file since that already exists
```

Author: [1nf053c](https://github.com/1nf053c)

Owner: [simeononsecurity](https://github.com/simeononsecurity)

## License

[MIT](https://github.com/simeononsecurity/glotta/blob/main/LICENSE)
