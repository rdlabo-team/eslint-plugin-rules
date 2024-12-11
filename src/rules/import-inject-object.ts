import { TSESLint } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'importInjectObject', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'This plugin automatically imports when inject is used but not imported.',
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
        if (classIndex !== -1) {
          const importInject = node.tokens.find(
            (token, index) => token.value === 'inject' && index < classIndex
          );
          const useInject = node.tokens.find(
            (token, index) => token.value === 'inject' && index > classIndex
          );
          if (useInject && importInject === undefined) {
            const core = node.tokens.find(
              (token) => token.value === "'@angular/core'"
            );
            if (core) {
              const coreIndex = node.tokens.findIndex(
                (token) => token === core
              );
              const lastObject = node.tokens.find(
                (_, index) => index === coreIndex - 3
              );
              if (lastObject) {
                context.report({
                  node: lastObject,
                  messageId: 'importInjectObject',
                  fix: (fixer) => {
                    return fixer.insertTextAfter(lastObject, ', inject');
                  },
                });
              }
            } else {
              context.report({
                node: node,
                messageId: 'importInjectObject',
                fix: (fixer) => {
                  return fixer.insertTextBefore(
                    node.tokens![0],
                    "import { inject } from '@angular/core';\n" +
                      ' '.repeat(node.tokens![0].loc.start.column)
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
