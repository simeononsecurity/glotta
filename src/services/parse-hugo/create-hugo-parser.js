const chevrotain = require('chevrotain');

function createHugoParser() {
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
                content: this.visit(ctx.content)
            }
        }
        frontmatter(ctx) {
            return ctx.frontmatterItem.map(fi => this.visit(fi));
        }
        frontmatterItem(ctx) {
            const keyName = ctx.ItemKey[0].image;
            const node = this.visit(ctx.value);
            return {
                type: `frontmatter.${keyName}`, // example: "frontmatter.coverAlt"
                value: node.value,
                translate: node.translate
            }
        }
        value(ctx) {
            if (ctx.UrlLike) {
                return {
                    type: 'UrlLike',
                    value: ctx.UrlLike[0].image,
                    translate: false
                }
            }
            else if (ctx.StringLiteral) {
                const value = ctx.StringLiteral[0].image;
                return {
                    type: 'StringLiteral',
                    value: value,
                    translate: value !== "\"\"" // don't translate empty strings
                }
            }
            else if (ctx.NumberLiteral) {
                return {
                    type: 'NumberLiteral',
                    value: ctx.NumberLiteral[0].image,
                    translate: false
                }
            }
            else if (ctx.Date) {
                return {
                    type: 'Date',
                    value: ctx.Date[0].image,
                    translate: false
                }
            }
            else if (ctx.True) {
                return {
                    type: 'True',
                    value: ctx.True[0].image,
                    translate: false
                }
            }
            else if (ctx.False) {
                return {
                    type: 'False',
                    value: ctx.False[0].image,
                    translate: false
                }
            }
            else if (ctx.array) {
                return {
                    type: 'Array',
                    value: this.visit(ctx.array),
                }
            }
        }
        array(ctx) {
            const values = ctx.value.map(v => this.visit(v));
            return values;
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
                value: content
            }
        }
    }
    return new MyCustomVisitor();
}

module.exports = {
    createHugoParser,
    createCstToTranslateInputTreeVisitor
}
