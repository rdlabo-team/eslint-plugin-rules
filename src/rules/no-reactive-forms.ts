import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { type TemplateAstNode, walkTemplateNodes } from './template-ast-utils';

const REACTIVE_IMPORTS = new Set([
  'AbstractControl',
  'FormArray',
  'FormArrayName',
  'FormBuilder',
  'FormControl',
  'FormControlDirective',
  'FormControlName',
  'FormGroup',
  'FormGroupDirective',
  'FormGroupName',
  'FormRecord',
  'NonNullableFormBuilder',
  'ReactiveFormsModule',
  'UntypedFormArray',
  'UntypedFormBuilder',
  'UntypedFormControl',
  'UntypedFormGroup',
  'Validators',
]);
const REACTIVE_TEMPLATE_BINDINGS = new Set(['formArrayName', 'formControl', 'formControlName', 'formGroup', 'formGroupName']);

type MessageIds = 'reactiveFormsImport' | 'reactiveFormsNamespaceImport' | 'reactiveFormsBinding';

function importedName(node: TSESTree.Identifier | TSESTree.StringLiteral): string {
  return node.type === 'Identifier' ? node.name : node.value;
}

const rule: TSESLint.RuleModule<MessageIds, []> = {
  defaultOptions: [],
  meta: {
    docs: { description: 'Disallow Angular Reactive Forms in favor of Signal Forms.', url: '' },
    messages: {
      reactiveFormsImport: '`{{name}}` is a Reactive Forms API. Use `@angular/forms/signals` instead.',
      reactiveFormsNamespaceImport:
        'Namespace/default imports from `@angular/forms` can bypass Reactive Forms checks. Import allowed template-driven APIs by name.',
      reactiveFormsBinding: '`{{name}}` is a Reactive Forms template binding. Use `[formField]` from Signal Forms instead.',
    },
    schema: [],
    type: 'problem',
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value !== '@angular/forms') {
          return;
        }
        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier' || specifier.type === 'ImportDefaultSpecifier') {
            context.report({ node: specifier, messageId: 'reactiveFormsNamespaceImport' });
            continue;
          }
          const name = specifier.type === 'ImportSpecifier' ? importedName(specifier.imported) : null;
          if (name && REACTIVE_IMPORTS.has(name)) {
            context.report({
              node: specifier,
              messageId: 'reactiveFormsImport',
              data: { name },
            });
          }
        }
      },
      Program(node) {
        const templateNodes = (node as unknown as { templateNodes?: TemplateAstNode[] }).templateNodes;
        walkTemplateNodes(
          templateNodes,
          (templateNode) => {
            if (
              (templateNode.type === 'BoundAttribute' || templateNode.type === 'TextAttribute') &&
              templateNode.name &&
              REACTIVE_TEMPLATE_BINDINGS.has(templateNode.name)
            ) {
              context.report({
                node: templateNode as unknown as TSESTree.Node,
                loc: templateNode.loc,
                messageId: 'reactiveFormsBinding',
                data: { name: templateNode.name },
              });
            }
          },
          ['inputs', 'attributes'],
        );
      },
    };
  },
};

export = rule;
