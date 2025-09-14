import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';
import { parseForESLint } from '@angular-eslint/template-parser';
import type { TmplAstElement, TmplAstTextAttribute } from '@angular/compiler';
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

    function visitNode(node: ts.Node) {
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
    }

    visitNode(sourceFile);
    ionicComponentsCache = componentsMap;
  } catch (error) {
    console.warn('Failed to load Ionic components types:', error);
  }

  return componentsMap;
}

// ファイルがTypeScriptファイルかHTMLファイルかを判定
function isTypeScriptFile(filename: string): boolean {
  return filename.endsWith('.ts') || filename.endsWith('.tsx');
}

function isHtmlFile(filename: string): boolean {
  return filename.endsWith('.html');
}

// 要素名がIonicコンポーネントかチェック
function isIonicComponent(elementName: string): boolean {
  const components = loadIonicComponents();
  return components.has(elementName.toLowerCase());
}

// 属性がboolean型かチェック
function isBooleanAttribute(
  elementName: string,
  attributeName: string
): boolean {
  const components = loadIonicComponents();
  const componentAttrs = components.get(elementName.toLowerCase());
  return componentAttrs?.get(attributeName) === 'boolean';
}

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
    const filename = context.getFilename();

    // TypeScriptファイルの場合はスキップ
    if (isTypeScriptFile(filename)) {
      return {};
    }

    // HTMLファイルでない場合はスキップ
    if (!isHtmlFile(filename)) {
      return {};
    }

    function getCorrectBooleanValue(value: string): string {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
        return 'true';
      }
      if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
        return 'false';
      }
      // 空文字列やその他の値はfalseとして扱う
      return 'false';
    }

    // boolean値の文字列表現かチェック
    function isBooleanStringValue(value: string): boolean {
      const lowerValue = value.toLowerCase();
      return (
        lowerValue === 'true' ||
        lowerValue === 'false' ||
        lowerValue === '1' ||
        lowerValue === '0' ||
        lowerValue === 'yes' ||
        lowerValue === 'no'
      );
    }

    function checkTemplate(template: string, _filename: string) {
      try {
        const { ast } = parseForESLint(template, { filePath: _filename });

        function traverseTemplateNodes(nodes: unknown[]) {
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

                    // BoundAttribute（プロパティバインディング）もチェック
                    else if (attrType === 'BoundAttribute') {
                      const boundAttr = attr as {
                        type: string;
                        value?: { type?: string; value?: unknown };
                        name?: string;
                        sourceSpan?: {
                          start?: { line: number; col: number };
                          end?: { line: number; col: number };
                        };
                      };

                      if (
                        boundAttr.name &&
                        isBooleanAttribute(element.name, boundAttr.name)
                      ) {
                        // 値が文字列リテラルの場合
                        if (
                          boundAttr.value &&
                          boundAttr.value.type === 'Literal' &&
                          typeof boundAttr.value.value === 'string' &&
                          isBooleanStringValue(boundAttr.value.value)
                        ) {
                          const correctValue = getCorrectBooleanValue(
                            boundAttr.value.value
                          );

                          context.report({
                            node: attr as unknown as TSESTree.Node,
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
                              value: boundAttr.value.value,
                              correctValue: correctValue,
                            },
                          });
                        }
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
        }

        traverseTemplateNodes(ast.templateNodes);
      } catch (error) {
        // パースエラーの場合は無視
        console.warn('Template parse error:', error);
      }
    }

    // HTMLファイルの内容を直接チェック
    try {
      const templateContent = fs.readFileSync(filename, 'utf8');
      checkTemplate(templateContent, filename);
    } catch (error) {
      // ファイル読み込みエラーの場合は無視
      console.warn('Failed to read HTML file:', error);
    }

    return {};
  },
};

export = rule;
