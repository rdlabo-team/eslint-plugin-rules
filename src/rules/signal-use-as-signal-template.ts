import { TSESLint } from '@typescript-eslint/utils';
import * as fs from 'fs';
import * as path from 'path';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { parseForESLint } from '@angular-eslint/template-parser';
import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';

// 型定義
interface DecoratorProperties {
  key: {
    name: string;
  };
  value: {
    value: string;
  };
}

interface TemplateInfo {
  template: string | null;
  templateNode?: TSESTree.Node;
  templatePropNode?: TSESTree.Node;
}

interface TemplateExpression {
  type: string;
  name?: string;
  receiver?: TemplateExpression;
  left?: TemplateExpression;
  right?: TemplateExpression;
  condition?: TemplateExpression;
  trueExp?: TemplateExpression;
  falseExp?: TemplateExpression;
  exp?: TemplateExpression;
  args?: TemplateExpression[];
}

const rule: TSESLint.RuleModule<'signalUseAsSignalTemplate', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Enforces the correct usage of Angular Signals in templates by requiring the use of () to access signal values',
    },
    fixable: undefined,
    messages: {
      signalUseAsSignalTemplate:
        'Angular Signal must be called with () to access its value in the template. Example: {{ count() }} instead of {{ count }}',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    function findComponentDecorator(node: TSESTree.ClassDeclaration) {
      return node.decorators?.find(
        (decorator) =>
          decorator.expression.type === 'CallExpression' &&
          decorator.expression.callee.type === 'Identifier' &&
          decorator.expression.callee.name === 'Component'
      );
    }

    function getTemplateFromDecorator(
      decorator: TSESTree.Decorator
    ): TemplateInfo {
      if (
        !('arguments' in decorator.expression) ||
        !('properties' in decorator.expression.arguments[0])
      ) {
        return { template: null };
      }

      const properties = decorator.expression.arguments[0]
        .properties as DecoratorProperties[];

      // インラインタンプレートの確認
      const templateProp = properties.find((p) => p.key.name === 'template');
      if (templateProp) {
        return {
          template: templateProp.value.value,
          templateNode: templateProp.value as unknown as TSESTree.Node,
          templatePropNode: templateProp as unknown as TSESTree.Node,
        };
      }

      // 外部テンプレートファイルの確認
      const templateUrl = properties.find((p) => p.key.name === 'templateUrl');
      if (templateUrl) {
        const filePath = path.resolve(
          path.dirname(context.getFilename()),
          templateUrl.value.value
        );
        try {
          return {
            template: fs.readFileSync(filePath, 'utf-8'),
            templateNode: templateUrl.value as unknown as TSESTree.Node,
            templatePropNode: templateUrl as unknown as TSESTree.Node,
          };
        } catch (error) {
          console.error('テンプレートファイルの読み込みに失敗しました:', error);
          return { template: null };
        }
      }

      return { template: null };
    }

    function getComponentTemplate(
      node: TSESTree.ClassDeclaration
    ): TemplateInfo {
      if (node.type !== AST_NODE_TYPES.ClassDeclaration) {
        return { template: null };
      }

      const decorator = findComponentDecorator(node);
      if (!decorator) {
        return { template: null };
      }

      return getTemplateFromDecorator(decorator);
    }

    function collectSignalIdentifiers(
      node: TSESTree.ClassDeclaration
    ): Set<string> {
      const signalIdentifiers = new Set<string>();

      node.body.body.forEach((member) => {
        if (
          member.type === 'PropertyDefinition' &&
          member.value?.type === 'CallExpression' &&
          member.value.callee.type === 'Identifier' &&
          member.value.callee.name === 'signal' &&
          member.key.type === 'Identifier'
        ) {
          signalIdentifiers.add(member.key.name);
        }
      });

      return signalIdentifiers;
    }

    function checkSignalUsage(
      expression: TemplateExpression | undefined,
      signalIdentifiers: Set<string>,
      isMethodCallReceiver: boolean,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node
    ) {
      if (!expression) return;

      // プロパティ参照（count）
      if (expression.type === 'PropertyRead') {
        // 直接的なSignal参照（count）
        if (
          expression.receiver?.type === 'ImplicitReceiver' &&
          expression.name &&
          signalIdentifiers.has(expression.name) &&
          !isMethodCallReceiver
        ) {
          context.report({
            node: reportNode,
            messageId: 'signalUseAsSignalTemplate',
            loc: reportLocNode.loc,
          });
        }

        // Signalプロパティ参照（count.signal）
        if (
          expression.receiver?.type === 'PropertyRead' &&
          expression.receiver.receiver?.type === 'ImplicitReceiver' &&
          expression.receiver.name &&
          signalIdentifiers.has(expression.receiver.name) &&
          expression.name === 'signal'
        ) {
          context.report({
            node: reportNode,
            messageId: 'signalUseAsSignalTemplate',
            loc: reportLocNode.loc,
          });
        }
      }

      // 二項演算子（count + 1, count > 0 など）
      if (expression.type === 'Binary' && expression.left && expression.right) {
        checkSignalUsage(
          expression.left,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode
        );
        checkSignalUsage(
          expression.right,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode
        );
      }

      // 条件式（count ? a : b）
      if (
        expression.type === 'Conditional' &&
        expression.condition &&
        expression.trueExp &&
        expression.falseExp
      ) {
        checkSignalUsage(
          expression.condition,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode
        );
        checkSignalUsage(
          expression.trueExp,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode
        );
        checkSignalUsage(
          expression.falseExp,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode
        );
      }

      // パイプ（count | async）
      if (expression.type === 'Pipe' && expression.exp) {
        checkSignalUsage(
          expression.exp,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode
        );
        if (Array.isArray(expression.args)) {
          expression.args.forEach((arg) =>
            checkSignalUsage(
              arg,
              signalIdentifiers,
              false,
              reportNode,
              reportLocNode
            )
          );
        }
      }

      // メソッド呼び出し（count()）
      if (expression.type === 'MethodCall' && expression.receiver) {
        checkSignalUsage(
          expression.receiver,
          signalIdentifiers,
          true,
          reportNode,
          reportLocNode
        );
      }
    }

    function traverseTemplateNodes(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodes: any[],
      signalIdentifiers: Set<string>,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node
    ) {
      if (!Array.isArray(nodes)) return;

      for (const nodeTmpl of nodes) {
        if (
          nodeTmpl.type === 'BoundText' &&
          nodeTmpl.value?.ast?.type === 'Interpolation'
        ) {
          const interpolation = nodeTmpl.value.ast;
          interpolation.expressions.forEach((expr: TemplateExpression) =>
            checkSignalUsage(
              expr,
              signalIdentifiers,
              false,
              reportNode,
              reportLocNode
            )
          );
        }

        // @ifディレクティブの条件式をチェック
        if (nodeTmpl.type === 'IfBlock' && nodeTmpl.branches) {
          for (const branch of nodeTmpl.branches) {
            if (branch.expression && branch.expression.ast) {
              checkSignalUsage(
                branch.expression.ast,
                signalIdentifiers,
                false,
                reportNode,
                reportLocNode
              );
            }
            if (branch.children) {
              traverseTemplateNodes(
                branch.children,
                signalIdentifiers,
                reportNode,
                reportLocNode
              );
            }
          }
        }

        // @switchディレクティブの条件式をチェック
        if (nodeTmpl.type === 'SwitchBlock' && nodeTmpl.expression) {
          if (nodeTmpl.expression.ast) {
            checkSignalUsage(
              nodeTmpl.expression.ast,
              signalIdentifiers,
              false,
              reportNode,
              reportLocNode
            );
          }
          if (nodeTmpl.cases) {
            for (const switchCase of nodeTmpl.cases) {
              if (switchCase.expression && switchCase.expression.ast) {
                checkSignalUsage(
                  switchCase.expression.ast,
                  signalIdentifiers,
                  false,
                  reportNode,
                  reportLocNode
                );
              }
              if (switchCase.children) {
                traverseTemplateNodes(
                  switchCase.children,
                  signalIdentifiers,
                  reportNode,
                  reportLocNode
                );
              }
            }
          }
        }

        // @deferディレクティブの条件式をチェック
        if (nodeTmpl.type === 'DeferBlock') {
          if (
            nodeTmpl.trigger &&
            nodeTmpl.trigger.expression &&
            nodeTmpl.trigger.expression.ast
          ) {
            checkSignalUsage(
              nodeTmpl.trigger.expression.ast,
              signalIdentifiers,
              false,
              reportNode,
              reportLocNode
            );
          }
          if (nodeTmpl.children) {
            traverseTemplateNodes(
              nodeTmpl.children,
              signalIdentifiers,
              reportNode,
              reportLocNode
            );
          }
          if (nodeTmpl.loading) {
            traverseTemplateNodes(
              nodeTmpl.loading,
              signalIdentifiers,
              reportNode,
              reportLocNode
            );
          }
          if (nodeTmpl.error) {
            traverseTemplateNodes(
              nodeTmpl.error,
              signalIdentifiers,
              reportNode,
              reportLocNode
            );
          }
        }

        if (nodeTmpl.children) {
          traverseTemplateNodes(
            nodeTmpl.children,
            signalIdentifiers,
            reportNode,
            reportLocNode
          );
        }
      }
    }

    function checkTemplateForSignalUsage(
      template: string,
      node: TSESTree.ClassDeclaration,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node
    ) {
      const { ast } = parseForESLint(template, {
        filePath: context.getFilename(),
      });

      const signalIdentifiers = collectSignalIdentifiers(node);
      traverseTemplateNodes(
        ast.templateNodes,
        signalIdentifiers,
        reportNode,
        reportLocNode
      );
    }

    return {
      ClassDeclaration(node) {
        const templateInfo = getComponentTemplate(node);
        if (!templateInfo.template) return;

        const reportNode = templateInfo.templateNode || node;
        const reportLocNode =
          templateInfo.templatePropNode || templateInfo.templateNode || node;

        checkTemplateForSignalUsage(
          templateInfo.template,
          node,
          reportNode,
          reportLocNode
        );
      },
    };
  },
};

export default rule;
