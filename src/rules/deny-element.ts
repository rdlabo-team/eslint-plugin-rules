import { TSESLint } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils/dist/ts-estree';

interface TemplateNode {
  name: string;
  type: string;
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  children: TemplateNodes;
}
type TemplateNodes = TemplateNode[];
interface Scheme {
  elements: string[];
}

const rule: TSESLint.RuleModule<'denyElement', [Scheme]> = {
  name: 'deny-element',
  meta: {
    docs: {
      description: 'This plugin disallows the use of certain HTML tags.',
      url: '',
    },
    fixable: undefined,
    messages: {
      denyElement: 'HTML Template File has <{{ element }}>. This element is not allowed.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          elements: {
            type: 'array',
          },
        },
        required: ['elements'],
      },
    ],
    type: 'problem',
  },
  defaultOptions: [
    {
      elements: ['ion-modal', 'ion-popover', 'ion-toast', 'ion-alert', 'ion-loading', 'ion-picker', 'ion-action-sheet'],
    },
  ],
  create: (context) => {
    const isHtmlFile = (filename: string) => !filename.includes('.spec') && filename.includes('.html');

    const isElementNode = (node: TemplateNode) => node.type.includes('Element');

    const checkElement = (node: TemplateNode, deniedElements: string[]) => {
      if (deniedElements.includes(node.name)) {
        context.report({
          node: node as unknown as TSESTree.Node,
          loc: node.loc,
          messageId: 'denyElement',
          data: {
            element: node.name,
          },
        });
      }
    };

    const processNode = (node: TemplateNode, deniedElements: string[]) => {
      checkElement(node, deniedElements);

      // 子ノードを再帰的に処理
      if (node.children) {
        node.children.filter(isElementNode).forEach((child) => processNode(child, deniedElements));
      }
    };

    // 制御フロー構文を含む汎用的なノード処理
    const processTemplateNodes = (templateNodes: TemplateNode[]) => {
      const traverseTemplateNodes = (nodes: TemplateNode[]) => {
        if (!Array.isArray(nodes)) return;

        for (const node of nodes) {
          // Element ノードの場合、属性をチェック
          if (isElementNode(node)) {
            processNode(node, context.options[0]?.elements || []);
          }

          // その他のノード（制御フロー構文など）の子ノードを再帰的に処理
          else if (node && typeof node === 'object' && 'type' in node) {
            const nodeWithChildren = node as unknown as {
              children?: TemplateNode[];
              branches?: TemplateNode[];
              then?: { children?: TemplateNode[] };
              else?: { children?: TemplateNode[] };
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
              if (nestedNode && typeof nestedNode === 'object' && 'children' in nestedNode) {
                const childObj = nestedNode as { children?: TemplateNode[] };
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
        if (!isHtmlFile(filename)) return;

        const scheme = context.options.find((option: Scheme) => option.elements);
        if (!scheme) {
          throw new Error('elements is not defined. Please define elements using array.');
        }

        const templateNodes: TemplateNodes = (
          node as unknown as {
            templateNodes: TemplateNodes;
          }
        ).templateNodes;

        processTemplateNodes(templateNodes);
      },
    };
  },
};

export = rule;
