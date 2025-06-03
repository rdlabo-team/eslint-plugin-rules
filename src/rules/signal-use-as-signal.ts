import { TSESLint } from '@typescript-eslint/utils';
import { RuleFix } from '@typescript-eslint/utils/dist/ts-eslint';
import { TSESTree } from '@typescript-eslint/types';

const rule: TSESLint.RuleModule<'signalUseAsSignal', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'This plugin check to valid signal use as signal.',
      url: '',
    },
    fixable: 'code',
    messages: {
      signalUseAsSignal:
        'signals should not be used as signals: `{{ identifier }}`',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => {
    const signalIdentifiers = new Set<string>();
    const readonlySignalIdentifiers = new Set<string>();

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
          } else if (node.key.type === 'Identifier') {
            signalIdentifiers.add(node.key.name);
          }
        }
        // asReadonly()で生成されたreadonly signal
        if (
          node.value &&
          node.value.type === 'CallExpression' &&
          node.value.callee.type === 'MemberExpression' &&
          node.value.callee.property.type === 'Identifier' &&
          node.value.callee.property.name === 'asReadonly' &&
          (node.key.type === 'PrivateIdentifier' ||
            node.key.type === 'Identifier')
        ) {
          readonlySignalIdentifiers.add(node.key.name);
        }
      },

      // this.#signal または this.signal の直接利用
      MemberExpression(node) {
        // AssignmentExpressionの左辺（this.#id = ...）で、this.#idやthis.userなどsignal本体のみスキップ
        if (
          node.parent &&
          node.parent.type === 'AssignmentExpression' &&
          node.parent.left === node &&
          node.object.type === 'ThisExpression'
        ) {
          return;
        }
        if (
          node.object.type === 'ThisExpression' &&
          ((node.property.type === 'PrivateIdentifier' &&
            signalIdentifiers.has(node.property.name)) ||
            (node.property.type === 'Identifier' &&
              signalIdentifiers.has(node.property.name)))
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
              fix: (fixer) => {
                const fixes: RuleFix[] = [];
                fixes.push(fixer.insertTextAfter(node.property, '()'));
                return fixes;
              },
            });
          }
        }
        // this.#signal().hoge = ... または this.signal().hoge = ...
        if (
          node.object.type === 'CallExpression' &&
          node.object.callee.type === 'MemberExpression' &&
          node.object.callee.object.type === 'ThisExpression' &&
          ((node.object.callee.property.type === 'PrivateIdentifier' &&
            (signalIdentifiers.has(node.object.callee.property.name) ||
              readonlySignalIdentifiers.has(
                node.object.callee.property.name
              ))) ||
            (node.object.callee.property.type === 'Identifier' &&
              (signalIdentifiers.has(node.object.callee.property.name) ||
                readonlySignalIdentifiers.has(
                  node.object.callee.property.name
                ))))
        ) {
          if (
            node.parent &&
            node.parent.type === 'AssignmentExpression' &&
            node.parent.left === node
          ) {
            context.report({
              node: node,
              messageId: 'signalUseAsSignal',
              data: {
                identifier: `this.${node.object.callee.property.name}()`,
              },
              fix: (fixer) => {
                const fixes: RuleFix[] = [];
                const callExpression = node.object as TSESTree.CallExpression;
                const memberExpression =
                  callExpression.callee as TSESTree.MemberExpression;
                let signalName = '';
                if (memberExpression.property.type === 'Identifier') {
                  signalName = memberExpression.property.name;
                } else if (
                  memberExpression.property.type === 'PrivateIdentifier'
                ) {
                  signalName = `#${memberExpression.property.name}`;
                }
                const propertyName =
                  node.property.type === 'Identifier' ? node.property.name : '';
                const assignmentNode =
                  node.parent as TSESTree.AssignmentExpression;
                fixes.push(
                  fixer.replaceText(
                    node.parent,
                    `this.${signalName}.update(value => ({ ...value, ${propertyName}: ${context.getSourceCode().getText(assignmentNode.right)} }))`
                  )
                );
                return fixes;
              },
            });
          }
          // push等の破壊的メソッド呼び出し
          if (
            node.parent &&
            node.parent.type === 'CallExpression' &&
            node.parent.callee === node
          ) {
            context.report({
              node: node,
              messageId: 'signalUseAsSignal',
              data: {
                identifier: `this.${node.object.callee.property.name}()`,
              },
              fix: (fixer) => {
                const fixes: RuleFix[] = [];
                const callExpression = node.object as TSESTree.CallExpression;
                const memberExpression =
                  callExpression.callee as TSESTree.MemberExpression;
                let signalName = '';
                if (memberExpression.property.type === 'Identifier') {
                  signalName = memberExpression.property.name;
                } else if (
                  memberExpression.property.type === 'PrivateIdentifier'
                ) {
                  signalName = `#${memberExpression.property.name}`;
                }
                const methodName =
                  node.property.type === 'Identifier' ? node.property.name : '';
                const callNode = node.parent as TSESTree.CallExpression;
                const args = callNode.arguments
                  .map((arg) => context.getSourceCode().getText(arg))
                  .join(', ');
                fixes.push(
                  fixer.replaceText(
                    node.parent,
                    `this.${signalName}.update(value => { value.${methodName}(${args}); return value; })`
                  )
                );
                return fixes;
              },
            });
          }
        }
      },

      // this.#signal() = ... または this.signal() = ... のような直接代入
      AssignmentExpression(node) {
        // this.#signal() = ... または this.signal() = ... のような直接代入
        if (
          node.left.type === 'CallExpression' &&
          node.left.callee.type === 'MemberExpression' &&
          node.left.callee.object.type === 'ThisExpression' &&
          ((node.left.callee.property.type === 'PrivateIdentifier' &&
            (signalIdentifiers.has(node.left.callee.property.name) ||
              readonlySignalIdentifiers.has(node.left.callee.property.name))) ||
            (node.left.callee.property.type === 'Identifier' &&
              (signalIdentifiers.has(node.left.callee.property.name) ||
                readonlySignalIdentifiers.has(node.left.callee.property.name))))
        ) {
          context.report({
            node: node.left,
            messageId: 'signalUseAsSignal',
            data: {
              identifier: `this.${node.left.callee.property.name}()`,
            },
            fix: (fixer) => {
              const fixes: RuleFix[] = [];
              const callExpression = node.left as TSESTree.CallExpression;
              const memberExpression =
                callExpression.callee as TSESTree.MemberExpression;
              let signalName = '';
              if (memberExpression.property.type === 'Identifier') {
                signalName = memberExpression.property.name;
              } else if (
                memberExpression.property.type === 'PrivateIdentifier'
              ) {
                signalName = `#${memberExpression.property.name}`;
              }
              fixes.push(
                fixer.replaceText(
                  node,
                  `this.${signalName}.set(${context.getSourceCode().getText(node.right)})`
                )
              );
              return fixes;
            },
          });
        }
        // this.#signal = ... または this.signal = ... のような直接代入
        else if (
          node.left.type === 'MemberExpression' &&
          node.left.object.type === 'ThisExpression' &&
          ((node.left.property.type === 'PrivateIdentifier' &&
            signalIdentifiers.has(node.left.property.name)) ||
            (node.left.property.type === 'Identifier' &&
              signalIdentifiers.has(node.left.property.name)))
        ) {
          // 右辺がsignal関数の呼び出しで、型が同じ場合はスキップ
          if (
            node.right.type === 'CallExpression' &&
            node.right.callee.type === 'Identifier' &&
            ['signal', 'model'].includes(node.right.callee.name)
          ) {
            return;
          }

          const memberExpr = node.left as TSESTree.MemberExpression;
          context.report({
            node: memberExpr,
            messageId: 'signalUseAsSignal',
            data: {
              identifier: (() => {
                if (memberExpr.property.type === 'Identifier') {
                  return `this.${memberExpr.property.name}`;
                } else if (memberExpr.property.type === 'PrivateIdentifier') {
                  return `this.#${memberExpr.property.name}`;
                }
                return 'this.';
              })(),
            },
            fix: (fixer) => {
              let signalName = '';
              if (memberExpr.property.type === 'Identifier') {
                signalName = memberExpr.property.name;
              } else if (memberExpr.property.type === 'PrivateIdentifier') {
                signalName = `#${memberExpr.property.name}`;
              }
              return fixer.replaceText(
                node,
                `this.${signalName}.set(${context.getSourceCode().getText(node.right)})`
              );
            },
          });
        }
      },
    };
  },
};

export = rule;
