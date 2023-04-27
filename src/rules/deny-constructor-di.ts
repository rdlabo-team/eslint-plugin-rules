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
              const codes: string[] = [''];
              let temporaryToken: Token[] = [];

              let continueFlg = true;
              for (let i = 0; i < diToken.length; i++) {
                temporaryToken.push(diToken[i]);
                if (diToken[i + 1]?.value === '<') {
                  continueFlg = false;
                }
                if (diToken[i].value === '>') {
                  continueFlg = true;
                }

                if (!continueFlg) {
                  // 何もしない
                } else if (
                  temporaryToken.filter((token) => token.type === 'Identifier')
                    .length >= 2
                ) {
                  if (temporaryToken[0].type === 'Keyword') {
                    const injectToken = temporaryToken
                      .slice(2, 6)
                      .map((d) => d.value)
                      .join('');
                    codes.push(
                      `${temporaryToken[0].value} ${temporaryToken[1].value} = Inject(${injectToken});`
                    );
                  } else {
                    const injectToken = temporaryToken
                      .slice(1, 6)
                      .map((d) => d.value)
                      .join('');
                    codes.push(
                      `${temporaryToken[0].value} = Inject(${injectToken});`
                    );
                  }
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
