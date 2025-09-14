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
              const componentName = child.name.text
                .replace('Ion', 'ion-')
                .toLowerCase();
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

                    // boolean型の属性を特定
                    if (
                      typeText === 'boolean' ||
                      typeText.includes('boolean')
                    ) {
                      attributesMap.set(attrName, 'boolean');
                    }
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

// 属性がboolean型かチェック
const isBooleanAttribute = (
  elementName: string,
  attributeName: string
): boolean => {
  const components = loadIonicComponents();
  const componentAttrs = components.get(elementName.toLowerCase());
  return componentAttrs?.get(attributeName) === 'boolean';
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
  // 空文字列やその他の値はfalseとして扱う
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

const rule: TSESLint.RuleModule<'no-string-boolean-ionic-attr', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description:
        'Disallows string values for boolean attributes in Ionic components',
      url: '',
    },
    fixable: undefined,
    messages: {
      'no-string-boolean-ionic-attr':
        "Boolean attribute '{{ attributeName }}' should not have a string value '{{ value }}'. Use property binding [{{ attributeName }}]=\"{{ correctValue }}\" instead.",
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    return {
      Program(node) {
        const filename = context.filename;

        // HTMLファイルでない場合はスキップ
        if (!filename.includes('.html')) {
          return;
        }

        // テンプレートノードを取得
        const templateNodes = (
          node as unknown as {
            templateNodes: unknown[];
          }
        ).templateNodes;

        if (!Array.isArray(templateNodes)) {
          return;
        }

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

                      // Ionicコンポーネントのboolean属性かチェック
                      if (isBooleanAttribute(element.name, textAttr.name)) {
                        // 値なしのboolean属性をチェック
                        if (!textAttr.value || textAttr.value.trim() === '') {
                          context.report({
                            node: attr as unknown as TSESTree.Node,
                            loc: textAttr.sourceSpan?.start
                              ? {
                                  start: {
                                    line: textAttr.sourceSpan.start.line,
                                    column: textAttr.sourceSpan.start.col,
                                  },
                                  end: {
                                    line: textAttr.sourceSpan.end.line,
                                    column: textAttr.sourceSpan.end.col,
                                  },
                                }
                              : undefined,
                            messageId: 'no-string-boolean-ionic-attr',
                            data: {
                              attributeName: textAttr.name,
                              value: textAttr.value || '',
                              correctValue: 'true',
                            },
                          });
                        }
                        // 値ありのboolean属性をチェック
                        else if (isBooleanStringValue(textAttr.value)) {
                          const correctValue = getCorrectBooleanValue(
                            textAttr.value
                          );

                          context.report({
                            node: attr as unknown as TSESTree.Node,
                            loc: textAttr.sourceSpan?.start
                              ? {
                                  start: {
                                    line: textAttr.sourceSpan.start.line,
                                    column: textAttr.sourceSpan.start.col,
                                  },
                                  end: {
                                    line: textAttr.sourceSpan.end.line,
                                    column: textAttr.sourceSpan.end.col,
                                  },
                                }
                              : undefined,
                            messageId: 'no-string-boolean-ionic-attr',
                            data: {
                              attributeName: textAttr.name,
                              value: textAttr.value,
                              correctValue: correctValue,
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
                      isBooleanAttribute(element.name, boundAttr.name)
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
                                    line: boundAttr.sourceSpan.start.line,
                                    column: boundAttr.sourceSpan.start.col,
                                  },
                                  end: {
                                    line: boundAttr.sourceSpan.end.line,
                                    column: boundAttr.sourceSpan.end.col,
                                  },
                                }
                              : undefined,
                          messageId: 'no-string-boolean-ionic-attr',
                          data: {
                            attributeName: boundAttr.name,
                            value: value.ast.value,
                            correctValue: correctValue,
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
          }
        };

        traverseTemplateNodes(templateNodes);
      },
    };
  },
};

export = rule;
