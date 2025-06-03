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
    ImportDeclaration(node) {
      if (node.source.value === '@ionic/angular') {
        context.report({
          node: node.source,
          messageId: 'denyImportFromIonicModule',
          fix: (fixer) => {
            return fixer.replaceText(
              node.source,
              "'@ionic/angular/standalone'"
            );
          },
        });
      }
    },
  }),
};

export = rule;
