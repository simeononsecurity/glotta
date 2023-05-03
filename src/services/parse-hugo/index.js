const { createHugoParser } = require('./create-hugo-parser');

function parseHugo(text) {
  const { lexer, parser } = createHugoParser();
  const lexingResult = lexer.tokenize(text);
  parser.input = lexingResult.tokens;
  return parser
}

module.exports = {
  parseHugo
}
