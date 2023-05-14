const { EOL } = require('os');
const chevrotain = require('chevrotain');

function createLexerAndParser() {
    // ----------------- Lexer ----------------
    const createToken = chevrotain.createToken;
    const Lexer = chevrotain.Lexer;

    // ----------------- Lexer mode: frontmatter -----------------
    const TripleDashStart = createToken({ name: "TripleDashStart", pattern: EOL === '\n' ? /---\n/ : /---\r\n/ });
    const Colon = createToken({ name: "Colon", pattern: /:/ });
    const NewLineNotFollowedByTripleDash = createToken({ name: "NewLineNotFollowedByTripleDash", pattern: EOL === '\n' ? /\n(?!---)/ : /\r\n(?!---)/ });
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
    const TripleDashEnd = createToken({ name: "TripleDashEnd", pattern: EOL === '\n' ? /\n---\n/ : /\r\n---\r\n/, push_mode: "content_mode" });

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
    const CodeSnippet = createToken({ name: "CodeSnippet", pattern: /```[\s\S]+```/ });
    const InlineCodeSnippet = createToken({ name: "InlineCodeSnippet", pattern: /`[\s\S]+`/ });
    const Content = createToken({ name: "Content", pattern: /[\s\S]*?(?=\{\{.*}\}|\[.*\]\(.*\)|```[\s\S]+```|`[\s\S]+`)/ });
    const ContentEnd = createToken({ name: "ContentEnd", pattern: /[\s\S]+/ });

    const hugoContentTokens = [
        Shortcode,
        UrlLike,     // reused
        CodeSnippet,
        InlineCodeSnippet,
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

    TripleDashStart.LABEL = EOL === '\n' ? "'---\\n'" : "'---\\r\\n'";
    TripleDashEnd.LABEL = EOL === '\n' ? "'\\n---\\n'" : "'\\r\\n---\\r\\n'";
    LSquare.LABEL = "'['";
    RSquare.LABEL = "']'";
    Colon.LABEL = "':'";
    Comma.LABEL = "','";
    UrlLike.LABEL = '[title](url) or /abc/def.png'; // more or less
    Shortcode.LABEL = "{{abcdef}}";
    CodeSnippet.LABEL = "``` node index.js ```";
    InlineCodeSnippet.LABEL = "`node index.js`";
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
                $.MANY_SEP({
                    SEP: NewLineNotFollowedByTripleDash, DEF: () => {
                        $.CONSUME(ItemKey);
                        $.CONSUME(Colon);
                        $.SUBRULE($.value);
                    }
                });
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
                            { ALT: () => $.CONSUME(CodeSnippet) },
                            { ALT: () => $.CONSUME(InlineCodeSnippet) },
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
    const translationDetails = {
        locations: [],
        frontmatterItemValueLocations: {}
    }
    let IS_FRONTMATTER_VALUE = false;
    let IS_WITHIN_ARRAY = false;
    class MyCustomVisitor extends HugoVisitorClass {
        constructor() {
            super();
            this.validateVisitor();
        }
        hugo(ctx) {
            if (ctx.frontmatter[0].recoveredNode) {
                return;
            }
            results.push('---' + EOL);
            ctx.frontmatter = this.visit(ctx.frontmatter);
            results.push('---' + EOL); // for sake of reconstruction, don't add return before ---, instead rely on the \n appended to previous value
            ctx.content = this.visit(ctx.content);
            return ctx;
        }
        frontmatter(ctx) {
            ctx.frontmatterItem = this.visit(ctx.frontmatterItem);
            return ctx;
        }
        frontmatterItem(ctx) {
            const valueArr = [];
            ctx.ItemKey.forEach((itemKey, i) => {
                results.push(itemKey.image + ': ');
                IS_FRONTMATTER_VALUE = true;
                valueArr.push(this.visit(ctx.value[i]));
                IS_FRONTMATTER_VALUE = false;
            });
            ctx.value = valueArr;
            return ctx;
        }
        value(ctx) {
            if (!ctx.array) {
                const key = Object.keys(ctx)[0];
                const rawValue = ctx[key][0].image.slice(1, -1);
                const suffix = IS_WITHIN_ARRAY ? ', ' : EOL;
                results.push(ctx[key][0].image + suffix);
                if (key === 'StringLiteral' && ctx[key].image !== "\"\"") {
                    translationDetails.locations.push(results.length - 1);
                    if (IS_FRONTMATTER_VALUE) {
                        translationDetails.frontmatterItemValueLocations[results.length - 1] = { rawValue, suffix: '"' + suffix }
                    }
                }
            }
            else if (ctx.array) {
                ctx.array = this.visit(ctx.array);
            }
            return ctx;
        }
        array(ctx) {
            IS_WITHIN_ARRAY = true;
            results.push("[");
            if (ctx && ctx.value && ctx.value.length > 0) {
                ctx.value = ctx.value.map(v => this.visit(v));
                results[results.length - 1] = results[results.length - 1].slice(0, -2); // undo last appended comma
                translationDetails.frontmatterItemValueLocations[results.length - 1].suffix = '"'; // keep tracked suffix accurate for this index
            }
            results.push("]" + EOL);
            IS_WITHIN_ARRAY = false;
            return ctx;
        }
        content(ctx) {
            // opportunity: could optimize by checking if pre-sorted Content/UrlLike/Shortcode/ContentEnd items are more uniform
            let combined = [];
            if (ctx.Content) {
                combined = combined.concat(ctx.Content);
            }
            if (ctx.UrlLike) {
                combined = combined.concat(ctx.UrlLike);
            }
            if (ctx.Shortcode) {
                combined = combined.concat(ctx.Shortcode);
            }
            if (ctx.CodeSnippet) {
                combined = combined.concat(ctx.CodeSnippet);
            }
            if (ctx.InlineCodeSnippet) {
                combined = combined.concat(ctx.InlineCodeSnippet);
            }
            if (ctx.ContentEnd) {
                combined = combined.concat(ctx.ContentEnd);
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
                while (i + peekAheadOffset < combined.length && combined[i + peekAheadOffset].tokenType.name === 'Content') {
                    text += combined[i + peekAheadOffset].image;
                    peekAheadOffset++;
                }
                results.push(text);
                if (text.length > 0) {
                    translationDetails.locations.push(results.length - 1);
                }
                prevContentOffset = peekAheadOffset; // save the last known "not Content" index for backtracking next iteration

                // ------------ handle UrlLike and ShortCode and Codesnippet ------------
                while (i + peekAheadOffset < combined.length && (combined[i + peekAheadOffset].tokenType.name !== 'ContentEnd')) {
                    results.push(combined[i + peekAheadOffset].image);
                    if (combined[i + peekAheadOffset].tokenType.name === 'Content') { // handle any content in-between Shortcodes and UrlLikes and Codesnippets
                        translationDetails.locations.push(results.length - 1);
                    }
                    peekAheadOffset++;
                }

                // ------------------ handle ContentEnd ------------------
                text = '';
                while (i + peekAheadOffset < combined.length && combined[i + peekAheadOffset].tokenType.name === 'ContentEnd') { // handle ContentEnd
                    text += combined[i + peekAheadOffset].image;
                    peekAheadOffset++;
                }
                results.push(text);
                if (text.length > 0) {
                    translationDetails.locations.push(results.length - 1);
                }

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
        translationDetails
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
