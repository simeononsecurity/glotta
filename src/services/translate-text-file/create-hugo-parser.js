const chevrotain = require('chevrotain');
const { LANGUAGE_IDS } = require('../../assert-valid-language-id');
const { translateText } = require('../translate-text');

function createLexerAndParser() {
    // ----------------- Lexer ----------------
    const createToken = chevrotain.createToken;
    const Lexer = chevrotain.Lexer;

    // ----------------- Lexer mode: frontmatter -----------------
    const TripleDashStart = createToken({ name: "TripleDashStart", pattern: /---\n/ });
    const Colon = createToken({ name: "Colon", pattern: /:/ });
    const NewLineNotFollowedByTripleDash = createToken({ name: "NewLineNotFollowedByTripleDash", pattern: /\n(?!---)/ });
    const True = createToken({ name: "True", pattern: /true/ });
    const False = createToken({ name: "False", pattern: /false/ });
    const LSquare = createToken({ name: "LSquare", pattern: /\[/ });
    const RSquare = createToken({ name: "RSquare", pattern: /]/ });
    const Date = createToken({ name: "Date", pattern: /\d{4}\-(0?[1-9]|1[012])\-(3[01]|[12][0-9]|0?[1-9])/ });
    const Comma = createToken({ name: "Comma", pattern: /,/ });
    const ItemKey = createToken({ name: "ItemKey", pattern: /[^:]+/ });
    const StringLiteral = createToken({ name: "StringLiteral", pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/ });
    const NumberLiteral = createToken({ name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/ });
    const WhiteSpace = createToken({ name: "WhiteSpace", pattern: /\s+/, group: Lexer.SKIPPED });
    const TripleDashEnd = createToken({ name: "TripleDashEnd", pattern: /\n---\n/, push_mode: "content_mode" });

    // UrlLike is used in both frontmatter mode and content mode
    const UrlLike = createToken({ name: 'UrlLike', pattern: /(\[.+\]\(.+\)|"(((https?:\/\/)?([a-z0-9_~-]+\.)+[a-z]{2,5}(\/\S*)?)|(.+\/.+\.*.*))")/ }); // imperfect but seems to work for relevant use cases

    const hugoFrontmatterTokens = [
        TripleDashStart,
        TripleDashEnd,
        Colon,
        Comma,
        Date,
        LSquare,
        RSquare,
        UrlLike,
        StringLiteral,
        NewLineNotFollowedByTripleDash,
        True,
        False,
        NumberLiteral,
        WhiteSpace,
        ItemKey,
        WhiteSpace
    ];

    // ----------------- lexer mode: content -----------------
    const Shortcode = createToken({ name: "Shortcode", pattern: /\{\{.+\}\}/ });
    const Content = createToken({ name: "Content", pattern: /[\s\S]*?(?=\{\{.*}\}|\[.*\]\(.*\))/ });
    const ContentEnd = createToken({ name: "ContentEnd", pattern: /[\s\S]+/ });
    const hugoContentTokens = [
        Shortcode,
        UrlLike,     // reused
        Content,
        ContentEnd
    ];

    const lexerConfig = {
        modes: {
            frontmatter_mode: hugoFrontmatterTokens,
            content_mode: hugoContentTokens // TripleDashEnd will push lexer into this mode, which is needed so the frontmatter tokens don't start matching
        },
        defaultMode: "frontmatter_mode"
    };

    const hugoLexer = new Lexer(lexerConfig);

    TripleDashStart.LABEL = "'---\\n'";
    TripleDashEnd.LABEL = "'\\n---\\n'";
    LSquare.LABEL = "'['";
    RSquare.LABEL = "']'";
    Colon.LABEL = "':'";
    Comma.LABEL = "','";
    UrlLike.LABEL = '[title](url) or /abc/def.png'; // more or less
    Shortcode.LABEL = "{{abcdef}}";
    Content.LABEL = "abcdef..."; // followed by UrlLike or Shortcode
    ContentEnd.LABEL = "...abc"; // only if there is text before end of file but not another UrlLike nor Shortcode

    // ----------------- parser -----------------
    const CstParser = chevrotain.CstParser;

    class HugoParser extends CstParser {
        constructor() {
            super(hugoFrontmatterTokens, { // notice ContentTokens are not passed here. The lexer is somehow able to parse in content_mode so this is OK.
                recoveryEnabled: true
            });

            const $ = this;
            $.RULE("hugo", () => {
                $.SUBRULE($.frontmatter);
                $.SUBRULE($.content);
            });

            $.RULE("frontmatter", () => {
                $.CONSUME(TripleDashStart);
                $.MANY_SEP({
                    SEP: NewLineNotFollowedByTripleDash, DEF: () => {
                        $.SUBRULE($.frontmatterItem);
                    }
                });
                $.CONSUME(TripleDashEnd);
            });

            $.RULE("frontmatterItem", () => {
                $.CONSUME(ItemKey);
                $.CONSUME(Colon);
                $.SUBRULE($.value);
            });

            $.RULE("value", () => {
                $.OR([
                    { ALT: () => $.CONSUME(UrlLike) },
                    { ALT: () => $.CONSUME(StringLiteral) },
                    { ALT: () => $.CONSUME(Date) },
                    { ALT: () => $.SUBRULE($.array) },
                    { ALT: () => $.CONSUME(NumberLiteral) },
                    { ALT: () => $.CONSUME(True) },
                    { ALT: () => $.CONSUME(False) },
                ]);
            });

            $.RULE("array", () => {
                $.CONSUME(LSquare);
                $.MANY_SEP({
                    SEP: Comma, DEF: () => {
                        $.SUBRULE($.value);
                    }
                });
                $.CONSUME(RSquare);
            });

            $.RULE("content", () => {
                $.MANY({
                    DEF: () => {
                        $.OR([
                            { ALT: () => $.CONSUME(Shortcode) },
                            { ALT: () => $.CONSUME(UrlLike) },
                            { ALT: () => $.CONSUME(Content) },
                            { ALT: () => $.CONSUME(ContentEnd) },
                        ]);
                    }
                });

            });

            this.performSelfAnalysis();
        }
    }

    return {
        lexer: hugoLexer,
        parser: new HugoParser(),
        defaultRule: "hugo"
    };
}

function createCstToTranslateInputTreeVisitor(HugoVisitorClass) {
    let results = [];
    class MyCustomVisitor extends HugoVisitorClass {
        constructor() {
            super();
            this.validateVisitor();
        }
        hugo(ctx) {
            if (ctx.frontmatter[0].recoveredNode) {
                return;
            }
            results.push('---\n');
            ctx.frontmatter = this.visit(ctx.frontmatter);
            results.push('\n---\n');
            ctx.content = this.visit(ctx.content);
            return ctx;
        }
        frontmatter(ctx) {
            ctx.frontmatterItem = ctx.frontmatterItem.map(fi => {
                const fi = this.visit(fi);
                results.push(fi.ItemKey[0].image + ': ' + fi.value[valueKey]);
            });
            return ctx;
        }
        frontmatterItem(ctx) {
            ctx.value = this.visit(ctx.value);
            return ctx;
        }
        value(ctx) {
            if (ctx.StringLiteral) {
                let value = ctx.StringLiteral[0].image;
                results.push(value);
                if (value !== "\"\"") {
                    // TODO: Mark for translation
                }
            }
            else if (ctx.array) {
                ctx.array = this.visit(ctx.array);
                return ctx;
            }
        }
        array(ctx) {
            ctx.value = ctx.value.map(v => this.visit(v));
            return ctx;
        }
        content(ctx) {
            /*
            let content = [];
            if (ctx.Shortcode) {
                ctx.Shortcode = ctx.Shortcode.map(c => ({ Shortcode: true, ...c }));
                content = content.concat(ctx.Shortcode);
            }
            if (ctx.UrlLike) {
                ctx.UrlLike = ctx.UrlLike.map(c => ({ UrlLike: true, ...c }));
                content = content.concat(ctx.UrlLike);
            }
            if (ctx.Content) {
                ctx.Content = ctx.Content.map(c => ({ Content: true, ...c }));
                content = content.concat(ctx.Content);
            }
            if (ctx.ContentEnd) {
                ctx.ContentEnd = ctx.ContentEnd.map(c => ({ ContentEnd: true, ...c }));
                content = content.concat(ctx.ContentEnd);
            }
            content.sort((a, b) => {
                if (a.startOffset < b.startOffset) return -1;
                if (a.startOffset > b.startOffset) return 1;
                return 0;
            });
            content = content.map(c => {
                if (c.Content) {
                    return {
                        type: 'Content',
                        value: c.image,
                        translate: true
                    }
                }
                else if (c.UrlLike) {
                    return {
                        type: 'UrlLike',
                        value: c.image,
                        translate: false
                    }
                }
                else if (c.Shortcode) {
                    return {
                        type: 'Shortcode',
                        value: c.image,
                        translate: false
                    }
                }
                else if (c.ContentEnd) {
                    return {
                        type: 'ContentEnd',
                        value: c.image,
                        translate: true
                    }
                }
                
            });

            return {
                type: 'ContentList',
                value: content,
                ctx
            }
            */

            return ctx;
        }
    }
    return new MyCustomVisitor();
}
/*
function createTranslatedCstVisitor(HugoVisitorClass) {
    class MyCustomVisitor extends HugoVisitorClass {
        constructor() {
            super();
            this.validateVisitor();
        }
        hugo(ctx) {
            if (ctx.frontmatter[0].recoveredNode) {
                return;
            }
            return {
                frontmatter: this.visit(ctx.frontmatter),
                content: this.visit(ctx.content),
                ctx
            }
        }
        frontmatter(ctx) {
            return {
                frontmatterItem: ctx.frontmatterItem.map(fi => this.visit(fi)),
                ctx: ctx
            }
        }
        async frontmatterItem(ctx) {
            const keyName = ctx.ItemKey[0].image;
            const node = this.visit(ctx.value);
            return {
                type: `frontmatter.${keyName}`, // example: "frontmatter.coverAlt"
                value: node.translate ? (await translateText(node.value), LANGUAGE_IDS.es) : node.value,
                translate: node.translate,
                ctx: ctx,
            }
        }
        value(ctx) {
            if (ctx.UrlLike) {
                return {
                    type: 'UrlLike',
                    value: ctx.UrlLike[0].image,
                    translate: false,
                    ctx: ctx
                }
            }
            else if (ctx.StringLiteral) {
                const value = ctx.StringLiteral[0].image;
                return {
                    type: 'StringLiteral',
                    value: value,
                    translate: value !== "\"\"", // don't translate empty strings
                    ctx: ctx
                }
            }
            else if (ctx.NumberLiteral) {
                return {
                    type: 'NumberLiteral',
                    value: ctx.NumberLiteral[0].image,
                    translate: false,
                    ctx: ctx
                }
            }
            else if (ctx.Date) {
                return {
                    type: 'Date',
                    value: ctx.Date[0].image,
                    translate: false,
                    ctx: ctx
                }
            }
            else if (ctx.True) {
                return {
                    type: 'True',
                    value: ctx.True[0].image,
                    translate: false,
                    ctx: ctx
                }
            }
            else if (ctx.False) {
                return {
                    type: 'False',
                    value: ctx.False[0].image,
                    translate: false,
                    ctx: ctx
                }
            }
            else if (ctx.array) {
                return {
                    type: 'Array',
                    value: this.visit(ctx.array),
                    ctx: ctx
                }
            }
        }
        array(ctx) {
            return {
                value: ctx.value.map(v => this.visit(v)),
                ctx
            };
        }
        content(ctx) {
            let content = [];
            if (ctx.Shortcode) {
                ctx.Shortcode = ctx.Shortcode.map(c => ({ Shortcode: true, ...c }));
                content = content.concat(ctx.Shortcode);
            }
            if (ctx.UrlLike) {
                ctx.UrlLike = ctx.UrlLike.map(c => ({ UrlLike: true, ...c }));
                content = content.concat(ctx.UrlLike);
            }
            if (ctx.Content) {
                ctx.Content = ctx.Content.map(c => ({ Content: true, ...c }));
                content = content.concat(ctx.Content);
            }
            if (ctx.ContentEnd) {
                ctx.ContentEnd = ctx.ContentEnd.map(c => ({ ContentEnd: true, ...c }));
                content = content.concat(ctx.ContentEnd);
            }
            content.sort((a, b) => {
                if (a.startOffset < b.startOffset) return -1;
                if (a.startOffset > b.startOffset) return 1;
                return 0;
            });
            content = content.map(async c => {
                if (c.Content) {
                    return {
                        type: 'Content',
                        value: (await translateText(c.image, LANGUAGE_IDS.es)),
                        translate: true
                    }
                }
                else if (c.UrlLike) {
                    return {
                        type: 'UrlLike',
                        value: c.image,
                        translate: false
                    }
                }
                else if (c.Shortcode) {
                    return {
                        type: 'Shortcode',
                        value: c.image,
                        translate: false
                    }
                }
                else if (c.ContentEnd) {
                    return {
                        type: 'ContentEnd',
                        value: await translateText(c.image, LANGUAGE_IDS.es),
                        translate: true
                    }
                }
            });

            return {
                type: 'ContentList',
                value: content,
                ctx
            }
        }
    }
    return new MyCustomVisitor();
}
*/

function createCstToFileVisitor(HugoVisitorClass) {
    class MyCustomVisitor extends HugoVisitorClass {
        constructor() {
            super();
            this.validateVisitor();
        }
        hugo(ctx) {
            if (ctx.frontmatter[0].recoveredNode) {
                return;
            }
            return this.visit(ctx.frontmatter) + this.visit(ctx.content);
        }
        frontmatter(ctx) {
            return ctx.frontmatter.map(frontmatterItem => this.visit(frontmatterItem)).join('\n');
        }
        frontmatterItem(ctx) {
            return ctx.ItemKey[0].image + ":" + this.visit(ctx.value);
        }
        value(ctx) {
            if (ctx.array) {
                return this.visit(ctx.array).join(',');
            }
            else {
                // Opportunity: simplify grammar rules
                const firstKey = Object.keys(ctx)[0]; // Due to the way I built this structure, there will only be one key (UrlLike, or StringLiteral, or etc...)
                return ctx[firstKey][0].image; // And the obj is always an array
            }
        }
        array(ctx) {
            return ctx.value.map(v => this.visit(v)).join(',');
        }
        content(ctx) {
            return ctx.content.map(c => {
                const firstKey = Object.keys(c)[0]; // Due to the way I built this structure, there will only be one key (UrlLike, or StringLiteral, or etc...)
                return c[firstKey][0].image;
            }).join('\n');
        }
    }
    return new MyCustomVisitor();
}

async function createHugoParser(text) {
    const { lexer, parser } = createLexerAndParser();
    const lexingResult = lexer.tokenize(text);
    parser.input = lexingResult.tokens;
    return parser;
}

module.exports = {
    createHugoParser,
    createCstToTranslateInputTreeVisitor,
    // createTranslatedCstVisitor,
    createCstToFileVisitor
}
