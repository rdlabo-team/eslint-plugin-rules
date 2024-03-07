import { TSESLint } from '@typescript-eslint/utils';

type TemplateNode = {
  name: string;
  type: string;
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  children: TemplateNodes;
};
type TemplateNodes = TemplateNode[];
type Scheme = {
  elements: string[];
};

const rule: TSESLint.RuleModule<'denyElement', [Scheme]> = {
  meta: {
    docs: {
      description: 'This plugin disallows the use of certain HTML tags.',
      recommended: 'stylistic',
      url: '',
    },
    fixable: undefined,
    messages: {
      denyElement:
        'HTML Template File has <{{ element }}>. This element is not allowed.',
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
      elements: [
        'ion-modal',
        'ion-popover',
        'ion-toast',
        'ion-alert',
        'ion-loading',
        'ion-picker',
        'ion-action-sheet',
      ],
    },
  ],
  create: (context) => ({
    Program(node) {
      const filename = context.getFilename();

      const scheme = context.options.find((option: Scheme) => option.elements);
      if (scheme === undefined) {
        throw new Error(
          'elements is not defined. Please define elements using array.'
        );
      }
      const elements = scheme.elements;

      if (!filename.includes('.spec') && filename.includes('.html')) {
        const reviewDenyElement = (nodeList: TemplateNodes): void => {
          for (const reviewNode of nodeList) {
            if (elements.includes(reviewNode.name)) {
              context.report({
                node,
                loc: reviewNode.loc,
                messageId: 'denyElement',
                data: {
                  element: reviewNode.name,
                },
              });
            }
            const children =
              reviewNode.children?.filter((d) => d.type.includes('Element')) ||
              [];
            if (children?.length > 0) {
              reviewDenyElement(children);
            }
          }
        };

        const templateNodes: TemplateNodes = (
          node as unknown as {
            // AngularのparserによるNode
            templateNodes: TemplateNodes;
          }
        ).templateNodes;

        const filterNodes = templateNodes
          .filter((templateNode) =>
            // テキストや改行は無視
            templateNode.type.includes('Element')
          )
          .map((templateNode) =>
            Object.assign(templateNode, {
              children: templateNode.children.filter((d) =>
                d.type.includes('Element')
              ),
            })
          );

        reviewDenyElement(filterNodes);
      }
    },
  }),
};

export = rule;
