import { TSESLint } from '@typescript-eslint/utils';
import * as fs from 'fs';
import * as path from 'path';
import { AST_NODE_TYPES } from '@typescript-eslint/types';
import { parseForESLint } from '@angular-eslint/template-parser';
import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';
import type { TmplAstNode, TmplAstDeferredBlock } from '@angular/compiler';
import type {
  DecoratorProperties,
  TemplateInfo,
  TemplateExpression,
} from './types';
import { shiftLocLine } from './utils';

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
        'Angular Signal {{ signalName }} must be called with () to access its value in the {{ where }}. Example: {{ signalNameWithParens }} instead of {{ signalName }}',
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

      // デコレータ引数のプロパティ取得
      const args =
        'arguments' in decorator.expression
          ? decorator.expression.arguments
          : [];
      const properties =
        args[0] && 'properties' in args[0]
          ? (args[0].properties as DecoratorProperties[])
          : [];

      // インラインテンプレート
      const templateProp = properties.find((p) => p.key.name === 'template');
      if (templateProp && templateProp.value.value) {
        const template = templateProp.value.value;
        const { ast } = parseForESLint(template, {
          filePath: context.getFilename(),
        });
        if (Array.isArray(ast.templateNodes)) {
          ast.templateNodes.forEach((node: TmplAstNode) =>
            shiftLocLine(node, 2)
          );
        }
        const templateNode = ast.templateNodes[0];
        return {
          template,
          templateNode: templateNode as unknown as TSESTree.Node,
          templatePropNode: templateNode as unknown as TSESTree.Node,
          sourceUrl: context.getFilename(),
          isInlineTemplate: true,
        };
      }

      // 外部テンプレートファイル
      const templateUrl = properties.find((p) => p.key.name === 'templateUrl');
      if (templateUrl) {
        const filePath = path.resolve(
          path.dirname(context.getFilename()),
          templateUrl.value.value
        );
        try {
          const template = fs.readFileSync(filePath, 'utf-8');
          const { ast } = parseForESLint(template, {
            filePath,
          });
          const templateNode = ast.templateNodes[0];
          if (templateNode) {
            templateNode.loc = {
              start: { line: 1, column: 0 },
              end: { line: template.split('\n').length, column: 0 },
            };
          }
          return {
            template,
            templateNode: templateNode as TSESTree.Node,
            templatePropNode: templateNode as TSESTree.Node,
            sourceUrl: filePath,
            isInlineTemplate: false,
          };
        } catch (error) {
          console.error('テンプレートファイルの読み込みに失敗しました:', error);
          return { template: null };
        }
      }

      return { template: null };
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
          (member.value.callee.name === 'signal' ||
            member.value.callee.name === 'model' ||
            member.value.callee.name === 'computed' ||
            member.value.callee.name === 'linkedSignal') &&
          member.key.type === 'Identifier'
        ) {
          signalIdentifiers.add(member.key.name);
        }
      });

      return signalIdentifiers;
    }

    function checkSignalUsage(
      source: string | undefined,
      expression: TemplateExpression | undefined,
      signalIdentifiers: Set<string>,
      isMethodCallReceiver: boolean,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node,
      isInlineTemplate: boolean
    ) {
      if (!expression) return;

      // sourceから{{ ... }}の中身をすべて抽出し、signal識別子?.のパターンを検出
      if (source) {
        if (expression.type === 'SafePropertyRead') {
          const mustacheRegex = /\{\{\s*([^}]+?)\s*\}\}/g;
          const expressions: string[] = [];
          let match;
          while ((match = mustacheRegex.exec(source)) !== null) {
            expressions.push(match[1]);
          }
          if (expressions.length > 0) {
            for (const expr of expressions) {
              const optionalChainRegex = /(\w+)\?\./g;
              let subMatch;
              while ((subMatch = optionalChainRegex.exec(expr)) !== null) {
                const signalName = subMatch[1];
                if (signalIdentifiers.has(signalName)) {
                  reportSignalError(
                    signalName,
                    reportNode,
                    reportLocNode,
                    isInlineTemplate
                  );
                  break;
                }
              }
            }
          }
        }
      }

      // プロパティ参照（count）
      if (expression.type === 'PropertyRead') {
        // 直接的なSignal参照（count）
        if (
          expression.receiver?.type === 'ImplicitReceiver' &&
          expression.name &&
          signalIdentifiers.has(expression.name) &&
          !isMethodCallReceiver
        ) {
          reportSignalError(
            expression.name,
            reportNode,
            reportLocNode,
            isInlineTemplate
          );
        }

        // Signalプロパティ参照（count.signal）
        if (
          expression.receiver?.type === 'PropertyRead' &&
          expression.receiver.receiver?.type === 'ImplicitReceiver' &&
          expression.receiver.name &&
          signalIdentifiers.has(expression.receiver.name) &&
          expression.name === 'signal'
        ) {
          reportSignalError(
            expression.receiver.name,
            reportNode,
            reportLocNode,
            isInlineTemplate
          );
        }
      }

      // パイプの検出
      if (expression.type === 'BindingPipe') {
        if (
          expression.exp?.type === 'PropertyRead' &&
          expression.exp.receiver?.type === 'ImplicitReceiver' &&
          expression.exp.name &&
          signalIdentifiers.has(expression.exp.name)
        ) {
          reportSignalError(
            expression.exp.name,
            reportNode,
            reportLocNode,
            isInlineTemplate
          );
        }
      }

      // 二項演算子（count + 1, count > 0 など）
      if (expression.type === 'Binary' && expression.left && expression.right) {
        checkSignalUsage(
          '',
          expression.left,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate
        );
        checkSignalUsage(
          '',
          expression.right,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate
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
          '',
          expression.condition,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate
        );
        checkSignalUsage(
          '',
          expression.trueExp,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate
        );
        checkSignalUsage(
          '',
          expression.falseExp,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate
        );
      }

      // パイプ（count | async）
      if (expression.type === 'Pipe' && expression.exp) {
        checkSignalUsage(
          '',
          expression.exp,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate
        );
        if (Array.isArray(expression.args)) {
          expression.args.forEach((arg) =>
            checkSignalUsage(
              '',
              arg,
              signalIdentifiers,
              false,
              reportNode,
              reportLocNode,
              isInlineTemplate
            )
          );
        }
      }

      // メソッド呼び出し（count()）
      if (expression.type === 'MethodCall' && expression.receiver) {
        checkSignalUsage(
          '',
          expression.receiver,
          signalIdentifiers,
          true,
          reportNode,
          reportLocNode,
          isInlineTemplate
        );
      }
    }

    // エラー報告を共通化
    function reportSignalError(
      signalName: string,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node,
      isInlineTemplate: boolean
    ) {
      context.report({
        node: reportNode,
        messageId: 'signalUseAsSignalTemplate',
        loc: isInlineTemplate
          ? {
              start: {
                line: reportLocNode.loc.start.line + 2,
                column: reportLocNode.loc.start.column,
              },
              end: {
                line: reportLocNode.loc.end.line + 2,
                column: reportLocNode.loc.end.column,
              },
            }
          : reportLocNode.loc,
        data: {
          signalName,
          signalNameWithParens: `${signalName}()`,
          where: isInlineTemplate
            ? 'template'
            : `templateUrl: ${reportLocNode.loc.start.line}:${reportLocNode.loc.start.column} error`,
        },
      });
    }

    function traverseTemplateNodes(
      nodes: TmplAstNode[],
      signalIdentifiers: Set<string>,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node,
      isInlineTemplate: boolean
    ) {
      if (!Array.isArray(nodes)) return;

      for (const nodeTmpl of nodes) {
        // BoundText
        if (
          typeof nodeTmpl === 'object' &&
          nodeTmpl !== null &&
          'type' in nodeTmpl &&
          nodeTmpl.type === 'BoundText' &&
          'value' in nodeTmpl &&
          typeof nodeTmpl.value === 'object' &&
          nodeTmpl.value !== null &&
          'ast' in nodeTmpl.value &&
          typeof nodeTmpl.value.ast === 'object' &&
          nodeTmpl.value.ast !== null &&
          'type' in nodeTmpl.value.ast &&
          (nodeTmpl.value.ast as { type?: string }).type === 'Interpolation'
        ) {
          const interpolation = nodeTmpl.value.ast as {
            expressions?: TemplateExpression[];
          };
          if (
            'expressions' in interpolation &&
            Array.isArray(interpolation.expressions)
          ) {
            (interpolation.expressions as TemplateExpression[]).forEach(
              (expr) => {
                if (expr && typeof expr === 'object' && 'type' in expr) {
                  checkSignalUsage(
                    typeof nodeTmpl.value === 'object' &&
                      nodeTmpl.value !== null &&
                      'source' in nodeTmpl.value
                      ? (nodeTmpl.value as { source?: string }).source
                      : undefined,
                    expr,
                    signalIdentifiers,
                    false,
                    nodeTmpl as unknown as TSESTree.Node,
                    nodeTmpl as unknown as TSESTree.Node,
                    isInlineTemplate
                  );
                }
              }
            );
          }
        }

        // IfBlock
        if (
          typeof nodeTmpl === 'object' &&
          nodeTmpl !== null &&
          'type' in nodeTmpl &&
          nodeTmpl.type === 'IfBlock' &&
          'branches' in nodeTmpl &&
          Array.isArray((nodeTmpl as { branches?: unknown[] }).branches)
        ) {
          for (const branch of (nodeTmpl as { branches?: unknown[] })
            .branches || []) {
            if (
              branch &&
              typeof branch === 'object' &&
              'expression' in branch &&
              branch.expression &&
              typeof branch.expression === 'object' &&
              'ast' in branch.expression &&
              branch.expression.ast &&
              typeof branch.expression.ast === 'object' &&
              'type' in branch.expression.ast
            ) {
              checkSignalUsage(
                'source' in branch.expression
                  ? (branch.expression.source as string | undefined)
                  : undefined,
                branch.expression.ast as TemplateExpression,
                signalIdentifiers,
                false,
                branch as unknown as TSESTree.Node,
                branch as unknown as TSESTree.Node,
                isInlineTemplate
              );
            }
            if (
              branch &&
              typeof branch === 'object' &&
              'children' in branch &&
              Array.isArray(branch.children)
            ) {
              traverseTemplateNodes(
                branch.children as TmplAstNode[],
                signalIdentifiers,
                branch as unknown as TSESTree.Node,
                branch as unknown as TSESTree.Node,
                isInlineTemplate
              );
            }
          }
        }

        // SwitchBlock
        if (
          typeof nodeTmpl === 'object' &&
          nodeTmpl !== null &&
          'type' in nodeTmpl &&
          nodeTmpl.type === 'SwitchBlock' &&
          'expression' in nodeTmpl &&
          nodeTmpl.expression &&
          typeof nodeTmpl.expression === 'object' &&
          'ast' in nodeTmpl.expression &&
          nodeTmpl.expression.ast &&
          typeof nodeTmpl.expression.ast === 'object' &&
          'type' in nodeTmpl.expression.ast
        ) {
          const astExpr = nodeTmpl.expression.ast as TemplateExpression;
          checkSignalUsage(
            'source' in nodeTmpl.expression
              ? (nodeTmpl.expression.source as string | undefined)
              : undefined,
            astExpr,
            signalIdentifiers,
            false,
            nodeTmpl as unknown as TSESTree.Node,
            nodeTmpl as unknown as TSESTree.Node,
            isInlineTemplate
          );
          if (
            'cases' in nodeTmpl &&
            Array.isArray((nodeTmpl as { cases?: unknown[] }).cases)
          ) {
            for (const switchCase of (nodeTmpl as { cases?: unknown[] })
              .cases || []) {
              if (
                switchCase &&
                typeof switchCase === 'object' &&
                'expression' in switchCase &&
                switchCase.expression &&
                typeof switchCase.expression === 'object' &&
                'ast' in switchCase.expression &&
                switchCase.expression.ast &&
                typeof switchCase.expression.ast === 'object' &&
                'type' in switchCase.expression.ast
              ) {
                const caseAstExpr = switchCase.expression
                  .ast as TemplateExpression;
                checkSignalUsage(
                  'source' in nodeTmpl.expression
                    ? (nodeTmpl.expression.source as string | undefined)
                    : undefined,
                  caseAstExpr,
                  signalIdentifiers,
                  false,
                  switchCase as unknown as TSESTree.Node,
                  switchCase as unknown as TSESTree.Node,
                  isInlineTemplate
                );
              }
              if (
                switchCase &&
                typeof switchCase === 'object' &&
                'children' in switchCase &&
                Array.isArray(switchCase.children)
              ) {
                traverseTemplateNodes(
                  switchCase.children as TmplAstNode[],
                  signalIdentifiers,
                  switchCase as unknown as TSESTree.Node,
                  switchCase as unknown as TSESTree.Node,
                  isInlineTemplate
                );
              }
            }
          }
        }

        // DeferBlock
        if (
          typeof nodeTmpl === 'object' &&
          nodeTmpl !== null &&
          'type' in nodeTmpl &&
          nodeTmpl.type === 'DeferBlock'
        ) {
          const deferBlock = nodeTmpl as unknown as TmplAstDeferredBlock;
          // triggersの最初のtriggerを使う
          const triggers = (deferBlock as unknown as { triggers?: unknown[] })
            .triggers;
          if (
            'triggers' in deferBlock &&
            Array.isArray(triggers) &&
            triggers?.length > 0
          ) {
            const trigger = triggers[0];
            if (
              trigger &&
              typeof trigger === 'object' &&
              'expression' in trigger &&
              trigger.expression &&
              typeof trigger.expression === 'object' &&
              'ast' in trigger.expression &&
              trigger.expression.ast
            ) {
              checkSignalUsage(
                'source' in trigger.expression
                  ? (trigger.expression.source as string | undefined)
                  : undefined,
                trigger.expression.ast as TemplateExpression,
                signalIdentifiers,
                false,
                nodeTmpl as unknown as TSESTree.Node,
                nodeTmpl as unknown as TSESTree.Node,
                isInlineTemplate
              );
            }
          }
          if (
            'children' in deferBlock &&
            Array.isArray(
              (deferBlock as unknown as { children?: unknown[] }).children
            )
          ) {
            traverseTemplateNodes(
              (deferBlock as unknown as { children?: unknown[] })
                .children as TmplAstNode[],
              signalIdentifiers,
              nodeTmpl as unknown as TSESTree.Node,
              nodeTmpl as unknown as TSESTree.Node,
              isInlineTemplate
            );
          }
          if (
            'loading' in deferBlock &&
            (deferBlock as unknown as { loading?: { children?: unknown[] } })
              .loading &&
            Array.isArray(
              (deferBlock as unknown as { loading?: { children?: unknown[] } })
                .loading?.children
            )
          ) {
            traverseTemplateNodes(
              (deferBlock as unknown as { loading?: { children?: unknown[] } })
                .loading?.children as TmplAstNode[],
              signalIdentifiers,
              nodeTmpl as unknown as TSESTree.Node,
              nodeTmpl as unknown as TSESTree.Node,
              isInlineTemplate
            );
          }
          if (
            'error' in deferBlock &&
            (deferBlock as unknown as { error?: { children?: unknown[] } })
              .error &&
            Array.isArray(
              (deferBlock as unknown as { error?: { children?: unknown[] } })
                .error?.children
            )
          ) {
            traverseTemplateNodes(
              (deferBlock as unknown as { error?: { children?: unknown[] } })
                .error?.children as TmplAstNode[],
              signalIdentifiers,
              nodeTmpl as unknown as TSESTree.Node,
              nodeTmpl as unknown as TSESTree.Node,
              isInlineTemplate
            );
          }
        }

        // children
        if (
          typeof nodeTmpl === 'object' &&
          nodeTmpl !== null &&
          'children' in nodeTmpl &&
          Array.isArray((nodeTmpl as { children?: unknown[] }).children)
        ) {
          traverseTemplateNodes(
            (nodeTmpl as { children?: unknown[] }).children as TmplAstNode[],
            signalIdentifiers,
            reportNode,
            reportLocNode,
            isInlineTemplate
          );
        }
      }
    }

    function checkTemplateForSignalUsage(
      templateInfo: TemplateInfo,
      node: TSESTree.ClassDeclaration,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node
    ) {
      const { template, sourceUrl, isInlineTemplate } = templateInfo;
      if (!template) {
        return;
      }

      const { ast } = parseForESLint(template, {
        filePath: sourceUrl || context.getFilename(),
      });

      const signalIdentifiers = collectSignalIdentifiers(node);
      traverseTemplateNodes(
        ast.templateNodes,
        signalIdentifiers,
        reportNode,
        reportLocNode,
        !!isInlineTemplate
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
          templateInfo,
          node,
          reportNode,
          reportLocNode
        );
      },
    };
  },
};

export default rule;
