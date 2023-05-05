const { resolve } = require('node:path');
const { parseHugo } = require('./index');
const { getFileContents } = require('../get-file-contents');

async function getFileText() {
    return await getFileContents(MOCK_FILE_PATH)
}

describe('parseHugo', () => {
    it('parses hugo text content into expected structure', async () => {
        const MOCK_FILE_PATH = resolve(__dirname, '../../../__fixtures__/example-dir/nested-example-dir/mock-file.en.md');
        const fileText = await getFileContents(MOCK_FILE_PATH);
        
        const translateTree = await parseHugo(fileText);
        expect(translateTree).toEqual(
            {
                "frontmatter": [
                    {
                        "type": "frontmatter.title",
                        "value": "\"Beginner's Guide to Cybersecurity Incident Response\"",
                        "translate": true
                    },
                    {
                        "type": "frontmatter.date",
                        "value": "2023-03-16",
                        "translate": false
                    },
                    {
                        "type": "frontmatter.toc",
                        "value": "true",
                        "translate": false
                    },
                    {
                        "type": "frontmatter.draft",
                        "value": "false",
                        "translate": false
                    },
                    {
                        "type": "frontmatter.description",
                        "value": "\"Learn the basics of incident response and handling cybersecurity incidents with this beginner's guide.\"",
                        "translate": true
                    },
                    {
                        "type": "frontmatter.tags",
                        "value": [
                            {
                                "type": "StringLiteral",
                                "value": "\"incident response\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"cybersecurity\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"beginner's guide\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"data protection\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"data security\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"IT security\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"network security\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"cyber attacks\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"information security\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"cybercrime\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"digital security\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"IT infrastructure\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"data breaches\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"cyber threats\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"cyber defense\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"incident management\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"data recovery\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"security planning\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"risk management\"",
                                "translate": true
                            },
                            {
                                "type": "StringLiteral",
                                "value": "\"cybersecurity strategy\"",
                                "translate": true
                            }
                        ]
                    },
                    {
                        "type": "frontmatter.cover",
                        "value": "\"/img/cover/A_cartoon_image_of_a_cybersecurity_superhero_defending_a_city.png\"",
                        "translate": false
                    },
                    {
                        "type": "frontmatter.coverAlt",
                        "value": "\"A cartoon image of a cybersecurity superhero defending a city against cyber threats.\"",
                        "translate": true
                    },
                    {
                        "type": "frontmatter.coverCaption",
                        "value": "\"\"",
                        "translate": false
                    }
                ],
                "content": {
                    "type": "ContentList",
                    "value": [
                        {
                            "type": "Content",
                            "value": "\n**Beginner's Guide to Cybersecurity Incident Response**\n\nAs the world becomes more reliant on technology, **cybersecurity** has\n\n## What is Incident Response?\n\n**Incident response** is the process.\n\n______\n\n## The Incident Response Process\n\nThe incident:\n\n### Preparation\n\n**Preparation** is the first\n\n",
                            "translate": true
                        },
                        {
                            "type": "UrlLike",
                            "value": "[fake-url-title](fake-url)",
                            "translate": false
                        },
                        {
                            "type": "Content",
                            "value": "\n\nhey hey hey\n\n",
                            "translate": true
                        },
                        {
                            "type": "Shortcode",
                            "value": "{{fake-short-code}}",
                            "translate": false
                        },
                        {
                            "type": "Content",
                            "value": "\n\nIdentification\n\nThe second step in the incident response process is **identification**. This involves detecting\n\n## Best Practices for Incident Response\n\nEffective incident response requires a\n\n- **Develop an incident response plan**: Create a plan thatincidents.\n- **Train employees**: Make sure that all employees are trained on\n______\n\n## Conclusion\n\nEffective incident response is critical for minimizing the damage caused by cybersecurity incidents.\n\n",
                            "translate": true
                        },
                        {
                            "type": "UrlLike",
                            "value": "[test](abc)",
                            "translate": false
                        },
                        {
                            "type": "ContentEnd",
                            "value": "\n\ntrailingtext",
                            "translate": true
                        }
                    ]
                }
            }
        );
    });
});
