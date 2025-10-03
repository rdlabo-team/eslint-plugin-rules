import { TSESLint, TSESTree } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'denyConstructorDI', []> = {
  name: 'deny-constructor-di',
  meta: {
    docs: {
      description: 'This plugin disallows Dependency Injection within the constructor.',
      url: 'https://angular.dev/reference/migrations/inject-function',
    },
    messages: {
      denyConstructorDI: 'Dependency Injection within the constructor is not allowed.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create: (context) => ({
    ClassDeclaration(node: TSESTree.ClassDeclaration) {
      const bodyElements = node.body.body;

      for (const element of bodyElements) {
        if (element.type === 'MethodDefinition' && element.kind === 'constructor') {
          const constructorFn = element.value;

          for (const param of constructorFn.params) {
            if (param.type === 'TSParameterProperty') {
              context.report({
                node: param,
                messageId: 'denyConstructorDI',
              });
            }
          }
        }
      }
    },
  }),
};

export = rule;
