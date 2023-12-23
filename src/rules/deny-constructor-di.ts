import { TSESLint } from '@typescript-eslint/utils';
import { Token } from '@typescript-eslint/types/dist/generated/ast-spec';

const rule: TSESLint.RuleModule<'denyConstructorDI', []> = {
  meta: {
    docs: {
      description:
        'This plugin disallows Dependency Injection within the constructor.',
      recommended: false,
      url: '',
    },
    fixable: 'code',
    messages: {
      denyConstructorDI:
        'Dependency Injection within the constructor is not allowed.',
    },
    schema: [],
    type: 'problem',
  },
  defaultOptions: [],
  create: (context) => ({
    Program(node) {
      if (node.tokens) {
        const constructor = node.tokens.find(
          (token) => token.value === 'constructor'
        );
        if (constructor) {
          const startLine = constructor.loc.start.line;
          const openToken = node.tokens
            .filter((token) => token.loc.start.line >= startLine)
            .find((token) => token.value === '(');
          const closeToken = node.tokens
            .filter((token) => token.loc.start.line >= startLine)
            .find((token) => token.value === ')');

          const openIndex = node.tokens.findIndex(
            (token) => token === openToken
          );
          const closeIndex = node.tokens.findIndex(
            (token) => token === closeToken
          );

          if (openToken && closeToken) {
            const diToken = node.tokens.filter(
              (token, index) =>
                index > openIndex &&
                index < closeIndex &&
                (['Identifier', 'Keyword'].includes(token.type) ||
                  ['<', '>'].includes(token.value))
            );

            if (diToken && diToken.length > 0) {
              const codes: string[] = [];
              let temporaryToken: Token[] = [];
              let continueFlg = true;

              for (let i = 0; i < diToken.length; i++) {
                if (diToken[i]?.value === '<') {
                  continueFlg = false;
                }
                if (diToken[i - 1]?.value === '>') {
                  continueFlg = true;
                }
                if (!continueFlg) {
                  continue;
                }

                temporaryToken.push(diToken[i]);
                if (
                  temporaryToken.filter(
                    (d) => d.type === 'Identifier' && d.value !== 'readonly'
                  ).length === 2
                ) {
                  const token: string[] = temporaryToken.map((d) => {
                    if (
                      temporaryToken.filter(
                        (di) =>
                          di.type === 'Identifier' && di.value !== 'readonly'
                      )[1].value === d.value
                    ) {
                      return `= inject(${d.value});`;
                    }
                    return d.value;
                  });
                  codes.push(token.join(' '));
                  temporaryToken = [];
                }
              }

              codes.push('');
              codes.push('constructor(');

              context.report({
                node: constructor,
                messageId: 'denyConstructorDI',
                fix: (fixer) => {
                  return fixer.replaceTextRange(
                    [constructor.range[0], closeToken.range[0]],
                    codes.join('\n' + ' '.repeat(constructor.loc.start.column))
                  );
                },
              });
            }
          }
        }
      }
    },
  }),
};

export = rule;
