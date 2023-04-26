import { TSESLint } from '@typescript-eslint/utils';

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
                token.type === 'Identifier' &&
                token.value !== 'constructor'
            );

            if (diToken && diToken.length > 0) {
              context.report({
                node: diToken[0],
                messageId: 'denyConstructorDI',
              });
            }
          }
        }
      }
    },
  }),
};

export default rule;
