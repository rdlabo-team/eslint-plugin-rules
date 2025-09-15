import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';
import type {
  TmplAstElement,
  TmplAstTextAttribute,
  TmplAstBoundAttribute,
} from '@angular/compiler';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Ionicコンポーネントの型定義をキャッシュ
let ionicComponentsCache: Map<string, Map<string, string>> | null = null;

// Ionicコンポーネントの型定義を読み込む
function loadIonicComponents(): Map<string, Map<string, string>> {
  if (ionicComponentsCache) {
    return ionicComponentsCache;
  }

  const componentsMap = new Map<string, Map<string, string>>();

  try {
    const componentsPath = path.resolve(
      process.cwd(),
      'node_modules/@ionic/core/dist/types/components.d.ts'
    );
    const sourceFile = ts.createSourceFile(
      componentsPath,
      fs.readFileSync(componentsPath, 'utf8'),
      ts.ScriptTarget.Latest,
      true
    );

    const visitNode = (node: ts.Node) => {
      if (
        ts.isModuleDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'Components'
      ) {
        if (node.body && ts.isModuleBlock(node.body)) {
          node.body.forEachChild((child: ts.Node) => {
            if (
              ts.isInterfaceDeclaration(child) &&
              child.name.text.startsWith('Ion')
            ) {
              // キャメルケースをケバブケースに変換
              // IonSkeletonText -> ion-skeleton-text
              const componentName = child.name.text
                .replace(/^Ion/, 'ion-') // 先頭のIonをion-に置換
                .replace(/[A-Z]/g, (match, offset) => {
                  // 最初の文字以外で大文字が見つかった場合、ハイフンを追加
                  return offset > 4
                    ? '-' + match.toLowerCase()
                    : match.toLowerCase(); // 4は'ion-'の長さ
                });
              const attributesMap = new Map<string, string>();

              try {
                child.members.forEach((member) => {
                  if (ts.isPropertySignature(member)) {
                    let attrName = '';
                    if (member.name && ts.isIdentifier(member.name)) {
                      attrName = member.name.text;
                    } else if (member.name && ts.isStringLiteral(member.name)) {
                      attrName = member.name.text;
                    } else {
                      return;
                    }

                    const typeText = member.type
                      ? member.type.getText()
                      : 'unknown';

                    // 属性の型を特定
                    let attributeType = 'unknown';
                    if (
                      typeText === 'boolean' ||
                      typeText.includes('boolean')
                    ) {
                      attributeType = 'boolean';
                    } else if (
                      typeText === 'number' ||
                      typeText.includes('number')
                    ) {
                      attributeType = 'number';
                    } else if (
                      typeText === 'string' ||
                      typeText.includes('string')
                    ) {
                      attributeType = 'string';
                    } else if (
                      typeText.includes("'") &&
                      typeText.includes('|')
                    ) {
                      // 文字列リテラルのUnion型（例: 'full' | 'inset' | 'none'）
                      attributeType = 'string';
                    } else if (
                      typeText.includes('Color') ||
                      typeText.includes('LiteralUnion')
                    ) {
                      // Color型やLiteralUnion型は文字列として扱う
                      attributeType = 'string';
                    } else if (
                      typeText.includes('|') ||
                      typeText.includes('&')
                    ) {
                      // その他のUnion型やIntersection型の場合
                      attributeType = 'complex';
                    } else if (typeText !== 'unknown') {
                      // その他の型（オブジェクト、配列など）
                      attributeType = 'object';
                    }

                    attributesMap.set(attrName, attributeType);
                  }
                });

                if (attributesMap.size > 0) {
                  componentsMap.set(componentName, attributesMap);
                }
              } catch {
                // エラーは無視
              }
            }
          });
        }
      }

      node.forEachChild(visitNode);
    };

    visitNode(sourceFile);
    ionicComponentsCache = componentsMap;
  } catch (error) {
    console.warn('Failed to load Ionic components types:', error);
  }

  return componentsMap;
}

// 要素名がIonicコンポーネントかチェック
const isIonicComponent = (elementName: string): boolean => {
  const components = loadIonicComponents();
  return components.has(elementName.toLowerCase());
};

// 属性の型を取得
const getAttributeType = (
  elementName: string,
  attributeName: string
): string | undefined => {
  const components = loadIonicComponents();
  const componentAttrs = components.get(elementName.toLowerCase());
  return componentAttrs?.get(attributeName);
};

// 正しいboolean値を取得
const getCorrectBooleanValue = (value: string): string => {
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
    return 'true';
  }
  if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
    return 'false';
  }
  // 空文字列はtrueとして扱い、その他の値はfalseとして扱う
  if (value === '') {
    return 'true';
  }
  return 'false';
};

// boolean値の文字列表現かチェック
const isBooleanStringValue = (value: string): boolean => {
  const lowerValue = value.toLowerCase();
  return (
    lowerValue === 'true' ||
    lowerValue === 'false' ||
    lowerValue === '1' ||
    lowerValue === '0' ||
    lowerValue === 'yes' ||
    lowerValue === 'no'
  );
};

const rule: TSESLint.RuleModule<'ionic-attr-type-check', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Disallows string values for non-string attributes in Ionic components and suggests proper property binding. Supports boolean, number, and object type attributes.',
      url: '',
    },
    fixable: 'code',
    messages: {
      'ionic-attr-type-check':
        "{{ attributeType }} attribute '{{ attributeName }}' should not have a string value '{{ value }}'. Use property binding [{{ attributeName }}]=\"{{ correctValue }}\" instead.",
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    const processTemplateNodes = (templateNodes: unknown[]) => {
      const traverseTemplateNodes = (nodes: unknown[]) => {
        if (!Array.isArray(nodes)) return;

        for (const node of nodes) {
          // Element ノードの場合、属性をチェック
          if (
            node &&
            typeof node === 'object' &&
            'type' in node &&
            (node as { type: string }).type === 'Element'
          ) {
            const element = node as unknown as TmplAstElement;

            // Ionicコンポーネントかチェック
            if (!isIonicComponent(element.name)) {
              // Ionicコンポーネントでない場合は子ノードのみチェック
              if (element.children && Array.isArray(element.children)) {
                traverseTemplateNodes(element.children);
              }
              continue;
            }

            // すべての属性タイプをチェック
            if (element.attributes && Array.isArray(element.attributes)) {
              for (const attr of element.attributes) {
                if (attr && typeof attr === 'object' && 'type' in attr) {
                  const attrType = (attr as { type: string }).type;

                  // TextAttribute（属性バインディング）をチェック
                  if (attrType === 'TextAttribute') {
                    const textAttr = attr as TmplAstTextAttribute;

                    // Ionicコンポーネントの属性かチェック
                    const attributeType = getAttributeType(
                      element.name,
                      textAttr.name
                    );
                    if (
                      attributeType &&
                      attributeType !== 'string' &&
                      attributeType !== 'unknown'
                    ) {
                      // 値なしの属性をチェック
                      if (!textAttr.value || textAttr.value.trim() === '') {
                        const correctValue =
                          attributeType === 'boolean'
                            ? 'true'
                            : attributeType === 'number'
                              ? '0'
                              : 'null';
                        context.report({
                          node: attr as unknown as TSESTree.Node,
                          loc: textAttr.sourceSpan?.start
                            ? {
                                start: {
                                  line: textAttr.sourceSpan.start.line + 1,
                                  column: textAttr.sourceSpan.start.col,
                                },
                                end: {
                                  line: textAttr.sourceSpan.end.line + 1,
                                  column: textAttr.sourceSpan.end.col,
                                },
                              }
                            : undefined,
                          messageId: 'ionic-attr-type-check',
                          data: {
                            attributeType: attributeType,
                            attributeName: textAttr.name,
                            value: textAttr.value || '',
                            correctValue: correctValue,
                          },
                          fix(fixer) {
                            const start =
                              textAttr.sourceSpan?.start.offset || 0;
                            const end = textAttr.sourceSpan?.end.offset || 0;

                            // 属性名を[属性名]="正しい値"に変更
                            const newAttributeText = `[${textAttr.name}]="${correctValue}"`;
                            return fixer.replaceTextRange(
                              [start, end],
                              newAttributeText
                            );
                          },
                        });
                      }
                      // 値ありの属性をチェック
                      else if (
                        attributeType === 'boolean' &&
                        isBooleanStringValue(textAttr.value)
                      ) {
                        const correctValue = getCorrectBooleanValue(
                          textAttr.value
                        );

                        context.report({
                          node: attr as unknown as TSESTree.Node,
                          loc: textAttr.sourceSpan?.start
                            ? {
                                start: {
                                  line: textAttr.sourceSpan.start.line + 1,
                                  column: textAttr.sourceSpan.start.col,
                                },
                                end: {
                                  line: textAttr.sourceSpan.end.line + 1,
                                  column: textAttr.sourceSpan.end.col,
                                },
                              }
                            : undefined,
                          messageId: 'ionic-attr-type-check',
                          data: {
                            attributeType: attributeType,
                            attributeName: textAttr.name,
                            value: textAttr.value,
                            correctValue: correctValue,
                          },
                          fix(fixer) {
                            const start =
                              textAttr.sourceSpan?.start.offset || 0;
                            const end = textAttr.sourceSpan?.end.offset || 0;

                            // 属性名を[属性名]="正しい値"に変更
                            const newAttributeText = `[${textAttr.name}]="${correctValue}"`;
                            return fixer.replaceTextRange(
                              [start, end],
                              newAttributeText
                            );
                          },
                        });
                      }
                      // 数値型属性の場合
                      else if (attributeType === 'number') {
                        const correctValue = textAttr.value;

                        context.report({
                          node: attr as unknown as TSESTree.Node,
                          loc: textAttr.sourceSpan?.start
                            ? {
                                start: {
                                  line: textAttr.sourceSpan.start.line + 1,
                                  column: textAttr.sourceSpan.start.col,
                                },
                                end: {
                                  line: textAttr.sourceSpan.end.line + 1,
                                  column: textAttr.sourceSpan.end.col,
                                },
                              }
                            : undefined,
                          messageId: 'ionic-attr-type-check',
                          data: {
                            attributeType: attributeType,
                            attributeName: textAttr.name,
                            value: textAttr.value,
                            correctValue: correctValue,
                          },
                          fix(fixer) {
                            const start =
                              textAttr.sourceSpan?.start.offset || 0;
                            const end = textAttr.sourceSpan?.end.offset || 0;

                            // 属性名を[属性名]="数値"に変更
                            const newAttributeText = `[${textAttr.name}]="${correctValue}"`;
                            return fixer.replaceTextRange(
                              [start, end],
                              newAttributeText
                            );
                          },
                        });
                      }
                      // オブジェクト型の属性の場合
                      else if (
                        attributeType === 'object' ||
                        attributeType === 'complex'
                      ) {
                        context.report({
                          node: attr as unknown as TSESTree.Node,
                          loc: textAttr.sourceSpan?.start
                            ? {
                                start: {
                                  line: textAttr.sourceSpan.start.line + 1,
                                  column: textAttr.sourceSpan.start.col,
                                },
                                end: {
                                  line: textAttr.sourceSpan.end.line + 1,
                                  column: textAttr.sourceSpan.end.col,
                                },
                              }
                            : undefined,
                          messageId: 'ionic-attr-type-check',
                          data: {
                            attributeType: attributeType,
                            attributeName: textAttr.name,
                            value: textAttr.value,
                            correctValue: 'null',
                          },
                          fix(fixer) {
                            const start =
                              textAttr.sourceSpan?.start.offset || 0;
                            const end = textAttr.sourceSpan?.end.offset || 0;

                            // 属性名を[属性名]="null"に変更（手動修正が必要）
                            const newAttributeText = `[${textAttr.name}]="null"`;
                            return fixer.replaceTextRange(
                              [start, end],
                              newAttributeText
                            );
                          },
                        });
                      }
                    }
                  }
                }
              }
            }

            // inputs配列（プロパティバインディング）をチェック
            if (element.inputs && Array.isArray(element.inputs)) {
              for (const input of element.inputs) {
                if (input && typeof input === 'object' && 'type' in input) {
                  const boundAttr = input as TmplAstBoundAttribute;

                  if (
                    boundAttr.name &&
                    getAttributeType(element.name, boundAttr.name) === 'boolean'
                  ) {
                    // 値が文字列リテラルの場合
                    const value = boundAttr.value as {
                      type?: string;
                      ast?: {
                        type?: string;
                        value?: string;
                      };
                    };
                    if (
                      value &&
                      value.type === 'ASTWithSource' &&
                      value.ast &&
                      value.ast.type === 'LiteralPrimitive' &&
                      typeof value.ast.value === 'string' &&
                      isBooleanStringValue(value.ast.value)
                    ) {
                      const correctValue = getCorrectBooleanValue(
                        value.ast.value
                      );

                      context.report({
                        node: input as unknown as TSESTree.Node,
                        loc:
                          boundAttr.sourceSpan?.start &&
                          boundAttr.sourceSpan?.end
                            ? {
                                start: {
                                  line: boundAttr.sourceSpan.start.line + 1,
                                  column: boundAttr.sourceSpan.start.col,
                                },
                                end: {
                                  line: boundAttr.sourceSpan.end.line + 1,
                                  column: boundAttr.sourceSpan.end.col,
                                },
                              }
                            : undefined,
                        messageId: 'ionic-attr-type-check',
                        data: {
                          attributeType: 'boolean',
                          attributeName: boundAttr.name,
                          value: value.ast.value,
                          correctValue: correctValue,
                        },
                        fix(fixer) {
                          const start = boundAttr.sourceSpan?.start.offset || 0;
                          const end = boundAttr.sourceSpan?.end.offset || 0;

                          // 文字列リテラルを正しいboolean値に変更
                          const newAttributeText = `[${boundAttr.name}]="${correctValue}"`;
                          return fixer.replaceTextRange(
                            [start, end],
                            newAttributeText
                          );
                        },
                      });
                    }
                  }
                }
              }
            }

            // 子ノードを再帰的にチェック
            if (element.children && Array.isArray(element.children)) {
              traverseTemplateNodes(element.children);
            }
          }
          // その他のノード（制御フロー構文など）の子ノードを再帰的に処理
          else if (node && typeof node === 'object' && 'type' in node) {
            const nodeWithChildren = node as {
              children?: unknown[];
              branches?: unknown[];
              then?: { children?: unknown[] };
              else?: { children?: unknown[] };
              [key: string]: unknown;
            };

            // 制御フロー構文でよく使われる子ノードプロパティのみを探索
            const childProperties = ['children', 'branches'];
            const nestedChildProperties = ['then', 'else'];

            // 直接の子ノードプロパティを処理
            for (const prop of childProperties) {
              const childNodes = nodeWithChildren[prop];
              if (Array.isArray(childNodes)) {
                traverseTemplateNodes(childNodes);
              }
            }

            // ネストした子ノードプロパティを処理
            for (const prop of nestedChildProperties) {
              const nestedNode = nodeWithChildren[prop];
              if (
                nestedNode &&
                typeof nestedNode === 'object' &&
                'children' in nestedNode
              ) {
                const childObj = nestedNode as { children?: unknown[] };
                if (Array.isArray(childObj.children)) {
                  traverseTemplateNodes(childObj.children);
                }
              }
            }
          }
        }
      };

      traverseTemplateNodes(templateNodes);
    };

    return {
      Program(node) {
        const filename = context.filename;

        // HTMLファイルの場合はtemplateNodesを取得
        if (filename.includes('.html')) {
          const templateNodes = (
            node as unknown as {
              templateNodes: unknown[];
            }
          ).templateNodes;

          if (!Array.isArray(templateNodes)) {
            return;
          }

          processTemplateNodes(templateNodes);
        }
      },
    };
  },
};

export = rule;
