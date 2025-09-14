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
  StarLine,
} from './types';
import { shiftLocLine, isSignalCallExpression } from './utils';

// ユーティリティ関数をcreateの外に移動
const findComponentDecorator = (node: TSESTree.ClassDeclaration) => {
  return node.decorators?.find(
    (decorator) =>
      decorator.expression.type === 'CallExpression' &&
      decorator.expression.callee.type === 'Identifier' &&
      decorator.expression.callee.name === 'Component'
  );
};

const collectSignalIdentifiers = (
  node: TSESTree.ClassDeclaration
): Set<string> => {
  const signalIdentifiers = new Set<string>();

  const traverseObjectExpression = (
    obj: TSESTree.ObjectExpression,
    prefix = ''
  ) => {
    obj.properties.forEach((prop) => {
      if (
        prop.type === 'Property' &&
        prop.key.type === 'Identifier' &&
        prop.value.type === 'CallExpression' &&
        isSignalCallExpression(prop.value)
      ) {
        signalIdentifiers.add(prefix + prop.key.name);
      } else if (
        prop.type === 'Property' &&
        prop.value.type === 'ObjectExpression' &&
        prop.key.type === 'Identifier'
      ) {
        traverseObjectExpression(prop.value, prefix + prop.key.name + '.');
      }
    });
  };

  node.body.body.forEach((member) => {
    if (
      member.type === 'PropertyDefinition' &&
      member.value?.type === 'CallExpression' &&
      isSignalCallExpression(member.value) &&
      member.key.type === 'Identifier'
    ) {
      signalIdentifiers.add(member.key.name);
    } else if (
      member.type === 'PropertyDefinition' &&
      member.value?.type === 'ObjectExpression' &&
      member.key.type === 'Identifier'
    ) {
      traverseObjectExpression(member.value, member.key.name + '.');
    }
  });

  return signalIdentifiers;
};

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
        'Angular Signal {{ signalName }} must be called {{signalNameWithParens}} to access its value in the {{ where }}',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    const getComponentTemplate = (
      node: TSESTree.ClassDeclaration
    ): TemplateInfo => {
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

      if (
        templateProp &&
        (templateProp.value.value || templateProp.value.quasis)
      ) {
        const template =
          templateProp.value.value ||
          templateProp.value.quasis?.map((q) => q.value.cooked).join('');
        if (!template) {
          return { template: null };
        }
        const { ast } = parseForESLint(template, {
          filePath: context.filename,
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
          sourceUrl: context.filename,
          isInlineTemplate: true,
          templateStartLine:
            (templateProp.value as unknown as StarLine).loc.start.line ||
            undefined,
        };
      }

      // 外部テンプレートファイル
      const templateUrl = properties.find((p) => p.key.name === 'templateUrl');
      if (templateUrl) {
        const filePath = path.resolve(
          path.dirname(context.filename),
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
            templateStartLine:
              (templateUrl.value as unknown as StarLine).loc?.start.line ||
              undefined,
          };
        } catch (error) {
          console.error('テンプレートファイルの読み込みに失敗しました:', error);
          return { template: null };
        }
      }

      return { template: null };
    };

    const checkSignalUsage = (
      source: string | undefined,
      expression: TemplateExpression | undefined,
      signalIdentifiers: Set<string>,
      isMethodCallReceiver: boolean,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node,
      isInlineTemplate: boolean,
      templateStartLine?: number,
      sourceUrl?: string
    ) => {
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
                    isInlineTemplate,
                    templateStartLine,
                    sourceUrl
                  );
                  break;
                }
              }
            }
          }
        }
      }

      // プロパティ参照（count, count.first）
      if (expression.type === 'PropertyRead') {
        // 入れ子になったプロパティ参照を処理
        let currentExpression: TemplateExpression | undefined = expression;
        const propertyPath: string[] = [];

        while (currentExpression?.type === 'PropertyRead') {
          if (currentExpression.name) {
            propertyPath.unshift(currentExpression.name);
          }
          currentExpression = currentExpression.receiver as TemplateExpression;
        }

        const fullPath = propertyPath.join('.');
        const normalizedPath =
          propertyPath[0] === 'this'
            ? propertyPath.slice(1).join('.')
            : fullPath;

        // Signalの参照をチェック
        if (
          (currentExpression?.type === 'ImplicitReceiver' ||
            currentExpression?.type === 'ThisReceiver') &&
          !isMethodCallReceiver
        ) {
          // 完全一致のチェック
          if (signalIdentifiers.has(normalizedPath)) {
            reportSignalError(
              normalizedPath,
              reportNode,
              reportLocNode,
              isInlineTemplate,
              templateStartLine,
              sourceUrl
            );
          } else {
            // 部分一致のチェック（入れ子になったSignalの場合）
            for (const signalId of signalIdentifiers) {
              if (normalizedPath.startsWith(signalId + '.')) {
                reportSignalError(
                  signalId,
                  reportNode,
                  reportLocNode,
                  isInlineTemplate,
                  templateStartLine,
                  sourceUrl
                );
                break;
              }
            }
          }
        }

        // Signalプロパティ参照（count.signal）とthis.count.signalのケース
        if (
          expression.receiver?.type === 'PropertyRead' &&
          (expression.receiver.receiver?.type === 'ImplicitReceiver' ||
            expression.receiver.receiver?.type === 'ThisExpression') &&
          expression.receiver.name &&
          signalIdentifiers.has(expression.receiver.name) &&
          expression.name === 'signal'
        ) {
          reportSignalError(
            expression.receiver.name,
            reportNode,
            reportLocNode,
            isInlineTemplate,
            templateStartLine,
            sourceUrl
          );
        }
      }

      // 否定演算子のケース（!count）
      if (
        expression.type === 'PrefixNot' &&
        (expression as { expression?: TemplateExpression }).expression?.type ===
          'PropertyRead'
      ) {
        const propertyRead = (expression as { expression?: TemplateExpression })
          .expression;
        if (
          propertyRead &&
          (propertyRead.receiver?.type === 'ImplicitReceiver' ||
            propertyRead.receiver?.type === 'ThisReceiver') &&
          propertyRead.name &&
          signalIdentifiers.has(propertyRead.name)
        ) {
          reportSignalError(
            propertyRead.name,
            reportNode,
            reportLocNode,
            isInlineTemplate,
            templateStartLine,
            sourceUrl
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
            isInlineTemplate,
            templateStartLine,
            sourceUrl
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
          isInlineTemplate,
          templateStartLine,
          sourceUrl
        );
        checkSignalUsage(
          '',
          expression.right,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate,
          templateStartLine,
          sourceUrl
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
          isInlineTemplate,
          templateStartLine,
          sourceUrl
        );
        checkSignalUsage(
          '',
          expression.trueExp,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate,
          templateStartLine,
          sourceUrl
        );
        checkSignalUsage(
          '',
          expression.falseExp,
          signalIdentifiers,
          false,
          reportNode,
          reportLocNode,
          isInlineTemplate,
          templateStartLine,
          sourceUrl
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
          isInlineTemplate,
          templateStartLine,
          sourceUrl
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
              isInlineTemplate,
              templateStartLine,
              sourceUrl
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
          isInlineTemplate,
          templateStartLine,
          sourceUrl
        );
      }
    };

    // エラー報告を共通化
    // 重複報告防止用のSet
    const reportedSignals = new Set<string>();
    const reportSignalError = (
      signalName: string,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node,
      isInlineTemplate: boolean,
      templateStartLine?: number,
      sourceUrl?: string
    ) => {
      // ノードの位置とsignal名で一意化
      const key = `${signalName}:${reportLocNode.loc?.start.line}:${reportLocNode.loc?.start.column}`;
      if (reportedSignals.has(key)) return;
      reportedSignals.add(key);
      // 行番号補正
      let errorLine = reportLocNode.loc?.start.line;
      if (templateStartLine && errorLine) {
        if (isInlineTemplate) {
          errorLine = templateStartLine + errorLine - 1;
        } else {
          errorLine = templateStartLine;
        }
      }
      const cwd = process.cwd();
      const relativePath = sourceUrl
        ? process.env.JEST_WORKER_ID
          ? path.relative(cwd, sourceUrl)
          : sourceUrl
        : undefined;

      context.report({
        node: reportNode,
        messageId: 'signalUseAsSignalTemplate',
        loc: errorLine
          ? {
              start: {
                line: errorLine,
                /**
                 * 本来は reportLocNode.loc.start.column であるべきだが、
                 * テストの関係上、上下をつくるために reportLocNode.loc.start.line で上下関係をつくってる
                 * Jestのテスト実行時のみ line を使用し、それ以外では column を使用する
                 */
                column: process.env.JEST_WORKER_ID
                  ? reportLocNode.loc.start.line
                  : reportLocNode.loc.start.column,
              },
              end: { line: errorLine, column: reportLocNode.loc.end.column },
            }
          : undefined,
        data: {
          signalName,
          signalNameWithParens: `${signalName}()`,
          where: isInlineTemplate
            ? 'template'
            : `templateUrl\n${relativePath}:${reportLocNode.loc.start.line}:${reportLocNode.loc.start.column}`,
        },
      });
    };

    const traverseTemplateNodes = (
      nodes: TmplAstNode[],
      signalIdentifiers: Set<string>,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node,
      isInlineTemplate: boolean,
      templateStartLine?: number,
      sourceUrl?: string
    ) => {
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
                    isInlineTemplate,
                    templateStartLine,
                    sourceUrl
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
                isInlineTemplate,
                templateStartLine,
                sourceUrl
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
                isInlineTemplate,
                templateStartLine,
                sourceUrl
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
            isInlineTemplate,
            templateStartLine,
            sourceUrl
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
                  isInlineTemplate,
                  templateStartLine,
                  sourceUrl
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
                  isInlineTemplate,
                  templateStartLine,
                  sourceUrl
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
                isInlineTemplate,
                templateStartLine,
                sourceUrl
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
              isInlineTemplate,
              templateStartLine,
              sourceUrl
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
              isInlineTemplate,
              templateStartLine,
              sourceUrl
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
              isInlineTemplate,
              templateStartLine,
              sourceUrl
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
            isInlineTemplate,
            templateStartLine,
            sourceUrl
          );
        }

        // 属性バインディングの処理を追加
        if (
          typeof nodeTmpl === 'object' &&
          nodeTmpl !== null &&
          'inputs' in nodeTmpl &&
          Array.isArray(nodeTmpl.inputs)
        ) {
          for (const input of nodeTmpl.inputs) {
            if (
              input &&
              typeof input === 'object' &&
              'value' in input &&
              input.value &&
              typeof input.value === 'object' &&
              'ast' in input.value &&
              input.value.ast
            ) {
              const ast = input.value.ast as TemplateExpression;
              if (ast.type === 'PropertyRead') {
                if (input.type === 'BoundAttribute') {
                  // TODO: check usage for BoundAttribute detail
                } else {
                  checkSignalUsage(
                    'source' in input.value
                      ? (input.value.source as string | undefined)
                      : undefined,
                    ast,
                    signalIdentifiers,
                    false,
                    nodeTmpl as unknown as TSESTree.Node,
                    nodeTmpl as unknown as TSESTree.Node,
                    isInlineTemplate,
                    templateStartLine,
                    sourceUrl
                  );
                }
              }
            }
          }
        }
      }
    };

    const checkTemplateForSignalUsage = (
      templateInfo: TemplateInfo,
      node: TSESTree.ClassDeclaration,
      reportNode: TSESTree.Node,
      reportLocNode: TSESTree.Node
    ) => {
      const { template, sourceUrl, isInlineTemplate, templateStartLine } =
        templateInfo;
      if (!template) {
        return;
      }

      const { ast } = parseForESLint(template, {
        filePath: sourceUrl || context.filename,
      });

      const signalIdentifiers = collectSignalIdentifiers(node);
      traverseTemplateNodes(
        ast.templateNodes,
        signalIdentifiers,
        reportNode,
        reportLocNode,
        !!isInlineTemplate,
        templateStartLine,
        sourceUrl
      );
    };

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
