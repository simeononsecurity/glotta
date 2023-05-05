require('dotenv').config()

const { resolve } = require('node:path');
const { parseHugo } = require('./index');
const { getFileContents } = require('../get-file-contents');
const { translateTree } = require('./translate-tree');

const MOCK_TRANSLATE_INPUT_TREE = {
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
};

const MOCK_TRANSLATED_TREE = {
    frontmatter: [
        {
            type: 'frontmatter.title',
            value: '"Guía para principiantes sobre respuesta a incidentes de ciberseguridad"',
            translate: true
        },
        { type: 'frontmatter.date', value: '2023-03-16', translate: false },
        { type: 'frontmatter.toc', value: 'true', translate: false },
        { type: 'frontmatter.draft', value: 'false', translate: false },
        {
            type: 'frontmatter.description',
            value: '"Aprenda los conceptos básicos de la respuesta a incidentes y el manejo de incidentes de ciberseguridad con esta guía para principiantes".',
            translate: true
        },
        {
            type: 'frontmatter.tags',
            value: [
                {
                    type: 'StringLiteral',
                    value: '"respuesta al incidente"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"la seguridad cibernética"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"Guía para principiantes"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"protección de Datos"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"seguridad de datos"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"Seguridad informatica"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"Seguridad de la red"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"Ataques ciberneticos"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"seguridad de información"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"delito cibernético"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"seguridad digital"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"Esa infraestructura"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"violaciones de datos"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"amenazas cibernéticas"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"defensa cibernética"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"administracion de incidentes"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"recuperación de datos"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"planificación de la seguridad"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"gestión de riesgos"',
                    translate: true
                },
                {
                    type: 'StringLiteral',
                    value: '"estrategia de ciberseguridad"',
                    translate: true
                }
            ]
        },
        {
            type: 'frontmatter.cover',
            value: '"/img/cover/A_cartoon_image_of_a_cybersecurity_superhero_defending_a_city.png"',
            translate: false
        },
        {
            type: 'frontmatter.coverAlt',
            value: '"Una caricatura de un superhéroe de ciberseguridad que defiende una ciudad contra las amenazas cibernéticas".',
            translate: true
        },
        { type: 'frontmatter.coverCaption', value: '""', translate: false }
    ],
    content: [
        {
            type: 'Content',
            value: '\n' +
                '**Guía para principiantes sobre respuesta a incidentes de ciberseguridad**\n' +
                '\n' +
                'A medida que el mundo se vuelve más dependiente de la tecnología, la **ciberseguridad** ha\n' +
                '\n' +
                '## ¿Qué es la respuesta a incidentes?\n' +
                '\n' +
                '**Respuesta a incidentes** es el proceso.\n' +
                '\n' +
                '______\n' +
                '\n' +
                '## El proceso de respuesta a incidentes\n' +
                '\n' +
                'El incidente:\n' +
                '\n' +
                '### Preparación\n' +
                '\n' +
                '**Preparación** es la primera\n' +
                '\n',
            translate: true
        },
        {
            type: 'UrlLike',
            value: '[fake-url-title](fake-url)',
            translate: false
        },
        { type: 'Content', value: '\n\nHey hey hey\n\n', translate: true },
        {
            type: 'Shortcode',
            value: '{{fake-short-code}}',
            translate: false
        },
        {
            type: 'Content',
            value: '\n' +
                '\n' +
                'Identificación\n' +
                '\n' +
                'El segundo paso en el proceso de respuesta a incidentes es la **identificación**. Esto implica detectar\n' +
                '\n' +
                '## Mejores prácticas para la respuesta a incidentes\n' +
                '\n' +
                'La respuesta efectiva a incidentes requiere una\n' +
                '\n' +
                '- **Desarrolle un plan de respuesta a incidentes**: Cree un plan que aborde los incidentes.\n' +
                '- **Capacitar a los empleados**: Asegúrese de que todos los empleados estén capacitados en\n' +
                '______\n' +
                '\n' +
                '## Conclusión\n' +
                '\n' +
                'La respuesta efectiva a incidentes es fundamental para minimizar el daño causado por incidentes de ciberseguridad.\n' +
                '\n',
            translate: true
        },
        { type: 'UrlLike', value: '[test](abc)', translate: false },
        { type: 'ContentEnd', value: '\n\ntexto final', translate: true }
    ]
}

describe('parseHugo', () => {
    it('parses hugo text content into expected structure', async () => {
        const MOCK_FILE_PATH = resolve(__dirname, '../../../__fixtures__/example-dir/nested-example-dir/mock-file.en.md');
        const fileText = await getFileContents(MOCK_FILE_PATH);

        const translateTree = await parseHugo(fileText);
        expect(translateTree).toEqual(MOCK_TRANSLATE_INPUT_TREE);
    });
});

describe('translate input tree', () => {
    it('translates only the expected values', async () => {
        const result = await translateTree(MOCK_TRANSLATE_INPUT_TREE);
        expect(result).toEqual(MOCK_TRANSLATED_TREE);
    }, 20000)
});
