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
    fixable: undefined,
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

          if (openToken && closeToken) {
            const diToken = node.tokens.filter(
              (token) =>
                token.loc.start.line >= openToken.loc.end.line &&
                token.loc.end.line <= closeToken.loc.end.line &&
                ((token.type === 'Identifier' &&
                  token.value !== 'constructor') ||
                  (token.type === 'Keyword' &&
                    ['public', 'private'].includes(token.value)))
            );

            if (diToken && diToken.length > 0) {
              const codes: string[] = [];
              let temporaryToken: Token[] = [];

              for (const token of diToken) {
                temporaryToken.push(token);
                if (
                  temporaryToken.filter((token) => token.type === 'Identifier')
                    .length === 2
                ) {
                  if (temporaryToken[0].type === 'Keyword') {
                    codes.push(
                      `${temporaryToken[0].value} ${temporaryToken[1].value} = inject(${temporaryToken[2].value});`
                    );
                  } else {
                    codes.push(
                      `${temporaryToken[0].value} = inject(${temporaryToken[1].value});`
                    );
                  }
                  temporaryToken = [];
                }
              }

              context.report({
                node: constructor,
                messageId: 'denyConstructorDI',
                fix: (fixer) => {
                  const fixes = [];
                  diToken.forEach((token) => {
                    fixes.push(fixer.remove(token));
                  });
                  return fixer.insertTextBeforeRange(
                    [
                      constructor.loc.start.line,
                      constructor.loc.start.line + codes.length,
                    ],
                    codes.join('\n')
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

export default rule;
