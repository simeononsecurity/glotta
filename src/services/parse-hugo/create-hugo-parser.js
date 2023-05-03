const chevrotain = require('chevrotain');

function createHugoParser() {
    // ----------------- Lexer -----------------
    const createToken = chevrotain.createToken;
    const Lexer = chevrotain.Lexer;

    // --- lexer mode: frontmatter ---
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

    const hugoFrontmatterTokens = [
        TripleDashStart,
        TripleDashEnd,
        Colon,
        Comma,
        Date,
        LSquare,
        RSquare,
        StringLiteral,
        NewLineNotFollowedByTripleDash,
        True,
        False,
        NumberLiteral,
        WhiteSpace,
        ItemKey,
        WhiteSpace
    ];

    // --- lexer mode: content ---
    const Content = createToken({ name: "Content", pattern: /[\s\S\n]+/ });
    const hugoContentTokens = [
        Content
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
    Content.LABEL = "abcdef..."

    // ----------------- parser -----------------
    const CstParser = chevrotain.CstParser;

    class HugoParser extends CstParser {
        constructor() {
            super(hugoFrontmatterTokens, { // notice ContentTokens are not passed here. The lexer is somehow able to parse in content_mode so this is OK
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
                $.CONSUME(ItemKey)
                $.CONSUME(Colon);
                $.SUBRULE($.value);
            });

            $.RULE("value", () => {
                $.OR([
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
                $.MANY_SEP({
                    SEP: NewLineNotFollowedByTripleDash, DEF: () => {
                        $.CONSUME(Content)
                    }
                })
            })

            this.performSelfAnalysis();
        }
    }

    return {
        lexer: hugoLexer,
        parser: new HugoParser(),
        defaultRule: "hugo"
    };
}

module.exports = {
    createHugoParser
}
