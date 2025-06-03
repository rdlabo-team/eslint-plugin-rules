import { TSESLint } from '@typescript-eslint/utils';
import { TSESTree } from '@typescript-eslint/types';

// 定数
const DESTRUCTIVE_METHODS = new Set([
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
  'copyWithin',
  'fill',
]);

const SIGNAL_TYPES = new Set(['signal', 'model']);

// ユーティリティ関数
const isSignalIdentifier = (
  node: TSESTree.Node,
  signalIdentifiers: Set<string>
): boolean => {
  if (node.type === 'PrivateIdentifier' || node.type === 'Identifier') {
    return signalIdentifiers.has(node.name);
  }
  return false;
};

const getSignalName = (node: TSESTree.Node): string => {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'PrivateIdentifier') {
    return `#${node.name}`;
  }
  return '';
};

const buildNestedSpread = (
  chain: (TSESTree.Identifier | TSESTree.PrivateIdentifier)[],
  rightExpr: TSESTree.Expression,
  context: TSESLint.RuleContext<'signalUseAsSignal', []>
): string => {
  if (chain.length === 1) {
    return `{ ...value, ${chain[0].name}: ${context.getSourceCode().getText(rightExpr)} }`;
  }
  const [first, ...rest] = chain;
  return `{ ...value, ${first.name}: ${buildNestedSpread(rest, rightExpr, context).replace(/value/g, `value.${first.name}`)} }`;
};

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
    const allSignalIdentifiers = new Set<string>();

    return {
      PropertyDefinition(node) {
        // signalの定義を検出
        if (
          node.value?.type === 'CallExpression' &&
          node.value.callee.type === 'Identifier' &&
          SIGNAL_TYPES.has(node.value.callee.name) &&
          (node.key.type === 'PrivateIdentifier' ||
            node.key.type === 'Identifier')
        ) {
          signalIdentifiers.add(node.key.name);
          allSignalIdentifiers.add(node.key.name);
        }

        // readonly signalの定義を検出
        if (
          node.value?.type === 'CallExpression' &&
          node.value.callee.type === 'MemberExpression' &&
          node.value.callee.property.type === 'Identifier' &&
          node.value.callee.property.name === 'asReadonly' &&
          (node.key.type === 'PrivateIdentifier' ||
            node.key.type === 'Identifier')
        ) {
          readonlySignalIdentifiers.add(node.key.name);
          allSignalIdentifiers.add(node.key.name);
        }
      },

      MemberExpression(node) {
        // 代入式の左辺でsignal本体の場合はスキップ
        if (
          node.parent?.type === 'AssignmentExpression' &&
          node.parent.left === node &&
          node.object.type === 'ThisExpression'
        ) {
          return;
        }

        // this.#signal または this.signal の直接利用
        if (
          node.object.type === 'ThisExpression' &&
          isSignalIdentifier(node.property, signalIdentifiers)
        ) {
          const parent = node.parent;
          if (
            parent &&
            parent.type !== 'CallExpression' &&
            parent.type !== 'MemberExpression'
          ) {
            const signalName = getSignalName(node.property);
            context.report({
              node: node.property,
              messageId: 'signalUseAsSignal',
              data: {
                identifier: `this.${signalName}`,
              },
              fix: (fixer) => [fixer.insertTextAfter(node.property, '()')],
            });
          }
        }

        // ネストされたプロパティ書き換えの処理
        let root: TSESTree.Expression | undefined = node;
        const propertyChain: (
          | TSESTree.Identifier
          | TSESTree.PrivateIdentifier
        )[] = [];

        while (root?.type === 'MemberExpression') {
          const memberExpr = root as TSESTree.MemberExpression;
          if (
            memberExpr.property.type === 'Identifier' ||
            memberExpr.property.type === 'PrivateIdentifier'
          ) {
            propertyChain.unshift(memberExpr.property);
            root = memberExpr.object;
          } else {
            break;
          }
        }

        if (
          root?.type === 'CallExpression' &&
          root.callee?.type === 'MemberExpression' &&
          root.callee.object.type === 'ThisExpression' &&
          isSignalIdentifier(root.callee.property, allSignalIdentifiers)
        ) {
          if (
            node.parent?.type === 'AssignmentExpression' &&
            node.parent.left === node
          ) {
            const signalName = getSignalName(root.callee.property);
            const spread = buildNestedSpread(
              propertyChain,
              node.parent.right,
              context
            );

            context.report({
              node: node,
              messageId: 'signalUseAsSignal',
              data: {
                identifier: `this.${signalName}()`,
              },
              fix: (fixer) => [
                fixer.replaceText(
                  node.parent,
                  `this.${signalName}.update(value => (${spread}))`
                ),
              ],
            });
          }
        }

        // 破壊的メソッドの呼び出しチェック
        if (
          node.object.type === 'CallExpression' &&
          node.object.callee.type === 'MemberExpression' &&
          node.object.callee.object.type === 'ThisExpression' &&
          isSignalIdentifier(node.object.callee.property, allSignalIdentifiers)
        ) {
          if (
            node.parent?.type === 'CallExpression' &&
            node.parent.callee === node &&
            node.property.type === 'Identifier' &&
            DESTRUCTIVE_METHODS.has(node.property.name)
          ) {
            const signalName = getSignalName(node.object.callee.property);
            const methodName = node.property.name;
            const args = (node.parent as TSESTree.CallExpression).arguments
              .map((arg) => context.getSourceCode().getText(arg))
              .join(', ');

            context.report({
              node: node,
              messageId: 'signalUseAsSignal',
              data: {
                identifier: `this.${signalName}()`,
              },
              fix: (fixer) => [
                fixer.replaceText(
                  node.parent,
                  `this.${signalName}.update(value => { value.${methodName}(${args}); return value; })`
                ),
              ],
            });
          }
        }
      },

      AssignmentExpression(node) {
        // this.#signal() = ... または this.signal() = ... のような直接代入
        if (
          node.left.type === 'CallExpression' &&
          node.left.callee.type === 'MemberExpression' &&
          node.left.callee.object.type === 'ThisExpression' &&
          isSignalIdentifier(node.left.callee.property, allSignalIdentifiers)
        ) {
          const signalName = getSignalName(node.left.callee.property);

          context.report({
            node: node.left,
            messageId: 'signalUseAsSignal',
            data: {
              identifier: `this.${signalName}()`,
            },
            fix: (fixer) => [
              fixer.replaceText(
                node,
                `this.${signalName}.set(${context.getSourceCode().getText(node.right)})`
              ),
            ],
          });
        }
        // this.#signal = ... または this.signal = ... のような直接代入
        else if (
          node.left.type === 'MemberExpression' &&
          node.left.object.type === 'ThisExpression' &&
          isSignalIdentifier(node.left.property, signalIdentifiers)
        ) {
          // 右辺がsignal関数の呼び出しで、型が同じ場合はスキップ
          if (
            node.right.type === 'CallExpression' &&
            node.right.callee.type === 'Identifier' &&
            SIGNAL_TYPES.has(node.right.callee.name)
          ) {
            return;
          }

          const signalName = getSignalName(node.left.property);

          context.report({
            node: node.left,
            messageId: 'signalUseAsSignal',
            data: {
              identifier: `this.${signalName}`,
            },
            fix: (fixer) => [
              fixer.replaceText(
                node,
                `this.${signalName}.set(${context.getSourceCode().getText(node.right)})`
              ),
            ],
          });
        }
      },
    };
  },
};

export = rule;
