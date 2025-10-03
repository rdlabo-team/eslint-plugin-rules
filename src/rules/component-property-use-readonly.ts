import { TSESLint, TSESTree } from '@typescript-eslint/utils';

interface RuleOptions {
  ignorePrivateProperties?: boolean;
}

const rule: TSESLint.RuleModule<'componentPropertyUseReadonly', [RuleOptions?]> = {
  name: 'component-property-use-readonly',
  defaultOptions: [{ ignorePrivateProperties: false }],
  meta: {
    docs: {
      description: 'Warns when a property should be readonly',
      url: '',
    },
    fixable: 'code',
    messages: {
      componentPropertyUseReadonly: 'This property should be readonly',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignorePrivateProperties: {
            type: 'boolean',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  create(context: TSESLint.RuleContext<'componentPropertyUseReadonly', [RuleOptions?]>) {
    const options = context.options[0] ?? { ignorePrivateProperties: false };

    // 現在のクラスがComponentかどうかを追跡
    let isComponentClass = false;

    return {
      ClassDeclaration(node: TSESTree.ClassDeclaration) {
        // Componentデコレータのチェック
        isComponentClass =
          node.decorators?.some(
            (decorator: TSESTree.Decorator) =>
              decorator.expression.type === 'CallExpression' &&
              decorator.expression.callee.type === 'Identifier' &&
              decorator.expression.callee.name === 'Component',
          ) ?? false;
      },
      'ClassDeclaration:exit'() {
        // クラス宣言の終了時にフラグをリセット
        isComponentClass = false;
      },
      PropertyDefinition(node: TSESTree.PropertyDefinition) {
        // Componentクラス内のプロパティのみを対象とする
        if (!isComponentClass || node.readonly) {
          return;
        }

        // 関数プロパティは除外
        if (node.value?.type === 'ArrowFunctionExpression' || node.value?.type === 'FunctionExpression') {
          return;
        }

        // private propertiesを無視するオプションが有効な場合
        if (options.ignorePrivateProperties) {
          // hard private (private) のチェック
          if (node.accessibility === 'private') {
            return;
          }
          // soft private (#) のチェック
          if (node.key.type === 'PrivateIdentifier') {
            return;
          }
        }

        context.report({
          node,
          messageId: 'componentPropertyUseReadonly',
          fix(fixer: TSESLint.RuleFixer) {
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
                (token.value === 'public' || token.value === 'private' || token.value === 'protected' || token.value === 'static')
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
