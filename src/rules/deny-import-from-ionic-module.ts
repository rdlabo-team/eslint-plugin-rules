import { TSESLint } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'denyImportFromIonicModule', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'This plugin prevents accidental imports from @ionic/angular instead of @ionic/angular/standalone.',
      url: '',
    },
    fixable: 'code',
    messages: {
      denyImportFromIonicModule:
        'You must import from @ionic/angular/standalone instead of @ionic/angular.',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => ({
    Program(node) {
      if (node.tokens) {
        const moduleImport = node.tokens.find((token, index) => {
          return (
            token.value === "'@ionic/angular'" &&
            node.tokens?.[index - 1].value === 'from'
          );
        });
        if (moduleImport) {
          context.report({
            node: node,
            messageId: 'denyImportFromIonicModule',
            fix: (fixer) => {
              return fixer.replaceText(
                moduleImport,
                "'@ionic/angular/standalone'"
              );
            },
          });
        }
      }
    },
  }),
};

export = rule;
