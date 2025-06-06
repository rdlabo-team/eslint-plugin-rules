import { TSESLint, TSESTree } from '@typescript-eslint/utils';

const rule: TSESLint.RuleModule<'propertyUseReadonly', []> = {
  defaultOptions: [],
  meta: {
    docs: {
      description: 'プロパティが読み取り専用であるべき場合に警告を出します',
      url: '',
    },
    fixable: 'code',
    messages: {
      propertyUseReadonly: 'このプロパティは読み取り専用であるべきです',
    },
    schema: [],
    type: 'suggestion',
  },
  create(context) {
    // 現在のクラスがComponentかどうかを追跡
    let isComponentClass = false;

    return {
      ClassDeclaration(node) {
        // Componentデコレータのチェック
        isComponentClass =
          node.decorators?.some(
            (decorator: TSESTree.Decorator) =>
              decorator.expression.type === 'CallExpression' &&
              decorator.expression.callee.type === 'Identifier' &&
              decorator.expression.callee.name === 'Component'
          ) ?? false;
      },
      'ClassDeclaration:exit'() {
        // クラス宣言の終了時にフラグをリセット
        isComponentClass = false;
      },
      PropertyDefinition(node) {
        // Componentクラス内のプロパティのみを対象とする
        if (!isComponentClass || node.readonly) {
          return;
        }

        context.report({
          node,
          messageId: 'propertyUseReadonly',
          fix(fixer) {
            const sourceCode = context.getSourceCode();
            // デコレータがあればその直後
            if (node.decorators && node.decorators.length > 0) {
              const lastDecorator = node.decorators[node.decorators.length - 1];
              return fixer.insertTextAfter(lastDecorator, ' readonly');
            }
            // static, アクセス修飾子があればその直後
            const tokens = sourceCode.getFirstTokens(node, {
              count: 3,
            }) as TSESTree.Token[];
            let insertAfterToken: TSESTree.Token | null = null;
            for (const token of tokens) {
              if (
                token.type === 'Identifier' &&
                (token.value === 'public' ||
                  token.value === 'private' ||
                  token.value === 'protected' ||
                  token.value === 'static')
              ) {
                insertAfterToken = token;
              }
            }
            if (insertAfterToken) {
              return fixer.insertTextAfter(insertAfterToken, ' readonly');
            }
            // computed propertyの場合は必ず先頭（keyの前はNG）
            if (node.computed) {
              // staticやアクセス修飾子もデコレータもない場合は、class bodyの先頭に挿入
              const firstToken = sourceCode.getFirstToken(node);
              return fixer.insertTextBefore(firstToken!, 'readonly ');
            }
            // それ以外はkeyの前
            return fixer.insertTextBefore(node.key, 'readonly ');
          },
        });
      },
    };
  },
};

export = rule;
