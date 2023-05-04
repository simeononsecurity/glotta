const { createHugoParser, createHugoVisitor } = require('./create-hugo-parser');

async function parseHugo(text) {
  const { lexer, parser } = createHugoParser();
  const lexingResult = lexer.tokenize(text);
  parser.input = lexingResult.tokens;
  const visiter = createHugoVisitor(parser.getBaseCstVisitorConstructor());
  return {
    hugoParser: parser,
    hugoVisitor: visiter
  }
}

module.exports = {
  parseHugo
}
