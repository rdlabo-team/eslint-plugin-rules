import { TSESLint } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'signalUseAsSignal', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'This plugin check to valid signal use as signal.',
      recommended: 'strict',
      url: '',
    },
    fixable: undefined,
    messages: {
      signalUseAsSignal:
        'signals should not be used as signals: `{{ identifier }}`',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => ({
    Program(node) {
      const filename = context.filename;
      if (
        filename.endsWith('.spec') ||
        filename.endsWith('.html') ||
        !node.tokens
      ) {
        return;
      }
      const signalIdentifier: string[] | undefined = node.tokens
        .map((token, index) => {
          if (
            token.type === 'Identifier' &&
            ['signal', 'model'].includes(token.value) &&
            node.tokens![index - 1].type === 'Punctuator' &&
            node.tokens![index - 1].value === '='
          ) {
            return node.tokens![index - 2].value;
          }
          return '';
        })
        .filter((token) => token !== '');

      if (signalIdentifier.length === 0) {
        return;
      }

      node.tokens.map((token, index) => {
        if (
          token.type === 'Identifier' &&
          signalIdentifier.includes(token.value) &&
          node.tokens![index - 1].type === 'Punctuator' &&
          node.tokens![index - 1].value === '.' &&
          node.tokens![index - 2].type === 'Keyword' &&
          node.tokens![index - 2].value === 'this'
        ) {
          if (!['(', '.'].includes(node.tokens![index + 1].value)) {
            context.report({
              node,
              loc: token.loc,
              messageId: 'signalUseAsSignal',
              data: {
                identifier:
                  node.tokens![index - 2].value +
                  node.tokens![index - 1].value +
                  token.value +
                  node.tokens![index + 1].value,
              },
            });
          }
        }
      });
    },
  }),
};

export = rule;
