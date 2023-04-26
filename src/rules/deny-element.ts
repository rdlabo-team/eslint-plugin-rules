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
      recommended: false,
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
      elements: ['element'],
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
        const getDenyElement = (nodeList: TemplateNodes): TemplateNodes => {
          const denyNodes: TemplateNodes = [];
          nodeList.some((node) => {
            if (elements.includes(node.name)) {
              denyNodes.push(node);
              return true;
            }
            const children =
              node.children?.filter((d) => d.type.includes('Element')) || [];
            if (children?.length === 0) {
              return false;
            }
            return getDenyElement(children);
          });
          return denyNodes;
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

        if (getDenyElement(filterNodes).length > 0) {
          getDenyElement(filterNodes).forEach((denyNode) => {
            context.report({
              node,
              loc: denyNode.loc,
              messageId: 'denyElement',
              data: {
                element: denyNode.name,
              },
            });
          });
        }
      }
    },
  }),
};

export default rule;
