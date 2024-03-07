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
          'implements' in targetClass.declaration &&
          'decorators' in targetClass.declaration
        ) {
          // Components以外を削除
          const decorators = targetClass.declaration.decorators.find(
            (decorator) => {
              return (
                decorator.expression.type === 'CallExpression' &&
                decorator.expression.callee.type === 'Identifier' &&
                decorator.expression.callee.name === 'Component'
              );
            }
          );
          if (!decorators) {
            return;
          }

          const implementType = targetClass.declaration.implements
            .filter((implement) => {
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

          const useLifecycle = targetClass.declaration.body.body.filter(
            (definition) => {
              return (
                definition.type === 'MethodDefinition' &&
                definition.key.type === 'Identifier' &&
                lifecycle
                  .map((lifecycle) => lifecycle.method)
                  .includes(definition.key.name)
              );
            }
          );
          const unImplements = useLifecycle.filter((definition) => {
            if (
              definition.type !== 'MethodDefinition' ||
              definition.key.type !== 'Identifier'
            ) {
              return false;
            }
            const name = definition.key.name;
            return !implementType.includes(
              lifecycle.find((method) => method.method === name)!.type
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
