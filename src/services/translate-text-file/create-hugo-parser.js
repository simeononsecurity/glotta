const chevrotain = require('chevrotain');
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

function cstToTranslationInput(cst, HugoVisitorClass) {
    const results = [];
    const translationIndices = [];
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
                results.push(fi.ItemKey[0].image + ': ');
                return fi;
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
                    translationIndices.push(results.length - 1);
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
            // opportunity: could optimize by checking if pre-sorted Concat/UrlLike/ShortCode/Contend items are more uniform
            const combined = [];
            if (ctx.Content) {
                combined.concat(ctx.Content);
            }
            if (ctx.UrlLike) {
                combined.concat(ctx.UrlLike);
            }
            if (ctx.ContentEnd) {
                combined.concat(ctx.ContentEnd);
            }
            combined.sort((a, b) => {
                if (a.startOffset < b.startOffset) return -1;
                if (a.startOffset > b.startOffset) return 1;
                return 0;
            });

            let prevContentOffset = 0;
            for (let i = 0; i < combined.length; i++) { // for each Content/UrlLike/Shortcode/ContentEnd in combined array
                let peekAheadOffset = 0;
                if (i > 0 && i !== combined.length) {   // if not the first iteration, then start one after the last index checked for Content
                    i = prevContentOffset + 1;
                }

                // ------------------ handle Content ------------------
                let text = '';
                while (combined[i + peekAheadOffset].tokenType.name === 'Content') {
                    text += combined[i + peekAheadOffset].image;
                    peekAheadOffset++;
                }
                results.push(text);
                translationIndices.push(results.length - 1);
                prevContentOffset = peekAheadOffset; // save the last known "not Content" index for backtracking next iteration

                // ------------ handle UrlLike and ShortCode ------------
                while (combined[i + peekAheadOffset].tokenType.name !== 'ContentEnd') {
                    results.push(combined[peekAheadOffset].image);
                    peekAheadOffset++;
                }

                // ------------------ handle ContentEnd ------------------
                text = '';
                while (combined[i + peekAheadOffset].tokenType.name === 'ContentEnd') { // handle ContentEnd
                    text += combined[peekAheadOffset].image;
                    peekAheadOffset++;
                }
                results.push(text);
                translationIndices.push(results.length - 1);

                if (peekAheadOffset === combined.length) {
                    // then we've made it through the entire combined array already, so break out of combined array iteration
                    break;
                }
            }
            return ctx;
        }
    }
    const customVisitor = new MyCustomVisitor();
    customVisitor.visit(cst);
    return {
        results,
        translationIndices
    }
}

async function createHugoParser(text) {
    const { lexer, parser } = createLexerAndParser();
    const lexingResult = lexer.tokenize(text);
    parser.input = lexingResult.tokens;
    return parser;
}

module.exports = {
    createHugoParser,
    cstToTranslationInput,
}
