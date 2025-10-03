import { TSESLint } from '@typescript-eslint/utils';
import { TSESTree } from '@typescript-eslint/types';
import { isSignalType, isSignalCallExpression } from './utils';

// 定数
const DESTRUCTIVE_METHODS = new Set(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse', 'copyWithin', 'fill']);

// ユーティリティ関数
const isSignalIdentifier = (node: TSESTree.Node, signalIdentifiers: Set<string>): boolean => {
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
  context: TSESLint.RuleContext<'signalUseAsSignal', []>,
): string => {
  if (chain.length === 1) {
    return `{ ...value, ${chain[0].name}: ${context.getSourceCode().getText(rightExpr)} }`;
  }
  const [first, ...rest] = chain;
  return `{ ...value, ${first.name}: ${buildNestedSpread(rest, rightExpr, context).replace(/value/g, `value.${first.name}`)} }`;
};

const rule: TSESLint.RuleModule<'signalUseAsSignal', []> = {
  name: 'signal-use-as-signal',
  defaultOptions: [],
  meta: {
    docs: {
      description: 'This plugin check to valid signal use as signal.',
      url: '',
    },
    fixable: 'code',
    messages: {
      signalUseAsSignal: 'signals should not be used as signals: `{{ identifier }}`',
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
        // signalの定義を検出（signal, input, input.required など）
        if (
          node.value?.type === 'CallExpression' &&
          isSignalCallExpression(node.value) &&
          (node.key.type === 'PrivateIdentifier' || node.key.type === 'Identifier')
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
          (node.key.type === 'PrivateIdentifier' || node.key.type === 'Identifier')
        ) {
          readonlySignalIdentifiers.add(node.key.name);
          allSignalIdentifiers.add(node.key.name);
        }

        // オブジェクトの中にSignalがある場合も再帰的に検出
        function traverseObject(obj: TSESTree.ObjectExpression, prefix = '', isLinkedSignalConfig = false) {
          if (obj && obj.type === 'ObjectExpression') {
            for (const prop of obj.properties) {
              if (prop.type === 'Property') {
                const key = prop.key as TSESTree.Identifier | TSESTree.PrivateIdentifier;
                if (key.type === 'Identifier' || key.type === 'PrivateIdentifier') {
                  const name = prefix + key.name;
                  if (prop.value.type === 'CallExpression' && isSignalCallExpression(prop.value)) {
                    // linkedSignalの設定オブジェクト内では、signal参照をエラーとして報告しない
                    if (!isLinkedSignalConfig) {
                      allSignalIdentifiers.add(name);
                    }
                  } else if (prop.value.type === 'ObjectExpression') {
                    traverseObject(prop.value, name + '.', isLinkedSignalConfig);
                  }
                }
              }
            }
          }
        }
        if (node.value?.type === 'ObjectExpression' && (node.key.type === 'PrivateIdentifier' || node.key.type === 'Identifier')) {
          // linkedSignalの設定オブジェクトかどうかを判定
          // linkedSignalの設定オブジェクトは、sourceプロパティとcomputationプロパティを持つ
          const hasSourceProperty = node.value.properties.some(
            (prop) => prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'source',
          );
          const hasComputationProperty = node.value.properties.some(
            (prop) => prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'computation',
          );
          const isLinkedSignalConfig = hasSourceProperty && hasComputationProperty;
          traverseObject(node.value, node.key.name + '.', isLinkedSignalConfig);
        }
      },

      MemberExpression(node) {
        // クラスプロパティ初期化子内でのthis.XXX参照はスキップ
        function isInPropertyDefinitionValue(n: TSESTree.Node): boolean {
          let p: TSESTree.Node | undefined = n.parent;
          while (p) {
            if (p.type === 'PropertyDefinition' && p.value) {
              if (p.value === n) return true;
              // 循環参照防止
              const visited = new Set<TSESTree.Node>();
              const check = (v: unknown): boolean => {
                if (v === n) return true;
                if (visited.has(v as TSESTree.Node)) return false;
                if (v && typeof v === 'object' && 'type' in (v as object)) {
                  visited.add(v as TSESTree.Node);
                  // ASTノードのプロパティを安全に探索
                  for (const val of Object.values(v as object)) {
                    if (Array.isArray(val)) {
                      if (val.some(check)) return true;
                    } else if (val && typeof val === 'object') {
                      if (check(val)) return true;
                    }
                  }
                }
                return false;
              };
              if (check(p.value)) return true;
            }
            p = p.parent;
          }
          return false;
        }
        if (isInPropertyDefinitionValue(node)) return;

        // 代入式の左辺でsignal本体の場合はスキップ
        if (node.parent?.type === 'AssignmentExpression' && node.parent.left === node && node.object.type === 'ThisExpression') {
          return;
        }

        // 多段プロパティアクセスでSignalが含まれていればエラー
        if (node.parent?.type === 'AssignmentExpression' && node.parent.left === node) {
          // MemberExpressionチェーンをたどってパスを組み立てる
          let current: TSESTree.Expression | undefined = node;
          const path: string[] = [];
          while (current && current.type === 'MemberExpression') {
            const memberExpr = current as TSESTree.MemberExpression;
            if (memberExpr.property.type === 'Identifier' || memberExpr.property.type === 'PrivateIdentifier') {
              path.unshift(memberExpr.property.name);
            } else {
              break;
            }
            current = memberExpr.object;
          }
          // this.から始まる場合のみ
          if (current && current.type === 'ThisExpression' && path.length > 0) {
            // 1つずつパスを伸ばしながらallSignalIdentifiersに含まれるかチェック
            let checkPath = '';
            for (const part of path) {
              checkPath = checkPath ? checkPath + '.' + part : part;
              if (allSignalIdentifiers.has(checkPath)) {
                context.report({
                  node: node,
                  messageId: 'signalUseAsSignal',
                  data: {
                    identifier: `this.${checkPath}()`,
                  },
                  // autofixなし
                });
                break;
              }
            }
          }
        }

        // this.#signal または this.signal の直接利用
        if (node.object.type === 'ThisExpression' && isSignalIdentifier(node.property, allSignalIdentifiers)) {
          const parent = node.parent;
          if (
            parent &&
            parent.type !== 'AssignmentExpression' &&
            parent.type !== 'IfStatement' &&
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

        // if文の条件式でのSignalの使用を検出（多段プロパティ対応、autofixあり）
        if (node.parent?.type === 'IfStatement' && node.parent.test === node) {
          // MemberExpressionチェーンをたどってパスを組み立てる
          let current: TSESTree.Expression | undefined = node;
          const path: string[] = [];
          while (current && current.type === 'MemberExpression') {
            const memberExpr = current as TSESTree.MemberExpression;
            if (memberExpr.property.type === 'Identifier' || memberExpr.property.type === 'PrivateIdentifier') {
              path.unshift(memberExpr.property.name);
            } else {
              break;
            }
            current = memberExpr.object;
          }
          // this.から始まる場合のみ
          if (current && current.type === 'ThisExpression' && path.length > 0) {
            // 1つずつパスを伸ばしながらallSignalIdentifiersに含まれるかチェック
            let checkPath = '';
            for (const part of path) {
              checkPath = checkPath ? checkPath + '.' + part : part;
              if (allSignalIdentifiers.has(checkPath)) {
                context.report({
                  node: node,
                  messageId: 'signalUseAsSignal',
                  data: {
                    identifier: `this.${checkPath}()`,
                  },
                  fix: (fixer) => [fixer.insertTextAfter(node, '()')],
                });
                break;
              }
            }
          }
        }

        // ネストされたプロパティ書き換えの処理
        let root: TSESTree.Expression | undefined = node;
        const propertyChain: (TSESTree.Identifier | TSESTree.PrivateIdentifier)[] = [];

        while (root?.type === 'MemberExpression') {
          const memberExpr = root as TSESTree.MemberExpression;
          if (memberExpr.property.type === 'Identifier' || memberExpr.property.type === 'PrivateIdentifier') {
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
          if (node.parent?.type === 'AssignmentExpression' && node.parent.left === node) {
            const signalName = getSignalName(root.callee.property);
            const spread = buildNestedSpread(propertyChain, node.parent.right, context);

            context.report({
              node: node,
              messageId: 'signalUseAsSignal',
              data: {
                identifier: `this.${signalName}()`,
              },
              fix: (fixer) => [fixer.replaceText(node.parent, `this.${signalName}.update(value => (${spread}))`)],
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
              .map((arg: TSESTree.CallExpressionArgument) => context.getSourceCode().getText(arg))
              .join(', ');

            context.report({
              node: node,
              messageId: 'signalUseAsSignal',
              data: {
                identifier: `this.${signalName}()`,
              },
              fix: (fixer) => [fixer.replaceText(node.parent, `this.${signalName}.update(value => { value.${methodName}(${args}); return value; })`)],
            });
          }
        }

        // Signalプロパティの値アクセス（多段プロパティ対応、Signal直下の値アクセスも検出）
        {
          let skip = false;
          // MemberExpressionの親がMemberExpressionの場合でも、Signal直下の値アクセスはスキップしない
          if (node.parent) {
            if (
              node.parent.type === 'AssignmentExpression' ||
              (node.parent.type === 'IfStatement' && node.parent.test === node) ||
              node.parent.type === 'CallExpression'
            ) {
              skip = true;
            } else if (node.parent.type === 'MemberExpression' && node.parent.object === node) {
              // Signal直下の値アクセスの場合はスキップしない
              let current: TSESTree.Expression | undefined = node;
              const path: string[] = [];
              while (current && current.type === 'MemberExpression') {
                const memberExpr = current as TSESTree.MemberExpression;
                if (memberExpr.property.type === 'Identifier' || memberExpr.property.type === 'PrivateIdentifier') {
                  path.unshift(memberExpr.property.name);
                } else {
                  break;
                }
                current = memberExpr.object;
              }
              if (!(current && current.type === 'ThisExpression' && path.length > 1)) {
                skip = true;
              }
            }
          }
          if (!skip) {
            let current: TSESTree.Expression | undefined = node;
            const path: string[] = [];
            while (current && current.type === 'MemberExpression') {
              const memberExpr = current as TSESTree.MemberExpression;
              if (memberExpr.property.type === 'Identifier' || memberExpr.property.type === 'PrivateIdentifier') {
                path.unshift(memberExpr.property.name);
              } else {
                break;
              }
              current = memberExpr.object;
            }
            // Signal直下の値アクセスも検出
            if (current && current.type === 'ThisExpression' && path.length > 1) {
              let checkPath = '';
              for (let i = 0; i < path.length - 1; i++) {
                checkPath = checkPath ? checkPath + '.' + path[i] : path[i];
                if (allSignalIdentifiers.has(checkPath)) {
                  // Signal直下の値アクセスの場合のみエラー
                  if (i === path.length - 2) {
                    context.report({
                      node: node,
                      messageId: 'signalUseAsSignal',
                      data: {
                        identifier: `this.${checkPath}()`,
                      },
                    });
                  }
                  break;
                }
              }
            }
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
            fix: (fixer) => [fixer.replaceText(node, `this.${signalName}.set(${context.getSourceCode().getText(node.right)})`)],
          });
        }
        // this.#signal = ... または this.signal = ... のような直接代入
        else if (
          node.left.type === 'MemberExpression' &&
          node.left.object.type === 'ThisExpression' &&
          isSignalIdentifier(node.left.property, signalIdentifiers)
        ) {
          // 右辺がsignal関数の呼び出しで、型が同じ場合はスキップ
          if (node.right.type === 'CallExpression' && node.right.callee.type === 'Identifier' && isSignalType(node.right.callee.name)) {
            return;
          }

          const signalName = getSignalName(node.left.property);

          context.report({
            node: node.left,
            messageId: 'signalUseAsSignal',
            data: {
              identifier: `this.${signalName}`,
            },
            fix: (fixer) => [fixer.replaceText(node, `this.${signalName}.set(${context.getSourceCode().getText(node.right)})`)],
          });
        }
      },
    };
  },
};

export = rule;
