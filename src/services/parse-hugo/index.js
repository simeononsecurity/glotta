const { createHugoParser, createCstToTranslateInputTreeVisitor } = require('./create-hugo-parser');

async function parseHugo(text) {
  const { lexer, parser } = createHugoParser();
  const lexingResult = lexer.tokenize(text);
  parser.input = lexingResult.tokens;
  const translateInputTreeVisitor = createCstToTranslateInputTreeVisitor(parser.getBaseCstVisitorConstructor());
  const cst = parser.hugo();
  const translateTree = translateInputTreeVisitor.visit(cst);
  return translateTree;
}

module.exports = {
  parseHugo
}
