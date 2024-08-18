import { TSESLint } from '@typescript-eslint/utils';
import { Token } from '@typescript-eslint/types/dist/generated/ast-spec';

const rule: TSESLint.RuleModule<'denyConstructorDI', []> = {
  meta: {
    docs: {
      description:
        'This plugin disallows Dependency Injection within the constructor.',
      recommended: 'stylistic',
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
        const decorator = node.tokens.find((token, index) => {
          return (
            token.type === 'Punctuator' &&
            token.value === '@' &&
            node.tokens![index + 1].type === 'Identifier' &&
            ['Component', 'Injectable', 'Directive', 'Pipe'].includes(
              node.tokens![index + 1].value
            )
          );
        });
        if (!decorator) {
          return;
        }

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

          const openContentToken = node.tokens
            .filter((token) => token.loc.start.line >= startLine)
            .find((token) => token.value === '{');

          const closeContentToken = node.tokens
            .filter((token) => token.loc.start.line >= startLine)
            .find((token) => token.value === '}');

          const openContentIndex = node.tokens.findIndex(
            (token) => token === openContentToken
          );

          const closeContentIndex = node.tokens.findIndex(
            (token) => token === closeContentToken
          );
          const constructorContentIsEmpty =
            closeContentIndex === openContentIndex + 1;

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

              if (!constructorContentIsEmpty) {
                codes.push('');
                codes.push('constructor(');
              }

              context.report({
                node: constructor,
                messageId: 'denyConstructorDI',
                fix: (fixer) => {
                  const endRange = constructorContentIsEmpty
                    ? closeContentToken!.range[1]
                    : closeToken.range[0];

                  return fixer.replaceTextRange(
                    [constructor.range[0], endRange],
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
