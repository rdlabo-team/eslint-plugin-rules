import { TSESLint } from '@typescript-eslint/utils';
import { RuleFix } from '@typescript-eslint/utils/dist/ts-eslint';

const rule: TSESLint.RuleModule<'denySoftPrivateModifier', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'This plugin disallows the use of soft private modifier.',
      recommended: 'stylistic',
      url: '',
    },
    fixable: 'code',
    messages: {
      denySoftPrivateModifier: 'Soft private modifier is not allowed.',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => ({
    Program(node) {
      const filename = context.filename;
      if (
        filename.endsWith('.spec') ||
        filename.endsWith('.html') ||
        !node.tokens
      ) {
        return;
      }
      const privateToken: number[] | undefined = node.tokens
        .map((token, index) => {
          if (
            token.type === 'Keyword' &&
            token.value === 'private' &&
            !(
              node.tokens![index + 1].type === 'Identifier' &&
              node.tokens![index + 1].value === 'constructor'
            )
          ) {
            return index;
          }
          return 0;
        })
        .filter((index) => index !== 0);

      if (privateToken.length === 0) {
        return;
      }

      context.report({
        node: node,
        messageId: 'denySoftPrivateModifier',
        fix: (fixer) => {
          const fixIdentifier: string[] = [];
          const fixes = node
            .tokens!.map((token, index) => {
              if (privateToken.includes(index)) {
                return fixer.remove(token);
              }
              if (privateToken.map((index) => index + 1).includes(index)) {
                fixIdentifier.push(token.value);
                return fixer.insertTextBefore(token, '#');
              }
              if (
                token.type === 'Identifier' &&
                fixIdentifier.includes(token.value) &&
                node.tokens![index - 2].value === 'this'
              ) {
                return fixer.insertTextBefore(token, '#');
              }
              return undefined;
            })
            .filter((fix) => fix !== undefined);

          return fixes as RuleFix[];
        },
      });
    },
  }),
};

export = rule;