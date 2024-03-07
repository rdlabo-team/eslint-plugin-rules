import { TSESLint } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'implementsIonicLifecycle', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'This plugin recommend to implements Ionic Lifecycle.',
      recommended: 'stylistic',
      url: '',
    },
    fixable: 'code',
    messages: {
      implementsIonicLifecycle: 'You must implements Ionic Lifecycle if use.',
    },
    schema: [],
    type: 'suggestion',
  },
  create: (context) => ({
    Program(node) {
      const lifecycle = [
        { method: 'ionViewDidEnter', type: 'ViewDidEnter' },
        { method: 'ionViewWillEnter', type: 'ViewWillEnter' },
        { method: 'ionViewDidLeave', type: 'ViewDidLeave' },
        { method: 'ionViewWillLeave', type: 'ViewWillLeave' },
      ];

      const targetClasses = node.body.filter(
        (node) => node.type === 'ExportNamedDeclaration'
      );

      targetClasses.forEach((targetClass) => {
        if (
          'declaration' in targetClass &&
          targetClass.declaration &&
          'implements' in targetClass.declaration
        ) {
          const implementType = targetClass
            .declaration!.implements.filter((implement) => {
              if ('name' in implement.expression!) {
                return lifecycle
                  .map((lifecycle) => lifecycle.type)
                  .includes(implement.expression!.name!);
              }
              return false;
            })
            .map((implement) => {
              if ('name' in implement.expression!) {
                return implement.expression!.name!;
              }
              return null;
            });

          const useLifecycle = node.tokens!.filter((token) => {
            return (
              token.type === 'Identifier' &&
              lifecycle
                .map((lifecycle) => lifecycle.method)
                .includes(token.value)
            );
          });
          const unImplements = useLifecycle.filter((use) => {
            return !implementType.includes(
              lifecycle.find((method) => method.method === use.value)!.type
            );
          });
          unImplements.map((unImplement) => {
            context.report({
              node: unImplement,
              messageId: 'implementsIonicLifecycle',
            });
          });
        }
      });
    },
  }),
};

export = rule;
