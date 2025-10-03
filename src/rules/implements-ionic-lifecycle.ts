import { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { ClassElement } from '@typescript-eslint/types/dist/generated/ast-spec';

const rule: TSESLint.RuleModule<'implementsIonicLifecycle', []> = {
  name: 'implements-ionic-lifecycle',
  defaultOptions: [],
  meta: {
    docs: {
      description: 'This plugin recommend to implements Ionic Lifecycle.',
      url: '',
    },
    fixable: 'code',
    messages: {
      implementsIonicLifecycle: 'You must implements Ionic Lifecycle if use.',
    },
    schema: [],
    type: 'suggestion',
  },
  create: (context) => {
    const lifecycle = [
      { method: 'ionViewDidEnter', type: 'ViewDidEnter' },
      { method: 'ionViewWillEnter', type: 'ViewWillEnter' },
      { method: 'ionViewDidLeave', type: 'ViewDidLeave' },
      { method: 'ionViewWillLeave', type: 'ViewWillLeave' },
    ];
    const lifecycleTypes = lifecycle.map((l) => l.type);
    const lifecycleMethods = lifecycle.map((l) => l.method);

    return {
      ClassDeclaration(node) {
        // Componentデコレータのチェック
        const isComponent = node.decorators?.some(
          (decorator) =>
            decorator.expression.type === 'CallExpression' &&
            decorator.expression.callee.type === 'Identifier' &&
            decorator.expression.callee.name === 'Component',
        );
        if (!isComponent || !node.id) {
          return;
        }

        // implementsに含まれるライフサイクル型
        const implementedTypes =
          node.implements
            ?.map((implement) => {
              const expression = implement.expression;
              if (expression.type === AST_NODE_TYPES.Identifier && 'name' in expression && lifecycleTypes.includes(expression.name)) {
                return expression.name;
              }
              return null;
            })
            .filter((type): type is string => type !== null) || [];

        // クラス内で使われているライフサイクルメソッド
        const usedLifecycleTypes: string[] = [];
        const usedLifecycleMethods: { type: string; node: ClassElement }[] = [];
        node.body.body.forEach((definition) => {
          if (definition.type === 'MethodDefinition' && definition.key.type === 'Identifier' && lifecycleMethods.includes(definition.key.name)) {
            const methodName = definition.key.name;
            const type = lifecycle.find((l) => l.method === methodName)?.type;
            if (type) {
              usedLifecycleTypes.push(type);
              usedLifecycleMethods.push({ type, node: definition });
            }
          }
        });

        // --- 空のクラスでライフサイクルインターフェースを実装していたら必ずエラー ---
        if (node.body.body.length === 0 && implementedTypes.length > 0) {
          context.report({
            node: node,
            messageId: 'implementsIonicLifecycle',
            fix: (fixer) => {
              if (node.implements && node.implements.length > 0) {
                const sourceCode = context.getSourceCode();
                const classText = sourceCode.getText(node);
                const match = classText.match(/implements\s+/);
                if (match && match.index !== undefined) {
                  const implementsStart = node.range[0] + match.index;
                  const lastImpl = node.implements[node.implements.length - 1];
                  return fixer.replaceTextRange([implementsStart, lastImpl.range[1]], '');
                }
              }
              return null;
            },
          });
          return;
        }

        // --- implements句の型を「必要なものだけ」にする ---
        if (usedLifecycleTypes.length > 0) {
          const uniqueNeededTypes = Array.from(new Set(usedLifecycleTypes));
          // implements句が既に正しい場合は何もしない
          if (
            node.implements &&
            node.implements.length === uniqueNeededTypes.length &&
            implementedTypes.every((t) => uniqueNeededTypes.includes(t)) &&
            uniqueNeededTypes.every((t) => implementedTypes.includes(t))
          ) {
            return;
          }
          // 不足している型があるメソッドのみエラーを出す
          let fixReported = false;
          usedLifecycleMethods.forEach(({ type, node: methodNode }) => {
            if (!implementedTypes.includes(type)) {
              context.report({
                node: methodNode,
                messageId: 'implementsIonicLifecycle',
                fix: !fixReported
                  ? (fixer) => {
                      if (node.implements && node.implements.length > 0) {
                        const sourceCode = context.getSourceCode();
                        const classText = sourceCode.getText(node);
                        const match = classText.match(/implements\s+/);
                        if (match && match.index !== undefined) {
                          const implementsStart = node.range[0] + match.index;
                          const lastImpl = node.implements[node.implements.length - 1];
                          return fixer.replaceTextRange([implementsStart, lastImpl.range[1]], `implements ${uniqueNeededTypes.join(', ')}`);
                        }
                      }
                      // implements句がない場合は新規追加
                      return fixer.insertTextAfter(node.id!, ` implements ${uniqueNeededTypes.join(', ')}`);
                    }
                  : undefined,
              });
              fixReported = true;
            }
          });
        }
      },
    };
  },
};

export = rule;
