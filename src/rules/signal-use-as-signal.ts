import { TSESLint } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'signalUseAsSignal', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'This plugin check to valid signal use as signal.',
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
  create: (context) => {
    const signalIdentifiers = new Set<string>();

    return {
      PropertyDefinition(node) {
        if (
          node.value &&
          node.value.type === 'CallExpression' &&
          node.value.callee.type === 'Identifier' &&
          ['signal', 'model'].includes(node.value.callee.name)
        ) {
          if (node.key.type === 'PrivateIdentifier') {
            signalIdentifiers.add(node.key.name);
          }
        }
      },

      MemberExpression(node) {
        if (
          node.object.type === 'ThisExpression' &&
          node.property.type === 'PrivateIdentifier' &&
          signalIdentifiers.has(node.property.name)
        ) {
          const parent = node.parent;
          if (
            parent &&
            parent.type !== 'CallExpression' &&
            parent.type !== 'MemberExpression'
          ) {
            context.report({
              node: node.property,
              messageId: 'signalUseAsSignal',
              data: {
                identifier: `this.${node.property.name}`,
              },
            });
          }
        }
      },
    };
  },
};

export = rule;
