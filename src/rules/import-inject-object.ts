import { TSESLint } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'importInjectObject', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'This plugin automatically imports when Inject is used but not imported.',
      recommended: false,
      url: '',
    },
    fixable: 'code',
    messages: {
      importInjectObject: 'If use Inject, must import.',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => ({
    Program(node) {
      if (node.tokens) {
        const classIndex = node.tokens.findIndex(
          (token) => token.value === 'class'
        );
        const importInject = node.tokens.find(
          (token, index) => token.value === 'Inject' && index < classIndex
        );
        const useInject = node.tokens.find(
          (token, index) => token.value === 'Inject' && index > classIndex
        );

        if (useInject && importInject === undefined) {
          const core = node.tokens.find(
            (token) => token.value === "'@angular/core'"
          );
          if (core) {
            const coreIndex = node.tokens.findIndex((token) => token === core);
            const lastObject = node.tokens.find(
              (_, index) => index === coreIndex - 3
            );
            if (lastObject) {
              context.report({
                node: lastObject,
                messageId: 'importInjectObject',
                fix: (fixer) => {
                  return fixer.insertTextAfter(lastObject, ', Inject');
                },
              });
            }
          } else {
            context.report({
              node: node.tokens[0],
              messageId: 'importInjectObject',
              fix: (fixer) => {
                return fixer.insertTextBefore(
                  node.tokens![0],
                  "import { Inject } from '@angular/core';\n" +
                    ' '.repeat(node.tokens![0].loc.start.column)
                );
              },
            });
          }
        }
      }
    },
  }),
};

export = rule;
