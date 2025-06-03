import { TSESLint } from '@typescript-eslint/utils';
import { RuleFix } from '@typescript-eslint/utils/dist/ts-eslint';
import { TSESTree } from '@typescript-eslint/types';

const rule: TSESLint.RuleModule<'denySoftPrivateModifier', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'This plugin disallows the use of soft private modifier.',
      url: '',
    },
    fixable: 'code',
    messages: {
      denySoftPrivateModifier: 'Soft private modifier is not allowed.',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => {
    const sourceCode = context.getSourceCode();
    let privateFields: string[] = [];
    return {
      ClassBody(node: TSESTree.ClassBody) {
        privateFields = [];
        for (const element of node.body) {
          if (
            element.type === 'PropertyDefinition' &&
            element.key.type === 'Identifier' &&
            element.accessibility === 'private'
          ) {
            privateFields.push(element.key.name);
          } else if (
            element.type === 'MethodDefinition' &&
            element.key.type === 'Identifier' &&
            element.accessibility === 'private' &&
            element.kind !== 'constructor'
          ) {
            privateFields.push(element.key.name);
          }
        }
      },
      MethodDefinition(node: TSESTree.MethodDefinition) {
        if (node.kind === 'constructor') {
          return;
        }
        if (
          node.accessibility === 'private' &&
          node.key.type === 'Identifier'
        ) {
          context.report({
            node,
            messageId: 'denySoftPrivateModifier',
            fix: (fixer) => {
              const fixes: RuleFix[] = [];
              const firstToken = sourceCode.getFirstToken(node);
              let privateToken = firstToken;
              while (privateToken && privateToken.value !== 'private') {
                privateToken = sourceCode.getTokenAfter(privateToken);
              }
              if (privateToken) {
                const nextToken = sourceCode.getTokenAfter(privateToken);
                if (nextToken && nextToken.range[0] === privateToken.range[1]) {
                  fixes.push(fixer.remove(privateToken));
                } else if (nextToken) {
                  fixes.push(
                    fixer.removeRange([
                      privateToken.range[0],
                      nextToken.range[0],
                    ])
                  );
                }
              }
              fixes.push(fixer.insertTextBefore(node.key, '#'));
              return fixes;
            },
          });
        }
      },
      PropertyDefinition(node: TSESTree.PropertyDefinition) {
        if (
          node.accessibility === 'private' &&
          node.key.type === 'Identifier'
        ) {
          context.report({
            node,
            messageId: 'denySoftPrivateModifier',
            fix: (fixer) => {
              const fixes: RuleFix[] = [];
              const firstToken = sourceCode.getFirstToken(node);
              let privateToken = firstToken;
              while (privateToken && privateToken.value !== 'private') {
                privateToken = sourceCode.getTokenAfter(privateToken);
              }
              if (privateToken) {
                const nextToken = sourceCode.getTokenAfter(privateToken);
                if (nextToken && nextToken.range[0] === privateToken.range[1]) {
                  fixes.push(fixer.remove(privateToken));
                } else if (nextToken) {
                  fixes.push(
                    fixer.removeRange([
                      privateToken.range[0],
                      nextToken.range[0],
                    ])
                  );
                }
              }
              fixes.push(fixer.insertTextBefore(node.key, '#'));
              return fixes;
            },
          });
        }
      },
      MemberExpression(node: TSESTree.MemberExpression) {
        if (
          node.object.type === 'ThisExpression' &&
          node.property.type === 'Identifier' &&
          privateFields.includes(node.property.name) &&
          !node.computed
        ) {
          context.report({
            node: node.property,
            messageId: 'denySoftPrivateModifier',
            fix: (fixer) => fixer.insertTextBefore(node.property, '#'),
          });
        }
      },
    };
  },
};

export = rule;
